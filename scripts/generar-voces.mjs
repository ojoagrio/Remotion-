// Genera las voces del guion con ElevenLabs y guarda la duración de cada línea.
// Uso: ELEVENLABS_API_KEY=... node scripts/generar-voces.mjs [src/tiktok/guion.json]
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("Falta la variable de entorno ELEVENLABS_API_KEY");
  process.exit(1);
}

const rutaGuion = process.argv[2] ?? "src/tiktok/guion.json";
const guion = JSON.parse(readFileSync(rutaGuion, "utf8"));
// Cada guion guarda sus audios en public/voces/<carpeta del guion>
const carpetaAudio = join("public/voces", guion.carpeta ?? "");
mkdirSync(carpetaAudio, { recursive: true });

const duraciones = {};
for (const linea of guion.lineas) {
  const voz = guion.voces[linea.personaje];
  const respuesta = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voz}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: linea.texto,
        model_id: guion.modelo,
        voice_settings: guion.ajustes?.[linea.personaje] ?? {
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
  writeFileSync(archivo, Buffer.from(await respuesta.arrayBuffer()));

  const salida = execFileSync("npx", [
    "remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration",
    "-of", "csv=p=0", archivo,
  ]).toString().trim();
  duraciones[linea.id] = Number(salida.split("\n").pop());
  console.log(`${archivo}  ${duraciones[linea.id].toFixed(2)} s  ${linea.texto}`);
}

writeFileSync(join(dirname(rutaGuion), "duraciones.json"), JSON.stringify(duraciones, null, 2) + "\n");
