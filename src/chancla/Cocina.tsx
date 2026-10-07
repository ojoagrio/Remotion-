import { useMemo } from "react";
import { crearTexturaCuadros } from "../n64/Escenario";

const Caja: React.FC<{
  pos: [number, number, number];
  tam: [number, number, number];
  color: string;
  rot?: [number, number, number];
}> = ({ pos, tam, color, rot }) => (
  <mesh position={pos} rotation={rot}>
    <boxGeometry args={tam} />
    <meshLambertMaterial color={color} flatShading />
  </mesh>
);

export const FREGADERO: [number, number, number] = [1.6, 0, -1.75];
// Encima del mostrador, donde está la torre de trastes
export const TORRE: [number, number, number] = [1.15, 0.92, -1.7];

// Pila de platos con un bamboleo cómico
const Pila: React.FC<{ pos: [number, number, number]; cantidad: number; frame: number; sucios: boolean }> = ({
  pos,
  cantidad,
  frame,
  sucios,
}) => (
  <group position={pos}>
    {Array.from({ length: Math.max(0, Math.round(cantidad)) }).map((_, i) => {
      const bamboleo = sucios ? Math.sin(frame * 0.08 + i * 0.4) * 0.012 * i : 0;
      const esOlla = sucios && i % 5 === 4;
      return (
        <mesh key={i} position={[bamboleo, 0.04 + i * 0.085, (i % 3) * 0.01]} rotation={[0, i * 0.7, 0]}>
          <cylinderGeometry args={esOlla ? [0.2, 0.18, 0.12, 7] : [0.24, 0.17, 0.06, 7]} />
          <meshLambertMaterial
            color={esOlla ? "#3a3a3a" : sucios ? (i % 2 ? "#e8d9b8" : "#cfd8e6") : "#ffffff"}
            flatShading
          />
        </mesh>
      );
    })}
  </group>
);

export const Cocina: React.FC<{
  frame: number;
  platosSucios: number;
  platosLimpios: number;
  burbujas: number;
}> = ({ frame, platosSucios, platosLimpios, burbujas }) => {
  const piso = useMemo(() => crearTexturaCuadros("#c46a3c", "#b05a30", 10), []);
  const azulejo = useMemo(() => crearTexturaCuadros("#f4f1e8", "#2d5fa8", 6), []);

  return (
    <>
      <color attach="background" args={["#ffe8b0"]} />
      <ambientLight intensity={1.25} />
      <directionalLight position={[3, 6, 5]} intensity={1.9} color="#fff1d6" />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshLambertMaterial map={piso} />
      </mesh>
      {/* Pared del fondo: azulejo tipo talavera abajo, amarillo arriba */}
      <Caja pos={[0, 3, -2.25]} tam={[12, 6, 0.2]} color="#f2c14e" />
      <mesh position={[0, 0.9, -2.14]}>
        <planeGeometry args={[8, 1.8]} />
        <meshLambertMaterial map={azulejo} />
      </mesh>
      <Caja pos={[-3.3, 3, 0]} tam={[0.2, 6, 12]} color="#e9b23f" />

      {/* Ventana con cortinas sobre el fregadero */}
      <Caja pos={[1.6, 2.6, -2.12]} tam={[1.6, 1.1, 0.05]} color="#8fd3ff" />
      <Caja pos={[1.6, 2.6, -2.09]} tam={[0.06, 1.1, 0.04]} color="#ffffff" />
      <Caja pos={[0.85, 2.6, -2.05]} tam={[0.3, 1.3, 0.05]} color="#d62828" />
      <Caja pos={[2.35, 2.6, -2.05]} tam={[0.3, 1.3, 0.05]} color="#d62828" />

      {/* Estufa con olla de frijoles */}
      <group position={[-1.6, 0, -1.75]}>
        <Caja pos={[0, 0.45, 0]} tam={[1.1, 0.9, 0.7]} color="#f0f0f0" />
        <Caja pos={[0, 0.45, 0.36]} tam={[0.7, 0.45, 0.02]} color="#222" />
        <mesh position={[-0.2, 1.05, 0]}>
          <cylinderGeometry args={[0.28, 0.24, 0.3, 8]} />
          <meshLambertMaterial color="#7a3b1a" flatShading />
        </mesh>
        {/* Vapor */}
        {[0, 1, 2].map((i) => {
          const fase = ((frame + i * 20) % 60) / 60;
          return (
            <mesh key={i} position={[-0.2 + Math.sin(frame * 0.1 + i) * 0.08, 1.3 + fase * 0.9, 0]} scale={0.6 + fase}>
              <icosahedronGeometry args={[0.1, 0]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.6 * (1 - fase)} />
            </mesh>
          );
        })}
      </group>

      {/* Mostrador con fregadero */}
      <group position={FREGADERO}>
        <Caja pos={[0, 0.45, 0]} tam={[2.0, 0.9, 0.75]} color="#8a5a33" />
        <Caja pos={[0, 0.91, 0]} tam={[2.05, 0.04, 0.8]} color="#e8e2d0" />
        <Caja pos={[0.35, 0.9, 0]} tam={[0.7, 0.05, 0.5]} color="#5b6470" />
        <Caja pos={[0.35, 1.15, -0.3]} tam={[0.06, 0.45, 0.06]} color="#c0c6cf" />
        <Caja pos={[0.35, 1.36, -0.18]} tam={[0.06, 0.06, 0.28]} color="#c0c6cf" />
      </group>
      <Pila pos={TORRE} cantidad={platosSucios} frame={frame} sucios />
      <Pila pos={[2.35, 0.92, -1.7]} cantidad={platosLimpios} frame={frame} sucios={false} />

      {/* Burbujas de jabón */}
      {burbujas > 0 &&
        Array.from({ length: 14 }).map((_, i) => {
          const fase = ((frame * 1.5 + i * 13) % 50) / 50;
          return (
            <mesh
              key={i}
              position={[
                1.95 + Math.sin(i * 2.3) * 0.4 + Math.sin(frame * 0.2 + i) * 0.05,
                1.0 + fase * 1.2,
                -1.6 + Math.cos(i * 1.7) * 0.25,
              ]}
              scale={burbujas * (0.5 + (i % 3) * 0.3)}
            >
              <icosahedronGeometry args={[0.07, 0]} />
              <meshBasicMaterial color="#e6f7ff" transparent opacity={0.75 * (1 - fase)} />
            </mesh>
          );
        })}

      {/* Refrigerador */}
      <group position={[-2.75, 0, -0.9]}>
        <Caja pos={[0, 1.1, 0]} tam={[0.8, 2.2, 0.8]} color="#dfe7ee" />
        <Caja pos={[0.41, 1.5, 0.2]} tam={[0.03, 0.4, 0.06]} color="#9aa3b5" />
        <Caja pos={[0.41, 1.66, -0.15]} tam={[0.02, 0.18, 0.14]} color="#ffd21f" rot={[0, 0, 0.1]} />
      </group>
    </>
  );
};
