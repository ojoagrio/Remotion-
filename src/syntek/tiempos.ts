import { crearLineas, fin } from "../comun/lineaDeTiempo";
import duraciones from "./duraciones.json";
import guion from "./guion.json";

export type Quien = "conductor" | "conductora" | "aleks";
export const FPS = 30;
export const LINEAS = crearLineas<Quien>(guion.lineas, duraciones, { inicio: 0.9, fps: FPS });
export const L = (n: number) => LINEAS[n - 1];

// Momentos clave dentro de las líneas (segundos medidos en los audios con silencedetect)
const en = (n: number, seg: number) => L(n).inicio + Math.round(seg * FPS);
export const JUANGA = en(1, 3.42); // «...y le pidieron una de Juan Gabriel»
export const ABUCHEO = fin(L(2)) - 40; // «¡Lo abuchearon!»
export const DALI_T = en(4, 2.31); // «como Dalí»
export const PICASSO_T = en(4, 3.79); // «como Picasso»
export const INGLATERRA = en(4, 5.9); // «me voy pa' Inglaterra»
export const TABASCO = en(5, 2.43); // «...concierto gratis en Tabasco»
export const DURACION = fin(L(7)) + 45;
