import { useMemo } from "react";
import { crearTexturaCuadros } from "../n64/Escenario";

// Sala de departamento para «Mensaje enviado»: sofá, mesa de centro, lámpara y ventana de noche

const Caja: React.FC<{ pos: [number, number, number]; tam: [number, number, number]; color: string; emisivo?: string }> = ({
  pos,
  tam,
  color,
  emisivo,
}) => (
  <mesh position={pos}>
    <boxGeometry args={tam} />
    <meshLambertMaterial color={color} emissive={emisivo ?? "#000000"} flatShading />
  </mesh>
);

export const Sala: React.FC<{ frame: number }> = ({ frame }) => {
  const piso = useMemo(() => crearTexturaCuadros("#c9a27e", "#bb9470", 10), []);
  const luzTele = 0.8 + Math.sin(frame * 0.3) * 0.1;
  return (
    <>
      <color attach="background" args={["#141824"]} />
      <ambientLight intensity={1.15} color="#fff2e2" />
      <directionalLight position={[2, 6, 6]} intensity={1.3} color="#ffe8cc" />
      {/* Lámpara cálida y brillo de la tele (fuera de cuadro) */}
      <pointLight position={[-2.2, 2.2, 0.2]} intensity={6} distance={5} color="#ffb86b" />
      <pointLight position={[0, 1.5, 4]} intensity={3 * luzTele} distance={6} color="#8ab4ff" />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshLambertMaterial map={piso} />
      </mesh>
      {/* Tapete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1.0]}>
        <planeGeometry args={[3.4, 2.2]} />
        <meshLambertMaterial color="#e76f51" />
      </mesh>
      {/* Paredes */}
      <Caja pos={[0, 2.6, -1.4]} tam={[12, 5.2, 0.2]} color="#a8dadc" />
      <Caja pos={[-4.2, 2.6, 0]} tam={[0.2, 5.2, 8]} color="#9ccfd2" />
      {/* Ventana de noche con luces de la ciudad */}
      <Caja pos={[1.7, 2.6, -1.28]} tam={[1.6, 1.3, 0.04]} color="#0b1640" emisivo="#050a20" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Caja key={i} pos={[1.1 + i * 0.3, 2.2 + (i % 2) * 0.25, -1.25]} tam={[0.08, 0.08, 0.02]} color="#ffd166" emisivo="#8a6a00" />
      ))}
      {/* Cuadros */}
      <Caja pos={[-1.2, 2.7, -1.28]} tam={[0.9, 0.7, 0.04]} color="#ffffff" />
      <Caja pos={[-1.2, 2.7, -1.25]} tam={[0.75, 0.55, 0.02]} color="#f4a261" />
      <Caja pos={[-0.3, 2.9, -1.28]} tam={[0.5, 0.5, 0.04]} color="#2a9d8f" />

      {/* Sofá */}
      <Caja pos={[0, 0.25, 0.1]} tam={[2.9, 0.5, 1.0]} color="#3d5a80" />
      <Caja pos={[0, 0.85, -0.35]} tam={[2.9, 0.9, 0.25]} color="#3d5a80" />
      {[-1.55, 1.55].map((x) => (
        <Caja key={x} pos={[x, 0.55, 0.1]} tam={[0.25, 0.65, 1.0]} color="#2f4a6b" />
      ))}
      {/* Cojines */}
      <Caja pos={[-1.2, 0.75, -0.15]} tam={[0.4, 0.4, 0.15]} color="#ee6c4d" />
      <Caja pos={[1.2, 0.75, -0.15]} tam={[0.4, 0.4, 0.15]} color="#ffd166" />
      {/* Mesa de centro con palomitas */}
      <Caja pos={[0, 0.35, 1.5]} tam={[1.4, 0.06, 0.7]} color="#8d5b3a" />
      {[-0.6, 0.6].map((x) => (
        <Caja key={x} pos={[x, 0.17, 1.5]} tam={[0.06, 0.34, 0.5]} color="#6b4226" />
      ))}
      <mesh position={[0.35, 0.47, 1.5]}>
        <cylinderGeometry args={[0.16, 0.12, 0.18, 7]} />
        <meshLambertMaterial color="#e63946" flatShading />
      </mesh>
      {/* Lámpara de pie */}
      <Caja pos={[-2.2, 0.9, -0.6]} tam={[0.06, 1.8, 0.06]} color="#333" />
      <mesh position={[-2.2, 1.9, -0.6]}>
        <coneGeometry args={[0.35, 0.4, 8, 1, true]} />
        <meshLambertMaterial color="#ffe8b0" emissive="#806030" side={2} />
      </mesh>
      {/* Planta */}
      <mesh position={[2.4, 0.3, -0.7]}>
        <cylinderGeometry args={[0.25, 0.2, 0.6, 7]} />
        <meshLambertMaterial color="#b5651d" flatShading />
      </mesh>
      <mesh position={[2.4, 1.0, -0.7]}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshLambertMaterial color="#2a9d8f" flatShading />
      </mesh>
    </>
  );
};
