import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { enMano, golpe, mezclar, orbita, suave, sumar, Toma } from "../comun/camara";
import { fijo, fin, saltar } from "../comun/lineaDeTiempo";
import { Camara, Lienzo, Vec3 } from "../comun/Lienzo";
import { SubtituloViral } from "../comun/SubtituloViral";
import { estiloContorno, FUENTE, Gancho, Sello } from "../comun/Textos";
import { Oficina, Robot, Silla } from "../ia/Oficina";
import { ColoresPersonaje, Personaje, PosePersonaje } from "../n64/Personaje";
import { Azotea, ESCRITORIOS, OficinaAbierta, PEDESTALES, Puf, SalaJuntas, Vitrina } from "./Escenas";
import { Sonidos } from "./Sonidos";
import { DURACION, L, LINEAS, PALABRAS, T } from "./tiempos";

// «La industria tech»: video con estructura viral (gancho, lista rápida, giro y llamada
// a compartir) sobre cómo la IA está cambiando el trabajo en tecnología. Con sarcasmo.

const POSE: PosePersonaje = { x: 0, z: 0, rotacion: 0, fasePaso: 0, caminar: 0, saludo: 0, salto: 0, respiracion: 0 };

const humano = (camisa: string, pantalon: string, cabello: string, extra: Partial<ColoresPersonaje> = {}): ColoresPersonaje => ({
  piel: "#e0a47c",
  camisa,
  pantalon,
  sombrero: camisa,
  zapatos: "#222",
  gorra: false,
  bigote: false,
  cabello,
  ...extra,
});

const DEV = humano("#ff7a00", "#2b2d42", "#1d1d1d", { lentes: true });
const TRABAJADORES = [
  humano("#4361ee", "#22223b", "#3b2414"),
  humano("#2a9d8f", "#264653", "#111", { mono: "#ffd21f" }),
  humano("#e76f51", "#2b2d42", "#6b3e1d", { bigote: true }),
  humano("#8338ec", "#22223b", "#e9c46a"),
];
const SUPERVISOR = humano("#ff9f1c", "#1d3557", "#111", { lentes: true });
const EJECUTIVOS = [humano("#14213d", "#14213d", "#999"), humano("#3d405b", "#3d405b", "#111"), humano("#6d597a", "#463f5a", "#4a2c2a", { mono: "#e63946" })];
const AMIGO = humano("#06d6a0", "#073b4c", "#111", { gorra: true, sombrero: "#ef476f", lentes: true });

type Escena = "gancho" | "antesAhora" | "despidos" | "juntas" | "vitrina" | "azotea" | "cta";
const escenaEn = (f: number): Escena => {
  if (f < L(2).inicio) return "gancho";
  if (f < L(3).inicio) return "antesAhora";
  if (f < L(4).inicio) return "despidos";
  if (f < L(5).inicio) return "juntas";
  if (f < L(6).inicio) return "vitrina";
  if (f < L(7).inicio) return "azotea";
  return "cta";
};



const SILLA: Vec3 = [0, 0, 1.05];
const CABEZA_SENTADO: Vec3 = [0, 1.53, 1.05];
const ROBOT_OFICINA: Vec3 = [1.3, 1.75, -0.1];
const HACIA_ROBOT = Math.atan2(ROBOT_OFICINA[0] - SILLA[0], ROBOT_OFICINA[2] - SILLA[2]);

