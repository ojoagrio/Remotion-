import { useMemo } from "react";
import * as THREE from "three";

// Textura de cuadros de 8x8 píxeles con filtro "nearest": el look borroso/pixelado
// de las texturas pequeñas de N64.
export const crearTexturaCuadros = (a: string, b: string, repeticiones: number) => {
  const tam = 8;
  const datos = new Uint8Array(tam * tam * 4);
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  for (let y = 0; y < tam; y++) {
    for (let x = 0; x < tam; x++) {
      const c = (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0 ? ca : cb;
      const i = (y * tam + x) * 4;
      datos[i] = c.r * 255;
      datos[i + 1] = c.g * 255;
      datos[i + 2] = c.b * 255;
      datos[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(datos, tam, tam);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeticiones, repeticiones);
  tex.needsUpdate = true;
  return tex;
};

const Arbol: React.FC<{ x: number; z: number; tam?: number }> = ({ x, z, tam = 1 }) => (
  <group position={[x, 0, z]} scale={tam}>
    <mesh position={[0, 0.6, 0]}>
      <cylinderGeometry args={[0.15, 0.2, 1.2, 5]} />
      <meshLambertMaterial color="#6b3e1d" flatShading />
    </mesh>
    <mesh position={[0, 1.7, 0]}>
      <coneGeometry args={[0.9, 1.6, 6]} />
      <meshLambertMaterial color="#2e8b3a" flatShading />
    </mesh>
    <mesh position={[0, 2.4, 0]}>
      <coneGeometry args={[0.65, 1.2, 6]} />
      <meshLambertMaterial color="#38a845" flatShading />
    </mesh>
  </group>
);

const Colina: React.FC<{ x: number; z: number; r: number; color: string }> = ({
  x,
  z,
  r,
  color,
}) => (
  <mesh position={[x, 0, z]} scale={[1, 0.6, 1]}>
    <sphereGeometry args={[r, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
    <meshLambertMaterial color={color} flatShading />
  </mesh>
);

export const COLOR_CIELO = "#7ec8ff";

export const Escenario: React.FC = () => {
  const texturaSuelo = useMemo(() => crearTexturaCuadros("#5cc04a", "#4aa83c", 20), []);

  return (
    <>
      <color attach="background" args={[COLOR_CIELO]} />
      {/* Niebla para ocultar el final del mundo, como en N64 */}
      <fog attach="fog" args={[COLOR_CIELO, 14, 38]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 10, 6]} intensity={2.2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshLambertMaterial map={texturaSuelo} />
      </mesh>

      <Colina x={-9} z={-12} r={5} color="#3f9e3a" />
      <Colina x={7} z={-15} r={7} color="#47ad40" />
      <Colina x={16} z={-8} r={4} color="#3f9e3a" />

      <Arbol x={-6} z={-4} tam={1.2} />
      <Arbol x={-3.5} z={-7} />
      <Arbol x={5} z={-5} tam={1.4} />
      <Arbol x={8} z={-2} />
      <Arbol x={-9} z={1} tam={0.9} />
    </>
  );
};

// Estrella giratoria de 5 puntas extruida (coleccionable)
export const Estrella: React.FC<{ y: number; giro: number; escala: number }> = ({
  y,
  giro,
  escala,
}) => {
  const geometria = useMemo(() => {
    const forma = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 0.6 : 0.26;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) forma.moveTo(px, py);
      else forma.lineTo(px, py);
    }
    forma.closePath();
    const g = new THREE.ExtrudeGeometry(forma, {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.05,
      bevelSegments: 1,
    });
    g.center();
    return g;
  }, []);

  return (
    <mesh geometry={geometria} position={[0, y, 0]} rotation={[0, giro, 0]} scale={escala}>
      <meshLambertMaterial color="#ffd21f" emissive="#8a6a00" flatShading />
    </mesh>
  );
};
