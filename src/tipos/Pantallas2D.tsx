import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { estiloContorno, FUENTE } from "../comun/Textos";

// Hoja de tarea con el «¡Claro! Aquí tienes tu ensayo» rodeado en rojo y un 0/10
export const HojaTarea: React.FC<{ circulo: number; nota: number }> = ({ circulo, nota }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 12 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 420,
        left: 120,
        right: 120,
        height: 700,
        background: "#fffdf3",
        borderRadius: 10,
        padding: "40px 50px",
        transform: `translateY(${(1 - entrada) * 900}px) rotate(-2deg)`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        backgroundImage: "repeating-linear-gradient(#fffdf3 0 52px, #a8d0ff 52px 54px)",
        fontFamily: "'Comic Sans MS', 'Comic Neue', cursive, sans-serif",
        color: "#1d3557",
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 700 }}>Tarea de Historia — Kevin, 3°B</div>
      <div style={{ position: "relative", display: "inline-block", fontSize: 44, marginTop: 30 }}>
        ¡Claro! Aquí tienes tu ensayo:
        {/* Círculo rojo dibujándose */}
        <svg style={{ position: "absolute", left: -30, top: -26, overflow: "visible" }} width={640} height={110}>
          <ellipse
            cx={320}
            cy={52}
            rx={330}
            ry={50}
            fill="none"
            stroke="#e63946"
            strokeWidth={7}
            strokeDasharray={2200}
            strokeDashoffset={2200 * (1 - circulo)}
          />
        </svg>
      </div>
      <div style={{ fontSize: 34, marginTop: 26, lineHeight: 1.6, color: "#444" }}>
        La Revolución Mexicana fue un movimiento armado que inició en 1910...
        <br />
        ¿Quieres que lo haga más largo o en forma de poema?
      </div>
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: 40,
          ...estiloContorno,
          color: "#e63946",
          fontSize: 140,
          transform: `scale(${nota}) rotate(-12deg)`,
        }}
      >
        0/10
      </div>
    </div>
  );
};

// Chat tipo mensajería con la mamá
export const ChatMama: React.FC<{ mensajes: { de: "mama" | "yo"; texto: string; desde: number }[] }> = ({ mensajes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 380,
        left: 150,
        right: 150,
        height: 880,
        background: "#efe7dd",
        borderRadius: 50,
        border: "16px solid #111",
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ background: "#075e54", color: "white", padding: "22px 30px", fontFamily: FUENTE, fontSize: 40 }}>
        MAMÁ
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: 26 }}>
        {mensajes.map((m, i) => {
          const p = spring({ frame: frame - m.desde, fps, config: { damping: 12 } });
          if (frame < m.desde) return null;
          return (
            <div
              key={i}
              style={{
                alignSelf: m.de === "yo" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                background: m.de === "yo" ? "#dcf8c6" : "#ffffff",
                borderRadius: 22,
                padding: "16px 22px",
                fontFamily: "sans-serif",
                fontSize: 36,
                color: "#111",
                boxShadow: "0 2px 0 rgba(0,0,0,0.15)",
                transform: `scale(${p})`,
                transformOrigin: m.de === "yo" ? "right" : "left",
              }}
            >
              {m.texto}
            </div>
          );
        })}
        {/* "escribiendo..." al final */}
        {frame > (mensajes[mensajes.length - 1]?.desde ?? 0) + 20 && (
          <div style={{ fontFamily: "sans-serif", fontSize: 30, color: "#075e54", fontStyle: "italic", opacity: interpolate(Math.sin(frame * 0.3), [-1, 1], [0.4, 1]) }}>
            Mamá está escribiendo...
          </div>
        )}
      </div>
    </div>
  );
};
