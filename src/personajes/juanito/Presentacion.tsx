import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { orbita, suave } from "../../comun/camara";
import { crearLineas, fijo, fin, saltar } from "../../comun/lineaDeTiempo";
import { Camara, Lienzo, Vec3 } from "../../comun/Lienzo";
import { Sonido } from "../../comun/Sonido";
import { estiloContorno, FUENTE, Subtitulo } from "../../comun/Textos";
import { useBocas } from "../../comun/useBocas";
import { TextoTerminal } from "../../clawd/Clawd3D";
import { Personaje, PosePersonaje } from "../../n64/Personaje";
import { FichaPersonaje, JUANITO } from "../elenco";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";

// Presentación de Juanito (vertical) y su hoja de modelo (16:9)

const LINEAS = crearLineas(guion.lineas, duraciones, { inicio: 1.2, pausa: 0.35 });
const L = (n: number) => LINEAS[n - 1];
export const DURACION_PRESENTACION = fin(L(3)) + 110;

const POSE: PosePersonaje = { x: 0, z: 0, rotacion: 0, fasePaso: 0, caminar: 0, saludo: 0, salto: 0, respiracion: 0 };

// Estudio: pedestal giratorio, luces de borde y símbolos de código flotando
const Estudio: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <color attach="background" args={["#0d1b2a"]} />
    <ambientLight intensity={1.0} />
    <directionalLight position={[2, 5, 6]} intensity={1.5} />
    <pointLight position={[-2.5, 2.5, 1]} intensity={10} distance={6} color="#3a86ff" />
    <pointLight position={[2.5, 2.5, 1]} intensity={10} distance={6} color="#ff4fd8" />
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshLambertMaterial color="#14213d" />
    </mesh>
    <mesh position={[0, 0.15, 0]} rotation={[0, frame * 0.01, 0]}>
      <cylinderGeometry args={[1.2, 1.3, 0.3, 10]} />
      <meshLambertMaterial color="#1b263b" flatShading />
    </mesh>
    <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.05, 1.15, 10]} />
      <meshBasicMaterial color="#3a86ff" />
    </mesh>
    {["</>", "{ }", ";", "=>", "git push", "0101"].map((t, i) => {
      // Siempre detrás de Juanito (semicírculo trasero), para no taparle la cara
      const a = Math.PI + 0.25 + (i / 5) * (Math.PI - 0.5) + Math.sin(frame * 0.01 + i) * 0.1;
      return (
        <TextoTerminal
          key={i}
          texto={t}
          pos={[Math.cos(a) * 2.8, 1.4 + Math.sin(frame * 0.04 + i) * 0.3 + (i % 3) * 0.6, Math.sin(a) * 2.2 - 0.8]}
          alto={0.28}
          color={i % 2 ? "#80ffdb" : "#ffd166"}
          fondo="#0d1b2a"
        />
      );
    })}
  </>
);

const Chip: React.FC<{ texto: string; color: string }> = ({ texto, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <div style={{ transform: `scale(${pop})`, background: color, color: "white", fontFamily: FUENTE, fontSize: 34, padding: "8px 20px", borderRadius: 14, boxShadow: "0 5px 0 rgba(0,0,0,0.35)" }}>
      {texto}
    </div>
  );
};

