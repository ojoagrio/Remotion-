import { AbsoluteFill } from "remotion";
import { Camara, Lienzo } from "../../comun/Lienzo";
import { estiloContorno, FUENTE } from "../../comun/Textos";
import { ColoresPersonaje, Personaje, PosePersonaje } from "../../n64/Personaje";
import { JUANITO } from "../elenco";

// Tres propuestas de look "cool" para Juanito, cada una con un rasgo facial exagerado (imagen 16:9)

const base = JUANITO.colores;
type Propuesta = { titulo: string; rasgo: string; ropa: string; fondo: string; colores: ColoresPersonaje; pose: Partial<PosePersonaje> };

const PROPUESTAS: Propuesta[] = [
  {
    titulo: "A · LENTES XL",
    rasgo: "Lentes gigantes con cristal azul",
    ropa: "Bomber negra · playera amarilla · cargo · tenis blancos",
    fondo: "#ffd166",
    colores: { ...base, chaqueta: "#1b1b1f", camisa: "#ffbe0b", pantalon: "#8d7b68", zapatos: "#f8f9fa", lentesCristal: "#4cc9f0", rasgos: { lentes: 1.65, sonrisa: 0.35 } },
    pose: { jarras: 1 },
  },
  {
    titulo: "B · COPETE SUPREMO",
    rasgo: "Copete enorme que desafía la gravedad",
    ropa: "Chamarra de mezclilla · hoodie naranja · cadena dorada",
    fondo: "#80ffdb",
    colores: { ...base, chaqueta: "#3d5a80", camisa: "#ff7a00", pantalon: "#1b1b1f", cadena: "#ffd166", audifonos: undefined, rasgos: { copete: 2.6, cejas: 0.6, sonrisa: 0.25 } },
    pose: { saludo: 1, brazoSaludo: "izquierdo" },
  },
  {
    titulo: "C · SONRISA CONTAGIOSA",
    rasgo: "Sonrisa de oreja a oreja y cejas expresivas",
    ropa: "Gorro rojo · chamarra varsity morada · tenis rojos",
    fondo: "#ffafcc",
    colores: { ...base, gorro: "#e63946", copete: false, chaqueta: "#7b2cbf", camisa: "#f8f9fa", rasgos: { sonrisa: 1.7, cejas: 1.2, orejas: 0.6, lentes: 1.15 } },
    pose: { manosCabeza: 1 },
  },
];

const POSE: PosePersonaje = { x: 0, z: 0, rotacion: 0.3, fasePaso: 0, caminar: 0, saludo: 0, salto: 0, respiracion: 0 };

export const PropuestasJuanito: React.FC = () => (
  <AbsoluteFill style={{ background: "#1b263b", padding: 40 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
      <div style={{ ...estiloContorno, fontSize: 76, color: JUANITO.color }}>JUANITO</div>
      <div style={{ fontFamily: FUENTE, fontSize: 38, color: "white" }}>3 propuestas de look cool</div>
    </div>
    <div style={{ display: "flex", gap: 30, marginTop: 20 }}>
      {PROPUESTAS.map((p) => (
        <div key={p.titulo} style={{ width: 593, height: 880, background: p.fondo, borderRadius: 26, overflow: "hidden", position: "relative", border: "6px solid #000" }}>
          <Lienzo ancho={593} alto={700} escalaPixel={3}>
            <Camara pos={[0.9, 1.75, 4.6]} mira={[0, 1.35, 0]} fov={38} />
            <color attach="background" args={[p.fondo]} />
            <ambientLight intensity={1.3} />
            <directionalLight position={[2, 5, 6]} intensity={1.5} />
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.4, 12]} />
              <meshBasicMaterial color="#00000022" transparent opacity={0.15} />
            </mesh>
            <Personaje colores={p.colores} pose={{ ...POSE, ...p.pose }} />
          </Lienzo>
          <div style={{ position: "absolute", top: 18, left: 0, right: 0, textAlign: "center", ...estiloContorno, fontSize: 50 }}>{p.titulo}</div>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 180, background: "#000000cc", padding: "18px 24px", color: "white" }}>
            <div style={{ fontFamily: FUENTE, fontSize: 32, color: "#ffd166" }}>RASGO EXAGERADO</div>
            <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 26, marginBottom: 8 }}>{p.rasgo}</div>
            <div style={{ fontFamily: "sans-serif", fontSize: 22, opacity: 0.9 }}>{p.ropa}</div>
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
