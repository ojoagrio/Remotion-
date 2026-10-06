import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
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
import { loadFont } from "@remotion/fonts";
import { ColoresPersonaje, Personaje, PosePersonaje } from "../n64/Personaje";
import { Cine, Cobija, Habitacion } from "./Escenas3D";
import { fin, linea, lineaActiva, LINEAS, Personaje as Quien } from "./linea";

// Video vertical (TikTok) en pantalla dividida: arriba Lola en el cine,
// abajo Pepe en su cama jurando que "ya va saliendo".

const ESCALA_PIXEL = 4;
// Fuente "Luckiest Guy" (licencia OFL) incluida en public/ para renderizar sin internet
const FUENTE = "Luckiest Guy";
loadFont({ family: FUENTE, url: staticFile("fuentes/LuckiestGuy.woff2") });
const fijo = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PEPE: ColoresPersonaje = {
  // Piyama celeste
  piel: "#f2b48a",
  camisa: "#8ecae6",
  pantalon: "#5fa8d3",
  sombrero: "#d62828",
  zapatos: "#f2b48a",
  gorra: false,
  cabello: "#3b2414",
};

const LOLA: ColoresPersonaje = {
  piel: "#e9a77c",
  camisa: "#f72585",
  pantalon: "#3a0ca3",
  sombrero: "#f72585",
  zapatos: "#1b1b1f",
  bigote: false,
  gorra: false,
  cabello: "#5a2e0e",
  mono: "#ffd21f",
};

const MAMA: ColoresPersonaje = {
  piel: "#f0b892",
  camisa: "#c77dff",
  pantalon: "#9d4edd",
  sombrero: "#c77dff",
  zapatos: "#5a2e0e",
  bigote: false,
  gorra: false,
  cabello: "#cfcfcf",
};

const POSE_BASE: PosePersonaje = {
  x: 0,
  z: 0,
  rotacion: 0,
  fasePaso: 0,
  caminar: 0,
  saludo: 0,
  salto: 0,
  respiracion: 0,
};

// Parábola de salto entre dos frames
const saltar = (frame: number, inicio: number, duracion: number, altura: number) => {
  const t = (frame - inicio) / duracion;
  if (t < 0 || t > 1) return 0;
  return 4 * altura * t * (1 - t);
};

// Apertura de boca de cada personaje según el volumen real de su audio
const useBocas = (): Record<Quien, number> => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audios = LINEAS.map((l) => useAudioData(staticFile(`voces/${l.id}.mp3`)));
  const bocas: Record<Quien, number> = { pepe: 0, lola: 0 };
  const activa = lineaActiva(frame);
  if (activa) {
    const datos = audios[LINEAS.indexOf(activa)];
    if (datos) {
      const espectro = visualizeAudio({
        fps,
        frame: frame - activa.inicio,
        audioData: datos,
        numberOfSamples: 16,
      });
      const volumen = espectro.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
      bocas[activa.personaje] = Math.min(1, volumen * 6);
    }
  }
  return bocas;
};

const Camara: React.FC<{
  pos: [number, number, number];
  mira: [number, number, number];
}> = ({ pos, mira }) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(...pos);
  camera.lookAt(...mira);
  return null;
};

// Lienzo 3D a baja resolución ampliado con píxeles nítidos
const Lienzo: React.FC<{ ancho: number; alto: number; children: React.ReactNode }> = ({
  ancho,
  alto,
  children,
}) => (
  <div
    style={{
      width: ancho / ESCALA_PIXEL,
      height: alto / ESCALA_PIXEL,
      transform: `scale(${ESCALA_PIXEL})`,
      transformOrigin: "top left",
      imageRendering: "pixelated",
    }}
  >
    <ThreeCanvas
      width={ancho / ESCALA_PIXEL}
      height={alto / ESCALA_PIXEL}
      dpr={1}
      gl={{ antialias: false }}
      camera={{ fov: 50, near: 0.1, far: 100 }}
      style={{ imageRendering: "pixelated" }}
    >
      {children}
    </ThreeCanvas>
  </div>
);

