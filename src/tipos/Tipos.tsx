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
import { enMano, golpe, mezclar, suave, sumar, Toma } from "../comun/camara";
import { fijo, fin, saltar } from "../comun/lineaDeTiempo";
import { Camara, Lienzo, Vec3 } from "../comun/Lienzo";
import { SubtituloViral } from "../comun/SubtituloViral";
import { estiloContorno, FUENTE, Gancho, Sello } from "../comun/Textos";
import { useBocas } from "../comun/useBocas";
import { Cocina } from "../chancla/Cocina";
import { Oficina, Robot, Silla } from "../ia/Oficina";
import { ESCRITORIOS, Etiqueta3D, OficinaAbierta } from "../industria/Escenas";
import { ColoresPersonaje, Personaje, PosePersonaje } from "../n64/Personaje";
import { Cobija, Habitacion } from "../tiktok/Escenas3D";
import { Rueda, RUEDA_X } from "./Escenas";
import { ChatMama, HojaTarea } from "./Pantallas2D";
import { Sonidos } from "./Sonidos";
import { DURACION, L, LINEAS, PALABRAS, Quien, SECCIONES as S, T } from "./tiempos";

// «Los 5 tipos de personas que usan la IA»: formato de lista con el que todos se
// identifican y que termina pidiendo etiquetar a un amigo (muy compartible).

const POSE: PosePersonaje = { x: 0, z: 0, rotacion: 0, fasePaso: 0, caminar: 0, saludo: 0, salto: 0, respiracion: 0 };

