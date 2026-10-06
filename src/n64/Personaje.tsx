import { useMemo } from "react";
import * as THREE from "three";

// Personaje low-poly al estilo N64: pocas caras, sombreado plano y colores sólidos.
// Se construye solo con primitivas, sin modelos externos.

export type ColoresPersonaje = {
  piel: string;
  camisa: string;
  pantalon: string;
  sombrero: string;
  zapatos: string;
};

export type PosePersonaje = {
  // Posición en el suelo y orientación (radianes, 0 = mirando a cámara)
  x: number;
  z: number;
  rotacion: number;
  // Fase del ciclo de caminar (avanza con el tiempo) y su intensidad 0..1
  fasePaso: number;
  caminar: number;
  // Intensidad del saludo 0..1 y con qué brazo
  saludo: number;
  brazoSaludo?: "izquierdo" | "derecho";
  // Altura del salto
  salto: number;
  // Fase de la respiración en reposo
  respiracion: number;
};

const Material: React.FC<{ color: string }> = ({ color }) => (
  <meshLambertMaterial color={color} flatShading />
);

export const Personaje: React.FC<{
  colores: ColoresPersonaje;
  pose: PosePersonaje;
  escala?: number;
}> = ({ colores, pose, escala = 1 }) => {
  const { x, z, rotacion, fasePaso, caminar, saludo, salto, respiracion } = pose;
  const brazoSaludo = pose.brazoSaludo ?? "derecho";

  const balanceo = Math.sin(fasePaso) * 0.7 * caminar;
  const rebote = Math.abs(Math.sin(fasePaso)) * 0.08 * caminar;
  const respira = Math.sin(respiracion) * 0.02 * (1 - caminar);

  // En el aire, brazos arriba y piernas recogidas
  const enAire = Math.min(1, salto / 0.6);

  // Sombra que se encoge al saltar
  const tamSombra = 1 - Math.min(0.5, salto * 0.25);

  const geoCabeza = useMemo(() => new THREE.SphereGeometry(0.45, 8, 6), []);

  return (
    <group position={[x, 0, z]} rotation={[0, rotacion, 0]} scale={escala}>
      {/* Sombra circular falsa, típica de los juegos de N64 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} scale={tamSombra}>
        <circleGeometry args={[0.5, 8]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      <group position={[0, salto + rebote + respira, 0]}>
        {/* Piernas (pivotan desde la cadera) */}
        {[-1, 1].map((lado) => (
          <group
            key={lado}
            position={[lado * 0.18, 0.75, 0]}
            rotation={[lado * balanceo - enAire * 0.6, 0, 0]}
          >
            <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[0.24, 0.6, 0.26]} />
              <Material color={colores.pantalon} />
            </mesh>
            <mesh position={[0, -0.66, 0.08]}>
              <boxGeometry args={[0.28, 0.16, 0.42]} />
              <Material color={colores.zapatos} />
            </mesh>
          </group>
        ))}

        {/* Torso */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.36, 0.42, 0.75, 6]} />
          <Material color={colores.camisa} />
        </mesh>
        {/* Overol */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.43, 0.4, 0.3, 6]} />
          <Material color={colores.pantalon} />
        </mesh>

        {/* Brazos (pivotan desde el hombro). lado -1 = izquierdo, 1 = derecho */}
        {[-1, 1].map((lado) => {
          const saluda = lado === (brazoSaludo === "derecho" ? 1 : -1);
          const s = saluda ? saludo : 0;
          // Ángulo de apertura lateral: en reposo un poco abierto, arriba al saltar o saludar
          const apertura =
            0.25 + enAire * 2.2 * (1 - s) + s * (2.6 + Math.sin(respiracion * 6) * 0.35);
          return (
            <group
              key={lado}
              position={[lado * 0.5, 1.4, 0]}
              rotation={[-lado * balanceo * (1 - s), 0, lado * apertura]}
            >
              <mesh position={[0, -0.3, 0]}>
                <boxGeometry args={[0.2, 0.6, 0.2]} />
                <Material color={colores.camisa} />
              </mesh>
              <mesh position={[0, -0.66, 0]}>
                <icosahedronGeometry args={[0.15, 0]} />
                <Material color="#ffffff" />
              </mesh>
            </group>
          );
        })}

        {/* Cabeza grande, proporciones caricaturescas */}
        <group position={[0, 1.85, 0]}>
          <mesh geometry={geoCabeza}>
            <Material color={colores.piel} />
          </mesh>
          {/* Nariz */}
          <mesh position={[0, -0.02, 0.45]}>
            <icosahedronGeometry args={[0.13, 0]} />
            <Material color={colores.piel} />
          </mesh>
          {/* Ojos */}
          {[-1, 1].map((lado) => (
            <mesh key={lado} position={[lado * 0.15, 0.12, 0.39]}>
              <boxGeometry args={[0.08, 0.16, 0.05]} />
              <meshBasicMaterial color="#1a1a40" />
            </mesh>
          ))}
          {/* Bigote */}
          <mesh position={[0, -0.15, 0.4]}>
            <boxGeometry args={[0.32, 0.08, 0.08]} />
            <meshBasicMaterial color="#2b1608" />
          </mesh>
          {/* Gorra */}
          <mesh position={[0, 0.27, 0]}>
            <cylinderGeometry args={[0.38, 0.46, 0.28, 8]} />
            <Material color={colores.sombrero} />
          </mesh>
          <mesh position={[0, 0.15, 0.32]} rotation={[0.15, 0, 0]}>
            <boxGeometry args={[0.6, 0.05, 0.35]} />
            <Material color={colores.sombrero} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
