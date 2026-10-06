import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Linea, lineaActiva } from "./lineaDeTiempo";

// Apertura de boca (0..1) de cada personaje según el volumen real de su audio
export const useBocas = <P extends string>(
  lineas: Linea<P>[],
  carpeta: string,
): Partial<Record<P, number>> => {
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