const persona = (camisa: string, pantalon: string, cabello: string, extra: Partial<ColoresPersonaje> = {}): ColoresPersonaje => ({
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

const EDUCADO = persona("#e9c46a", "#264653", "#6b3e1d", { lentes: true });
const COPIADOR = persona("#3a86ff", "#22223b", "#111", { gorra: true, sombrero: "#ffbe0b" });
const DISCUTIDOR = persona("#d62828", "#1d1d1d", "#111", { bigote: true });
const TRISTE = persona("#adb5bd", "#4361ee", "#3b2414");
const HIJO = persona("#06d6a0", "#073b4c", "#2b2b2b");
const MAMA: ColoresPersonaje = {
  piel: "#e8a77c",
  camisa: "#c1121f",
  pantalon: "#5e3c99",
  sombrero: "#c1121f",
  zapatos: "#ff5fa2",
  bigote: false,
  gorra: false,
  cabello: "#bdbdbd",
  chongo: true,
  mandil: "#fdf0d5",
};
const FILA = [EDUCADO, COPIADOR, DISCUTIDOR, TRISTE, HIJO];

type Seccion = "gancho" | "tipo1" | "tipo2" | "tipo3" | "tipo4" | "tipo5" | "cta";
const seccionEn = (f: number): Seccion => {
  if (f < S.tipo1) return "gancho";
  if (f < S.tipo2) return "tipo1";
  if (f < S.tipo3) return "tipo2";
  if (f < S.tipo4) return "tipo3";
  if (f < S.tipo5) return "tipo4";
  if (f < S.cta) return "tipo5";
  return "cta";
};

const SILLA: Vec3 = [0, 0, 1.05];
const ROBOT: Vec3 = [1.3, 1.75, -0.1];
const HACIA_ROBOT = Math.atan2(ROBOT[0] - SILLA[0], ROBOT[2] - SILLA[2]);

// ---------------------------------------------------------------- cámara
const camaraEn = (f: number): Toma => {
  const base = { giro: 0, desenfoque: 0, fov: 50 };
  switch (seccionEn(f)) {
    case "gancho": {
      // Recorrido por la rueda de reconocimiento y crash zoom en «tú»
      const t = interpolate(f, [0, T.tu], [0, 1], suave);
      const zoom = interpolate(f, [T.tu, T.tu + 6], [0, 1], golpe);
      return {
        pos: sumar(mezclar([2.6, 1.9, 3.4], [0, 2.3, 9.6], t), [0, 0, -zoom * 2.4]),
        mira: mezclar([2.4, 1.6, 0], [0, 1.4, 0], t),
        fov: 52 - zoom * 6,
        giro: zoom * 0.06,
        desenfoque: interpolate(f, [0, 6], [6, 0], fijo),
      };
    }
    case "tipo1": {
      const t = interpolate(f, [S.tipo1, S.tipo2], [0, 1], suave);
      // De frente al educado (desde el lado del robot, sin cruzarse con él)
      return { ...base, pos: mezclar([3.3, 1.95, 1.3], [2.8, 1.85, 1.1], t), mira: [0.4, 1.45, 0.6], fov: 50 };
    }
    case "tipo2": {
      const t = interpolate(f, [S.tipo2, S.tipo3], [0, 1], suave);
      const [x, z] = ESCRITORIOS[0];
      return { ...base, pos: mezclar([x + 0.3, 2.4, z + 2.6], [x + 0.2, 2.0, z + 1.6], t), mira: [x, 1.1, z - 0.5], fov: 50 };
    }
    case "tipo3": {
      const cabeza: Vec3 = [SILLA[0], 1.85, SILLA[2]];
      if (f < L(7).inicio) {
        // «¡Estás mal!»: crash zoom al que discute
        const zoom = interpolate(f, [L(6).inicio, L(6).inicio + 6], [0, 1], golpe);
        return {
          pos: sumar([2.3, 1.95, 1.05], enMano(f, zoom * 0.015)),
          mira: f < L(6).inicio ? [0.6, 1.6, 0.4] : cabeza,
          fov: 60 - zoom * 18,
          giro: zoom * 0.1,
          desenfoque: 0,
        };
      }
      if (f < L(8).inicio) {
        // La IA, frontal y tranquila
        return { ...base, pos: [ROBOT[0] - 1.2, ROBOT[1] + 0.05, ROBOT[2] + 1.6], mira: ROBOT, fov: 36 };
      }
      return { pos: sumar([2.4, 2.4, 2.8], enMano(f, 0.03)), mira: [0.6, 1.5, 0.4], fov: 54, giro: -0.12, desenfoque: 0 };
    }
    case "tipo4": {
      const t = interpolate(f, [S.tipo4, S.tipo5], [0, 1], suave);
      // Desde los pies de la cama hacia la almohada, para ver la cara derecha
      return { ...base, pos: mezclar([1.2, 3.3, 2.8], [0.12, 2.75, 0.9], t), mira: mezclar([0, 1.0, 0], [0, 1.3, -0.6], t), fov: 50 };
    }
    case "tipo5": {
      const zoom = interpolate(f, [L(12).inicio, L(12).inicio + 6], [0, 1], golpe);
      return {
        pos: sumar([0.6, 2.0, 3.6], enMano(f, f >= T.comer ? 0.03 : 0.005)),
        mira: [-0.75, 1.9, 0.6],
        fov: 58 - zoom * 20,
        giro: zoom * 0.08,
        desenfoque: f < L(12).inicio ? 5 : 0,
      };
    }
    default: {
      const t = interpolate(f, [S.cta, DURACION], [0, 1], suave);
      const foco = interpolate(f, [T.cuatro, T.cuatro + 8], [0, 1], golpe);
      return {
        ...base,
        pos: mezclar(mezclar([0, 2.6, 10.2], [0, 2.4, 9.4], t), [RUEDA_X[3], 2.2, 3.2], foco),
        mira: mezclar([0, 1.4, 0], [RUEDA_X[3], 2.1, 0], foco),
        fov: 52,
      };
    }
  }
};

// ---------------------------------------------------------------- mundos
const MundoRueda: React.FC<{ camara: Toma; foco: number; bocas: Partial<Record<Quien, number>> }> = ({ camara, foco }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <Rueda foco={foco} />
      {FILA.map((c, i) => (
        <group key={i} position={[RUEDA_X[i], 0, 0]}>
          <Personaje
            colores={c}
            pose={{
              ...POSE,
              respiracion: f / 15 + i,
              teclear: 0.55,
              sueno: foco === 3 && i === 3 ? 0.6 : 0,
              llanto: foco === 3 && i === 3 ? 1 : 0,
              enojo: i === 2 ? 0.6 : 0,
            }}
            escala={0.95}
          />
          <Etiqueta3D texto={`#${i + 1}`} pos={[0, 1.05, 0.55]} tam={[0.6, 0.3]} fondo="#111111" color="#ffffff" />
        </group>
      ))}
    </>
  );
};

const MundoEducado: React.FC<{ camara: Toma; boca: number }> = ({ camara, boca }) => {
  const f = useCurrentFrame();
  // Reverencias mientras agradece
  const reverencia = f >= L(3).inicio && f < fin(L(3)) ? Math.abs(Math.sin((f - L(3).inicio) * 0.12)) * 0.35 : 0;
  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <Oficina frame={f} pantalla="codigo" progreso={0} alarma={0} />
      <Silla pos={SILLA} rot={Math.PI} />
      <group position={SILLA} rotation={[0, HACIA_ROBOT, 0]}>
        <group rotation={[reverencia, 0, 0]}>
          <Personaje colores={EDUCADO} pose={{ ...POSE, sentado: 1, respiracion: f / 15, boca, teclear: 0.6 }} />
        </group>
      </group>
      <Robot pos={ROBOT} rot={HACIA_ROBOT + Math.PI} boca={0} frame={f} animo={f >= T.mundo ? "malvado" : "feliz"} />
    </>
  );
};

