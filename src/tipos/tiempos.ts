import { crearLineas, fin } from "../comun/lineaDeTiempo";
import { Palabra } from "../comun/SubtituloViral";
import duraciones from "./duraciones.json";
import guion from "./guion.json";
import palabrasJson from "./palabras.json";

export type Quien = "narrador" | "educado" | "discutidor" | "triste" | "ia" | "mama";
export const FPS = 30;
export const LINEAS = crearLineas<Quien>(guion.lineas, duraciones, { inicio: 0.3, fps: FPS, pausa: 0.15 });
export const L = (n: number) => LINEAS[n - 1];
export const PALABRAS = palabrasJson as Record<string, Palabra[]>;

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zñ]/g, "");

// Frame absoluto en que se dice una palabra de la línea n
export const momento = (n: number, palabra: string, ocurrencia = 1) => {
  let vistas = 0;
  for (const p of PALABRAS[L(n).id]) {
    if (normalizar(p.palabra) === normalizar(palabra) && ++vistas === ocurrencia) {
      return L(n).inicio + Math.round(p.inicio * FPS);
    }
  }
  throw new Error(`No encuentro «${palabra}» en la línea ${n}`);
};

// Secciones: gancho, los cinco tipos y la llamada final
export const SECCIONES = {
  gancho: L(1).inicio,
  tipo1: L(2).inicio,
  tipo2: L(4).inicio,
  tipo3: L(5).inicio,
  tipo4: L(9).inicio,
  tipo5: L(11).inicio,
  cta: L(13).inicio,
};

export const T = {
  tu: momento(1, "tú"),
  mundo: momento(3, "mundo"),
  claro: momento(4, "claro"),
  ensayo: momento(4, "ensayo"),
  estasMal: L(6).inicio,
  razonIA: L(7).inicio,
  porQue: L(8).inicio,
  tres: momento(9, "tres"),
  visto: momento(10, "visto"),
  ia11: momento(11, "IA"),
  mama: momento(11, "mamá"),
  comer: momento(12, "comer"),
  cuatro: momento(13, "cuatro"),
};

export const DURACION = fin(L(13)) + 45;
