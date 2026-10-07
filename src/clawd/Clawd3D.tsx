import { useEffect, useMemo } from "react";
import * as THREE from "three";

// Clawd, el cangrejito de píxeles de Claude Code, en versión vóxel (video de fan).
// Basado en descripciones públicas: cuerpo rectangular naranja, ojos negros cuadrados,
// pinzas a los lados y cuatro patitas.

export const NARANJA_CLAWD = "#da7758"; // RGB(218, 119, 88), según la comunidad
export const AZUL_MISTERIO = "#5b8def";

const Bloque: React.FC<{
  pos: [number, number, number];
  tam: [number, number, number];
  color: string;
  basico?: boolean;
  rot?: [number, number, number];
}> = ({ pos, tam, color, basico, rot }) => (
  <mesh position={pos} rotation={rot}>
    <boxGeometry args={tam} />
    {basico ? <meshBasicMaterial color={color} /> : <meshLambertMaterial color={color} flatShading />}
  </mesh>
);

export const Clawd: React.FC<{
  pos?: [number, number, number];
  rot?: number;
  escala?: number;
  frame: number;
  color?: string;
  // Salto 0..1 (altura), saludo con la pinza derecha 0..1, pinzas abriendo/cerrando 0..1
  salto?: number;
  saludo?: number;
  pellizco?: number;
  // Cuánto "camina" (mueve las patitas)
  caminar?: number;
}> = ({ pos = [0, 0, 0], rot = 0, escala = 1, frame, color = NARANJA_CLAWD, salto = 0, saludo = 0, pellizco = 0, caminar = 0 }) => {
  // Parpadeo cada ~3 s
  const parpadeo = frame % 95 < 4 ? 0.15 : 1;
  const respira = 1 + Math.sin(frame * 0.12) * 0.02;
  const aplasta = 1 - Math.max(0, Math.sin(frame * 0.5)) * 0.06 * caminar;
  return (
    <group position={[pos[0], pos[1] + salto, pos[2]]} rotation={[0, rot, 0]} scale={escala}>
      {/* Sombra */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01 - salto, 0]} scale={1 - Math.min(0.5, salto * 0.3)}>
        <planeGeometry args={[1.3, 0.7]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} />
      </mesh>
      <group position={[0, 0.62, 0]} scale={[respira, aplasta, respira]}>
        {/* Cuerpo */}
        <Bloque pos={[0, 0, 0]} tam={[1.1, 0.62, 0.62]} color={color} />
        {/* Ojos cuadrados */}
        {[-1, 1].map((l) => (
          <group key={l} position={[l * 0.24, 0.08, 0.315]} scale={[1, parpadeo, 1]}>
            <Bloque pos={[0, 0, 0]} tam={[0.13, 0.2, 0.02]} color="#111111" basico />
          </group>
        ))}
        {/* Pinzas laterales; la derecha puede saludar */}
        {[-1, 1].map((l) => {
          const arriba = l === 1 ? saludo : 0;
          const abre = Math.abs(Math.sin(frame * 0.6)) * pellizco;
          return (
            <group
              key={l}
              position={[l * 0.58, -0.02, 0]}
              rotation={[0, 0, l * (arriba * (1.9 + Math.sin(frame * 0.5) * 0.25))]}
            >
              <Bloque pos={[l * 0.12, 0, 0]} tam={[0.24, 0.2, 0.26]} color={color} />
              {/* Dos "dedos" de la pinza */}
              <Bloque pos={[l * 0.27, 0.06 + abre * 0.05, 0]} tam={[0.1, 0.07, 0.2]} color={color} />
              <Bloque pos={[l * 0.27, -0.06 - abre * 0.05, 0]} tam={[0.1, 0.07, 0.2]} color={color} />
            </group>
          );
        })}
      </group>
      {/* Cuatro patitas */}
      {[-0.38, -0.13, 0.13, 0.38].map((x, i) => (
        <Bloque
          key={x}
          pos={[x, 0.17 + Math.max(0, Math.sin(frame * 0.5 + i * 1.6)) * 0.06 * caminar, 0]}
          tam={[0.1, 0.3, 0.12]}
          color={color}
        />
      ))}
    </group>
  );
};

// Texto flotante de terminal (canvas pequeño, look pixelado)
const useTexto = (texto: string, color: string, fondo: string) => {
  const tex = useMemo(() => {
    const ancho = Math.max(64, texto.length * 8);
    const c = document.createElement("canvas");
    c.width = ancho;
    c.height = 16;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, ancho, 16);
    ctx.fillStyle = color;
    ctx.font = "bold 12px monospace";
    ctx.textBaseline = "middle";
    ctx.fillText(texto, 3, 9);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    return { t, ancho };
  }, [texto, color, fondo]);
  useEffect(() => () => tex.t.dispose(), [tex]);
  return tex;
};