const MundoLola: React.FC<{ boca: number }> = ({ boca }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const l3 = linea(3);
  const l5 = linea(5);
  const l7 = linea(7);

  // Se enoja al final: salta y tiembla
  const enojo = interpolate(frame, [l7.inicio, l7.inicio + 6], [0, 1], fijo);
  // Sospecha en la línea 3: se acerca la cámara
  const zoom = interpolate(frame, [l3.inicio, l3.inicio + 15, fin(l3), fin(l3) + 15], [0, 1, 1, 0], fijo);
  const zoomFinal = interpolate(frame, [l7.inicio, l7.inicio + 8], [0, 1], fijo);
  const acercar = Math.max(zoom * 0.6, zoomFinal);

  // La mamá de Pepe pasa por detrás saludando durante la línea 5
  const mamaX = interpolate(frame, [l5.inicio - 45, fin(l5) + 20], [-6, 6], fijo);
  const mamaVisible = frame > l5.inicio - 45 && frame < fin(l5) + 20;

  const lola: PosePersonaje = {
    ...POSE_BASE,
    respiracion: t * 2,
    boca,
    telefono: 1,
    impaciencia: frame < linea(2).inicio ? 1 : interpolate(frame, [l5.inicio, l5.inicio + 10], [0.4, 0], fijo),
    enojo,
    salto: saltar(frame, l7.inicio + 2, 14, 0.7) + saltar(frame, l7.inicio + 18, 14, 0.7),
  };

  const mama: PosePersonaje = {
    ...POSE_BASE,
    x: mamaX,
    z: -1.4,
    rotacion: Math.PI / 2,
    fasePaso: t * 9,
    caminar: 1,
    saludo: 0,
    respiracion: t * 2,
  };

  return (
    <>
      <Camara
        pos={[0, 2.2 - acercar * 0.2, 6.6 - acercar * 2.8]}
        mira={[0, 2.1 + acercar * 0.1, 0]}
      />
      <Cine frame={frame} />
      <Personaje colores={LOLA} pose={lola} escala={0.95} />
      {mamaVisible && <Personaje colores={MAMA} pose={mama} escala={0.95} />}
    </>
  );
};

const MundoPepe: React.FC<{ boca: number }> = ({ boca }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const l2 = linea(2);
  const l4 = linea(4);
  const l5 = linea(5);
  const l6 = linea(6);
  const l7 = linea(7);

  // "¡Para nada!": salta de la cama y se pone a "manejar" de pie sobre el colchón
  const levantarse = l4.inicio + 30;
  const dePie =
    interpolate(frame, [levantarse, levantarse + 8], [0, 1], fijo) *
    interpolate(frame, [l6.inicio + 10, l6.inicio + 40], [1, 0], fijo);
  const maneja = interpolate(frame, [levantarse + 8, levantarse + 14, l5.inicio + 20, l5.inicio + 30], [0, 1, 1, 0], fijo);
  const brinco = saltar(frame, levantarse - 2, 14, 1.2);
  // Al final se tapa hasta la cabeza
  const tapado = interpolate(frame, [l7.inicio + 6, l7.inicio + 16], [0, 1], fijo);
  const sueno =
    frame < l2.inicio
      ? 1
      : frame < levantarse
        ? 0.6
        : 0;

  // Acostado: rotado -90° sobre el colchón; de pie: erguido sobre la cama
  const rotX = (-Math.PI / 2 + 0.4) * (1 - dePie);
  const y = 0.63 + brinco;
  const z = interpolate(dePie, [0, 1], [1.1, 0.1]);

  const pepe: PosePersonaje = {
    ...POSE_BASE,
    respiracion: t * 2,
    boca,
    telefono: 1,
    brazosAdelante: maneja,
    sueno,
    salto: 0,
  };

  // Zoom a la cara cuando lo descubren (línea 5)
  const zoom = interpolate(frame, [l5.inicio + 30, l5.inicio + 50, fin(l5) + 5, fin(l5) + 15], [0, 1, 1, 0], fijo);

  return (
    <>
      <Camara
        pos={[2.4 - zoom * 0.9, 3.0 - zoom * 0.2, 3.4 - zoom * 1.1]}
        mira={[0, 0.9 + dePie * 0.9 + zoom * 0.5, -0.2]}
      />
      <Habitacion />
      <group position={[0, y, z]} rotation={[rotX, 0, 0]}>
        <Personaje colores={PEPE} pose={pepe} sombra={false} />
      </group>
      <Cobija cubre={tapado} visible={1 - dePie} temblor={Math.sin(frame * 1.7) * 0.05 * tapado} />
    </>
  );
};

