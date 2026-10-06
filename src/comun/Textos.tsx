import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Fuente "Luckiest Guy" (licencia OFL) incluida en public/ para renderizar sin internet
export const FUENTE = "Luckiest Guy";
loadFont({ family: FUENTE, url: staticFile("fuentes/LuckiestGuy.woff2") });

export const estiloContorno: React.CSSProperties = {
  fontFamily: FUENTE,
  color: "white",
  WebkitTextStroke: "10px black",
  paintOrder: "stroke fill",
  textShadow: "0 6px 0 #000",
};

export const Etiqueta: React.FC<{ texto: string; color: string; style: React.CSSProperties }> = ({
  texto,
  color,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      padding: "10px 22px",
      borderRadius: 14,
      background: color,
      color: "white",
      fontFamily: FUENTE,
      fontSize: 38,
      boxShadow: "0 6px 0 rgba(0,0,0,0.35)",
      ...style,
    }}
  >
    {texto}
  </div>
);

// Subtítulo grande al estilo TikTok con el nombre de quien habla
export const Subtitulo: React.FC<{
  texto: string;
  nombre: string;
  color: string;
  centroY?: number;
}> = ({ texto, nombre, color, centroY }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <AbsoluteFill
      style={{
        justifyContent: centroY === undefined ? "center" : "flex-start",
        alignItems: "center",
        paddingTop: centroY === undefined ? 0 : centroY,
      }}
    >
      <div style={{ transform: `scale(${0.6 + pop * 0.4})`, maxWidth: 920, textAlign: "center" }}>
        <span
          style={{
            display: "inline-block",
            background: color,
            color: "white",
            fontFamily: FUENTE,
            fontSize: 34,
            padding: "4px 18px",
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          {nombre}
        </span>
        <div style={{ ...estiloContorno, fontSize: 62, lineHeight: 1.15 }}>{texto}</div>
      </div>
    </AbsoluteFill>
  );
};

// Gancho fijo arriba del video, típico de TikTok
export const Gancho: React.FC<{ texto: string; top?: number }> = ({ texto, top = 140 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 60,
      right: 60,
      padding: "14px 10px 6px",
      borderRadius: 24,
      background: "rgba(0,0,0,0.55)",
      textAlign: "center",
      ...estiloContorno,
      fontSize: 58,
      textShadow: "0 5px 0 #000",
    }}
  >
    {texto}
  </div>
);