export const PresentacionJuanito: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const bocas = useBocas(LINEAS, envolventes);

  // Gira en el pedestal al inicio y al final; de frente mientras habla
  const giro = interpolate(f, [0, L(1).inicio, fin(L(3)) + 15, DURACION_PRESENTACION], [Math.PI * 2, 0, 0, -Math.PI], { ...fijo, easing: suave.easing });
  const pose: PosePersonaje = {
    ...POSE,
    rotacion: giro,
    respiracion: f / 15,
    boca: bocas.juanito ?? 0,
    saludo: f >= L(1).inicio && f < L(1).inicio + 45 ? 1 : f >= fin(L(3)) + 20 ? 1 : 0,
    teclear: f >= L(2).inicio && f < L(2).inicio + 50 ? 1 : 0,
    jarras: (f >= L(2).inicio + 50 && f < fin(L(3)) + 20) ? 1 : 0,
    salto: saltar(f, L(1).inicio, 12, 0.4) + saltar(f, L(2).inicio + 70, 12, 0.3),
    sueno: f >= fin(L(3)) - 25 && f < fin(L(3)) + 5 ? 0.6 : 0,
  };
  const a = interpolate(f, [0, L(1).inicio + 20, L(2).inicio, fin(L(3))], [-0.9, 0, 0, 0.35], fijo);
  const acercar = interpolate(f, [L(2).inicio, L(2).inicio + 30, fin(L(2)), fin(L(2)) + 20], [0, 1, 1, 0], fijo);
  const camPos: Vec3 = orbita([0, 0, 0], 5.2 - acercar * 1.6, a, 2.0 - acercar * 0.2);

  const ficha = JUANITO;
  return (
    <AbsoluteFill style={{ background: "#0d1b2a" }}>
      <Lienzo ancho={width} alto={height}>
        <Camara pos={camPos} mira={[0, 1.5 + acercar * 0.3, 0]} fov={46} />
        <Estudio frame={f} />
        <group position={[0, 0.3, 0]}>
          <Personaje colores={ficha.colores} pose={pose} />
        </group>
      </Lienzo>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 220px 60px rgba(0,0,0,0.6)" }} />

      {/* Nombre y rol */}
      <Sequence from={L(1).inicio + 20} layout="none">
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
          <div style={{ ...estiloContorno, fontSize: 130, color: ficha.color, transform: `scale(${spring({ frame: f - L(1).inicio - 20, fps, config: { damping: 9 } })}) rotate(-3deg)` }}>
            {ficha.nombre}
          </div>
          <div style={{ fontFamily: FUENTE, fontSize: 44, color: "white", textShadow: "0 4px 0 #000" }}>{ficha.rol}</div>
        </AbsoluteFill>
      </Sequence>

      {/* Rasgos de personalidad */}
      <Sequence from={fin(L(3)) + 10} layout="none">
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 380, gap: 14 }}>
          {["Simpático", "Bromista", "Ama el modo oscuro"].map((r, i) => (
            <Sequence key={r} from={i * 8} layout="none">
              <Chip texto={r} color={["#3a86ff", "#ff4fd8", "#2a9d8f"][i]} />
            </Sequence>
          ))}
        </AbsoluteFill>
      </Sequence>

      {LINEAS.map((l) => (
        <Sequence key={l.id} from={l.inicio} durationInFrames={l.duracion + 4} layout="none">
          <Audio src={staticFile(`voces/${guion.carpeta}/${l.id}.mp3`)} />
          <Subtitulo texto={l.texto} nombre={ficha.nombre} color={ficha.color} centroY={1180} />
        </Sequence>
      ))}

      <Sonido archivo="sonidos/musica-chiptune.wav" desde={0} volumen={0.16} bajarConVoces={{ lineas: LINEAS, volumen: 0.06 }} fundido={10} bucle />
      <Sonido archivo="sonidos/brillo.wav" desde={L(1).inicio + 18} volumen={0.4} />
      <Sonido archivo="sonidos/rimshot.wav" desde={fin(L(2)) + 2} volumen={0.5} />
      <Sonido archivo="sonidos/risa-chica.wav" desde={fin(L(3))} volumen={0.4} />
      {[0, 8, 16].map((d) => (
        <Sonido key={d} archivo="sonidos/pop.wav" desde={fin(L(3)) + 10 + d} volumen={0.3} />
      ))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- hoja de modelo (16:9)
const Vistas: React.FC<{ ficha: FichaPersonaje }> = ({ ficha }) => {
  const vistas = [0, -0.75, -Math.PI / 2, Math.PI];
  return (
    <>
      <Camara pos={[0, 1.6, 14]} mira={[0, 1.2, 0]} fov={22} />
      <color attach="background" args={["#f8f9fa"]} />
      <ambientLight intensity={1.3} />
      <directionalLight position={[2, 5, 6]} intensity={1.4} />
      {vistas.map((r, i) => (
        <group key={i} position={[-3.6 + i * 2.4, 0, 0]}>
          <Personaje colores={ficha.colores} pose={{ ...POSE, rotacion: r }} sombra={false} />
        </group>
      ))}
    </>
  );
};

const Expresiones: React.FC<{ ficha: FichaPersonaje }> = ({ ficha }) => {
  const caras: Partial<PosePersonaje>[] = [{ boca: 0.9 }, { enojo: 1, boca: 0.3 }, { sueno: 0.7 }];
  return (
    <>
      <Camara pos={[0, 1.95, 8.5]} mira={[0, 1.8, 0]} fov={14} />
      <color attach="background" args={["#e9ecef"]} />
      <ambientLight intensity={1.3} />
      <directionalLight position={[2, 5, 6]} intensity={1.4} />
      {caras.map((c, i) => (
        <group key={i} position={[-1.4 + i * 1.4, 0, 0]}>
          <Personaje colores={ficha.colores} pose={{ ...POSE, ...c }} sombra={false} />
        </group>
      ))}
    </>
  );
};

export const HojaModeloJuanito: React.FC = () => {
  const ficha = JUANITO;
  const c = ficha.colores;
  const paleta: [string, string][] = [
    ["Piel", c.piel],
    ["Sudadera", c.camisa],
    ["Jeans", c.pantalon],
    ["Tenis", c.zapatos],
    ["Pelo", c.cabello ?? "#000"],
    ["Audífonos", c.audifonos ?? "#000"],
  ];
  const etiqueta: React.CSSProperties = { fontFamily: FUENTE, fontSize: 30, color: "#1b263b", textAlign: "center" };
  return (
    <AbsoluteFill style={{ background: "#f8f9fa", padding: 40, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
        <div style={{ ...estiloContorno, fontSize: 84, color: ficha.color }}>{ficha.nombre}</div>
        <div style={{ fontFamily: FUENTE, fontSize: 36, color: "#1b263b" }}>Hoja de modelo · {ficha.rol}</div>
      </div>
      <div style={{ position: "absolute", top: 150, left: 40, width: 1160, height: 640, border: "4px solid #1b263b", borderRadius: 16, overflow: "hidden" }}>
        <Lienzo ancho={1160} alto={640} escalaPixel={3}>
          <Vistas ficha={ficha} />
        </Lienzo>
        <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
          {["FRENTE", "3/4", "PERFIL", "ESPALDA"].map((v) => (
            <div key={v} style={etiqueta}>{v}</div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", top: 150, left: 1230, width: 650, height: 300, border: "4px solid #1b263b", borderRadius: 16, overflow: "hidden" }}>
        <Lienzo ancho={650} alto={300} escalaPixel={3}>
          <Expresiones ficha={ficha} />
        </Lienzo>
        <div style={{ position: "absolute", top: 6, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
          {["FELIZ", "ENOJADO", "CANSADO"].map((v) => (
            <div key={v} style={{ ...etiqueta, fontSize: 24 }}>{v}</div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", top: 470, left: 1230, width: 650 }}>
        <div style={{ fontFamily: FUENTE, fontSize: 30, color: "#1b263b", marginBottom: 8 }}>PALETA</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {paleta.map(([n, col]) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, width: 205 }}>
              <div style={{ width: 40, height: 40, background: col, borderRadius: 8, border: "2px solid #1b263b" }} />
              <div style={{ fontSize: 20, color: "#1b263b" }}>
                {n}
                <br />
                <span style={{ fontFamily: "monospace" }}>{col}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: FUENTE, fontSize: 30, color: "#1b263b", marginTop: 18 }}>VOZ</div>
        <div style={{ fontSize: 22, color: "#1b263b" }}>ElevenLabs «{ficha.voz.nombre}» ({ficha.voz.id})</div>
      </div>
      <div style={{ position: "absolute", top: 810, left: 40, right: 40, display: "flex", gap: 40 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FUENTE, fontSize: 30, color: "#1b263b" }}>PERSONALIDAD</div>
          {ficha.personalidad.map((p) => (
            <div key={p} style={{ fontSize: 24, color: "#1b263b" }}>• {p}</div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FUENTE, fontSize: 30, color: "#1b263b" }}>MULETILLAS</div>
          {ficha.muletillas.map((m) => (
            <div key={m} style={{ fontSize: 24, color: "#1b263b", fontStyle: "italic" }}>«{m}»</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