// ---------------------------------------------------------------- cámara (escenas de pantalla completa)
const camaraEn = (f: number): Toma => {
  const base = { giro: 0, desenfoque: 0, fov: 50 };
  const escena = escenaEn(f);

  if (escena === "gancho") {
    // Plano cerrado del dev iluminado por la pantalla en rojo; crash zoom en «doler»
    const zoom = interpolate(f, [T.doler, T.doler + 5], [0, 1], golpe);
    return {
      pos: sumar([0.95, 1.8, -0.35], enMano(f, 0.006 + zoom * 0.02)),
      mira: CABEZA_SENTADO,
      fov: 66 - interpolate(f, [0, T.doler], [0, 8], fijo) - zoom * 18,
      giro: zoom * 0.12,
      desenfoque: interpolate(f, [0, 6], [6, 0], fijo),
    };
  }
  if (escena === "despidos") {
    const t = interpolate(f, [L(3).inicio, L(4).inicio], [0, 1], suave);
    const supervisor = interpolate(f, [T.contratan, T.contratan + 20], [0, 1], suave);
    return {
      ...base,
      pos: mezclar([0, 4.2, 5.6], [0.3, 3.7, 4.8], t),
      mira: mezclar([0, 0.9, -0.6], [0.3, 1.2, -1.3], supervisor),
      fov: 54,
    };
  }
  if (escena === "juntas") {
    if (f >= T.nadie) {
      // Remate: la pila de notas vuela al bote de basura
      const t = interpolate(f, [T.nadie, T.nadie + 12], [0, 1], suave);
      return { ...base, pos: [1.2, 2.2, 4.4], mira: mezclar([0.6, 1.2, 0], [3.4, 0.7, 1.6], t), fov: 50 };
    }
    const t = interpolate(f, [L(4).inicio, T.nadie], [0, 1], suave);
    return { ...base, pos: mezclar([-3.0, 3.6, 4.6], [1.6, 3.4, 4.8], t), mira: mezclar([-2.0, 0.9, 0], [0.6, 0.9, 0], t), fov: 56 };
  }
  if (escena === "vitrina") {
    // Seguimos cada producto conforme aparece y crash zoom a la tostadora con el pan
    const x = interpolate(f, [L(5).inicio, T.refri, T.cepillo, T.tostadora], [0, PEDESTALES[0][0], PEDESTALES[1][0], PEDESTALES[2][0]], suave);
    if (f >= T.pan) {
      const zoom = interpolate(f, [T.pan, T.pan + 6], [0, 1], golpe);
      return {
        pos: sumar([2.2, 2.0, 2.6], enMano(f, f >= T.quemado ? 0.02 : 0.005)),
        mira: [2.2, 1.6, 0],
        fov: 58 - zoom * 20,
        giro: 0,
        desenfoque: 0,
      };
    }
    return { ...base, pos: [x * 0.7, 2.1, 4.6], mira: [x, 1.4, 0], fov: 46 };
  }
  if (escena === "azotea") {
    const a = interpolate(f, [L(6).inicio, fin(L(6))], [-0.7, 0.35], suave);
    const zoom = interpolate(f, [T.eres, T.eres + 6], [0, 1], golpe);
    return {
      ...base,
      pos: orbita([0, 0, 0], 4.2 - zoom * 1.6, a, 0.8 + zoom * 0.6),
      mira: [0, 1.6 + zoom * 0.2, 0],
      fov: 50 - zoom * 12,
      giro: zoom * -0.1,
    };
  }
  // CTA: el amigo confiado y el robot que aparece detrás
  const t = interpolate(f, [L(7).inicio, DURACION], [0, 1], suave);
  const zoom = interpolate(f, [T.prueba, T.prueba + 6], [0, 1], golpe);
  return {
    ...base,
    pos: sumar(mezclar([0.6, 2.0, 5.4], [0.3, 1.9, 4.6], t), enMano(f, zoom * 0.01)),
    mira: [0, 2.1, 0.8],
    fov: 52 - zoom * 8,
  };
};

// ---------------------------------------------------------------- mundos
const MundoGancho: React.FC<{ camara: Toma }> = ({ camara }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <Oficina frame={f} pantalla="error" progreso={0} alarma={interpolate(f, [T.doler, T.doler + 4], [0, 1], fijo)} />
      <Silla pos={SILLA} rot={Math.PI} />
      <group position={SILLA} rotation={[0, Math.PI, 0]}>
        <Personaje colores={DEV} pose={{ ...POSE, sentado: 1, respiracion: f / 15, sueno: 0.15, enojo: interpolate(f, [T.doler, T.doler + 4], [0, 0.7], fijo) }} />
      </group>
    </>
  );
};

