import { crearLineas, fin, lineaActiva as activa } from "../comun/lineaDeTiempo";
import duraciones from "./duraciones.json";
import guion from "./guion.json";

export const FPS = 30;

export type Personaje = "pepe" | "lola";

export const LINEAS = crearLineas<Personaje>(guion.lineas, duraciones, { fps: FPS });

export const linea = (n: number) => LINEAS[n - 1];
export { fin };
export const lineaActiva = (frame: number) => activa(LINEAS, frame);
