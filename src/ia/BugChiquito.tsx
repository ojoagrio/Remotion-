import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { crearLineas, fijo, fin, saltar } from "../comun/lineaDeTiempo";
import { enMano, mezclar, sumar, Toma } from "../comun/camara";
import { Camara, Lienzo, Vec3 } from "../comun/Lienzo";
import { estiloContorno, Gancho, Subtitulo } from "../comun/Textos";
import { useBocas } from "../comun/useBocas";
import { ColoresPersonaje, Personaje, PosePersonaje } from "../n64/Personaje";
import duraciones from "./duraciones.json";
import guion from "./guion.json";
import { EstadoPantalla, Oficina, Robot, Silla } from "./Oficina";
import { Sonidos } from "./Sonidos";

// «El bug chiquito»: un desarrollador le pide a la IA que arregle un botón y la IA...
// Vertical 1080x1920, 30 s. Cada línea del guion tiene su propio movimiento de cámara.

type Quien = "dev" | "ia";
const LINEAS = crearLineas<Quien>(guion.lineas, duraciones, { inicio: 0.6 });
const L = (n: number) => LINEAS[n - 1];

const DEV: ColoresPersonaje = {
  // Sudadera con capucha naranja y lentes
  piel: "#e0a47c",
  camisa: "#ff7a00",
  pantalon: "#2b2d42",
  sombrero: "#ff7a00",
  zapatos: "#f2f2f2",
  gorra: false,
  bigote: false,
  cabello: "#1d1d1d",
  lentes: true,
};

const SILLA: Vec3 = [0, 0, 1.05];
const CABEZA_DEV: Vec3 = [0, 1.85, 1.05];
const ROBOT: Vec3 = [1.3, 1.75, -0.1];
// Ángulo con el que el desarrollador mira al robot cuando se levanta
const HACIA_ROBOT = Math.atan2(ROBOT[0] - SILLA[0], ROBOT[2] - SILLA[2]);

const suave = { ...fijo, easing: Easing.inOut(Easing.cubic) };
const golpe = { ...fijo, easing: Easing.out(Easing.exp) };

