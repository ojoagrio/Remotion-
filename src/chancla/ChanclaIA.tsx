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
import { fijo, fin } from "../comun/lineaDeTiempo";
import { Camara, Lienzo, Vec3 } from "../comun/Lienzo";
import { estiloContorno, FUENTE, Gancho, Subtitulo } from "../comun/Textos";
import { useBocas } from "../comun/useBocas";
import { Robot } from "../ia/Oficina";
import { ColoresPersonaje, Personaje, PosePersonaje } from "../n64/Personaje";
import { Cocina, FREGADERO, TORRE } from "./Cocina";
import { Sonidos } from "./Sonidos";
import { DUELO, DUELO_CHANCLA, DUELO_ROBOT, ESCAPE, FINAL, L, LAVADO, LINEAS } from "./tiempos";

// «La chancla»: una mamá le pide a la IA que lave los trastes y la IA responde
// «como modelo de lenguaje, no puedo»... hasta que aparece la chancla.

const MAMA: ColoresPersonaje = {
  piel: "#e8a77c",
  camisa: "#c1121f",
  pantalon: "#5e3c99",
  sombrero: "#c1121f",
  zapatos: "#ff5fa2", // chanclas rosas
  bigote: false,
  gorra: false,
  cabello: "#bdbdbd",
  chongo: true,
  mandil: "#fdf0d5",
};

const MAMA_POS: Vec3 = [-0.75, 0, 0.6];
const CABEZA_MAMA: Vec3 = [-0.75, 1.78, 0.6];
const ROBOT_BASE: Vec3 = [0.75, 1.6, 0.4];
const ROBOT_FREGADERO: Vec3 = [FREGADERO[0] + 0.35, 1.5, FREGADERO[2] + 0.8];