const MundoCopiador: React.FC<{ camara: Toma }> = ({ camara }) => {
  const f = useCurrentFrame();
  const [x, z] = ESCRITORIOS[0];
  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <OficinaAbierta />
      <group position={[x, 0, z - 0.55]}>
        <Personaje colores={COPIADOR} pose={{ ...POSE, sentado: 1, teclear: 1, respiracion: f / 8, sueno: 0.3 }} />
      </group>
    </>
  );
};

const MundoDiscutidor: React.FC<{ camara: Toma; bocaDev: number; bocaIA: number }> = ({ camara, bocaDev, bocaIA }) => {
  const f = useCurrentFrame();
  const furia = f >= L(8).inicio;
  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <Oficina frame={f} pantalla={furia ? "error" : "codigo"} progreso={0} alarma={furia ? 0.6 : 0} />
      <Silla pos={[SILLA[0] + 0.4, 0, SILLA[2] + 0.6]} rot={Math.PI} />
      <group position={SILLA} rotation={[0, HACIA_ROBOT, 0]}>
        <Personaje
          colores={DISCUTIDOR}
          pose={{
            ...POSE,
            respiracion: f / 15,
            boca: bocaDev,
            enojo: f >= L(6).inicio ? 1 : 0.4,
            saludo: f >= L(6).inicio && !furia ? 1 : 0,
            manosCabeza: furia ? 1 : 0,
            salto: saltar(f, L(8).inicio, 10, 0.4),
          }}
        />
      </group>
      <Robot pos={ROBOT} rot={HACIA_ROBOT + Math.PI} boca={bocaIA} frame={f} animo={f >= L(7).inicio ? "feliz" : "normal"} />
    </>
  );
};

const MundoTriste: React.FC<{ camara: Toma; boca: number }> = ({ camara, boca }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <Habitacion noche hora="3:07" />
      {/* Luz azul del celular sobre la cara */}
      <pointLight position={[0.4, 1.9, 0.2]} intensity={2.2} distance={3} color="#7ab8ff" />
      <group position={[0, 0.63, 1.1]} rotation={[-Math.PI / 2 + 0.4, 0, 0]}>
        <Personaje
          colores={TRISTE}
          pose={{ ...POSE, respiracion: f / 15, boca, llanto: f >= L(10).inicio ? 1 : 0.3, sueno: 0.25 }}
          sombra={false}
        />
      </group>
      <Cobija cubre={0} visible={1} />
    </>
  );
};

