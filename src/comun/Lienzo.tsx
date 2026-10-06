import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";

// Lienzo 3D a baja resolución (como una N64) ampliado con píxeles nítidos
export const Lienzo: React.FC<{
  ancho: number;
  alto: number;
  escalaPixel?: number;
  desenfoque?: number;
  children: React.ReactNode;
}> = ({ ancho, alto, escalaPixel = 4, desenfoque = 0, children }) => (
  <div
    style={{
      width: ancho / escalaPixel,
      height: alto / escalaPixel,
      transform: `scale(${escalaPixel})`,
      transformOrigin: "top left",
      imageRendering: "pixelated",
      filter: desenfoque > 0 ? `blur(${desenfoque}px)` : undefined,
    }}
  >
    <ThreeCanvas
      width={ancho / escalaPixel}
      height={alto / escalaPixel}
      dpr={1}
      gl={{ antialias: false }}
      camera={{ fov: 50, near: 0.1, far: 100 }}
      style={{ imageRendering: "pixelated" }}
    >
      {children}
    </ThreeCanvas>
  </div>
);

export type Vec3 = [number, number, number];

// Cámara controlada por frame: posición, punto de mira, apertura (fov) y giro (plano holandés)
export const Camara: React.FC<{ pos: Vec3; mira: Vec3; fov?: number; giro?: number }> = ({
  pos,
  mira,
  fov = 50,
  giro = 0,
}) => {
  const camera = useThree((s) => s.camera);
  camera.position.set(...pos);
  camera.lookAt(...mira);
  if (giro) camera.rotateZ(giro);
  if ("fov" in camera && camera.fov !== fov) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  return null;
};