// Media pantalla de «antes» o «ahora» en la oficina del dev
const MundoOficina: React.FC<{ ahora: boolean }> = ({ ahora }) => {
  const f = useCurrentFrame();
  const roto = ahora && f >= T.arregla;
  const pose: PosePersonaje = {
    ...POSE,
    sentado: 1,
    respiracion: f / 15,
    teclear: roto ? 0 : 1,
    manosCabeza: roto ? 1 : 0,
    enojo: roto ? 0.8 : 0,
  };
  return (
    <>
      <Camara pos={ahora ? [-1.9, 2.4, 3.0] : [2.0, 2.3, 2.9]} mira={[0.2, 1.3, 0]} fov={46} />
      <Oficina
        frame={f}
        pantalla={!ahora ? "codigo" : roto ? "error" : f >= T.ahora ? "rust" : "codigo"}
        progreso={interpolate(f, [T.ahora, T.arregla], [0, 1], fijo)}
        alarma={roto ? 1 : 0}
      />
      <Silla pos={SILLA} rot={Math.PI} />
      <group position={SILLA} rotation={[0, ahora && f >= T.ahora && !roto ? Math.PI - 0.5 : Math.PI, 0]}>
        <Personaje colores={DEV} pose={pose} />
      </group>
      {ahora && <Robot pos={ROBOT_OFICINA} rot={HACIA_ROBOT + Math.PI} boca={0} frame={f} animo={roto ? "feliz" : "normal"} />}
    </>
  );
};

const MundoDespidos: React.FC<{ camara: Toma }> = ({ camara }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const supervisorX = interpolate(f, [T.contratan, T.contratan + 25], [5, 0.6], fijo);
  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <OficinaAbierta />
      {ESCRITORIOS.map(([x, z], i) => {
        const sale = T.despiden + i * 5;
        const llega = T.ia3 + i * 5;
        const escala = interpolate(f, [sale, sale + 4], [1, 0], fijo);
        const robot = spring({ frame: f - llega, fps, config: { damping: 10 } });
        return (
          <group key={i}>
            {escala > 0 && (
              <group position={[x, 0, z - 0.55]} scale={escala}>
                <Personaje colores={TRABAJADORES[i]} pose={{ ...POSE, sentado: 1, teclear: 1, respiracion: f / 15 + i }} />
              </group>
            )}
            <Puf pos={[x, 0, z - 0.55]} t={interpolate(f, [sale, sale + 14], [0, 1], fijo)} />
            {robot > 0.01 && (
              <group scale={robot}>
                <Robot
                  pos={[x, 1.35, z - 0.55]}
                  rot={0}
                  boca={0}
                  frame={f + i * 7}
                  animo={f >= T.innovacion ? "feliz" : "normal"}
                  lavando={1}
                />
              </group>
            )}
          </group>
        );
      })}
      {f >= T.contratan && (
        <group position={[supervisorX, 0, -2.7]}>
          <Personaje
            colores={SUPERVISOR}
            pose={{
              ...POSE,
              rotacion: supervisorX > 0.7 ? -Math.PI / 2 : 0,
              caminar: supervisorX > 0.7 ? 1 : 0,
              fasePaso: f * 0.4,
              jarras: supervisorX > 0.7 ? 0 : 1,
              respiracion: f / 15,
            }}
          />
        </group>
      )}
    </>
  );
};

const MundoJuntas: React.FC<{ camara: Toma }> = ({ camara }) => {
  const f = useCurrentFrame();
  const dormidos = f >= T.nadie ? 1 : 0;
  const lados = [1, -1];
  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <SalaJuntas
        hojas={interpolate(f, [T.doce, T.notas + 20], [0, 18], fijo)}
        tiradas={interpolate(f, [T.nadie + 2, T.leer + 6], [0, 1], fijo)}
      />
      {/* Tres humanos en la cabecera */}
      {EJECUTIVOS.map((c, i) => {
        const pos: Vec3 = i === 0 ? [-3.4, 0, 0] : [-2.5, 0, i === 1 ? 1.1 : -1.1];
        const rot = i === 0 ? Math.PI / 2 : i === 1 ? Math.PI : 0;
        return (
          <group key={i} position={pos}>
            <Personaje colores={c} pose={{ ...POSE, rotacion: rot, sentado: 1, respiracion: f / 15 + i, sueno: dormidos, teclear: 0.3 }} />
          </group>
        );
      })}
      {/* Doce agentes de IA tomando notas */}
      {Array.from({ length: 12 }).map((_, i) => {
        const lado = lados[i % 2];
        const x = -1.4 + Math.floor(i / 2) * 0.75;
        return (
          <group key={i} scale={0.55} position={[x, 0, lado * 1.15]}>
            <Robot pos={[0, 2.1, 0]} rot={lado > 0 ? Math.PI : 0} boca={0} frame={f + i * 5} animo="normal" lavando={1} />
          </group>
        );
      })}
    </>
  );
};

