import { AbsoluteFill } from "remotion";
import { Camara, Lienzo } from "../../comun/Lienzo";
import { estiloContorno, FUENTE } from "../../comun/Textos";
import { ColoresPersonaje, Personaje, PosePersonaje } from "../../n64/Personaje";

// Tres propuestas de look para Paty: niña sabelotodo que a veces está en contra de la IA (imagen 16:9)

const base: ColoresPersonaje = {
  piel: "#c98d6b",
  camisa: "#f8f9fa",
  pantalon: "#1d3557",
  sombrero: "#7a3b1d",
  zapatos: "#ff4fd8",
  gorra: false,
  bigote: false,
  cabello: "#7a3b1d",
  lentes: true,
};

type Propuesta = { titulo: string; rasgo: string; ropa: string; frase: string; fondo: string; colores: ColoresPersonaje; pose: Partial<PosePersonaje> };

const PROPUESTAS: Propuesta[] = [
  {
    titulo: "A · COLETAS ANTENA",
    rasgo: "Coletas gigantes: se alzan cuando sabe la respuesta",
    ropa: "Jumper morado · blusa blanca · moños y tenis rosas",
    frase: "«¡Eso no lo dijo la IA, lo dije yo!»",
    fondo: "#cdb4db",
    colores: { ...base, mono: "#ff4fd8", mandil: "#7b2cbf", pantalon: "#7b2cbf", emblema: "A+", rasgos: { coletas: 1.9, lentes: 1.2, sonrisa: 0.3 } },
    pose: { saludo: 1 },
  },
  {
    titulo: "B · CEJA ESCÉPTICA",
    rasgo: "Una ceja siempre levantada… y muchas pecas",
    ropa: "Melena suelta · hoodie verde «¿IA?» · jeans · tenis amarillos",
    frase: "«¿Y de dónde sacó eso la IA? Cítame la fuente.»",
    fondo: "#a8dadc",
    colores: { ...base, melena: true, camisa: "#2a9d8f", zapatos: "#ffbe0b", emblema: "¿IA?", rasgos: { cejaEsceptica: 1.5, pecas: 1.3 } },
    pose: { jarras: 1 },
  },
  {
    titulo: "C · CHONGO GENIO",
    rasgo: "Chongo enorme con lápiz y sonrisa con frenos",
    ropa: "Suéter rojo · playera amarilla «π» · falda azul",
    frase: "«Lo resolví a mano. En papel. Como en la antigüedad.»",
    fondo: "#ffd6a5",
    colores: { ...base, chongo: true, lapiz: true, chaqueta: "#e63946", camisa: "#ffd166", pantalon: "#264653", zapatos: "#1b1b1f", emblema: "π", rasgos: { chongo: 1.6, sonrisa: 1.2, frenos: true, pecas: 0.8, lentes: 1.1 } },
    pose: { brazosAdelante: 1 },
  },
];

const POSE: PosePersonaje = { x: 0, z: 0, rotacion: 0.3, fasePaso: 0, caminar: 0, saludo: 0, salto: 0, respiracion: 0 };

export const PropuestasPaty: React.FC = () => (
  <AbsoluteFill style={{ background: "#1b263b", padding: 40 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
      <div style={{ ...estiloContorno, fontSize: 76, color: "#ff4fd8" }}>PATY</div>
      <div style={{ fontFamily: FUENTE, fontSize: 38, color: "white" }}>la niña sabelotodo que no confía en la IA · 3 propuestas</div>
    </div>
    <div style={{ display: "flex", gap: 30, marginTop: 20 }}>
      {PROPUESTAS.map((p) => (
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
            <div style={{ fontFamily: "sans-serif", fontStyle: "italic", fontWeight: 700, fontSize: 23, color: "#ff8fab" }}>{p.frase}</div>
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
