import duraciones from "./duraciones.json";
import guion from "./guion.json";

export const FPS = 30;
// Segundos antes de la primera línea y entre líneas
const INICIO = 0.25;
const PAUSA = 0.15;

export type Personaje = "pepe" | "lola";

export type Linea = {
  id: string;
  personaje: Personaje;
  texto: string;
  inicio: number; // frame
  duracion: number; // frames
};

// Línea de tiempo calculada a partir de la duración real de cada audio
export const LINEAS: Linea[] = (() => {
  let t = INICIO;
  return guion.lineas.map((l) => {
    const seg = (duraciones as Record<string, number>)[l.id];
    const linea: Linea = {
      id: l.id,
      personaje: l.personaje as Personaje,
      texto: l.texto,
      inicio: Math.round(t * FPS),
      duracion: Math.ceil(seg * FPS),
    };
    t += seg + PAUSA;
    return linea;
  });
})();

export const linea = (n: number) => LINEAS[n - 1];
export const fin = (l: Linea) => l.inicio + l.duracion;

export const lineaActiva = (frame: number) =>
  LINEAS.find((l) => frame >= l.inicio && frame < fin(l));
