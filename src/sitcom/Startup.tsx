import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { crearTexturaCuadros } from "../n64/Escenario";

// Set de la sitcom «Prompt & Compañía»: oficina de startup vista de frente, como un
// estudio de televisión (pared del fondo, dos escritorios a los lados y la cafetera).

const Caja: React.FC<{
  pos: [number, number, number];
  tam: [number, number, number];
  color: string;
  emisivo?: string;
  rot?: [number, number, number];
}> = ({ pos, tam, color, emisivo, rot }) => (
  <mesh position={pos} rotation={rot}>
    <boxGeometry args={tam} />
    <meshLambertMaterial color={color} emissive={emisivo ?? "#000000"} flatShading />
  </mesh>
);

const useLienzo = (ancho: number, alto: number, dibujar: (ctx: CanvasRenderingContext2D) => void, clave: string) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = ancho;
    c.height = alto;
    dibujar(c.getContext("2d")!);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
};

const Plano: React.FC<{ tex: THREE.Texture; pos: [number, number, number]; tam: [number, number]; rot?: [number, number, number] }> = ({
  tex,
  pos,
  tam,
  rot,
}) => (
  <mesh position={pos} rotation={rot}>
    <planeGeometry args={tam} />
    <meshBasicMaterial map={tex} transparent />
  </mesh>
);

export const ESCRITORIO_SOFI: [number, number, number] = [-2.5, 0, 0.3];
export const ESCRITORIO_TONO: [number, number, number] = [2.5, 0, 0.3];
// Giro de cada escritorio para que miren un poco hacia el centro
export const ROT_SOFI = 0.45;
export const ROT_TONO = -0.45;
export const CAFETERA: [number, number, number] = [1.3, 0, -2.0];

// Como en las sitcoms, el escritorio "mira" al público: la persona se sienta detrás
// (de frente a cámara) y el monitor queda a un lado para no taparle la cara.
const Escritorio: React.FC<{ pos: [number, number, number]; rot: number; pantalla: string }> = ({ pos, rot, pantalla }) => (
  <group position={pos} rotation={[0, rot, 0]}>
    <Caja pos={[0, 0.82, 0.62]} tam={[1.5, 0.08, 0.7]} color="#f1f1f1" />
    <Caja pos={[0, 0.42, 0.95]} tam={[1.45, 0.8, 0.05]} color="#9aa0a6" />
    <Caja pos={[0.55, 1.15, 0.6]} tam={[0.55, 0.38, 0.05]} color="#1b1b22" rot={[0, -0.5, 0]} />
    <Caja pos={[0.54, 1.15, 0.57]} tam={[0.48, 0.32, 0.02]} color={pantalla} emisivo={pantalla} rot={[0, -0.5, 0]} />
    <Caja pos={[-0.3, 0.88, 0.6]} tam={[0.45, 0.03, 0.18]} color="#2b2b2b" />
    {/* Silla detrás */}
    <Caja pos={[0, 0.46, 0]} tam={[0.65, 0.08, 0.6]} color="#2b2d42" />
    <Caja pos={[0, 0.85, -0.3]} tam={[0.65, 0.75, 0.08]} color="#2b2d42" />
  </group>
);

