import { interpolate, useCurrentFrame } from "remotion";

// Cuadro de diálogo estilo videojuego retro, con efecto de máquina de escribir
export const Dialogo: React.FC<{
  nombre: string;
  texto: string;
  lado: "izquierda" | "derecha" | "centro";
}> = ({ nombre, texto, lado }) => {
  const frame = useCurrentFrame();
  const letras = Math.floor(interpolate(frame, [0, texto.length * 1.5], [0, texto.length], {
    extrapolateRight: "clamp",
  }));
  const entrada = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  const posicion =
    lado === "izquierda"
      ? { left: 120 }
      : lado === "derecha"
        ? { right: 120 }
        : { left: "50%", marginLeft: -450 };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 80,
        width: 900,
        ...posicion,
        opacity: entrada,
        transform: `translateY(${(1 - entrada) * 40}px)`,
        background: "rgba(10, 16, 60, 0.85)",
        border: "8px solid white",
        borderRadius: 24,
        padding: "28px 40px",
        fontFamily: "'Courier New', monospace",
        fontWeight: "bold",
        color: "white",
        boxShadow: "0 0 0 8px #0a103c",
      }}
    >
      <div style={{ color: "#ffd21f", fontSize: 40, marginBottom: 10 }}>{nombre}</div>
      <div style={{ fontSize: 56, minHeight: 64 }}>{texto.slice(0, letras)}</div>
    </div>
  );
};
