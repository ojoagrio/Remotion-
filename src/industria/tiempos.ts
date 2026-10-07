import { crearLineas, fin } from "../comun/lineaDeTiempo";
import { Palabra } from "../comun/SubtituloViral";
import duraciones from "./duraciones.json";
import guion from "./guion.json";
import palabrasJson from "./palabras.json";

export const FPS = 30;
export const LINEAS = crearLineas<"narrador">(guion.lineas, duraciones, { inicio: 0.3, fps: FPS, pausa: 0.15 });
export const L = (n: number) => LINEAS[n - 1];
export const PALABRAS = palabrasJson as Record<string, Palabra[]>;

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zñ]/g, "");

// Frame absoluto en que el narrador dice una palabra de la línea n
export const momento = (n: number, palabra: string, ocurrencia = 1) => {
  const lista = PALABRAS[L(n).id];
  let vistas = 0;
  for (const p of lista) {
    if (normalizar(p.palabra) === normalizar(palabra) && ++vistas === ocurrencia) {
      return L(n).inicio + Math.round(p.inicio * FPS);
    }
  }
  throw new Error(`No encuentro «${palabra}» en la línea ${n}`);
};

// Momentos clave (frames), sacados de los tiempos de cada palabra
export const T = {
  doler: momento(1, "doler"),
  ahora: momento(2, "ahora"),
  arregla: momento(2, "arregla"),
  rompio: momento(2, "rompió"),
  despiden: momento(3, "despiden"),
  ia3: momento(3, "IA"),
  contratan: momento(3, "contratan"),
  innovacion: momento(3, "innovación"),
  doce: momento(4, "doce"),
  notas: momento(4, "notas"),
  nadie: momento(4, "nadie"),
  leer: momento(4, "leer"),
  refri: momento(5, "refri"),
  cepillo: momento(5, "cepillo"),
  tostadora: momento(5, "tostadora"),
  pan: momento(5, "pan"),
  quemado: momento(5, "quemado"),
  alguien: momento(6, "alguien"),
  eres: momento(6, "eres"),
  tu: momento(6, "tú"),
  prueba: momento(7, "prueba"),
};

export const DURACION = fin(L(7)) + 50;
