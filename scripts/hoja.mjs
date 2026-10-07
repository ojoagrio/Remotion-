// Hoja de contactos: renderiza varios fotogramas de una composición en una sola imagen,
// empaquetando el proyecto UNA vez y reutilizando el mismo navegador (mucho más rápido
// que llamar a `remotion still` por cada fotograma).
//
// Uso: node scripts/hoja.mjs <Composicion> [frames|N] [escala=0.25] [salida]
//   frames: lista "10,200,450" o un número N de fotogramas repartidos por todo el video.
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [id, framesArg = "12", escalaArg = "0.25", salidaArg] = process.argv.slice(2);
if (!id) {
  console.error("Uso: node scripts/hoja.mjs <Composicion> [frames|N] [escala] [salida]");
  process.exit(1);
}
const escala = Number(escalaArg);
const salida = salidaArg ?? `out/hoja-${id}.png`;
const tmp = join("out", `.hoja-${id}`);
mkdirSync(tmp, { recursive: true });

const gl = process.env.REMOTION_GL ?? "swangle";
const serveUrl = await bundle({ entryPoint: "src/index.ts" });
const browser = await openBrowser("chrome", { chromiumOptions: { gl } });
const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser, chromiumOptions: { gl } });

const frames = framesArg.includes(",")
  ? framesArg.split(",").map(Number)
  : Array.from({ length: Number(framesArg) }, (_, i) =>
      Math.round(((i + 0.5) / Number(framesArg)) * (composition.durationInFrames - 1)),
    );

const archivos = [];
for (const frame of frames) {
  const output = join(tmp, `${frame}.png`);
  await renderStill({ composition, serveUrl, output, frame, scale: escala, puppeteerInstance: browser, chromiumOptions: { gl } });
  archivos.push(output);
  process.stdout.write(`${frame} `);
}
await browser.close({ silent: true });

// Une las imágenes en una cuadrícula con el número de frame en cada una (Python + Pillow)
execFileSync("python3", [
  "-c",
  `
import sys
from PIL import Image, ImageDraw
rutas = sys.argv[2:]
ims = [Image.open(r).convert("RGB") for r in rutas]
w, h = ims[0].size
cols = 6 if w < h else 4
filas = (len(ims) + cols - 1) // cols
hoja = Image.new("RGB", (cols * (w + 6), filas * (h + 6)), "white")
for i, (im, r) in enumerate(zip(ims, rutas)):
    x, y = (i % cols) * (w + 6), (i // cols) * (h + 6)
    hoja.paste(im, (x, y))
    ImageDraw.Draw(hoja).text((x + 6, y + 6), r.split("/")[-1][:-4], fill="yellow")
hoja.save(sys.argv[1])
print("\\n" + sys.argv[1], hoja.size)
`,
  salida,
  ...archivos,
], { stdio: "inherit" });