// El "guion de cámara": devuelve la cámara para cada frame
const camaraEn = (f: number): Toma => {
  const base = { giro: 0, desenfoque: 0, fov: 50 };

  // 1. Grúa de apertura: de un plano general alto bajamos hasta el hombro del dev
  if (f < L(2).inicio) {
    const t = interpolate(f, [0, L(2).inicio], [0, 1], suave);
    return {
      ...base,
      pos: mezclar([-2.8, 4.4, 5.4], [-0.9, 2.15, 2.5], t),
      mira: mezclar([0, 1.0, -0.3], [0.2, 1.45, -0.3], t),
    };
  }

  // 2. Sobre el hombro del dev, empujando lentamente hacia la IA
  if (f < L(3).inicio) {
    const t = interpolate(f, [L(2).inicio, L(3).inicio], [0, 1], suave);
    return {
      ...base,
      pos: mezclar([-1.5, 3.1, 2.2], [-1.2, 2.9, 1.8], t),
      mira: mezclar([0.9, 1.6, -0.2], ROBOT, t),
      fov: 45 - t * 8,
    };
  }

  // 3. Crash zoom a la cara del dev, con plano holandés y cámara en mano
  if (f < L(4).inicio) {
    const zoom = interpolate(f, [L(3).inicio, L(3).inicio + 7], [0, 1], golpe);
    const temblor = interpolate(f, [L(3).inicio, L(3).inicio + 20], [0.05, 0.015], fijo);
    return {
      pos: sumar(
        [
          CABEZA_DEV[0] + Math.sin(HACIA_ROBOT - 0.6) * 1.7,
          1.8,
          CABEZA_DEV[2] + Math.cos(HACIA_ROBOT - 0.6) * 1.7,
        ],
        enMano(f, temblor),
      ),
      mira: CABEZA_DEV,
      fov: 80 - zoom * 22,
      giro: zoom * 0.2,
      desenfoque: interpolate(f, [L(3).inicio, L(3).inicio + 5], [3, 0], fijo),
    };
  }

  // 4a. Contrapicado orbitando alrededor de la IA (se pone "malvada")
  if (f < fin(L(4))) {
    const a = interpolate(f, [L(4).inicio, fin(L(4))], [0.25, -0.35], suave);
    const r = 2.0;
    return {
      ...base,
      pos: [ROBOT[0] + Math.sin(a) * r, 0.95, ROBOT[2] + Math.cos(a) * r],
      mira: [ROBOT[0], ROBOT[1] + 0.1, ROBOT[2]],
      fov: 48,
    };
  }

  // 4b. Barrido rápido (whip pan) hacia los servidores en alarma y empujón
  const rack: Vec3 = [-2.6, 1.4, -1.4];
  if (f < L(5).inicio) {
    const barrido = interpolate(f, [fin(L(4)), fin(L(4)) + 7], [0, 1], suave);
    const empuje = interpolate(f, [fin(L(4)) + 7, L(5).inicio], [0, 1], golpe);
    return {
      pos: sumar(mezclar([0.4, 1.5, 1.9], [-1.6, 1.45, 0.3], empuje), enMano(f, 0.02)),
      mira: mezclar(ROBOT, rack, barrido),
      fov: 50 - empuje * 10,
      giro: -empuje * 0.08,
      desenfoque: Math.sin(barrido * Math.PI) * 7,
    };
  }

  // 5. Efecto vértigo (dolly zoom) sobre el dev gritando: la cámara se aleja
  //    mientras el zoom se cierra, así el fondo "se estira" detrás de él
  if (f < L(6).inicio) {
    const t = interpolate(f, [L(5).inicio, L(5).inicio + 45], [0, 1], suave);
    const distancia = 1.4 + t * 2.6;
    const k = 1.4 * Math.tan((90 / 2) * (Math.PI / 180));
    const fov = 2 * Math.atan(k / distancia) * (180 / Math.PI);
    const dir = HACIA_ROBOT - 0.9;
    return {
      pos: sumar(
        [
          CABEZA_DEV[0] + Math.sin(dir) * distancia,
          1.65,
          CABEZA_DEV[2] + Math.cos(dir) * distancia,
        ],
        enMano(f, 0.025),
      ),
      mira: [CABEZA_DEV[0], CABEZA_DEV[1] + 0.15, CABEZA_DEV[2]],
      fov,
      giro: Math.sin(f * 0.15) * 0.06,
      desenfoque: 0,
    };
  }

  // 6. Plano de dos con órbita lenta mientras la IA se disculpa
  const centro: Vec3 = [0.65, 1.6, 0.5];
  if (f < fin(L(6)) + 6) {
    const a = interpolate(f, [L(6).inicio, fin(L(6))], [0.25, 1.25], suave);
    return {
      ...base,
      pos: [centro[0] + Math.sin(a) * 3.4, 2.1, centro[2] + Math.cos(a) * 3.4],
      mira: centro,
      fov: 46,
    };
  }

  // 7. El dev se desmaya: la cámara sube a un plano cenital girando
  const a = 1.25;
  const desde: Vec3 = [centro[0] + Math.sin(a) * 3.4, 2.1, centro[2] + Math.cos(a) * 3.4];
  const t = interpolate(f, [fin(L(6)) + 6, fin(L(6)) + 50], [0, 1], suave);
  return {
    ...base,
    pos: mezclar(desde, [-0.6, 6.2, 1.9], t),
    mira: mezclar(centro, [-0.75, 0, 1.75], t),
    giro: t * 0.5,
    fov: 50,
  };
};

