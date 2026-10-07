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
import { Camara, Lienzo } from "../comun/Lienzo";
import { SubtituloViral } from "../comun/SubtituloViral";
import { estiloContorno, FUENTE, Gancho, Sello } from "../comun/Textos";
import { AZUL_MISTERIO, Clawd, CorazonPixel, NARANJA_CLAWD, Terminal, TextoTerminal } from "./Clawd3D";
import { Sonidos } from "./Sonidos";
import { DURACION, L, LINEAS, PALABRAS, T } from "./tiempos";

// «Vida salvaje en la terminal»: mini documental de fan sobre Clawd, la mascota de
// Claude Code. Los datos vienen de fuentes públicas (ver README).

type Escena = "gancho" | "ficha" | "nombre" | "aparece" | "git" | "comunidad" | "misterio" | "despedida";
const escenaEn = (f: number): Escena => {
  if (f < L(2).inicio) return "gancho";
  if (f < L(3).inicio) return "ficha";
  if (f < L(4).inicio) return "nombre";
  if (f < L(5).inicio) return "aparece";
  if (f < L(6).inicio) return "git";
  if (f < L(7).inicio) return "comunidad";
  if (f < L(8).inicio) return "misterio";
  return "despedida";
};

// Clawd siempre en el centro del hábitat
const CENTRO: [number, number, number] = [0, 0.6, 0];

const camaraEn = (f: number): Toma => {
  const base = { giro: 0, desenfoque: 0, fov: 50 };
  switch (escenaEn(f)) {
    case "gancho": {
      // Teleobjetivo de documental: entre los arbustos, acercándose despacio
      const t = interpolate(f, [0, L(2).inicio], [0, 1], suave);
      return {
        pos: sumar(mezclar([-3.4, 1.0, 6.2], [-2.0, 1.0, 4.6], t), enMano(f, 0.008)),
        mira: [0, 0.6, 0],
        fov: 32,
        giro: 0,
        desenfoque: interpolate(f, [0, 20], [6, 0], fijo),
      };
    }
    case "ficha": {
      // Órbita alrededor del ejemplar
      const a = interpolate(f, [L(2).inicio, L(3).inicio], [-0.6, 0.6], suave);
      return { ...base, pos: orbita(CENTRO, 4.8, a, 1.6), mira: [0, 0.7, 0], fov: 44 };
    }
    case "nombre": {
      const zoom = interpolate(f, [T.claw, T.claw + 6], [0, 1], golpe);
      return { ...base, pos: [0.5, 1.1, 4.6 - zoom * 1.0], mira: [0.3, 0.7, 0], fov: 46 };
    }
    case "aparece": {
      const t = interpolate(f, [L(4).inicio, L(5).inicio], [0, 1], suave);
      return { ...base, pos: mezclar([0, 1.7, 5.6], [0, 1.3, 4.4], t), mira: [0, 1.1, 0], fov: 48 };
    }
    case "git": {
      const a = interpolate(f, [L(5).inicio, L(6).inicio], [0.5, -0.5], suave);
      return { pos: sumar(orbita(CENTRO, 4.8, a, 1.8), enMano(f, f < T.creyendo ? 0.02 : 0.004)), mira: [0, 0.9, 0], fov: 50, giro: f < T.creyendo ? 0.06 : 0, desenfoque: 0 };
    }
    case "comunidad": {
      // Recorrido lateral por la "galería" de Clawds hechos por la comunidad
      const t = interpolate(f, [L(6).inicio, L(7).inicio], [0, 1], suave);
      return { ...base, pos: mezclar([-1.6, 1.6, 4.4], [1.6, 2.2, 5.0], t), mira: mezclar([-1.4, 0.8, 0], [1.2, 0.9, 0], t), fov: 50 };
    }
    case "misterio": {
      const zoom = interpolate(f, [T.azul, T.azul + 6], [0, 1], golpe);
      const t = interpolate(f, [L(7).inicio, T.azul], [0, 1], suave);
      return { ...base, pos: mezclar([0, 2.8, 6.0], [0, 1.5, 4.6], t), mira: [0, 0.7, 0], fov: 46 - zoom * 10, giro: zoom * 0.05 };
    }
    default: {
      const t = interpolate(f, [L(8).inicio, DURACION], [0, 1], suave);
      return { ...base, pos: mezclar([0, 1.2, 4.6], [0, 1.1, 4.0], t), mira: [0, 0.85, 0], fov: 46 };
    }
  }
};