const camaraEn = (f: number): Toma => {
  const base = { giro: 0, desenfoque: 0, fov: 50 };

  // 1. Entramos a la cocina desde la puerta
  if (f < L(2).inicio) {
    const t = interpolate(f, [0, L(2).inicio], [0, 1], suave);
    return {
      ...base,
      pos: mezclar([-0.3, 2.9, 8.0], [0, 2.1, 5.4], t),
      mira: mezclar([0, 1.3, 0.2], [0, 1.5, 0.4], t),
    };
  }

  // 2. Órbita alrededor de la IA mientras proyecta el holograma de la quinoa
  if (f < L(3).inicio) {
    const a = interpolate(f, [L(2).inicio, L(3).inicio], [-0.3, -0.95], suave);
    return {
      ...base,
      pos: orbita(ROBOT_BASE, 3.0, a, 1.95),
      mira: [ROBOT_BASE[0] - 0.1, ROBOT_BASE[1] + 0.45, ROBOT_BASE[2]],
      fov: 45,
    };
  }

  // 3a. Zoom de golpe a la cara de la mamá: «¿Quinoa?»
  const barrido = L(3).inicio + 78;
  if (f < barrido) {
    const zoom = interpolate(f, [L(3).inicio, L(3).inicio + 6], [0, 1], golpe);
    return {
      ...base,
      pos: sumar([1.2, 1.9, 2.1], enMano(f, 0.01)),
      mira: CABEZA_MAMA,
      fov: 70 - zoom * 22 - interpolate(f, [L(3).inicio + 6, barrido], [0, 6], fijo),
    };
  }

  // 3b. Barrido rápido a la torre de trastes sucios y subida por la torre
  if (f < L(4).inicio - 4) {
    const giro = interpolate(f, [barrido, barrido + 7], [0, 1], suave);
    const sube = interpolate(f, [barrido + 7, L(4).inicio], [0, 1], suave);
    const torre: Vec3 = [TORRE[0], TORRE[1] + 0.3 + sube * 1.0, TORRE[2]];
    return {
      pos: [2.7, 1.8, 1.0],
      mira: mezclar(CABEZA_MAMA, torre, giro),
      fov: 48 - sube * 14,
      giro: 0,
      desenfoque: Math.sin(giro * Math.PI) * 7,
    };
  }

  // 4. Plano frontal simétrico y quieto: la IA mira a cámara y se niega
  if (f < DUELO) {
    return {
      ...base,
      pos: [ROBOT_BASE[0], ROBOT_BASE[1], 3.9],
      mira: ROBOT_BASE,
      fov: 30,
    };
  }

  // 5. Duelo del viejo oeste: ojos de la mamá, ojos del robot y la chancla
  if (f < DUELO_ROBOT) {
    const t = interpolate(f, [DUELO, DUELO_ROBOT], [0, 1], fijo);
    return {
      ...base,
      // De frente y algo ladeada para no cruzarse con el robot
      pos: orbita(CABEZA_MAMA, 2.9 - t * 0.3, Math.PI / 2 - 0.45, CABEZA_MAMA[1] + 0.1),
      mira: [CABEZA_MAMA[0], CABEZA_MAMA[1] + 0.1, CABEZA_MAMA[2]],
      fov: 22,
    };
  }
  if (f < DUELO_CHANCLA) {
    const t = interpolate(f, [DUELO_ROBOT, DUELO_CHANCLA], [0, 1], fijo);
    return {
      ...base,
      pos: orbita(ROBOT_BASE, 2.5 - t * 0.3, -Math.PI / 2 + 0.6, ROBOT_BASE[1] + 0.1),
      mira: [ROBOT_BASE[0], ROBOT_BASE[1] + 0.1, ROBOT_BASE[2]],
      fov: 24,
    };
  }
  if (f < L(5).inicio) {
    // Desde el suelo: la cámara sube siguiendo la chancla
    const t = interpolate(f, [DUELO_CHANCLA, L(5).inicio - 8], [0, 1], suave);
    return {
      ...base,
      pos: [0.5, 0.3, 2.7],
      mira: mezclar([MAMA_POS[0], 0.2, MAMA_POS[2]], [MAMA_POS[0], 2.1, MAMA_POS[2] + 0.3], t),
      fov: 55,
    };
  }

  // 6. Contrapicado heroico de la mamá con la chancla en alto, el robot en primer plano
  if (f < L(6).inicio) {
    const t = interpolate(f, [L(5).inicio, L(6).inicio], [0, 1], suave);
    return {
      ...base,
      pos: mezclar([2.4, 0.7, 1.9], [2.1, 0.8, 1.75], t),
      mira: [MAMA_POS[0], 2.25, MAMA_POS[2] + 0.2],
      fov: 52,
      giro: 0.12,
    };
  }

  // 7a. Crash zoom al robot en pánico
  if (f < ESCAPE) {
    const zoom = interpolate(f, [L(6).inicio, L(6).inicio + 6], [0, 1], golpe);
    return {
      pos: sumar([0.0, 1.75, 2.1], enMano(f, 0.03)),
      mira: ROBOT_BASE,
      fov: 78 - zoom * 26,
      giro: -0.1,
      desenfoque: 0,
    };
  }

  // 7b. El robot sale disparado al fregadero y la cámara lo sigue con un barrido
  if (f < LAVADO) {
    const sigue = interpolate(f, [ESCAPE, ESCAPE + 10], [0, 1], suave);
    return {
      pos: sumar([0.4, 2.0, 1.9], enMano(f, 0.01)),
      mira: mezclar(ROBOT_BASE, ROBOT_FREGADERO, sigue),
      fov: 46,
      giro: 0,
      desenfoque: Math.sin(sigue * Math.PI) * 6,
    };
  }

  // 8. Cámara rápida: plano general alto con la mamá satisfecha en primer plano
  const t = interpolate(f, [LAVADO, 900], [0, 1], fijo);
  return {
    ...base,
    pos: mezclar([-1.7, 2.5, 3.4], [-1.5, 2.7, 3.1], t),
    mira: [0.7, 1.2, -0.9],
    fov: 52,
  };
};