const Mundo: React.FC<{ camara: Toma; bocaDev: number; bocaIA: number }> = ({
  camara,
  bocaDev,
  bocaIA,
}) => {
  const f = useCurrentFrame();
  const t = f / 30;

  // --- Desarrollador ---
  const levantado = interpolate(f, [L(3).inicio, L(3).inicio + 6], [0, 1], fijo);
  const rotacion = interpolate(
    f,
    [fin(L(1)), fin(L(1)) + 12, L(3).inicio, L(3).inicio + 4],
    [Math.PI, Math.PI - 0.55, Math.PI - 0.55, HACIA_ROBOT],
    fijo,
  );
  const enojo = Math.max(
    interpolate(f, [L(3).inicio, L(3).inicio + 5, L(4).inicio, L(4).inicio + 10], [0, 0.6, 0.6, 0.25], fijo),
    interpolate(f, [fin(L(4)), fin(L(4)) + 10, fin(L(5)), fin(L(5)) + 30], [0, 1, 1, 0.6], fijo),
  );
  const desmayo = interpolate(f, [fin(L(6)) + 8, fin(L(6)) + 20], [0, 1], {
    ...fijo,
    easing: Easing.in(Easing.quad),
  });
  const dev: PosePersonaje = {
    x: 0,
    z: 0,
    rotacion: 0,
    fasePaso: 0,
    caminar: 0,
    saludo: 0,
    respiracion: t * 2,
    sentado: 1 - levantado,
    teclear: interpolate(f, [0, 5, fin(L(1)), fin(L(1)) + 8], [0, 1, 1, 0], fijo),
    manosCabeza: interpolate(f, [L(5).inicio, L(5).inicio + 4, fin(L(5)) + 5, fin(L(5)) + 15], [0, 1, 1, 0], fijo),
    salto: saltar(f, L(3).inicio, 12, 0.5) + saltar(f, L(5).inicio, 10, 0.3),
    boca: Math.max(bocaDev, desmayo * 0.8),
    enojo,
    sueno: desmayo,
  };
  const sillaZ = interpolate(levantado, [0, 1], [SILLA[2], SILLA[2] + 0.6]);

  // --- Pantalla y alarma ---
  let pantalla: EstadoPantalla = "codigo";
  let progreso = 0;
  if (f >= fin(L(4))) pantalla = "error";
  else if (f >= L(4).inicio) {
    pantalla = "borrado";
    progreso = interpolate(f, [L(4).inicio + 20, fin(L(4))], [0, 1], fijo);
  } else if (f >= L(2).inicio) {
    pantalla = "rust";
    progreso = interpolate(f, [L(2).inicio + 5, fin(L(2)) + 10], [0, 1], fijo);
  }
  const alarma = interpolate(f, [fin(L(4)), fin(L(4)) + 6], [0, 1], fijo);

  // --- IA ---
  const animo =
    f >= L(4).inicio && f < L(5).inicio
      ? "malvado"
      : (f >= L(2).inicio && f < fin(L(2))) || f >= L(6).inicio
        ? "feliz"
        : "normal";
  const rotRobot = HACIA_ROBOT + Math.PI;

  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <Oficina frame={f} pantalla={pantalla} progreso={progreso} alarma={alarma} />
      <Silla pos={[SILLA[0] + levantado * 0.4, 0, sillaZ]} rot={Math.PI} />
      {/* El dev cae de espaldas pivotando sobre los pies */}
      <group position={SILLA} rotation={[0, rotacion, 0]}>
        <group rotation={[(-Math.PI / 2) * desmayo, 0, 0]}>
          <Personaje colores={DEV} pose={dev} sombra={desmayo < 0.1} />
        </group>
      </group>
      <Robot pos={ROBOT} rot={rotRobot} boca={bocaIA} frame={f} animo={animo} />
    </>
  );
};

const CartelFinal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 9, stiffness: 160 } });
  const pop2 = spring({ frame: frame - 12, fps, config: { damping: 9, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 640 }}>
      <div style={{ ...estiloContorno, fontSize: 96, transform: `scale(${pop}) rotate(-4deg)`, textAlign: "center" }}>
        PROGRAMAR CON IA
      </div>
      <div
        style={{
          ...estiloContorno,
          fontSize: 120,
          color: "#ffd21f",
          transform: `scale(${pop2}) rotate(3deg)`,
        }}
      >
        EN 2026
      </div>
    </AbsoluteFill>
  );
};

export const BugChiquito: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const bocas = useBocas(LINEAS, "voces/ia");
  const camara = camaraEn(frame);

  // Destello blanco en los cortes de cámara bruscos
  const flash = (inicio: number, fuerza: number) =>
    frame < inicio ? 0 : interpolate(frame, [inicio, inicio + 4], [fuerza, 0], fijo);
  const destello = Math.max(flash(L(3).inicio, 0.7), flash(L(5).inicio, 0.5));
  // Viñeta roja durante la alarma
  const alarma = frame >= fin(L(4)) && frame < L(6).inicio ? 0.35 + 0.25 * Math.sin(frame * 0.6) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Lienzo ancho={width} alto={height} desenfoque={camara.desenfoque}>
        <Mundo camara={camara} bocaDev={bocas.dev ?? 0} bocaIA={bocas.ia ?? 0} />
      </Lienzo>

      <AbsoluteFill
        style={{ boxShadow: `inset 0 0 220px 60px rgba(255,0,0,${alarma})`, pointerEvents: "none" }}
      />
      <AbsoluteFill style={{ backgroundColor: "white", opacity: destello }} />

      <Gancho texto="Cuando le pides a la IA que arregle UN bug" />

      {LINEAS.map((l) => (
        <Sequence key={l.id} from={l.inicio} durationInFrames={l.duracion + 4} layout="none">
          <Audio src={staticFile(`voces/ia/${l.id}.mp3`)} />
          <Subtitulo
            texto={l.texto}
            nombre={l.personaje === "dev" ? "DEV" : "IA"}
            color={l.personaje === "dev" ? "#ff7a00" : "#13a8c8"}
            centroY={1180}
          />
        </Sequence>
      ))}

      <Sequence from={fin(L(6)) + 30} layout="none">
        <CartelFinal />
      </Sequence>

      <Sonidos lineas={LINEAS} />
    </AbsoluteFill>
  );
};
