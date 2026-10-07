import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { crearTexturaCuadros } from "../n64/Escenario";

// Rueda de reconocimiento de policía: pared con líneas de estatura y foco cenital
export const RUEDA_X = [-2.4, -1.2, 0, 1.2, 2.4];

export const Rueda: React.FC<{ foco?: number }> = ({ foco = -1 }) => {
  const piso = useMemo(() => crearTexturaCuadros("#3a3a44", "#33333c", 10), []);
  const pared = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 96;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#59606b";
    ctx.fillRect(0, 0, 128, 96);
    ctx.fillStyle = "#e9ecef";
    ctx.font = "bold 7px sans-serif";
    for (let i = 0; i <= 8; i++) {
      const y = 92 - i * 11;
      ctx.fillRect(0, y, 128, i % 2 === 0 ? 2 : 1);
      if (i % 2 === 0) ctx.fillText(`${(i * 0.25 + 0.0).toFixed(2)}`, 2, y - 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    return t;
  }, []);
  useEffect(() => () => pared.dispose(), [pared]);

  return (
    <>
      <color attach="background" args={["#1b1d22"]} />
      <ambientLight intensity={foco >= 0 ? 0.55 : 1.1} />
      <directionalLight position={[0, 6, 5]} intensity={foco >= 0 ? 0.6 : 1.5} />
      {foco >= 0 && (
        <>
          <pointLight position={[RUEDA_X[foco], 3.2, 1.2]} intensity={18} distance={5} color="#fff3c4" />
          <mesh position={[RUEDA_X[foco], 2.6, 0]}>
            <coneGeometry args={[0.8, 5.2, 10, 1, true]} />
            <meshBasicMaterial color="#fff3c4" transparent opacity={0.13} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshLambertMaterial map={piso} />
      </mesh>
      <mesh position={[0, 2.4, -0.8]}>
        <planeGeometry args={[8, 4.8]} />
        <meshLambertMaterial map={pared} />
      </mesh>
    </>
  );
};
