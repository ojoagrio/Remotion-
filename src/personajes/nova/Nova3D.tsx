// Nova: robot asistente de IA que flota. Tres diseños ("orbe", "tele", "gota") con la misma idea:
// cuerpo pequeño, cara en pantalla (ojos de luz) y manitas flotantes sin brazos.

export type DisenoNova = "orbe" | "tele" | "gota";

export type ColoresNova = {
  cuerpo: string;
  detalle: string;
  pantalla: string;
  luz: string; // ojos, antena y propulsor
  mejillas?: string;
};

export type PoseNova = {
  flotar: number; // fase de flotación (radianes)
  saludo?: number; // 0..1 levanta la manita derecha
  parpadeo?: number; // 0..1 cierra los ojos
  boca?: number; // 0..1
  giro?: number;
};

const Mat: React.FC<{ color: string; emisivo?: string }> = ({ color, emisivo }) => (
  <meshLambertMaterial color={color} emissive={emisivo ?? "#000000"} flatShading />
);

const Luz: React.FC<{ color: string }> = ({ color }) => <meshBasicMaterial color={color} />;

// Ojos de luz en pantalla: dos «píldoras» (o uno gigante) que parpadean, con brillo blanco
const Ojos: React.FC<{ c: ColoresNova; parpadeo: number; separacion: number; tam: number; uno?: boolean }> = ({ c, parpadeo, separacion, tam, uno }) => (
  <>
    {(uno ? [0] : [-1, 1]).map((l) => (
      <group key={l} position={[l * separacion, 0, 0]} scale={[1, Math.max(0.12, 1 - parpadeo), 1]}>
        <mesh>
          <circleGeometry args={[tam, 8]} />
          <Luz color={c.luz} />
        </mesh>
        <mesh position={[tam * 0.35, tam * 0.35, 0.002]}>
          <circleGeometry args={[tam * 0.3, 6]} />
          <Luz color="#ffffff" />
        </mesh>
      </group>
    ))}
  </>
);

const Sonrisa: React.FC<{ c: ColoresNova; ancho: number; boca: number; y: number }> = ({ c, ancho, boca, y }) => (
  <mesh position={[0, y, 0.001]} scale={[1, 0.35 + boca * 1.2, 1]}>
    <circleGeometry args={[ancho, 10, Math.PI, Math.PI]} />
    <Luz color={c.luz} />
  </mesh>
);

