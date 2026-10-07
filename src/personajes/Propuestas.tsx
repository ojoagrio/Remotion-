import { AbsoluteFill } from "remotion";
import { Camara, Lienzo } from "../comun/Lienzo";
import { estiloContorno, FUENTE } from "../comun/Textos";
import { ColoresPersonaje, Personaje, PosePersonaje } from "../n64/Personaje";

// Imagen 16:9 con tres propuestas de look de un personaje, cada una con un rasgo exagerado

export type PropuestaLook = {
  titulo: string;
  rasgo: string;
  ropa: string;
  frase: string;
  fondo: string;
  colores: ColoresPersonaje;
  pose: Partial<PosePersonaje>;
};

const POSE: PosePersonaje = { x: 0, z: 0, rotacion: 0.3, fasePaso: 0, caminar: 0, saludo: 0, salto: 0, respiracion: 0 };

export const PropuestasLook: React.FC<{ nombre: string; subtitulo: string; color: string; propuestas: PropuestaLook[] }> = ({
  nombre,
  subtitulo,
  color,
  propuestas,
}) => (
  <AbsoluteFill style={{ background: "#1b263b", padding: 40 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
      <div style={{ ...estiloContorno, fontSize: 76, color }}>{nombre}</div>
      <div style={{ fontFamily: FUENTE, fontSize: 38, color: "white" }}>{subtitulo}</div>
    </div>
    <div style={{ display: "flex", gap: 30, marginTop: 20 }}>
      {propuestas.map((p) => (
        <div key={p.titulo} style={{ width: 593, height: 880, background: p.fondo, borderRadius: 26, overflow: "hidden", position: "relative", border: "6px solid #000" }}>
          <Lienzo ancho={593} alto={660} escalaPixel={3}>
            <Camara pos={[0.9, 1.75, 4.6]} mira={[0, 1.35, 0]} fov={38} />
            <color attach="background" args={[p.fondo]} />
            <ambientLight intensity={1.3} />
            <directionalLight position={[2, 5, 6]} intensity={1.5} />
            <Personaje colores={p.colores} pose={{ ...POSE, ...p.pose }} />
          </Lienzo>
          <div style={{ position: "absolute", top: 18, left: 0, right: 0, textAlign: "center", ...estiloContorno, fontSize: 46 }}>{p.titulo}</div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 230, background: "#000000cc", padding: "16px 24px", color: "white" }}>
            <div style={{ fontFamily: FUENTE, fontSize: 30, color: "#ffd166" }}>RASGO EXAGERADO</div>
            <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 25, marginBottom: 6 }}>{p.rasgo}</div>
            <div style={{ fontFamily: "sans-serif", fontSize: 21, opacity: 0.9, marginBottom: 10 }}>{p.ropa}</div>
            <div style={{ fontFamily: "sans-serif", fontStyle: "italic", fontWeight: 700, fontSize: 23, color: "#8ecae6" }}>{p.frase}</div>
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