const Etiqueta: React.FC<{ texto: string; color: string; style: React.CSSProperties }> = ({
  texto,
  color,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      padding: "10px 22px",
      borderRadius: 14,
      background: color,
      color: "white",
      fontFamily: FUENTE,
      fontWeight: 900,
      fontSize: 38,
      boxShadow: "0 6px 0 rgba(0,0,0,0.35)",
      ...style,
    }}
  >
    {texto}
  </div>
);

// Subtítulo grande al estilo TikTok, en la franja entre ambas mitades
const Subtitulo: React.FC<{ texto: string; quien: Quien }> = ({ texto, quien }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, stiffness: 200 } });
  const color = quien === "lola" ? "#f72585" : "#2f8fd6";
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          transform: `scale(${0.6 + pop * 0.4})`,
          maxWidth: 900,
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: color,
            color: "white",
            fontFamily: FUENTE,
            fontSize: 34,
            padding: "4px 18px",
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          {quien.toUpperCase()}
        </span>
        <div
          style={{
            fontFamily: FUENTE,
            fontWeight: 900,
            fontSize: 62,
            lineHeight: 1.15,
            color: "white",
            WebkitTextStroke: "10px black",
            paintOrder: "stroke fill",
            textShadow: "0 6px 0 #000, 0 0 18px rgba(0,0,0,0.6)",
          }}
        >
          {texto}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const YaVoySaliendo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const bocas = useBocas();
  const mitad = height / 2;

  const l7 = linea(7);
  // Sacudida de pantalla con el grito final
  const sacudida = interpolate(frame, [l7.inicio, l7.inicio + 30], [1, 0], fijo);
  const dx = Math.sin(frame * 2.3) * 18 * sacudida;
  const dy = Math.cos(frame * 3.1) * 14 * sacudida;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px)` }}>
        <div style={{ position: "absolute", top: 0, left: 0, width, height: mitad, overflow: "hidden" }}>
          <Lienzo ancho={width} alto={mitad}>
            <MundoLola boca={bocas.lola} />
          </Lienzo>
        </div>
        <div style={{ position: "absolute", top: mitad, left: 0, width, height: mitad, overflow: "hidden" }}>
          <Lienzo ancho={width} alto={mitad}>
            <MundoPepe boca={bocas.pepe} />
          </Lienzo>
        </div>
        {/* Línea divisoria */}
        <div style={{ position: "absolute", top: mitad - 6, left: 0, width, height: 12, background: "white" }} />

        <Etiqueta texto="LOLA · EN EL CINE" color="#f72585" style={{ left: 40, top: 255 }} />
        <Etiqueta texto="PEPE · «EN CAMINO»" color="#2f8fd6" style={{ left: 40, top: height - 470 }} />
      </AbsoluteFill>

      {/* Gancho fijo arriba, típico de TikTok */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 60,
          right: 60,
          padding: "14px 10px 6px",
          borderRadius: 24,
          background: "rgba(0,0,0,0.55)",
          textAlign: "center",
          fontFamily: FUENTE,
          fontWeight: 900,
          fontSize: 58,
          color: "white",
          WebkitTextStroke: "10px black",
            paintOrder: "stroke fill",
          textShadow: "0 5px 0 #000",
        }}
      >
        Cuando dices «ya voy saliendo»
      </div>

      {LINEAS.map((l) => (
        <Sequence key={l.id} from={l.inicio} durationInFrames={l.duracion + 4} layout="none">
          <Audio src={staticFile(`voces/${l.id}.mp3`)} />
          <Subtitulo texto={l.texto} quien={l.personaje} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