const Mundo: React.FC<{ camara: Toma }> = ({ camara }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const escena = escenaEn(f);

  // Clawd se asoma en el gancho, salta al decir su nombre, pellizca, saluda...
  const asoma = interpolate(f, [20, 60], [-1.6, 0], suave);
  const aparece = escena === "aparece" ? spring({ frame: f - (T.inicias + 28), fps, config: { damping: 9 } }) : 1;
  const azul = escena === "misterio" ? interpolate(f, [T.azul - 2, T.azul + 2], [0, 1], fijo) : 0;
  const color = azul > 0.5 ? AZUL_MISTERIO : NARANJA_CLAWD;

  const clawd = (
    <Clawd
      pos={escena === "gancho" ? [asoma, 0, 0] : [0, 0, 0]}
      escala={escena === "aparece" ? aparece : 1}
      frame={f}
      color={color}
      salto={saltar(f, T.clawd, 12, 0.45) + saltar(f, T.saludarte, 12, 0.35) + saltar(f, T.creyendo, 12, 0.3) + saltar(f, T.saludalo, 12, 0.35)}
      saludo={(escena === "aparece" && f >= T.saludarte - 4) || escena === "despedida" ? 1 : 0}
      pellizco={escena === "nombre" ? 1 : 0}
      caminar={escena === "gancho" && f < 60 ? 1 : 0}
    />
  );

  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <Terminal
        frame={f}
        conflicto={escena === "git" ? interpolate(f, [T.git - 6, T.git, T.creyendo, T.creyendo + 15], [0, 1, 1, 0.2], fijo) : 0}
        oscuridad={escena === "misterio" ? interpolate(f, [L(7).inicio, L(7).inicio + 15], [0, 1], fijo) : 0}
      />
      {escena !== "comunidad" && clawd}

      {/* Foco del misterio */}
      {escena === "misterio" && (
        <>
          <pointLight position={[0, 3, 1]} intensity={12} distance={6} color="#cfe0ff" />
          <mesh position={[0, 2.4, 0]}>
            <coneGeometry args={[1.2, 4.8, 10, 1, true]} />
            <meshBasicMaterial color="#cfe0ff" transparent opacity={0.1} side={2} depthWrite={false} />
          </mesh>
        </>
      )}

      {/* La terminal donde se escribe «$ claude» */}
      {escena === "aparece" && (
        <TextoTerminal
          texto={`$ ${"claude".slice(0, Math.max(0, Math.floor((f - L(4).inicio) / 4)))}${Math.floor(f / 8) % 2 ? "_" : " "}`}
          pos={[0, 1.8, -0.6]}
          alto={0.4}
        />
      )}

      {/* Corazones de píxeles: «él sigue creyendo en ti» */}
      {escena === "git" &&
        f >= T.creyendo &&
        [0, 1, 2, 3].map((i) => {
          const p = ((f - T.creyendo) / 40 + i * 0.25) % 1;
          return <CorazonPixel key={i} pos={[-0.6 + i * 0.4, 1.4 + p * 1.6, 0.2]} escala={0.8 + p * 0.6} />;
        })}

      {/* La comunidad: figura impresa en 3D (gris) y un muro de emojis */}
      {escena === "comunidad" && (
        <>
          <Clawd pos={[-1.4, 0, 0]} frame={f} />
          {f >= T.tresD && (
            <group scale={spring({ frame: f - T.tresD, fps, config: { damping: 10 } })}>
              <mesh position={[0.4, 0.25, 0]}>
                <cylinderGeometry args={[0.7, 0.8, 0.5, 8]} />
                <meshLambertMaterial color="#2b2b38" flatShading />
              </mesh>
              <Clawd pos={[0.4, 0.5, 0]} rot={f * 0.04} frame={0} color="#bfc4cc" escala={0.8} />
              <TextoTerminal texto="IMPRESO EN 3D" pos={[0.4, 2.0, 0]} alto={0.22} color="#ffffff" fondo="#333" />
            </group>
          )}
          {f >= T.emojis &&
            Array.from({ length: 9 }).map((_, i) => {
              const s = spring({ frame: f - T.emojis - i * 2, fps, config: { damping: 9 } });
              return (
                <Clawd
                  key={i}
                  pos={[1.9 + (i % 3) * 0.55, 0.2 + Math.floor(i / 3) * 0.55, -0.6]}
                  frame={f + i * 10}
                  escala={0.3 * s}
                  salto={Math.abs(Math.sin(f * 0.3 + i)) * 0.25}
                />
              );
            })}
        </>
      )}
    </>
  );
};

// Ficha técnica estilo documental
const Rotulo: React.FC<{ texto: string; sub: string }> = ({ texto, sub }) => {
  const frame = useCurrentFrame();
  const entrada = interpolate(frame, [0, 10], [-700, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 60, top: 1500, transform: `translateX(${entrada}px)` }}>
      <div style={{ background: "#ffe600", height: 8, width: 120, marginBottom: 10 }} />
      <div style={{ fontFamily: FUENTE, fontSize: 56, color: "white", textShadow: "0 4px 0 #000" }}>{texto}</div>
      <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 38, color: "#e0e0e0", textShadow: "0 3px 0 #000" }}>{sub}</div>
    </div>
  );
};

const Nota: React.FC<{ texto: string; top: number; izquierda: boolean }> = ({ texto, top, izquierda }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <div
      style={{
        position: "absolute",
        top,
        [izquierda ? "left" : "right"]: 60,
        background: "white",
        color: "#111",
        fontFamily: FUENTE,
        fontSize: 44,
        padding: "8px 22px",
        borderRadius: 14,
        border: `6px solid ${NARANJA_CLAWD}`,
        transform: `scale(${pop}) rotate(${izquierda ? -3 : 3}deg)`,
        boxShadow: "0 6px 0 rgba(0,0,0,0.4)",
      }}
    >
      {texto}
    </div>
  );
};