const Mejillas: React.FC<{ color?: string; x: number; y: number; z: number; tam: number }> = ({ color, x, y, z, tam }) =>
  color ? (
    <>
      {[-1, 1].map((l) => (
        <mesh key={l} position={[l * x, y, z]} rotation={[0, l * 0.55, 0]}>
          <circleGeometry args={[tam, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </>
  ) : null;

// Manitas flotantes (sin brazos), estilo Rayman
const Manitas: React.FC<{ c: ColoresNova; x: number; y: number; saludo: number; fase: number }> = ({ c, x, y, saludo, fase }) => (
  <>
    {[-1, 1].map((l) => {
      const arriba = l === 1 ? saludo : 0;
      return (
        <group
          key={l}
          position={[l * (x + arriba * 0.1), y + Math.sin(fase + l) * 0.04 + arriba * 0.55, 0.1]}
          rotation={[0, 0, l === 1 ? Math.sin(fase * 4) * 0.5 * arriba : 0]}
        >
          <mesh scale={[1, 1.15, 0.8]}>
            <sphereGeometry args={[0.12, 7, 5]} />
            <Mat color={c.detalle} />
          </mesh>
          <mesh position={[-l * 0.1, 0.02, 0.02]}>
            <sphereGeometry args={[0.05, 6, 4]} />
            <Mat color={c.detalle} />
          </mesh>
        </group>
      );
    })}
  </>
);

// Propulsor de luz bajo el cuerpo y sombra en el piso (más chica cuanto más alto flota)
const Propulsor: React.FC<{ c: ColoresNova; y: number; fase: number }> = ({ c, y, fase }) => (
  <group position={[0, y, 0]}>
    <mesh rotation={[Math.PI, 0, 0]} scale={[1, 1 + Math.sin(fase * 6) * 0.25, 1]} position={[0, -0.12, 0]}>
      <coneGeometry args={[0.14, 0.3, 6]} />
      <meshBasicMaterial color={c.luz} transparent opacity={0.7} />
    </mesh>
  </group>
);

export const Nova3D: React.FC<{ diseno: DisenoNova; colores: ColoresNova; pose: PoseNova; altura?: number }> = ({
  diseno,
  colores: c,
  pose,
  altura = 1.1,
}) => {
  const y = altura + Math.sin(pose.flotar) * 0.12;
  const parpadeo = pose.parpadeo ?? 0;
  const boca = pose.boca ?? 0;
  const saludo = pose.saludo ?? 0;
  const inclinacion = Math.sin(pose.flotar * 0.5) * 0.06;
  return (
    <group rotation={[0, pose.giro ?? 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} scale={1 - (y - altura) * 0.8}>
        <circleGeometry args={[0.55, 10]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>
      <group position={[0, y, 0]} rotation={[0, 0, inclinacion]}>
        {diseno === "orbe" && (
          <>
            {/* Cuerpo esférico con visor oscuro y ojos gigantes */}
            <mesh>
              <sphereGeometry args={[0.6, 10, 8]} />
              <Mat color={c.cuerpo} />
            </mesh>
            <mesh position={[0, 0.05, 0.36]} scale={[1, 0.75, 0.6]}>
              <sphereGeometry args={[0.45, 10, 8]} />
              <meshLambertMaterial color={c.pantalla} flatShading />
            </mesh>
            <group position={[0, 0.1, 0.63]}>
              <Ojos c={c} parpadeo={parpadeo} separacion={0.17} tam={0.13} />
              <Sonrisa c={c} ancho={0.08} boca={boca} y={-0.17} />
            </group>
            <Mejillas color={c.mejillas} x={0.36} y={-0.12} z={0.47} tam={0.065} />
            {/* Aro de luz flotando (halo) */}
            <mesh position={[0, 0.82 + Math.sin(pose.flotar * 2) * 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.28, 0.04, 4, 12]} />
              <Luz color={c.luz} />
            </mesh>
            {/* Orejitas laterales */}
            {[-1, 1].map((l) => (
              <mesh key={l} position={[l * 0.6, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.13, 0.13, 0.1, 8]} />
                <Mat color={c.detalle} />
              </mesh>
            ))}
            <Manitas c={c} x={0.82} y={-0.15} saludo={saludo} fase={pose.flotar} />
            <Propulsor c={c} y={-0.6} fase={pose.flotar} />
          </>
        )}
        {diseno === "tele" && (
          <>
            {/* Cabeza de tele retro con pantalla y antenas de conejo */}
            <mesh>
              <boxGeometry args={[1.05, 0.82, 0.7]} />
              <Mat color={c.cuerpo} />
            </mesh>
            <mesh position={[-0.08, 0, 0.351]}>
              <planeGeometry args={[0.72, 0.6]} />
              <meshLambertMaterial color={c.pantalla} />
            </mesh>
            <group position={[-0.08, 0.06, 0.355]}>
              <Ojos c={c} parpadeo={parpadeo} separacion={0.15} tam={0.085} />
              <Sonrisa c={c} ancho={0.09} boca={boca} y={-0.15} />
            </group>
            {/* Perillas */}
            {[0.15, -0.12].map((py, i) => (
              <mesh key={py} position={[0.4, py, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.05, 6]} />
                <Mat color={i ? c.luz : c.detalle} />
              </mesh>
            ))}
            {[-1, 1].map((l) => (
              <group key={l} position={[l * 0.18, 0.41, 0]} rotation={[0, 0, -l * 0.45 + Math.sin(pose.flotar * 2 + l) * 0.08]}>
                <mesh position={[0, 0.42, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.84, 4]} />
                  <Mat color={c.detalle} />
                </mesh>
                <mesh position={[0, 0.86, 0]}>
                  <icosahedronGeometry args={[0.07, 0]} />
                  <Luz color={c.luz} />
                </mesh>
              </group>
            ))}
            {/* Base con hélice */}
            <mesh position={[0, -0.48, 0]}>
              <cylinderGeometry args={[0.2, 0.3, 0.16, 8]} />
              <Mat color={c.detalle} />
            </mesh>
            <group position={[0, -0.6, 0]} rotation={[0, pose.flotar * 6, 0]}>
              {[0, 1].map((k) => (
                <mesh key={k} rotation={[0, (k * Math.PI) / 2, 0]}>
                  <boxGeometry args={[0.9, 0.03, 0.1]} />
                  <Mat color={c.luz} />
                </mesh>
              ))}
            </group>
            <Manitas c={c} x={0.75} y={-0.2} saludo={saludo} fase={pose.flotar} />
          </>
        )}
        {diseno === "gota" && (
          <>
            {/* Gotita/fantasmita: cabeza redonda que se afina hacia abajo, un solo ojo gigante */}
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.55, 10, 8]} />
              <Mat color={c.cuerpo} />
            </mesh>
            <mesh position={[0, -0.42, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.5, 0.75, 10]} />
              <Mat color={c.cuerpo} />
            </mesh>
            <mesh position={[0, 0.12, 0.535]}>
              <circleGeometry args={[0.3, 10]} />
              <meshLambertMaterial color={c.pantalla} />
            </mesh>
            <group position={[0, 0.17, 0.54]}>
              <Ojos c={c} parpadeo={parpadeo} separacion={0} tam={0.2} uno />
              <Sonrisa c={c} ancho={0.07} boca={boca} y={-0.26} />
            </group>
            <Mejillas color={c.mejillas} x={0.36} y={-0.02} z={0.42} tam={0.07} />
            {/* Antena curva con chispa */}
            <mesh position={[0.05, 0.75, 0]} rotation={[0, 0, -0.3]}>
              <torusGeometry args={[0.15, 0.025, 4, 8, Math.PI]} />
              <Mat color={c.detalle} />
            </mesh>
            <mesh position={[0.22, 0.72, 0]} rotation={[0, 0, pose.flotar * 2]}>
              <octahedronGeometry args={[0.09, 0]} />
              <Luz color={c.luz} />
            </mesh>
            <Manitas c={c} x={0.72} y={-0.15} saludo={saludo} fase={pose.flotar} />
            <Propulsor c={c} y={-0.75} fase={pose.flotar} />
          </>
        )}
      </group>
    </group>
  );
};

