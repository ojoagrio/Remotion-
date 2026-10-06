import { useMemo } from "react";
import * as THREE from "three";
import { crearTexturaCuadros } from "../n64/Escenario";

const Caja: React.FC<{
  pos: [number, number, number];
  tam: [number, number, number];
  color: string;
  emisivo?: string;
}> = ({ pos, tam, color, emisivo }) => (
  <mesh position={pos}>
    <boxGeometry args={tam} />
    <meshLambertMaterial color={color} emissive={emisivo ?? "#000000"} flatShading />
  </mesh>
);

// Texto en una textura diminuta con filtro "nearest": se ve pixelado como en N64
const useTexturaTexto = (texto: string, fondo: string, color: string) =>
  useMemo(() => {
    const lienzo = document.createElement("canvas");
    lienzo.width = 64;
    lienzo.height = 16;
    const ctx = lienzo.getContext("2d")!;
    ctx.fillStyle = fondo;
    ctx.fillRect(0, 0, 64, 16);
    ctx.fillStyle = color;
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(texto, 32, 9);
    const tex = new THREE.CanvasTexture(lienzo);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }, [texto, fondo, color]);

// ---------- Fuera del cine, al atardecer ----------
export const COLOR_ATARDECER = "#f4a46b";

export const Cine: React.FC<{ frame: number }> = ({ frame }) => {
  const acera = useMemo(() => crearTexturaCuadros("#b9b4ad", "#a7a29b", 12), []);
  const cartel = useTexturaTexto("CINE", "#1a1030", "#ffe14d");
  const focosEncendidos = Math.floor(frame / 6) % 2;

  return (
    <>
      <color attach="background" args={[COLOR_ATARDECER]} />
      <fog attach="fog" args={[COLOR_ATARDECER, 9, 22]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[-4, 6, 5]} intensity={2} color="#ffe2c4" />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshLambertMaterial map={acera} />
      </mesh>

      {/* Fachada */}
      <Caja pos={[0, 2.5, -3]} tam={[9, 5, 0.6]} color="#8c2433" />
      <Caja pos={[0, 5.2, -3]} tam={[9.4, 0.4, 0.8]} color="#5e1621" />
      {/* Puerta */}
      <Caja pos={[0, 1.1, -2.65]} tam={[1.8, 2.2, 0.1]} color="#2a1418" />
      {/* Marquesina con letrero */}
      <Caja pos={[0, 3.3, -2.3]} tam={[4.6, 1.3, 0.9]} color="#3a2340" />
      <mesh position={[0, 3.3, -1.84]}>
        <planeGeometry args={[4, 1]} />
        <meshBasicMaterial map={cartel} />
      </mesh>
      {/* Focos que parpadean */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[-2.1 + i * (4.2 / 9), 2.62, -1.84]}>
          <icosahedronGeometry args={[0.08, 0]} />
          <meshBasicMaterial color={(i + focosEncendidos) % 2 ? "#fff6b0" : "#8a6a20"} />
        </mesh>
      ))}
      {/* Carteles de películas */}
      <Caja pos={[-3.2, 1.5, -2.65]} tam={[1.2, 1.8, 0.1]} color="#2f6fd6" />
      <Caja pos={[-3.2, 1.8, -2.6]} tam={[0.6, 0.6, 0.05]} color="#ffd21f" />
      <Caja pos={[3.2, 1.5, -2.65]} tam={[1.2, 1.8, 0.1]} color="#24a35a" />
      <Caja pos={[3.2, 1.2, -2.6]} tam={[0.8, 0.3, 0.05]} color="#f2f2f2" />
      {/* Farola */}
      <Caja pos={[-3.4, 1.8, 0.6]} tam={[0.14, 3.6, 0.14]} color="#2b2b33" />
      <Caja pos={[-3.4, 3.7, 0.6]} tam={[0.45, 0.35, 0.45]} color="#fff2b0" emisivo="#7a6a30" />
    </>
  );
};

// ---------- Cuarto de Pepe ----------
export const Habitacion: React.FC = () => {
  const piso = useMemo(() => crearTexturaCuadros("#9a6a3c", "#8a5c32", 8), []);
  const reloj = useTexturaTexto("7:31", "#101010", "#ff3b3b");

  return (
    <>
      <color attach="background" args={["#e9d8b6"]} />
      <ambientLight intensity={1.3} />
      <directionalLight position={[3, 6, 4]} intensity={1.8} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshLambertMaterial map={piso} />
      </mesh>
      {/* Paredes */}
      <Caja pos={[0, 2.5, -2.4]} tam={[10, 5, 0.2]} color="#7fb3d9" />
      <Caja pos={[-3, 2.5, 0]} tam={[0.2, 5, 10]} color="#6aa0c8" />
      {/* Ventana */}
      <Caja pos={[1.7, 2.9, -2.28]} tam={[1.8, 1.4, 0.05]} color="#ffffff" />
      <Caja pos={[1.7, 2.9, -2.25]} tam={[1.6, 1.2, 0.05]} color="#f6a36b" emisivo="#5a3010" />
      <Caja pos={[1.7, 2.9, -2.22]} tam={[0.06, 1.2, 0.05]} color="#ffffff" />
      {/* Póster */}
      <Caja pos={[-1.4, 3.1, -2.28]} tam={[1, 1.4, 0.05]} color="#d62828" />
      <Caja pos={[-1.4, 3.3, -2.24]} tam={[0.5, 0.5, 0.05]} color="#ffd21f" />

      {/* Cama */}
      <Caja pos={[0, 0.25, -0.1]} tam={[1.7, 0.5, 3.1]} color="#6b3e1d" />
      <Caja pos={[0, 0.56, -0.1]} tam={[1.6, 0.14, 3]} color="#f5f5f5" />
      <Caja pos={[0, 0.9, -1.62]} tam={[1.7, 1.3, 0.15]} color="#6b3e1d" />
      {/* Almohada */}
      <Caja pos={[0, 0.72, -1.15]} tam={[1.1, 0.2, 0.55]} color="#ffffff" />

      {/* Mesita con despertador */}
      <Caja pos={[1.45, 0.4, -1.3]} tam={[0.7, 0.8, 0.7]} color="#8a5c32" />
      <Caja pos={[1.45, 0.98, -1.3]} tam={[0.5, 0.36, 0.3]} color="#333340" />
      <mesh position={[1.45, 0.98, -1.14]}>
        <planeGeometry args={[0.42, 0.22]} />
        <meshBasicMaterial map={reloj} />
      </mesh>
      {/* Ropa tirada en el suelo */}
      <Caja pos={[-1.6, 0.04, 1.4]} tam={[0.9, 0.08, 0.6]} color="#d62828" />
      <Caja pos={[-1.2, 0.05, 1.8]} tam={[0.5, 0.1, 0.8]} color="#1d4ed8" />
    </>
  );
};

// Cobija de la cama: "cubre" de 0 (solo piernas y torso) a 1 (tapa hasta la cabeza)
export const Cobija: React.FC<{ cubre: number; visible: number; temblor?: number }> = ({
  cubre,
  visible,
  temblor = 0,
}) => {
  const largo = 1.6 + cubre * 1.3;
  const zCentro = 1.4 - largo / 2;
  return (
    <mesh
      position={[temblor, 0.8 + cubre * 0.35, zCentro]}
      scale={[1, Math.max(0.01, visible), 1]}
    >
      <boxGeometry args={[1.66, 0.4 + cubre * 0.7, largo]} />
      <meshLambertMaterial color="#e05a8a" flatShading />
    </mesh>
  );
};