const MundoMama: React.FC<{ camara: Toma; boca: number }> = ({ camara, boca }) => {
  const f = useCurrentFrame();
  const enojada = f >= L(12).inicio;
  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <Cocina frame={f} platosSucios={6} platosLimpios={0} burbujas={0} />
      <group position={[-0.75, 0, 0.6]}>
        <Personaje
          colores={MAMA}
          pose={{
            ...POSE,
            rotacion: 0.5,
            respiracion: f / 15,
            boca,
            telefono: enojada ? 0 : 1,
            saludo: enojada ? 1 : 0,
            brazoSaludo: "derecho",
            chancla: enojada ? 1 : 0,
            enojo: enojada ? 1 : 0,
            sueno: enojada ? 0.4 : 0,
          }}
          escala={0.95}
        />
      </group>
    </>
  );
};

// ---------------------------------------------------------------- textos
const ETIQUETAS: { desde: number; hasta: number; texto: string; color: string }[] = [
  { desde: S.tipo1, hasta: S.tipo2, texto: "#1 EL EDUCADO", color: "#e9c46a" },
  { desde: S.tipo2, hasta: S.tipo3, texto: "#2 EL COPY-PASTE", color: "#3a86ff" },
  { desde: S.tipo3, hasta: S.tipo4, texto: "#3 EL QUE DISCUTE", color: "#d62828" },
  { desde: S.tipo4, hasta: S.tipo5, texto: "#4 EL DE LAS 3 AM", color: "#4361ee" },
  { desde: S.tipo5, hasta: S.cta, texto: "#5 EL HIJO «EFICIENTE»", color: "#06d6a0" },
];

const Etiqueta: React.FC<{ texto: string; color: string }> = ({ texto, color }) => {
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
        fontSize: 50,
        padding: "8px 26px",
        borderRadius: 16,
        transform: `scale(${pop}) rotate(-3deg)`,
        boxShadow: "0 8px 0 rgba(0,0,0,0.35)",
        WebkitTextStroke: "2px rgba(0,0,0,0.4)",
      }}
    >
      {texto}
    </div>
  );
};

const Etiquetalo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 8 } });
  const rebote = Math.abs(Math.sin(frame * 0.25)) * 14;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 400 }}>
      <div style={{ ...estiloContorno, fontSize: 92, color: "#ffe600", transform: `scale(${pop}) translateY(${-rebote}px) rotate(-3deg)`, textAlign: "center" }}>
        ETIQUETA A TU #4
      </div>
      <svg width={170} height={170} viewBox="0 0 24 24" style={{ marginTop: 20, transform: `scale(${pop})` }}>
        <circle cx="12" cy="12" r="11" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
        <path d="M12 5.5a3 3 0 110 6 3 3 0 010-6zm0 7.5c3.3 0 6 1.5 6 3.5V18H6v-1.5c0-2 2.7-3.5 6-3.5z" fill="#111" />
        <circle cx="19" cy="6" r="4" fill="#ff1744" />
        <path d="M17.5 6h3M19 4.5v3" stroke="#fff" strokeWidth="1.2" />
      </svg>
    </AbsoluteFill>
  );
};

const RESALTE: Record<Quien, string> = {
  narrador: "#ffe600",
  educado: "#a0e7e5",
  discutidor: "#ff6b6b",
  triste: "#9bb1ff",
  ia: "#5ef2ff",
  mama: "#ff5fa2",
};

