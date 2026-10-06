import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Escenario, Estrella } from "./Escenario";
import { ColoresPersonaje, Personaje, PosePersonaje } from "./Personaje";
import { Dialogo } from "./Dialogo";

// Resolución interna baja (como una N64) que luego se amplía sin suavizado
export const ESCALA_PIXEL = 4;

const PEPE: ColoresPersonaje = {
  piel: "#f2b48a",
  camisa: "#d62828",
  pantalon: "#1d4ed8",
  sombrero: "#d62828",
  zapatos: "#5a2e0e",
};

const LOLA: ColoresPersonaje = {
  piel: "#e9a77c",
  camisa: "#2a9d3f",
  pantalon: "#6d28d9",
  sombrero: "#2a9d3f",
  zapatos: "#3b2414",
};

const fijo = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Salto parabólico entre dos frames
const saltar = (frame: number, inicio: number, duracion: number, altura: number) => {
  const t = (frame - inicio) / duracion;
  if (t < 0 || t > 1) return 0;
  return 4 * altura * t * (1 - t);
};

const Camara: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera);

  // Plano general que sigue a Pepe, luego se acerca, y al final gira alrededor
  const x = interpolate(frame, [0, 90, 150], [-4, -0.5, 0], fijo);
  const distancia = interpolate(frame, [0, 90, 150, 210], [10, 8, 6.5, 7.5], fijo);
  const angulo = interpolate(frame, [210, 300], [0, 0.6], fijo);
  const altura = interpolate(frame, [0, 150, 300], [4.5, 3.2, 3.8], fijo);

  camera.position.set(x + Math.sin(angulo) * distancia, altura, Math.cos(angulo) * distancia);
  camera.lookAt(x, 1.4, 0);
  return null;
};

const Mundo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // --- Pepe: entra caminando, se detiene y saluda ---
  const pepeX = interpolate(frame, [0, 90], [-7, -1.4], fijo);
  const pepeCamina = interpolate(frame, [0, 5, 82, 92], [0, 1, 1, 0], fijo);
  const pepeSaluda = interpolate(frame, [95, 105, 140, 150], [0, 1, 1, 0], fijo);
  const pepeRot = interpolate(frame, [80, 95], [Math.PI / 2, Math.PI / 2.6], fijo);

  // --- Lola: espera, se gira al oír a Pepe y salta de alegría ---
  const lolaRot = interpolate(frame, [100, 115], [0, -Math.PI / 2.6], fijo);
  const lolaSalto = saltar(frame, 155, 18, 0.9) + saltar(frame, 176, 18, 0.9);

  // --- Final: aparece la estrella y ambos saltan ---
  const apareceEstrella = spring({ frame: frame - 205, fps, config: { damping: 12 } });
  const saltoFinal = (inicio: number) =>
    saltar(frame, inicio, 20, 1.2) + saltar(frame, inicio + 26, 20, 1.2);

  const pepe: PosePersonaje = {
    x: pepeX,
    z: 0,
    rotacion: pepeRot,
    fasePaso: t * 10,
    caminar: pepeCamina,
    saludo: pepeSaluda,
    // Pepe mira a la derecha: su brazo izquierdo es el que queda frente a cámara
    brazoSaludo: "izquierdo",
    salto: saltoFinal(235),
    respiracion: t * 2,
  };

  const lola: PosePersonaje = {
    x: 1.4,
    z: 0,
    rotacion: lolaRot,
    fasePaso: 0,
    caminar: 0,
    saludo: 0,
    salto: lolaSalto + saltoFinal(240),
    respiracion: t * 2 + 1,
  };

  return (
    <>
      <Camara />
      <Escenario />
      <Personaje colores={PEPE} pose={pepe} />
      <Personaje colores={LOLA} pose={lola} escala={0.92} />
      {frame >= 205 && (
        <Estrella
          y={3.2 + Math.sin(t * 3) * 0.15}
          giro={t * 4}
          escala={apareceEstrella}
        />
      )}
    </>
  );
};

export const EscenaEncuentro: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const anchoInterno = width / ESCALA_PIXEL;
  const altoInterno = height / ESCALA_PIXEL;
  const fundido = interpolate(frame, [0, 12, 285, 300], [1, 0, 0, 1], fijo);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Lienzo 3D a baja resolución, ampliado con píxeles nítidos */}
      <div
        style={{
          width: anchoInterno,
          height: altoInterno,
          transform: `scale(${ESCALA_PIXEL})`,
          transformOrigin: "top left",
          imageRendering: "pixelated",
        }}
      >
        <ThreeCanvas
          width={anchoInterno}
          height={altoInterno}
          dpr={1}
          gl={{ antialias: false }}
          camera={{ fov: 50, near: 0.1, far: 100 }}
          style={{ imageRendering: "pixelated" }}
        >
          <Mundo />
        </ThreeCanvas>
      </div>

      <Sequence from={100} durationInFrames={50} layout="none">
        <Dialogo nombre="PEPE" texto="¡Hola, Lola!" lado="izquierda" />
      </Sequence>
      <Sequence from={150} durationInFrames={55} layout="none">
        <Dialogo nombre="LOLA" texto="¡Pepe! ¡Mira lo que encontré!" lado="derecha" />
      </Sequence>
      <Sequence from={215} durationInFrames={70} layout="none">
        <Dialogo nombre="LOS DOS" texto="¡¡Una estrella!!" lado="centro" />
      </Sequence>

      <AbsoluteFill style={{ backgroundColor: "black", opacity: fundido }} />
    </AbsoluteFill>
  );
};
