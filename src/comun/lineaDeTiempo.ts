export type LineaGuion = {
  id: string;
  personaje: string;
  texto: string;
  // Silencio extra (segundos) después de esta línea, para pausas cómicas
  pausa?: number;
};

export type Linea<P extends string = string> = {
  id: string;
  personaje: P;
  texto: string;
  inicio: number; // frame
  duracion: number; // frames
};

// Calcula en qué frame empieza cada línea a partir de la duración real de los audios
export const crearLineas = <P extends string>(
  lineas: LineaGuion[],
  duraciones: Record<string, number>,
  { fps = 30, inicio = 0.25, pausa = 0.15 } = {},
): Linea<P>[] => {
  let t = inicio;
  return lineas.map((l) => {
    const seg = duraciones[l.id];
    const linea: Linea<P> = {
      id: l.id,
      personaje: l.personaje as P,
      texto: l.texto,
      inicio: Math.round(t * fps),
      duracion: Math.ceil(seg * fps),
    };
    t += seg + pausa + (l.pausa ?? 0);
    return linea;
  });
};

export const fin = (l: Linea) => l.inicio + l.duracion;

export const lineaActiva = <P extends string>(lineas: Linea<P>[], frame: number) =>
  lineas.find((l) => frame >= l.inicio && frame < fin(l));

export const fijo = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Parábola de salto entre dos frames
export const saltar = (frame: number, inicio: number, duracion: number, altura: number) => {
  const t = (frame - inicio) / duracion;
  if (t < 0 || t > 1) return 0;
  return 4 * altura * t * (1 - t);
};