const MundoVitrina: React.FC<{ camara: Toma }> = ({ camara }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const aparece = (t: number) => spring({ frame: f - t, fps, config: { damping: 9, stiffness: 160 } });
  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <Vitrina
        frame={f}
        aparece={[aparece(T.refri - 3), aparece(T.cepillo - 3), aparece(T.tostadora - 3)]}
        pan={interpolate(f, [T.pan, T.pan + 22], [0, 1], fijo)}
      />
    </>
  );
};

const MundoAzotea: React.FC<{ camara: Toma }> = ({ camara }) => {
  const f = useCurrentFrame();
  const heroe = interpolate(f, [T.alguien, T.alguien + 10], [0, 1], fijo);
  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <Azotea sol={interpolate(f, [L(6).inicio, fin(L(6))], [0.1, 1], fijo)} />
      <Personaje
        colores={DEV}
        pose={{
          ...POSE,
          respiracion: f / 15,
          sueno: 0.4 * (1 - heroe),
          saludo: f >= T.eres ? 1 : 0,
          jarras: f < T.eres ? heroe : 0,
          salto: saltar(f, T.tu, 12, 0.35),
        }}
      />
      {[-1.5, 1.5].map((x, i) => (
        <Robot key={x} pos={[x, 2.3, -1.0]} rot={-x * 0.4} boca={0} frame={f + i * 9} animo={f >= T.eres ? "feliz" : "normal"} />
      ))}
    </>
  );
};

const MundoCTA: React.FC<{ camara: Toma }> = ({ camara }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const robot = spring({ frame: f - T.prueba, fps, config: { damping: 9 } });
  const susto = f >= T.prueba + 4 ? 1 : 0;
  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <OficinaAbierta />
      <Silla pos={[0, 0, 0.9]} rot={0} />
      <group position={[0, 0, 0.9]}>
        <Personaje
          colores={AMIGO}
          pose={{
            ...POSE,
            sentado: 1 - susto,
            manosCabeza: 1 - susto,
            salto: saltar(f, T.prueba + 4, 12, 0.6),
            respiracion: f / 15,
            enojo: susto * 0.3,
          }}
        />
      </group>
      {robot > 0.01 && (
        <group scale={robot}>
          <Robot pos={[0.9, 2.5, 0.2]} rot={-0.4} boca={0} frame={f} animo="feliz" />
        </group>
      )}
    </>
  );
};

// ---------------------------------------------------------------- textos en pantalla
const PUNTOS: { desde: number; hasta: number; texto: string; color: string }[] = [
  { desde: L(2).inicio, hasta: L(3).inicio, texto: "#1 PROGRAMAR", color: "#ff7a00" },
  { desde: L(3).inicio, hasta: L(4).inicio, texto: "#2 LOS DESPIDOS", color: "#e63946" },
  { desde: L(4).inicio, hasta: L(5).inicio, texto: "#3 LAS JUNTAS", color: "#4361ee" },
  { desde: L(5).inicio, hasta: L(6).inicio, texto: "#4 TODO «CON IA»", color: "#8338ec" },
  { desde: L(6).inicio, hasta: L(7).inicio, texto: "EL GIRO", color: "#06d6a0" },
];

const Punto: React.FC<{ texto: string; color: string }> = ({ texto, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 290,
        left: 60,
        background: color,
        color: "white",
        fontFamily: FUENTE,
        fontSize: 52,
        padding: "8px 26px",
        borderRadius: 16,
        transform: `scale(${pop}) rotate(-3deg)`,
        boxShadow: "0 8px 0 rgba(0,0,0,0.35)",
      }}
    >
      {texto}
    </div>
  );
};

