// Producción en un solo comando: voces (con caché) → ritmo y bocas → hoja de prueba → render.
//
// Uso:
//   ELEVENLABS_API_KEY=... node scripts/producir.mjs <guion.json> [--hoja=Comp] [--render=Comp:salida.mp4]
//
// Caché de voces: cada línea se identifica por un hash de (voz, modelo, texto, ajustes). Si no
// cambió, no se vuelve a pedir a ElevenLabs (ahorra créditos y tiempo). Los audios crudos se
// guardan en audio-fuente/voces/<carpeta>/ y los procesados en public/voces/<carpeta>/.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const rutaGuion = args.find((a) => !a.startsWith("--"));
const opcion = (n) => args.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
if (!rutaGuion) {
  console.error("Uso: node scripts/producir.mjs <guion.json> [--hoja=Comp] [--render=Comp:salida.mp4]");
  process.exit(1);
}

const guion = JSON.parse(readFileSync(rutaGuion, "utf8"));
const crudo = join("audio-fuente/voces", guion.carpeta ?? "");
mkdirSync(crudo, { recursive: true });
const rutaCache = join(crudo, "cache.json");
const cache = existsSync(rutaCache) ? JSON.parse(readFileSync(rutaCache, "utf8")) : {};

// 1. Voces
let nuevas = 0;
for (const linea of guion.lineas) {
  const voz = guion.voces[linea.personaje];
  const cuerpo = {
    text: linea.locucion ?? linea.texto,
    model_id: linea.modelo ?? guion.modelo,
    voice_settings: linea.ajustes ?? guion.ajustes?.[linea.personaje] ?? { stability: 0.5, similarity_boost: 0.8 },
  };
  const hash = createHash("sha1").update(JSON.stringify([voz, cuerpo, !!guion.timestamps])).digest("hex");
  const mp3 = join(crudo, `${linea.id}.mp3`);
  if (cache[linea.id] === hash && existsSync(mp3)) continue;

  if (!process.env.ELEVENLABS_API_KEY) {
    console.error("Falta ELEVENLABS_API_KEY para generar voces nuevas");
    process.exit(1);
  }
  const ruta = guion.timestamps ? `${voz}/with-timestamps` : voz;
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ruta}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  if (!r.ok) {
    console.error(`Error en la línea ${linea.id}:`, await r.text());
    process.exit(1);
  }
  if (guion.timestamps) {
    const datos = await r.json();
    writeFileSync(mp3, Buffer.from(datos.audio_base64, "base64"));
    writeFileSync(join(crudo, `${linea.id}.json`), JSON.stringify(datos.alignment));
  } else {
    writeFileSync(mp3, Buffer.from(await r.arrayBuffer()));
  }
  cache[linea.id] = hash;
  writeFileSync(rutaCache, JSON.stringify(cache, null, 2));
  nuevas++;
  console.log(`voz ${linea.id} generada`);
}
console.log(`Voces: ${nuevas} nuevas, ${guion.lineas.length - nuevas} desde caché`);

// 2. Ritmo, duraciones, palabras y bocas
execFileSync("python3", ["scripts/procesar-voces.py", rutaGuion], { stdio: "inherit" });

// 3. Hoja de prueba y 4. render (opcionales)
const hoja = opcion("hoja");
if (hoja) execFileSync("node", ["scripts/hoja.mjs", hoja, "12", "0.25"], { stdio: "inherit" });
const render = opcion("render");
if (render) {
  const [comp, salida] = render.split(":");
  execFileSync("npx", ["remotion", "render", comp, salida ?? `out/${comp}.mp4`, `--gl=${process.env.REMOTION_GL ?? "swangle"}`], { stdio: "inherit" });
}