// ---------------------------------------------------------------- composición
export const Tipos: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const bocas = useBocas(LINEAS, "voces/tipos");
  const seccion = seccionEn(frame);
  const camara = camaraEn(frame);

  const cortes = [S.gancho, S.tipo1, S.tipo2, S.tipo3, S.tipo4, S.tipo5, S.cta];
  const glitch = cortes.some((c) => frame >= c && frame < c + 4);
  const remates = [T.tu, T.ensayo, L(8).inicio, T.visto, T.comer];
  const sacudida = remates.reduce((s, r) => s + (frame >= r && frame < r + 10 ? (10 - (frame - r)) / 10 : 0), 0);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${Math.sin(frame * 2.7) * 14 * sacudida + (glitch ? Math.sin(frame * 12.9) * 24 : 0)}px, ${Math.cos(frame * 3.3) * 10 * sacudida}px)`,
          filter: glitch ? "hue-rotate(90deg) saturate(2)" : undefined,
        }}
      >
        <Lienzo ancho={width} alto={height} desenfoque={camara.desenfoque}>
          {(seccion === "gancho" || seccion === "cta") && (
            <MundoRueda camara={camara} foco={seccion === "cta" && frame >= T.cuatro ? 3 : -1} bocas={bocas} />
          )}
          {seccion === "tipo1" && <MundoEducado camara={camara} boca={bocas.educado ?? 0} />}
          {seccion === "tipo2" && <MundoCopiador camara={camara} />}
          {seccion === "tipo3" && <MundoDiscutidor camara={camara} bocaDev={bocas.discutidor ?? 0} bocaIA={bocas.ia ?? 0} />}
          {seccion === "tipo4" && <MundoTriste camara={camara} boca={bocas.triste ?? 0} />}
          {seccion === "tipo5" && <MundoMama camara={camara} boca={bocas.mama ?? 0} />}
        </Lienzo>
      </AbsoluteFill>

      <div style={{ position: "absolute", top: 0, left: 0, height: 12, width: `${(frame / DURACION) * 100}%`, background: "#ffe600" }} />
      <Gancho texto="5 tipos de personas usando la IA" />

      {ETIQUETAS.map((e) => (
        <Sequence key={e.texto} from={e.desde} durationInFrames={e.hasta - e.desde} layout="none">
          <Etiqueta texto={e.texto} color={e.color} />
        </Sequence>
      ))}

      {/* Remates visuales */}
      <Sequence from={T.tu + 2} durationInFrames={S.tipo1 - T.tu - 2} layout="none">
        <Sello texto="¿CUÁL ERES?" color="#ffe600" top={560} tam={110} />
      </Sequence>
      <Sequence from={T.mundo} durationInFrames={S.tipo2 - T.mundo} layout="none">
        <Sello texto="+1000 DE RESPETO CON LAS MÁQUINAS" color="#a0e7e5" top={430} tam={64} giro={-3} />
      </Sequence>
      <Sequence from={T.claro - 30} durationInFrames={S.tipo3 - T.claro + 30} layout="none">
        <HojaTarea
          circulo={interpolate(frame, [T.claro, T.claro + 18], [0, 1], fijo)}
          nota={spring({ frame: frame - (T.ensayo + 12), fps: 30, config: { damping: 8 } })}
        />
      </Sequence>
      <Sequence from={S.tipo4} durationInFrames={S.tipo5 - S.tipo4} layout="none">
        <div style={{ position: "absolute", top: 400, right: 70, ...estiloContorno, fontSize: 90, color: "#ff3b3b" }}>3:07 AM</div>
      </Sequence>
      <Sequence from={T.visto + 4} durationInFrames={S.tipo5 - T.visto - 4} layout="none">
        <Sello texto="✓✓ VISTO" color="#4fc3f7" top={560} tam={110} />
      </Sequence>
      <Sequence from={S.tipo5} durationInFrames={L(12).inicio - S.tipo5} layout="none">
        <ChatMama
          mensajes={[
            { de: "mama", texto: "¿Ya comiste, mijo?", desde: 8 },
            { de: "yo", texto: "Como modelo de lenguaje, no puedo comer.", desde: T.ia11 - S.tipo5 + 4 },
          ]}
        />
      </Sequence>
      <Sequence from={fin(L(13)) - 30} layout="none">
        <Etiquetalo />
      </Sequence>

      {LINEAS.map((l) => (
        <Sequence key={l.id} from={l.inicio} durationInFrames={l.duracion + 4} layout="none">
          <Audio src={staticFile(`voces/tipos/${l.id}.mp3`)} />
          <SubtituloViral palabras={PALABRAS[l.id]} top={1180} resaltar={RESALTE[l.personaje]} />
        </Sequence>
      ))}

      <Sonidos />
    </AbsoluteFill>
  );
};
