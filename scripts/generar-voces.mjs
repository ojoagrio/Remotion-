// Genera las voces del guion con ElevenLabs y guarda la duración de cada línea.
// Uso: ELEVENLABS_API_KEY=... node scripts/generar-voces.mjs [src/tiktok/guion.json]
//
// Cada línea puede indicar, además de "texto" (el subtítulo):
// - "locucion": texto que se envía a la voz, si es distinto (p. ej. con etiquetas de
//   eleven_v3 como [sings] o vocales alargadas para cantar)
// - "modelo" y "ajustes": para usar otro modelo o ajustes de voz solo en esa línea
//
// Si el guion tiene "timestamps": true, también se guarda en palabras.json el momento
// (en segundos) en que se dice cada palabra, para subtítulos palabra por palabra.
//
// Con --solo=<personaje> solo se regeneran las líneas de ese personaje; el resto de
// audios y duraciones se conservan tal cual.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("Falta la variable de entorno ELEVENLABS_API_KEY");
  process.exit(1);
}

const args = process.argv.slice(2);
const solo = args.find((a) => a.startsWith("--solo="))?.slice("--solo=".length);
const rutaGuion = args.find((a) => !a.startsWith("--")) ?? "src/tiktok/guion.json";
const guion = JSON.parse(readFileSync(rutaGuion, "utf8"));
// Cada guion guarda sus audios en public/voces/<carpeta del guion>
const carpetaAudio = join("public/voces", guion.carpeta ?? "");
mkdirSync(carpetaAudio, { recursive: true });

const rutaDuraciones = join(dirname(rutaGuion), "duraciones.json");
const duraciones = solo && existsSync(rutaDuraciones) ? JSON.parse(readFileSync(rutaDuraciones, "utf8")) : {};
const rutaPalabras = join(dirname(rutaGuion), "palabras.json");
const palabras = solo && existsSync(rutaPalabras) ? JSON.parse(readFileSync(rutaPalabras, "utf8")) : {};

// Agrupa la alineación por caracteres en palabras, sin las etiquetas tipo [sarcastic]
const aPalabras = ({ characters, character_start_times_seconds: ini, character_end_times_seconds: fin }) => {
  const lista = [];
  let actual = null;
  let enEtiqueta = false;
  characters.forEach((c, i) => {
    if (c === "[") enEtiqueta = true;
    if (enEtiqueta) {
      if (c === "]") enEtiqueta = false;
      return;
    }
    if (/\s/.test(c)) {
      actual = null;
      return;
    }
    if (!actual) {
      actual = { palabra: "", inicio: ini[i], fin: fin[i] };
      lista.push(actual);
    }
    actual.palabra += c;
    actual.fin = fin[i];
  });
  return lista;
};
for (const linea of guion.lineas) {
  if (solo && linea.personaje !== solo) continue;
  const voz = guion.voces[linea.personaje];
  const ruta = guion.timestamps ? `${voz}/with-timestamps` : voz;
  const respuesta = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ruta}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: linea.locucion ?? linea.texto,
        model_id: linea.modelo ?? guion.modelo,
        voice_settings: linea.ajustes ?? guion.ajustes?.[linea.personaje] ?? {
          stability: 0.35,
          similarity_boost: 0.8,
          style: 0.6,
        },
      }),
    },
  );
  if (!respuesta.ok) {
    console.error(`Error en la línea ${linea.id}:`, await respuesta.text());
    process.exit(1);
  }
  const archivo = join(carpetaAudio, `${linea.id}.mp3`);
  if (guion.timestamps) {
    const datos = await respuesta.json();
    writeFileSync(archivo, Buffer.from(datos.audio_base64, "base64"));
    palabras[linea.id] = aPalabras(datos.alignment);
  } else {
    writeFileSync(archivo, Buffer.from(await respuesta.arrayBuffer()));
  }

  const salida = execFileSync("npx", [
    "remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration",
    "-of", "csv=p=0", archivo,
  ]).toString().trim();
  duraciones[linea.id] = Number(salida.split("\n").pop());
  console.log(`${archivo}  ${duraciones[linea.id].toFixed(2)} s  ${linea.texto}`);
}

writeFileSync(rutaDuraciones, JSON.stringify(duraciones, null, 2) + "\n");
if (guion.timestamps) writeFileSync(rutaPalabras, JSON.stringify(palabras, null, 1) + "\n");