export const Startup: React.FC<{
  frame: number;
  cafeCancelado: boolean;
  pantallaTono: string;
  pantallaSofi: string;
  // Posición y giro de cada escritorio (para el formato vertical se acercan al centro)
  escritorios?: { pos: [number, number, number]; rot: number }[];
  // Textos del letrero de neón y del pizarrón (otra serie puede cambiarlos)
  letrero?: string;
  pizarronFinal?: string;
}> = ({
  letrero: textoLetrero = "PROMPT & CO.",
  pizarronFinal = "AI-FIRST!!",
  frame,
  cafeCancelado,
  pantallaTono,
  pantallaSofi,
  escritorios = [
    { pos: ESCRITORIO_SOFI, rot: ROT_SOFI },
    { pos: ESCRITORIO_TONO, rot: ROT_TONO },
  ],
}) => {
  const piso = useMemo(() => crearTexturaCuadros("#b5835a", "#a8764f", 12), []);
  const parpadeo = Math.floor(frame / 20) % 6 !== 0;

  const letrero = useLienzo(
    160,
    40,
    (ctx) => {
      ctx.fillStyle = "#00000000";
      ctx.clearRect(0, 0, 160, 40);
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "#ff4fd8";
      ctx.shadowBlur = parpadeo ? 8 : 0;
      ctx.fillStyle = parpadeo ? "#ffd6f5" : "#7a3a6e";
      ctx.fillText(textoLetrero, 80, 21);
    },
    `letrero-${parpadeo}-${textoLetrero}`,
  );
  const pizarron = useLienzo(
    96,
    64,
    (ctx) => {
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(0, 0, 96, 64);
      ctx.font = "bold 10px sans-serif";
      ctx.fillStyle = "#6c757d";
      ctx.fillText("blockchain-first", 6, 18);
      ctx.strokeStyle = "#e63946";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(4, 15);
      ctx.lineTo(90, 15);
      ctx.stroke();
      ctx.fillStyle = "#6c757d";
      ctx.fillText("metaverso-first", 6, 32);
      ctx.beginPath();
      ctx.moveTo(4, 29);
      ctx.lineTo(90, 29);
      ctx.stroke();
      ctx.fillStyle = "#1d4ed8";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(pizarronFinal, 14, 52);
    },
    `pizarron-${pizarronFinal}`,
  );
  const cartelCafe = useLienzo(
    64,
    24,
    (ctx) => {
      ctx.fillStyle = cafeCancelado ? "#e63946" : "#2a9d8f";
      ctx.fillRect(0, 0, 64, 24);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(cafeCancelado ? "CANCELADO" : "CAFÉ ♥", 32, 13);
    },
    `cafe-${cafeCancelado}`,
  );

  return (
    <>
      <color attach="background" args={["#1a1a24"]} />
      {/* Iluminación plana y cálida, de estudio de televisión */}
      <ambientLight intensity={1.35} />
      <directionalLight position={[0, 6, 6]} intensity={1.6} color="#fff4e0" />
      <directionalLight position={[-5, 4, 3]} intensity={0.5} color="#d6e4ff" />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 12]} />
        <meshLambertMaterial map={piso} />
      </mesh>
      {/* Pared del fondo de ladrillo pintado y pared lateral */}
      <Caja pos={[0, 2.6, -2.6]} tam={[12, 5.2, 0.2]} color="#e9e1d4" />
      <Caja pos={[0, 0.25, -2.48]} tam={[12, 0.5, 0.05]} color="#c9b8a0" />
      <Caja pos={[-5.0, 2.6, 0]} tam={[0.2, 5.2, 6]} color="#ddd3c2" />
      {/* Ventanales con la ciudad */}
      {[-3.4, -1.9].map((x) => (
        <group key={x}>
          <Caja pos={[x, 2.8, -2.47]} tam={[1.2, 1.6, 0.04]} color="#7ec8ff" emisivo="#2a5470" />
          <Caja pos={[x, 2.8, -2.44]} tam={[0.05, 1.6, 0.04]} color="#333" />
          <Caja pos={[x, 2.4, -2.44]} tam={[1.2, 0.05, 0.04]} color="#333" />
        </group>
      ))}
      {/* Letrero de neón */}
      <Plano tex={letrero} pos={[0.6, 3.9, -2.45]} tam={[3.6, 0.9]} />
      {/* Pizarrón */}
      <Caja pos={[-0.2, 2.5, -2.48]} tam={[1.7, 1.15, 0.04]} color="#adb5bd" />
      <Plano tex={pizarron} pos={[-0.2, 2.5, -2.45]} tam={[1.6, 1.05]} />
      {/* Puerta (por donde entra Raúl) */}
      <Caja pos={[4.3, 1.3, -2.47]} tam={[1.1, 2.6, 0.05]} color="#8d5b3a" />
      <Caja pos={[3.9, 1.3, -2.43]} tam={[0.08, 0.08, 0.06]} color="#ffd166" />

      {/* Cafetera con su cartel */}
      <group position={CAFETERA}>
        <Caja pos={[0, 0.45, 0]} tam={[1.4, 0.9, 0.6]} color="#6d4c41" />
        <Caja pos={[0, 0.92, 0]} tam={[1.45, 0.05, 0.65]} color="#efebe9" />
        <Caja pos={[-0.25, 1.25, -0.05]} tam={[0.45, 0.6, 0.4]} color="#263238" />
        <Caja pos={[-0.25, 1.1, 0.16]} tam={[0.16, 0.05, 0.05]} color="#90a4ae" />
        <mesh position={[0.35, 1.03, 0.05]}>
          <cylinderGeometry args={[0.07, 0.06, 0.16, 6]} />
          <meshLambertMaterial color="#ffffff" flatShading />
        </mesh>
        <Plano tex={cartelCafe} pos={[-0.25, 1.75, 0.0]} tam={[0.9, 0.34]} />
      </group>

      {/* Planta y puf */}
      <group position={[-4.2, 0, -1.6]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.3, 0.25, 0.6, 7]} />
          <meshLambertMaterial color="#e76f51" flatShading />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <icosahedronGeometry args={[0.6, 0]} />
          <meshLambertMaterial color="#2a9d8f" flatShading />
        </mesh>
      </group>
      <mesh position={[3.6, 0.35, -1.0]} scale={[1, 0.6, 1]}>
        <sphereGeometry args={[0.6, 7, 5]} />
        <meshLambertMaterial color="#8338ec" flatShading />
      </mesh>

      {escritorios.map((e, i) => (
        <Escritorio key={i} pos={e.pos} rot={e.rot} pantalla={i === 0 ? pantallaSofi : pantallaTono} />
      ))}
    </>
  );
};
