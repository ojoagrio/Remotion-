import { crearLineas, fin } from "../comun/lineaDeTiempo";
import { Palabra } from "../comun/SubtituloViral";
import duraciones from "./duraciones.json";
import guion from "./guion.json";
import palabrasJson from "./palabras.json";

export const FPS = 30;
export const LINEAS = crearLineas<"narrador">(guion.lineas, duraciones, { inicio: 0.4, fps: FPS, pausa: 0.2 });
export const L = (n: number) => LINEAS[n - 1];
export const PALABRAS = palabrasJson as Record<string, Palabra[]>;

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

export const momento = (n: number, palabra: string, ocurrencia = 1) => {
  let vistas = 0;
  for (const p of PALABRAS[L(n).id]) {
    if (normalizar(p.palabra) === normalizar(palabra) && ++vistas === ocurrencia) {
      return L(n).inicio + Math.round(p.inicio * FPS);
    }
  }
  throw new Error(`No encuentro «${palabra}» en la línea ${n}`);
};

export const T = {
  clawd: momento(2, "Clawd"),
  naranja: momento(2, "naranja"),
  ojos: momento(2, "ojos"),
  patitas: momento(2, "patitas"),
  claw: momento(3, "claw"),
  claude: momento(3, "Claude"),
  inicias: momento(4, "inicias"),
  saludarte: momento(4, "saludarte"),
  git: momento(5, "git"),
  creyendo: momento(5, "creyendo"),
  tresD: momento(6, "3D"),
  emojis: momento(6, "emojis"),
  azul: momento(7, "azul"),
  nadie: momento(7, "nadie"),
  saludalo: momento(8, "salúdalo"),
};

export const DURACION = fin(L(8)) + 60;
