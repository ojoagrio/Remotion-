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
  // Opcionales para variar el aspecto
  bigote?: boolean;
  gorra?: boolean;
  cabello?: string;
  // Si se indica, dibuja coletas y un moño de este color
  mono?: string;
  lentes?: boolean;
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
  // Apertura de la boca 0..1 (para sincronizar con la voz)
  boca?: number;
  // Sujeta un teléfono en la oreja con el brazo derecho 0..1
  telefono?: number;
  // Ambos brazos al frente, como agarrando un volante 0..1
  brazosAdelante?: number;
  // Golpeteo impaciente con el pie 0..1
  impaciencia?: number;
  // Enojo 0..1: la cara se pone roja y el cuerpo tiembla
  enojo?: number;
  // Ojos cerrados 0..1 (dormido)
  sueno?: number;
  // Sentado en una silla 0..1
  sentado?: number;
  // Brazos al frente tecleando 0..1
  teclear?: number;
  // Brazos arriba, agarrándose la cabeza 0..1
  manosCabeza?: number;
};

const Material: React.FC<{ color: string }> = ({ color }) => (
  <meshLambertMaterial color={color} flatShading />
);

const ROJO_ENOJO = new THREE.Color("#ff2a2a");

export const Personaje: React.FC<{
  colores: ColoresPersonaje;
  pose: PosePersonaje;
  escala?: number;
  sombra?: boolean;
}> = ({ colores, pose, escala = 1, sombra = true }) => {
  const { x, z, rotacion, fasePaso, caminar, saludo, salto, respiracion } = pose;
  const brazoSaludo = pose.brazoSaludo ?? "derecho";
  const boca = pose.boca ?? 0;
  const telefono = pose.telefono ?? 0;
  const adelante = pose.brazosAdelante ?? 0;
  const impaciencia = pose.impaciencia ?? 0;
  const enojo = pose.enojo ?? 0;
  const sueno = pose.sueno ?? 0;
  const sentado = pose.sentado ?? 0;
  const teclear = pose.teclear ?? 0;
  const manosCabeza = pose.manosCabeza ?? 0;

  const balanceo = Math.sin(fasePaso) * 0.7 * caminar;
  const rebote = Math.abs(Math.sin(fasePaso)) * 0.08 * caminar;
  const respira = Math.sin(respiracion) * 0.02 * (1 - caminar);
  const temblor = Math.sin(respiracion * 40) * 0.04 * enojo;
  // Pie derecho golpeando el suelo
  const golpePie = Math.max(0, Math.sin(respiracion * 7)) * 0.35 * impaciencia;
  // Volante: los brazos giran a un lado y a otro
  const volante = Math.sin(respiracion * 5) * 0.35 * adelante;

  // En el aire, brazos arriba y piernas recogidas
  const enAire = Math.min(1, salto / 0.6);

  // Sombra que se encoge al saltar
  const tamSombra = 1 - Math.min(0.5, salto * 0.25);

  const colorPiel = useMemo(
    () => "#" + new THREE.Color(colores.piel).lerp(ROJO_ENOJO, enojo * 0.6).getHexString(),
    [colores.piel, enojo],
  );
  const geoCabeza = useMemo(() => new THREE.SphereGeometry(0.45, 8, 6), []);
  const conBigote = colores.bigote ?? true;
  const conGorra = colores.gorra ?? true;
  const { cabello, mono } = colores;

  return (
    <group position={[x + temblor, 0, z]} rotation={[0, rotacion, 0]} scale={escala}>
      {/* Sombra circular falsa, típica de los juegos de N64 */}
      {sombra && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} scale={tamSombra}>
          <circleGeometry args={[0.5, 8]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} />
        </mesh>
      )}

      <group position={[0, salto + rebote + respira - sentado * 0.32, 0]}>
        {/* Piernas (pivotan desde la cadera) */}
        {[-1, 1].map((lado) => (
          <group
            key={lado}
            position={[lado * 0.18, 0.75, 0]}
            rotation={[
              lado * balanceo - enAire * 0.6 - (lado === 1 ? golpePie : 0) - sentado * (Math.PI / 2),
              0,
              0,
            ]}
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
        {/* Overol / cinturón */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.43, 0.4, 0.3, 6]} />
          <Material color={colores.pantalon} />
        </mesh>

        {/* Brazos (pivotan desde el hombro). lado -1 = izquierdo, 1 = derecho */}
        {[-1, 1].map((lado) => {
          const saluda = lado === (brazoSaludo === "derecho" ? 1 : -1);
          const s = saluda ? saludo : 0;
          // El brazo derecho sujeta el teléfono si no está manejando
          const tel = lado === 1 ? telefono * (1 - adelante) : 0;
          const libre = (1 - s) * (1 - tel) * (1 - adelante) * (1 - teclear) * (1 - manosCabeza);
          const tecleo = Math.sin(respiracion * 30 + lado * 2) * 0.12 * teclear;
          // Ángulo de apertura lateral: en reposo un poco abierto, arriba al saltar o saludar
          const apertura =
            (0.25 + enAire * 2.2) * libre +
            s * (2.6 + Math.sin(respiracion * 6) * 0.35) +
            tel * -0.35 +
            adelante * (0.12 + lado * volante) +
            teclear * -0.12 +
            manosCabeza * (2.75 + Math.sin(respiracion * 20) * 0.08);
          const frente =
            -lado * balanceo * libre - tel * 2.5 - adelante * 1.45 - teclear * 1.25 + tecleo;
          return (
            <group key={lado} position={[lado * 0.5, 1.4, 0]} rotation={[frente, 0, lado * apertura]}>
              <mesh position={[0, -0.3, 0]}>
                <boxGeometry args={[0.2, 0.6, 0.2]} />
                <Material color={colores.camisa} />
              </mesh>
              <mesh position={[0, -0.66, 0]}>
                <icosahedronGeometry args={[0.15, 0]} />
                <Material color="#ffffff" />
              </mesh>
              {lado === 1 && telefono > 0 && (
                <mesh position={[0, -0.72, 0.05]} rotation={[0.3, 0, 0]}>
                  <boxGeometry args={[0.13, 0.3, 0.06]} />
                  <meshLambertMaterial color="#1b1b1f" flatShading />
                </mesh>
              )}
            </group>
          );
        })}

        {/* Cabeza grande, proporciones caricaturescas */}
        <group position={[0, 1.85, 0]}>
          <mesh geometry={geoCabeza}>
            <Material color={colorPiel} />
          </mesh>
          {/* Nariz */}
          <mesh position={[0, -0.02, 0.45]}>
            <icosahedronGeometry args={[conBigote ? 0.13 : 0.08, 0]} />
            <Material color={colorPiel} />
          </mesh>
          {/* Ojos: se aplanan al dormir */}
          {[-1, 1].map((lado) => (
            <mesh
              key={lado}
              position={[lado * 0.15, 0.12, 0.39]}
              scale={[1, 1 - sueno * 0.85, 1]}
            >
              <boxGeometry args={[0.08, 0.16, 0.05]} />
              <meshBasicMaterial color="#1a1a40" />
            </mesh>
          ))}
          {colores.lentes &&
            [-1, 1].map((lado) => (
              <mesh key={lado} position={[lado * 0.16, 0.12, 0.43]}>
                <torusGeometry args={[0.11, 0.025, 3, 6]} />
                <meshBasicMaterial color="#111111" />
              </mesh>
            ))}
          {colores.lentes && (
            <mesh position={[0, 0.14, 0.45]}>
              <boxGeometry args={[0.1, 0.03, 0.03]} />
              <meshBasicMaterial color="#111111" />
            </mesh>
          )}
          {/* Cejas enojadas */}
          {enojo > 0.05 &&
            [-1, 1].map((lado) => (
              <mesh
                key={lado}
                position={[lado * 0.15, 0.27, 0.4]}
                rotation={[0, 0, lado * 0.5 * enojo]}
              >
                <boxGeometry args={[0.16, 0.04, 0.04]} />
                <meshBasicMaterial color="#2b1608" />
              </mesh>
            ))}
          {/* Boca: se abre con la voz */}
          <mesh position={[0, -0.24, 0.37]} scale={[1, 0.15 + boca * 1.1, 1]}>
            <boxGeometry args={[0.18, 0.14, 0.06]} />
            <meshBasicMaterial color="#5a0f12" />
          </mesh>
          {conBigote && (
            <mesh position={[0, -0.15, 0.4]}>
              <boxGeometry args={[0.32, 0.08, 0.08]} />
              <meshBasicMaterial color="#2b1608" />
            </mesh>
          )}
          {cabello && (
            <>
              {/* Pelo: casquete sobre la cabeza y flequillo */}
              <mesh position={[0, 0.1, -0.08]} scale={1.06}>
                <sphereGeometry args={[0.45, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2.3]} />
                <Material color={cabello} />
              </mesh>
              {mono &&
                [-1, 1].map((lado) => (
                  <group key={lado} position={[lado * 0.5, 0.1, -0.1]}>
                    <mesh position={[lado * 0.08, -0.2, 0]} rotation={[0, 0, lado * 0.4]}>
                      <coneGeometry args={[0.14, 0.5, 5]} />
                      <Material color={cabello} />
                    </mesh>
                    <mesh>
                      <boxGeometry args={[0.12, 0.18, 0.18]} />
                      <Material color={mono} />
                    </mesh>
                  </group>
                ))}
            </>
          )}
          {conGorra && (
            <>
              <mesh position={[0, 0.27, 0]}>
                <cylinderGeometry args={[0.38, 0.46, 0.28, 8]} />
                <Material color={colores.sombrero} />
              </mesh>
              <mesh position={[0, 0.15, 0.32]} rotation={[0.15, 0, 0]}>
                <boxGeometry args={[0.6, 0.05, 0.35]} />
                <Material color={colores.sombrero} />
              </mesh>
            </>
          )}
        </group>
      </group>
    </group>
  );
};
