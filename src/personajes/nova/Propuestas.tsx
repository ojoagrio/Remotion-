import { AbsoluteFill } from "remotion";
import { Camara, Lienzo } from "../../comun/Lienzo";
import { estiloContorno, FUENTE } from "../../comun/Textos";
import { ColoresNova, DisenoNova, Nova3D, PoseNova } from "./Nova3D";

// Tres propuestas para NOVA, el robot asistente de IA que flota (imagen 16:9)

type Propuesta = { titulo: string; diseno: DisenoNova; rasgo: string; estilo: string; frase: string; fondo: string; colores: ColoresNova; pose: PoseNova };

const PROPUESTAS: Propuesta[] = [
  {
    titulo: "A · ORBE",
    diseno: "orbe",
    rasgo: "Ojos de pantalla gigantes y un halo de luz",
    estilo: "Esfera blanca brillante · orejitas azules · cachetes rosas",
    frase: "«¡Listo, ya lo hice! …¿Qué era lo que querías?»",
    fondo: "#bde0fe",
    colores: { cuerpo: "#f1f5f9", detalle: "#4361ee", pantalla: "#0b132b", luz: "#4cc9f0", mejillas: "#ff8fab" },
    pose: { flotar: 0.6, saludo: 1, boca: 0.5 },
  },
  {
    titulo: "B · TELE RETRO",
    diseno: "tele",
    rasgo: "Antenas de conejo y cara en una tele de los 80",
    estilo: "Tele menta · pantalla verde de terminal · hélice abajo",
    frase: "«Sé todo lo que pasó en el mundo… hasta 2023.»",
    fondo: "#caffbf",
    colores: { cuerpo: "#06d6a0", detalle: "#073b4c", pantalla: "#081c15", luz: "#b7ff4a" },
    pose: { flotar: 1.2, boca: 0.2 },
  },
  {
    titulo: "C · GOTITA",
    diseno: "gota",
    rasgo: "Un solo ojo enorme y antena con chispa",
    estilo: "Gotita morada tipo fantasmita · luz amarilla · cachetes fucsia",
    frase: "«¡Perdón! Tienes toda la razón.» (siempre)",
    fondo: "#e7c6ff",
    colores: { cuerpo: "#c77dff", detalle: "#5a189a", pantalla: "#10002b", luz: "#ffd60a", mejillas: "#ff4fd8" },
    pose: { flotar: 0.2, saludo: 1, boca: 0.6 },
  },
];

export const PropuestasNova: React.FC = () => (
  <AbsoluteFill style={{ background: "#1b263b", padding: 40 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
      <div style={{ ...estiloContorno, fontSize: 76, color: "#4cc9f0" }}>NOVA</div>
      <div style={{ fontFamily: FUENTE, fontSize: 38, color: "white" }}>el robot asistente de IA que flota · 3 propuestas</div>
    </div>
    <div style={{ display: "flex", gap: 30, marginTop: 20 }}>
      {PROPUESTAS.map((p) => (
        <div key={p.titulo} style={{ width: 593, height: 880, background: p.fondo, borderRadius: 26, overflow: "hidden", position: "relative", border: "6px solid #000" }}>
          <Lienzo ancho={593} alto={660} escalaPixel={3}>
            <Camara pos={[0.7, 1.6, 4.4]} mira={[0, 1.2, 0]} fov={40} />
            <color attach="background" args={[p.fondo]} />
            <ambientLight intensity={1.3} />
            <directionalLight position={[2, 5, 6]} intensity={1.5} />
            <group rotation={[0, 0.25, 0]}>
              <Nova3D diseno={p.diseno} colores={p.colores} pose={p.pose} />
            </group>
          </Lienzo>
          <div style={{ position: "absolute", top: 18, left: 0, right: 0, textAlign: "center", ...estiloContorno, fontSize: 50 }}>{p.titulo}</div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 230, background: "#000000cc", padding: "16px 24px", color: "white" }}>
            <div style={{ fontFamily: FUENTE, fontSize: 30, color: "#ffd166" }}>RASGO EXAGERADO</div>
            <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 25, marginBottom: 6 }}>{p.rasgo}</div>
            <div style={{ fontFamily: "sans-serif", fontSize: 21, opacity: 0.9, marginBottom: 10 }}>{p.estilo}</div>
            <div style={{ fontFamily: "sans-serif", fontStyle: "italic", fontWeight: 700, fontSize: 23, color: "#8ecae6" }}>{p.frase}</div>
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
