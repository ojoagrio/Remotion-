import { crearLineas, fin } from "../comun/lineaDeTiempo";
import duraciones from "./duraciones.json";
import guion from "./guion.json";

export type Quien = "mama" | "ia";
export const LINEAS = crearLineas<Quien>(guion.lineas, duraciones, { inicio: 0.5 });
export const L = (n: number) => LINEAS[n - 1];

// Momentos clave (frames)
export const DUELO = fin(L(4)) + 3; // empieza el duelo del oeste
export const DUELO_ROBOT = DUELO + 22; // primer plano de los ojos del robot
export const DUELO_CHANCLA = DUELO + 43; // aparece la chancla
export const ESCAPE = L(6).inicio + 30; // el robot sale disparado al fregadero
export const LAVADO = fin(L(6)) + 5; // cámara rápida lavando
export const FINAL = LAVADO + 40; // cartel final