const Compartir: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 8 } });
  const rebote = Math.abs(Math.sin(frame * 0.25)) * 18;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 380 }}>
      <svg width={220} height={220} viewBox="0 0 24 24" style={{ transform: `scale(${pop}) translateY(${-rebote / 10}px)` }}>
        <circle cx="12" cy="12" r="11" fill="#ffe600" stroke="#000" strokeWidth="1.2" />
        <path d="M13 6l6 5-6 5v-3c-4 0-6.5 1-8 4 .5-4.5 3-7.5 8-8z" fill="#111" />
      </svg>
      <div style={{ ...estiloContorno, fontSize: 84, marginTop: 10, transform: `scale(${pop})`, textAlign: "center" }}>
        MÁNDASELO
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- composición
export const Industria: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const escena = escenaEn(frame);
  const camara = camaraEn(frame);

  // Efecto glitch en cada cambio de escena
  const cortes = [0, L(2).inicio, L(3).inicio, L(4).inicio, L(5).inicio, L(6).inicio, L(7).inicio];
  const glitch = cortes.some((c) => frame >= c && frame < c + 4);
  const desplazamiento = glitch ? Math.sin(frame * 12.9) * 26 : 0;
  // Sacudida en los remates
  const remates = [T.doler, T.rompio, T.innovacion, T.leer, T.quemado, T.tu];
  const sacudida = remates.reduce((s, r) => s + (frame >= r && frame < r + 10 ? (10 - (frame - r)) / 10 : 0), 0);
  const dx = Math.sin(frame * 2.7) * 14 * sacudida;
  const dy = Math.cos(frame * 3.3) * 10 * sacudida;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${dx + desplazamiento}px, ${dy}px)`,
          filter: glitch ? "hue-rotate(90deg) saturate(2)" : undefined,
        }}
      >
        {escena === "antesAhora" ? (
          <>
            <div style={{ position: "absolute", top: 0, width, height: height / 2, overflow: "hidden", filter: "sepia(0.85) contrast(1.05)" }}>
              <Lienzo ancho={width} alto={height / 2}>
                <MundoOficina ahora={false} />
              </Lienzo>
            </div>
            <div style={{ position: "absolute", top: height / 2, width, height: height / 2, overflow: "hidden" }}>
              <Lienzo ancho={width} alto={height / 2}>
                <MundoOficina ahora />
              </Lienzo>
            </div>
            <div style={{ position: "absolute", top: height / 2 - 6, width, height: 12, background: "white" }} />
            {[
              { t: "ANTES", top: height / 2 - 120, color: "#8d6e63" },
              { t: "AHORA", top: height - 520, color: "#ff1744" },
            ].map((e) => (
              <div
                key={e.t}
                style={{ position: "absolute", top: e.top, right: 60, background: e.color, color: "white", fontFamily: FUENTE, fontSize: 56, padding: "6px 24px", borderRadius: 14 }}
              >
                {e.t}
              </div>
            ))}
          </>
        ) : (
          <Lienzo ancho={width} alto={height} desenfoque={camara.desenfoque}>
            {escena === "gancho" && <MundoGancho camara={camara} />}
            {escena === "despidos" && <MundoDespidos camara={camara} />}
            {escena === "juntas" && <MundoJuntas camara={camara} />}
            {escena === "vitrina" && <MundoVitrina camara={camara} />}
            {escena === "azotea" && <MundoAzotea camara={camara} />}
            {escena === "cta" && <MundoCTA camara={camara} />}
          </Lienzo>
        )}
      </AbsoluteFill>

      {/* Barra de progreso (retención) */}
      <div style={{ position: "absolute", top: 0, left: 0, height: 12, width: `${(frame / DURACION) * 100}%`, background: "#ffe600" }} />
      <Gancho texto="Así está cambiando la industria tech (sin filtro)" />

      {PUNTOS.map((p) => (
        <Sequence key={p.texto} from={p.desde} durationInFrames={p.hasta - p.desde} layout="none">
          <Punto texto={p.texto} color={p.color} />
        </Sequence>
      ))}

      <Sequence from={T.innovacion} durationInFrames={L(4).inicio - T.innovacion} layout="none">
        <Sello texto="INNOVACIÓN™" color="#ffe600" top={560} tam={100} />
      </Sequence>
      <Sequence from={T.leer} durationInFrames={L(5).inicio - T.leer} layout="none">
        <Sello texto="0 LECTURAS" color="#ff4040" top={560} />
      </Sequence>
      <Sequence from={T.tu} durationInFrames={L(7).inicio - T.tu} layout="none">
        <Sello texto="SÍ, TÚ" color="#06d6a0" top={540} tam={150} giro={-4} />
      </Sequence>
      <Sequence from={fin(L(7)) - 4} layout="none">
        <Compartir />
      </Sequence>

      {LINEAS.map((l) => (
        <Sequence key={l.id} from={l.inicio} durationInFrames={l.duracion + 4} layout="none">
          <Audio src={staticFile(`voces/industria/${l.id}.mp3`)} />
          <SubtituloViral palabras={PALABRAS[l.id]} top={1160} />
        </Sequence>
      ))}

      <Sonidos />
    </AbsoluteFill>
  );
};