const Mundo: React.FC<{ camara: Toma; bocaMama: number; bocaIA: number }> = ({
  camara,
  bocaMama,
  bocaIA,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;

  // --- Mamá ---
  const alzaChancla = interpolate(f, [DUELO_CHANCLA + 8, L(5).inicio - 6, ESCAPE + 10, ESCAPE + 30], [0, 1, 1, 0], fijo);
  const tieneChancla = f >= DUELO_CHANCLA && f < ESCAPE + 30 ? 1 : 0;
  const mama: PosePersonaje = {
    x: 0,
    z: 0,
    rotacion: interpolate(f, [LAVADO - 30, LAVADO - 10], [Math.PI / 2, 2.0], fijo),
    fasePaso: 0,
    caminar: 0,
    saludo: alzaChancla,
    // El brazo izquierdo es el que queda de frente a la cámara
    brazoSaludo: "izquierdo",
    salto: 0,
    respiracion: t * 2,
    boca: bocaMama,
    jarras: f < DUELO ? 1 : f < ESCAPE + 30 ? (1 - alzaChancla) * (1 - tieneChancla) : 1,
    chancla: tieneChancla,
    // Ojos entrecerrados y cejas de enojo durante el duelo
    sueno: f >= DUELO && f < L(6).inicio ? 0.55 : 0,
    enojo: interpolate(f, [L(3).inicio, L(3).inicio + 5, DUELO, DUELO + 5, ESCAPE, ESCAPE + 40], [0, 0.3, 0.3, 0.8, 0.8, 0], fijo),
  };

  // --- IA ---
  const escapa = interpolate(f, [ESCAPE, ESCAPE + 10], [0, 1], suave);
  const posRobot = mezclar(ROBOT_BASE, ROBOT_FREGADERO, escapa);
  const miraCamara = interpolate(f, [L(4).inicio - 6, L(4).inicio + 2, DUELO - 2, DUELO + 2], [0, 1, 1, 0], fijo);
  const rotRobot =
    escapa > 0
      ? interpolate(escapa, [0, 1], [-Math.PI / 2, Math.PI])
      : -Math.PI / 2 + miraCamara * (Math.PI / 2);
  const asustado = f >= DUELO_ROBOT - 5 && f < LAVADO + 20;
  const animo =
    f >= L(2).inicio && f < fin(L(2))
      ? "feliz"
      : asustado
        ? "asustado"
        : f >= LAVADO + 20
          ? "feliz"
          : "normal";
  const holograma =
    f < fin(L(2)) + 6
      ? spring({ frame: f - L(2).inicio - 8, fps, config: { damping: 12 } }) *
        interpolate(f, [fin(L(2)), fin(L(2)) + 6], [1, 0], fijo)
      : 0;

  // --- Trastes ---
  const lavado = interpolate(f, [LAVADO + 5, LAVADO + 60], [0, 1], fijo);
  const sucios = 16 * (1 - lavado);

  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <Cocina
        frame={f}
        platosSucios={sucios}
        platosLimpios={16 - sucios}
        burbujas={interpolate(f, [ESCAPE + 12, ESCAPE + 20], [0, 1], fijo)}
      />
      <group position={MAMA_POS}>
        <Personaje colores={MAMA} pose={mama} escala={0.95} />
      </group>
      <Robot
        pos={posRobot}
        rot={rotRobot}
        boca={bocaIA}
        frame={f}
        animo={animo}
        temblor={f >= DUELO_ROBOT && f < ESCAPE ? 1 : 0}
        sudor={f >= DUELO_ROBOT && f < LAVADO + 20 ? 1 : 0}
        lavando={interpolate(f, [ESCAPE + 8, ESCAPE + 14], [0, 1], fijo)}
        holograma={holograma}
      />
    </>
  );
};

