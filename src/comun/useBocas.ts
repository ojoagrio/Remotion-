import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Linea, lineaActiva } from "./lineaDeTiempo";

export type Envolventes = Record<string, number[]>;

// Apertura de boca (0..1) de cada personaje según el volumen de su audio.
// - Con "envolventes" (generadas con scripts/envolventes.py) no decodifica audio en el
//   navegador: es más rápido y evita los límites de AudioContext con muchos audios.
// - Con una carpeta, decodifica los MP3 con @remotion/media-utils.
export function useBocas<P extends string>(lineas: Linea<P>[], fuente: string): Partial<Record<P, number>>;
export function useBocas<P extends string>(lineas: Linea<P>[], fuente: Envolventes): Partial<Record<P, number>>;
export function useBocas<P extends string>(lineas: Linea<P>[], fuente: string | Envolventes) {
  return typeof fuente === "string" ? useBocasAudio(lineas, fuente) : useBocasEnvolventes(lineas, fuente);
}

const useBocasEnvolventes = <P extends string>(lineas: Linea<P>[], envolventes: Envolventes) => {
  const frame = useCurrentFrame();
  const bocas: Partial<Record<P, number>> = {};
  const activa = lineaActiva(lineas, frame);
  if (activa) {
    const valores = envolventes[activa.id] ?? [];
    bocas[activa.personaje] = valores[frame - activa.inicio] ?? 0;
  }
  return bocas;
};

const useBocasAudio = <P extends string>(lineas: Linea<P>[], carpeta: string) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Las líneas no cambian durante el render, así que el orden de los hooks es estable
  const audios = lineas.map((l) => useAudioData(staticFile(`${carpeta}/${l.id}.mp3`)));
  const bocas: Partial<Record<P, number>> = {};
  const activa = lineaActiva(lineas, frame);
  const datos = activa ? audios[lineas.indexOf(activa)] : null;
  if (activa && datos) {
    const espectro = visualizeAudio({
      fps,
      frame: frame - activa.inicio,
      audioData: datos,
      numberOfSamples: 16,
    });
    const volumen = espectro.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
    bocas[activa.personaje] = Math.min(1, volumen * 6);
  }
  return bocas;
};