const Ecuacion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = (d: number) => spring({ frame: frame - d, fps, config: { damping: 10 } });
  const T0 = 0;
  const pieza = (texto: string, d: number, color = "white") => (
    <span style={{ ...estiloContorno, fontSize: 88, color, display: "inline-block", transform: `scale(${p(d)})` }}>{texto}</span>
  );
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 430 }}>
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        {pieza("CLAW", T0, NARANJA_CLAWD)}
        {pieza("+", T0 + 20)}
        {pieza("CLAUDE", T.claude - T.claw)}
      </div>
      <div style={{ marginTop: 10 }}>{pieza("= CLAWD", T.claude - T.claw + 12, "#ffe600")}</div>
      <div style={{ fontFamily: FUENTE, fontSize: 36, color: "white", marginTop: 8, opacity: p(10), textShadow: "0 3px 0 #000" }}>
        («claw» = garra en inglés)
      </div>
    </AbsoluteFill>
  );
};

const Fuentes: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 230, opacity: o }}>
      <div style={{ maxWidth: 900, textAlign: "center", color: "white", fontFamily: "sans-serif", fontWeight: 700, fontSize: 30, background: "rgba(0,0,0,0.6)", padding: "14px 24px", borderRadius: 14 }}>
        Video de fan. Clawd es la mascota de Claude Code (Anthropic). Fuentes: GitHub anthropics/claude-code, Stark Insider, Classmethod.
      </div>
    </AbsoluteFill>
  );
};

export const ClawdDocumental: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const camara = camaraEn(frame);
  const escena = escenaEn(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Lienzo ancho={width} alto={height} desenfoque={camara.desenfoque}>
        <Mundo camara={camara} />
      </Lienzo>

      {/* Viñeta de documental */}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 260px 80px rgba(0,0,0,0.7)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, height: 12, width: `${(frame / DURACION) * 100}%`, background: NARANJA_CLAWD }} />
      <Gancho texto="Vida salvaje en la terminal" />
      {escena === "gancho" && frame > 30 && (
        <div style={{ position: "absolute", top: 290, left: 0, right: 0, textAlign: "center", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 40, color: "#e0e0e0", textShadow: "0 3px 0 #000" }}>
          Episodio 1: el pequeño cangrejo naranja
        </div>
      )}

      <Sequence from={T.clawd} durationInFrames={L(3).inicio - T.clawd} layout="none">
        <Rotulo texto="CLAWD" sub="Clawdus terminalis" />
      </Sequence>
      {[
        { t: T.naranja, texto: "NARANJA", top: 420, izq: true },
        { t: T.ojos, texto: "OJOS CUADRADOS", top: 560, izq: false },
        { t: T.patitas, texto: "4 PATITAS", top: 700, izq: true },
      ].map((n) => (
        <Sequence key={n.texto} from={n.t - 3} durationInFrames={L(3).inicio - n.t + 3} layout="none">
          <Nota texto={n.texto} top={n.top} izquierda={n.izq} />
        </Sequence>
      ))}
      <Sequence from={T.claw} durationInFrames={L(4).inicio - T.claw} layout="none">
        <Ecuacion />
      </Sequence>
      <Sequence from={T.git} durationInFrames={T.creyendo - T.git} layout="none">
        <Sello texto="CONFLICT!" color="#ff4040" top={420} tam={100} />
      </Sequence>
      <Sequence from={T.creyendo} durationInFrames={L(6).inicio - T.creyendo} layout="none">
        <Sello texto="CREE EN TI" color="#ff4f8b" top={420} tam={100} giro={3} />
      </Sequence>
      <Sequence from={T.azul + 4} durationInFrames={L(8).inicio - T.azul - 4} layout="none">
        <>
          <Sello texto="¿?" color={AZUL_MISTERIO} top={380} tam={150} />
          <div style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center", color: "white", fontFamily: FUENTE, fontSize: 36, textShadow: "0 3px 0 #000" }}>
            Reportado en la v2.0.67 · sin explicación oficial
          </div>
        </>
      </Sequence>
      <Sequence from={T.saludalo} layout="none">
        <Sello texto="¡SALÚDALO!" color="#ffe600" top={420} tam={110} giro={-3} />
      </Sequence>
      <Sequence from={fin(L(8)) + 4} layout="none">
        <Fuentes />
      </Sequence>

      {LINEAS.map((l) => (
        <Sequence key={l.id} from={l.inicio} durationInFrames={l.duracion + 4} layout="none">
          <Audio src={staticFile(`voces/clawd/${l.id}.mp3`)} />
          <SubtituloViral palabras={PALABRAS[l.id]} top={1180} resaltar="#ffb38a" />
        </Sequence>
      ))}

      <Sonidos />
    </AbsoluteFill>
  );
};
