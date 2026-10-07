import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { crearTexturaCuadros } from "../n64/Escenario";

// Escenarios de «La industria tech»: oficina abierta, sala de juntas, vitrina y azotea.

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

// Etiqueta de texto pixelada (canvas pequeño con filtro "nearest")
const useEtiqueta = (texto: string, fondo: string, color: string, ancho = 64, alto = 24) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = ancho;
    c.height = alto;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, ancho, alto);
    ctx.fillStyle = color;
    ctx.font = `bold ${Math.floor(alto * 0.6)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(texto, ancho / 2, alto / 2 + 1);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    return t;
  }, [texto, fondo, color, ancho, alto]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
};

export const Etiqueta3D: React.FC<{
  texto: string;
  pos: [number, number, number];
  tam: [number, number];
  fondo?: string;
  color?: string;
  rot?: [number, number, number];
}> = ({ texto, pos, tam, fondo = "#ffe600", color = "#111", rot }) => {
  const tex = useEtiqueta(texto, fondo, color);
  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={tam} />
      <meshBasicMaterial map={tex} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Nube de "puf" cuando alguien desaparece
export const Puf: React.FC<{ pos: [number, number, number]; t: number }> = ({ pos, t }) =>
  t <= 0 || t >= 1 ? null : (
    <group position={pos}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * t * 0.7, 1.0 + Math.sin(a) * t * 0.5, 0]} scale={(1 - t) * 1.4}>
            <icosahedronGeometry args={[0.25, 0]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.85 * (1 - t)} />
          </mesh>
        );
      })}
    </group>
  );

// ---------------------------------------------------------------- Oficina abierta
// Escritorios en cuadrícula 2x2 (cabe mejor en vertical): [x, z] de cada escritorio
export const ESCRITORIOS: [number, number][] = [
  [-0.85, 0.4],
  [0.85, 0.4],
  [-0.85, -1.4],
  [0.85, -1.4],
];

export const OficinaAbierta: React.FC = () => {
  const piso = useMemo(() => crearTexturaCuadros("#8d99ae", "#7d899e", 14), []);
  return (
    <>
      <color attach="background" args={["#d9e2ec"]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 6, 5]} intensity={1.6} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial map={piso} />
      </mesh>
      <Caja pos={[0, 2.5, -3.4]} tam={[14, 5, 0.2]} color="#edf2f4" />
      <Etiqueta3D texto="STARTUP S.A." pos={[0, 3.3, -3.28]} tam={[2.6, 0.75]} fondo="#2b2d42" color="#ffffff" />
      {ESCRITORIOS.map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <Caja pos={[0, 0.85, 0]} tam={[1.3, 0.08, 0.7]} color="#ffffff" />
          <Caja pos={[0, 0.42, 0.3]} tam={[1.2, 0.84, 0.05]} color="#adb5bd" />
          {/* Laptop pequeña a un lado para no tapar a quien está sentado */}
          <Caja pos={[0.42, 0.9, 0.05]} tam={[0.4, 0.02, 0.28]} color="#1b1b22" />
          <Caja pos={[0.42, 1.04, -0.08]} tam={[0.4, 0.27, 0.02]} color="#4fc3f7" emisivo="#1a4a6a" rot={[-0.3, 0, 0]} />
        </group>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- Sala de juntas
export const SalaJuntas: React.FC<{ hojas: number; tiradas: number }> = ({ hojas, tiradas }) => {
  const piso = useMemo(() => crearTexturaCuadros("#5c4033", "#523a2e", 10), []);
  // Pila de notas: se va al bote cuando "tiradas" pasa de 0 a 1
  const pila: [number, number, number] = [
    0.6 + tiradas * 2.6,
    0.95 + Math.sin(tiradas * Math.PI) * 1.2 - tiradas * 0.4,
    0.0 + tiradas * 1.4,
  ];
  return (
    <>
      <color attach="background" args={["#1b263b"]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[1, 6, 4]} intensity={1.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial map={piso} />
      </mesh>
      <Caja pos={[0, 2.5, -2.6]} tam={[14, 5, 0.2]} color="#415a77" />
      {/* Pantalla de presentación */}
      <Caja pos={[0, 2.6, -2.45]} tam={[3.0, 1.6, 0.05]} color="#e0e1dd" />
      <Etiqueta3D texto="SINERGIA IA" pos={[0, 2.9, -2.4]} tam={[2.4, 0.6]} fondo="#e0e1dd" color="#1b263b" />
      <Caja pos={[0, 2.3, -2.4]} tam={[1.6, 0.4, 0.02]} color="#e63946" />
      {/* Mesa larga */}
      <Caja pos={[0, 0.85, 0]} tam={[6.4, 0.1, 1.6]} color="#7f5539" />
      {[-2.8, 2.8].map((x) => (
        <Caja key={x} pos={[x, 0.42, 0]} tam={[0.12, 0.84, 1.2]} color="#5c3d2e" />
      ))}
      {/* Pila de notas */}
      <group position={pila} rotation={[0, tiradas * 3, tiradas * 2]}>
        {Array.from({ length: Math.round(hojas) }).map((_, i) => (
          <Caja
            key={i}
            pos={[Math.sin(i * 1.7) * 0.03, i * 0.035, Math.cos(i * 1.3) * 0.03]}
            tam={[0.5, 0.03, 0.65]}
            color={i % 2 ? "#ffffff" : "#f1f1f1"}
            rot={[0, i * 0.2, 0]}
          />
        ))}
      </group>
      {/* Bote de basura */}
      <group position={[3.4, 0, 1.6]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.38, 0.3, 0.8, 8, 1, true]} />
          <meshLambertMaterial color="#6c757d" side={THREE.DoubleSide} flatShading />
        </mesh>
      </group>
    </>
  );
};

// ---------------------------------------------------------------- Vitrina «con IA»
export const PEDESTALES: [number, number, number][] = [
  [-2.2, 0, 0],
  [0, 0, 0],
  [2.2, 0, 0],
];

const Pedestal: React.FC<{ pos: [number, number, number] }> = ({ pos }) => (
  <group position={pos}>
    <mesh position={[0, 0.45, 0]}>
      <cylinderGeometry args={[0.6, 0.7, 0.9, 8]} />
      <meshLambertMaterial color="#2b2b38" flatShading />
    </mesh>
    {/* Cono de luz */}
    <mesh position={[0, 3.0, 0]}>
      <coneGeometry args={[0.9, 4.2, 8, 1, true]} />
      <meshBasicMaterial color="#fff6c2" transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  </group>
);

const Brillo: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {[0, 1, 2].map((i) => {
      const a = frame * 0.08 + i * 2.1;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.7, 1.1 + Math.sin(a * 1.3) * 0.4, Math.sin(a) * 0.4 + 0.3]} rotation={[0, 0, frame * 0.1]}>
          <octahedronGeometry args={[0.07, 0]} />
          <meshBasicMaterial color="#ffe600" />
        </mesh>
      );
    })}
  </>
);

export const Vitrina: React.FC<{
  frame: number;
  aparece: [number, number, number];
  // 0..1: el pan sale disparado y quemado de la tostadora
  pan: number;
}> = ({ frame, aparece, pan }) => {
  const piso = useMemo(() => crearTexturaCuadros("#111118", "#1a1a24", 12), []);
  const humo = pan > 0.3;
  return (
    <>
      <color attach="background" args={["#08080d"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 6, 4]} intensity={1.4} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshLambertMaterial map={piso} />
      </mesh>
      {PEDESTALES.map((p, i) => (
        <Pedestal key={i} pos={p} />
      ))}

      {/* Refri con IA */}
      <group position={[PEDESTALES[0][0], 0.9, 0]} scale={aparece[0]}>
        <Caja pos={[0, 0.65, 0]} tam={[0.7, 1.3, 0.6]} color="#e9ecef" />
        <Caja pos={[0.36, 0.85, 0.15]} tam={[0.03, 0.35, 0.05]} color="#adb5bd" />
        <Etiqueta3D texto="IA" pos={[0, 0.9, 0.31]} tam={[0.4, 0.2]} />
        <Brillo frame={frame} />
      </group>
      {/* Cepillo de dientes con IA */}
      <group position={[PEDESTALES[1][0], 0.9, 0]} scale={aparece[1]} rotation={[0, 0, 0.3]}>
        <Caja pos={[0, 0.55, 0]} tam={[0.12, 1.0, 0.12]} color="#4cc9f0" />
        <Caja pos={[0, 1.12, 0.06]} tam={[0.14, 0.2, 0.1]} color="#ffffff" />
        <Etiqueta3D texto="IA" pos={[0, 0.5, 0.07]} tam={[0.3, 0.15]} />
        <Brillo frame={frame + 30} />
      </group>
      {/* Tostadora con IA */}
      <group position={[PEDESTALES[2][0], 0.9, 0]} scale={aparece[2]}>
        <Caja pos={[0, 0.3, 0]} tam={[0.8, 0.6, 0.5]} color="#ced4da" />
        <Caja pos={[0, 0.61, 0]} tam={[0.6, 0.03, 0.12]} color="#212529" />
        <Etiqueta3D texto="IA" pos={[0, 0.3, 0.26]} tam={[0.4, 0.2]} />
        {/* Pan quemado que sale disparado */}
        <group position={[0, 0.55 + Math.sin(Math.min(pan, 1) * Math.PI) * 1.4 + (pan > 0 ? 0.1 : -0.2), 0]} rotation={[0, 0, pan * 6]}>
          <Caja pos={[0, 0, 0]} tam={[0.45, 0.5, 0.08]} color="#1a0f08" />
        </group>
        {/* Humo */}
        {humo &&
          [0, 1, 2, 3].map((i) => {
            const f = ((frame + i * 12) % 48) / 48;
            return (
              <mesh key={i} position={[Math.sin(frame * 0.1 + i) * 0.15, 0.8 + f * 1.6, 0]} scale={0.5 + f * 1.2}>
                <icosahedronGeometry args={[0.18, 0]} />
                <meshBasicMaterial color="#555" transparent opacity={0.7 * (1 - f)} />
              </mesh>
            );
          })}
        {!humo && <Brillo frame={frame + 60} />}
      </group>
    </>
  );
};

// ---------------------------------------------------------------- Azotea al amanecer
export const Azotea: React.FC<{ sol: number }> = ({ sol }) => {
  const edificios = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: -9 + i * 1.4 + Math.sin(i * 3.1) * 0.3,
        z: -7 - (i % 3) * 1.5,
        alto: 2 + ((i * 37) % 7),
        ancho: 0.8 + (i % 3) * 0.3,
      })),
    [],
  );
  const cielo = new THREE.Color("#2b1055").lerp(new THREE.Color("#ff9e5e"), sol);
  return (
    <>
      <color attach="background" args={[`#${cielo.getHexString()}`]} />
      <fog attach="fog" args={[`#${cielo.getHexString()}`, 8, 22]} />
      <ambientLight intensity={0.8 + sol * 0.5} />
      <directionalLight position={[-3, 2 + sol * 3, -6]} intensity={1.5 + sol} color="#ffb070" />
      <directionalLight position={[2, 5, 5]} intensity={0.8} />
      {/* Sol saliendo */}
      <mesh position={[-2.5, -0.5 + sol * 3.2, -12]}>
        <sphereGeometry args={[1.6, 10, 8]} />
        <meshBasicMaterial color="#ffd166" />
      </mesh>
      {edificios.map((e, i) => (
        <Caja key={i} pos={[e.x, e.alto / 2 - 2, e.z]} tam={[e.ancho, e.alto, e.ancho]} color={i % 2 ? "#3a2e5c" : "#2e2450"} />
      ))}
      {/* Techo de la azotea */}
      <Caja pos={[0, -0.05, 0]} tam={[8, 0.1, 6]} color="#6d6875" />
      <Caja pos={[0, 0.3, -2.9]} tam={[8, 0.6, 0.15]} color="#b5838d" />
    </>
  );
};
