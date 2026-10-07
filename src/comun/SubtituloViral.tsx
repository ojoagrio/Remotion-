import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { estiloContorno } from "./Textos";

export type Palabra = { palabra: string; inicio: number; fin: number };

// Agrupa las palabras en bloques cortos (máx. "porBloque"), cortando también en puntuación
const agrupar = (palabras: Palabra[], porBloque: number) => {
  const bloques: Palabra[][] = [];
  let actual: Palabra[] = [];
  for (const p of palabras) {
    actual.push(p);
    if (actual.length >= porBloque || /[.,:;?!…]$/.test(p.palabra)) {
      bloques.push(actual);
      actual = [];
    }
  }
  if (actual.length) bloques.push(actual);
  return bloques;
};

// Subtítulos estilo viral: pocas palabras a la vez, la palabra que se dice en amarillo
// y con un pequeño salto. "palabras" son tiempos en segundos relativos al audio de la línea;
// el componente se coloca dentro de un <Sequence> que empieza con el audio.
export const SubtituloViral: React.FC<{
  palabras: Palabra[];
  porBloque?: number;
  top?: number;
  resaltar?: string;
}> = ({ palabras, porBloque = 3, top = 1180, resaltar = "#ffe600" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const bloques = agrupar(palabras, porBloque);
  const indice = bloques.findIndex((b, i) => {
    const siguiente = bloques[i + 1];
    return t >= b[0].inicio - 0.05 && (!siguiente || t < siguiente[0].inicio - 0.05);
  });
  if (indice < 0) return null;
  const bloque = bloques[indice];
  const entrada = interpolate(t, [bloque[0].inicio - 0.05, bloque[0].inicio + 0.07], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: top }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 22px",
          maxWidth: 960,
          transform: `scale(${entrada})`,
        }}
      >
        {bloque.map((p, i) => {
          const activa = t >= p.inicio - 0.03 && (t < p.fin + 0.05 || i === bloque.length - 1);
          const salto = activa ? interpolate(t, [p.inicio - 0.03, p.inicio + 0.08], [1.25, 1.1], { extrapolateRight: "clamp" }) : 1;
          return (
            <span
              key={i}
              style={{
                ...estiloContorno,
                fontSize: 96,
                lineHeight: 1.1,
                color: activa ? resaltar : "white",
                transform: `scale(${salto}) rotate(${activa ? -2 : 0}deg)`,
                display: "inline-block",
                textTransform: "uppercase",
              }}
            >
              {p.palabra}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