export const TextoTerminal: React.FC<{
  texto: string;
  pos: [number, number, number];
  alto?: number;
  color?: string;
  fondo?: string;
  rot?: [number, number, number];
}> = ({ texto, pos, alto = 0.3, color = "#b8f2c0", fondo = "#0b0f0c", rot }) => {
  const { t, ancho } = useTexto(texto, color, fondo);
  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[(ancho / 16) * alto, alto]} />
      <meshBasicMaterial map={t} transparent opacity={0.95} />
    </mesh>
  );
};

// Arbusto de píxeles (para el look de documental de naturaleza)
const Arbusto: React.FC<{ pos: [number, number, number]; semilla: number }> = ({ pos, semilla }) => (
  <group position={pos}>
    {Array.from({ length: 7 }).map((_, i) => {
      const a = semilla + i * 2.3;
      return (
        <Bloque
          key={i}
          pos={[Math.sin(a) * 0.35, 0.2 + (i % 3) * 0.22, Math.cos(a) * 0.25]}
          tam={[0.32, 0.32, 0.32]}
          color={i % 2 ? "#2d6a4f" : "#40916c"}
        />
      );
    })}
  </group>
);

// Hábitat: la terminal. Suelo de rejilla, cursor gigante, texto flotante y arbustos de píxeles
export const Terminal: React.FC<{
  frame: number;
  conflicto?: number; // 0..1 tormenta de conflictos de git
  oscuridad?: number; // 0..1 escena de misterio
}> = ({ frame, conflicto = 0, oscuridad = 0 }) => {
  const rejilla = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 16;
    c.height = 16;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#07090c";
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = "#1c3a2a";
    ctx.fillRect(0, 0, 16, 1);
    ctx.fillRect(0, 0, 1, 16);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(30, 30);
    return t;
  }, []);
  useEffect(() => () => rejilla.dispose(), [rejilla]);
  const cursor = Math.floor(frame / 15) % 2 === 0;
  const luz = 1 - oscuridad * 0.75;

  return (
    <>
      <color attach="background" args={["#05070a"]} />
      <fog attach="fog" args={["#05070a", 8, 22]} />
      <ambientLight intensity={1.0 * luz} />
      <directionalLight position={[2, 6, 5]} intensity={1.5 * luz} />
      {conflicto > 0 && (
        <pointLight position={[0, 3, 1]} intensity={14 * conflicto * (0.6 + 0.4 * Math.sin(frame * 0.5))} distance={8} color="#ff2a2a" />
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial map={rejilla} />
      </mesh>

      {/* Texto flotante de fondo */}
      <TextoTerminal texto="$ claude" pos={[-1.8, 3.4, -3.5]} alto={0.5} />
      <TextoTerminal texto="git status" pos={[2.0, 2.6, -4.0]} alto={0.4} color="#7fd1ff" />
      <TextoTerminal texto="npm run dev" pos={[-2.4, 1.6, -4.5]} alto={0.4} color="#ffd166" />
      {/* Cursor gigante parpadeando */}
      {cursor && <Bloque pos={[0.9, 3.4, -3.6]} tam={[0.3, 0.5, 0.05]} color="#b8f2c0" basico />}

      {/* Arbustos de píxeles */}
      <Arbusto pos={[-2.2, 0, 0.6]} semilla={1} />
      <Arbusto pos={[2.3, 0, 0.2]} semilla={4} />
      <Arbusto pos={[-1.4, 0, -2.2]} semilla={7} />
      <Arbusto pos={[1.6, 0, -2.6]} semilla={9} />

      {/* Tormenta de conflictos de git */}
      {conflicto > 0 &&
        ["<<<<<<< HEAD", "=======", ">>>>>>> main", "CONFLICT", "<<<<<<< HEAD", "merge failed"].map((t, i) => {
          const caida = ((frame * 0.03 + i * 0.37) % 1) * 5;
          return (
            <TextoTerminal
              key={i}
              texto={t}
              pos={[-2.2 + (i % 3) * 2.1, 4.6 - caida, -0.8 - (i % 2) * 1.2]}
              alto={0.32}
              color="#ff5a5a"
              fondo="#2a0606"
              rot={[0, 0, Math.sin(frame * 0.05 + i) * 0.2]}
            />
          );
        })}
    </>
  );
};

// Corazón de píxeles
export const CorazonPixel: React.FC<{ pos: [number, number, number]; escala?: number }> = ({ pos, escala = 1 }) => {
  const forma = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];
  return (
    <group position={pos} scale={escala * 0.07}>
      {forma.map((fila, y) =>
        fila.split("").map((c, x) =>
          c === "1" ? <Bloque key={`${x}-${y}`} pos={[x - 3, -y, 0]} tam={[1, 1, 1]} color="#ff4f8b" basico /> : null,
        ),
      )}
    </group>
  );
};