// Ventanita de "actualización" estilo sistema operativo
const Actualizacion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 12 } });
  const progreso = interpolate(frame, [5, 85], [0, 100], fijo);
  const listo = progreso >= 100;
  return (
    <div
      style={{
        position: "absolute",
        top: 360,
        left: 110,
        right: 110,
        transform: `scale(${entrada})`,
        background: "#0b3d91",
        border: "6px solid white",
        borderRadius: 18,
        padding: "20px 28px",
        color: "white",
        fontFamily: FUENTE,
        boxShadow: "0 10px 0 rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ fontSize: 34, marginBottom: 12 }}>
        {listo ? "ACTUALIZACIÓN INSTALADA" : "INSTALANDO: obedecer_a_mama.exe"}
      </div>
      <div style={{ height: 34, background: "#05214f", borderRadius: 8, overflow: "hidden" }}>
        <div
          style={{
            width: `${progreso}%`,
            height: "100%",
            background: listo ? "#3ddc84" : "#4fc3f7",
          }}
        />
      </div>
      <div style={{ fontSize: 30, marginTop: 8, textAlign: "right" }}>{Math.round(progreso)}%</div>
    </div>
  );
};

const CartelFinal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 9, stiffness: 160 } });
  const pop2 = spring({ frame: frame - 10, fps, config: { damping: 9, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 1180 }}>
      <div style={{ ...estiloContorno, fontSize: 88, transform: `scale(${pop}) rotate(-3deg)` }}>
        NI LA IA LE GANA
      </div>
      <div
        style={{
          ...estiloContorno,
          fontSize: 120,
          color: "#ff5fa2",
          transform: `scale(${pop2}) rotate(2deg)`,
        }}
      >
        A LA CHANCLA
      </div>
    </AbsoluteFill>
  );
};

export const ChanclaIA: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const bocas = useBocas(LINEAS, "voces/chancla");
  const camara = camaraEn(frame);

  // Franjas de cine durante el duelo
  const franjas =
    frame < DUELO
      ? 0
      : interpolate(frame, [DUELO, DUELO + 6, L(5).inicio, L(5).inicio + 6], [0, 1, 1, 0], fijo);
  const flash = (inicio: number, fuerza: number) =>
    frame < inicio ? 0 : interpolate(frame, [inicio, inicio + 4], [fuerza, 0], fijo);
  const destello = Math.max(flash(L(3).inicio, 0.5), flash(L(6).inicio, 0.6), flash(DUELO_CHANCLA, 0.4));

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Lienzo ancho={width} alto={height} desenfoque={camara.desenfoque}>
        <Mundo camara={camara} bocaMama={bocas.mama ?? 0} bocaIA={bocas.ia ?? 0} />
      </Lienzo>

      <AbsoluteFill style={{ backgroundColor: "white", opacity: destello }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 300 * franjas, background: "black" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 300 * franjas, background: "black" }} />

      <Gancho texto="Cuando tu mamá usa la IA por primera vez" />

      {LINEAS.map((l) => (
        <Sequence key={l.id} from={l.inicio} durationInFrames={l.duracion + 4} layout="none">
          <Audio src={staticFile(`voces/chancla/${l.id}.mp3`)} />
          <Subtitulo
            texto={l.texto}
            nombre={l.personaje === "mama" ? "MAMÁ" : "IA"}
            color={l.personaje === "mama" ? "#c1121f" : "#13a8c8"}
            centroY={1180}
          />
        </Sequence>
      ))}

      <Sequence from={L(6).inicio + 8} durationInFrames={LAVADO - L(6).inicio + 10} layout="none">
        <Actualizacion />
      </Sequence>

      {/* Indicador de cámara rápida */}
      {frame >= LAVADO && frame < FINAL + 10 && (
        <div style={{ position: "absolute", top: 360, right: 70, ...estiloContorno, fontSize: 80 }}>
          x8 &gt;&gt;
        </div>
      )}

      <Sequence from={FINAL} layout="none">
        <CartelFinal />
      </Sequence>

      <Sonidos />
    </AbsoluteFill>
  );
};
