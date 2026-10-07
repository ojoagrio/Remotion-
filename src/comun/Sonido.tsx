import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { Linea, lineaActiva } from "./lineaDeTiempo";

// Un efecto o pista de sonido colocado en la línea de tiempo.
// - desde/hasta: frames absolutos del video (hasta es opcional)
// - volumen: volumen base 0..1
// - bajarConVoces: si se indica, el volumen baja a ese valor mientras alguien habla
// - fundido: frames de fundido de entrada y salida
export const Sonido: React.FC<{
  archivo: string;
  desde: number;
  hasta?: number;
  volumen?: number;
  bajarConVoces?: { lineas: Linea[]; volumen: number };
  fundido?: number;
  bucle?: boolean;
  // Velocidad de reproducción (1 = normal)
  velocidad?: number;
}> = ({ archivo, desde, hasta, volumen = 1, bajarConVoces, fundido = 0, bucle = false, velocidad = 1 }) => {
  const duracion = hasta === undefined ? undefined : hasta - desde;
  return (
    <Sequence from={desde} durationInFrames={duracion} layout="none">
      <Audio
        src={staticFile(archivo)}
        loop={bucle}
        playbackRate={velocidad}
        volume={(f) => {
          let v = volumen;
          if (bajarConVoces) {
            // Bajada suave alrededor de cada línea de diálogo
            const cerca = [0, 4, 8].some((d) => lineaActiva(bajarConVoces.lineas, desde + f + d));
            if (lineaActiva(bajarConVoces.lineas, desde + f) || cerca) v = bajarConVoces.volumen;
          }
          if (fundido > 0) {
            v *= interpolate(f, [0, fundido], [0, 1], { extrapolateRight: "clamp" });
            if (duracion !== undefined) {
              v *= interpolate(f, [duracion - fundido, duracion], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
            }
          }
          return v;
        }}
      />
    </Sequence>
  );
};
