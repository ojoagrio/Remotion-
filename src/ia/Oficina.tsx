import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { crearTexturaCuadros } from "../n64/Escenario";

const Caja: React.FC<{
  pos: [number, number, number];
  tam: [number, number, number];
  color: string;
  emisivo?: string;
  rot?: [number, number, number];
}> = ({ pos, tam, color, emisivo, rot }) => (
  <mesh position={pos} rotation={rot}>
    <boxGeometry args={tam} />
    <meshLambertMaterial color={color} emissive={emisivo ?? "#000000"} flatShading />
  </mesh>
);

export type EstadoPantalla = "codigo" | "rust" | "borrado" | "error";

// Pantalla del monitor dibujada en un canvas diminuto (96x64) con filtro "nearest"
const usePantalla = (estado: EstadoPantalla, progreso: number, parpadeo: boolean) => {
  const textura = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 96;
    c.height = 64;
    const ctx = c.getContext("2d")!;
    const texto = (t: string, x: number, y: number, color: string, tam = 9) => {
      ctx.fillStyle = color;
      ctx.font = `bold ${tam}px monospace`;
      ctx.fillText(t, x, y);
    };
    if (estado === "codigo") {
      ctx.fillStyle = "#1e1e2e";
      ctx.fillRect(0, 0, 96, 64);
      const colores = ["#f38ba8", "#89b4fa", "#a6e3a1", "#f9e2af", "#cba6f7"];
      for (let i = 0; i < 9; i++) {
        const sangria = [0, 6, 12, 12, 6, 6, 12, 6, 0][i];
        ctx.fillStyle = colores[(i * 3) % 5];
        ctx.fillRect(6 + sangria, 5 + i * 6, 14 + ((i * 17) % 40), 3);
      }
      // Cursor parpadeante
      if (parpadeo) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(48, 53, 3, 5);
      }
    } else if (estado === "rust") {
      ctx.fillStyle = "#2b1a12";
      ctx.fillRect(0, 0, 96, 64);
      texto("RUST", 28, 22, "#f74c00", 16);
      texto("reescribiendo...", 4, 38, "#ffd7b5", 9);
      ctx.fillStyle = "#553322";
      ctx.fillRect(6, 46, 84, 8);
      ctx.fillStyle = "#f74c00";
      ctx.fillRect(6, 46, 84 * progreso, 8);
    } else if (estado === "borrado") {
      ctx.fillStyle = "#200000";
      ctx.fillRect(0, 0, 96, 64);
      texto("> DROP", 4, 18, "#ff4040", 11);
      texto("DATABASE", 4, 32, "#ff4040", 11);
      texto("prod;", 4, 46, "#ff4040", 11);
      texto(`${Math.round(progreso * 100)}%`, 60, 58, "#ffffff", 9);
    } else {
      ctx.fillStyle = parpadeo ? "#c00000" : "#1a0000";
      ctx.fillRect(0, 0, 96, 64);
      texto("ERROR", 22, 28, "#ffffff", 16);
      texto("500", 36, 46, "#ffffff", 14);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }, [estado, progreso, parpadeo]);
  useEffect(() => () => textura.dispose(), [textura]);
  return textura;
};

export const Oficina: React.FC<{
  frame: number;
  pantalla: EstadoPantalla;
  progreso: number;
  // Alarma 0..1: luces rojas girando y servidores en rojo
  alarma: number;
}> = ({ frame, pantalla, progreso, alarma }) => {
  const alfombra = useMemo(() => crearTexturaCuadros("#3d4a6b", "#35415e", 10), []);
  const parpadeo = Math.floor(frame / 8) % 2 === 0;
  const textura = usePantalla(pantalla, Math.round(progreso * 20) / 20, parpadeo);
  const giroAlarma = frame * 0.25;
  const destello = alarma * (0.5 + 0.5 * Math.sin(frame * 0.6));

  return (
    <>
      <color attach="background" args={["#0b0f1e"]} />
      <ambientLight intensity={0.9 - alarma * 0.3} color="#9fb4ff" />
      <directionalLight position={[2, 5, 4]} intensity={1.4} color="#c8d4ff" />
      {/* Luz del monitor sobre el desarrollador */}
      <pointLight
        position={[0, 1.4, 0.2]}
        intensity={pantalla === "codigo" ? 6 : 8}
        distance={5}
        color={pantalla === "codigo" ? "#9db8ff" : pantalla === "rust" ? "#ff8a3d" : "#ff2020"}
      />
      {/* Luz de alarma giratoria */}
      <pointLight
        position={[Math.cos(giroAlarma) * 2, 3.2, Math.sin(giroAlarma) * 2 - 0.5]}
        intensity={destello * 25}
        distance={9}
        color="#ff0000"
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshLambertMaterial map={alfombra} />
      </mesh>
      {/* Paredes */}
      <Caja pos={[0, 2.5, -2.2]} tam={[12, 5, 0.2]} color="#2a3352" />
      <Caja pos={[-3.6, 2.5, 0]} tam={[0.2, 5, 12]} color="#252d48" />
      {/* Ventana de noche con la ciudad */}
      <Caja pos={[1.6, 2.9, -2.08]} tam={[2.6, 1.6, 0.05]} color="#0a0a14" />
      {Array.from({ length: 12 }).map((_, i) => (
        <Caja
          key={i}
          pos={[0.5 + (i % 6) * 0.42, 2.35 + (i % 3) * 0.12, -2.04]}
          tam={[0.3, 0.3 + ((i * 7) % 5) * 0.12, 0.02]}
          color="#151a2e"
          emisivo={i % 4 === 0 ? "#3a3410" : "#000000"}
        />
      ))}
      {/* Póster motivacional */}
      <Caja pos={[-1.6, 3.1, -2.08]} tam={[1, 1.3, 0.05]} color="#ffd21f" />
      <Caja pos={[-1.6, 3.2, -2.04]} tam={[0.6, 0.6, 0.02]} color="#111111" />

      {/* Escritorio */}
      <Caja pos={[0, 0.9, -0.2]} tam={[2.6, 0.12, 1.2]} color="#7a4b28" />
      {[-1.15, 1.15].map((x) => (
        <Caja key={x} pos={[x, 0.42, -0.2]} tam={[0.12, 0.84, 1.0]} color="#5a361c" />
      ))}
      {/* Monitor */}
      <Caja pos={[0, 1.55, -0.55]} tam={[1.35, 0.85, 0.08]} color="#1b1b22" />
      <mesh position={[0, 1.55, -0.505]}>
        <planeGeometry args={[1.22, 0.74]} />
        <meshBasicMaterial map={textura} />
      </mesh>
      <Caja pos={[0, 1.08, -0.6]} tam={[0.12, 0.3, 0.08]} color="#1b1b22" />
      <Caja pos={[0, 0.97, -0.6]} tam={[0.45, 0.04, 0.3]} color="#1b1b22" />
      {/* Teclado, taza y notas */}
      <Caja pos={[0, 0.98, 0.05]} tam={[0.9, 0.05, 0.3]} color="#2c2c34" />
      <mesh position={[-0.8, 1.06, 0.05]}>
        <cylinderGeometry args={[0.09, 0.08, 0.22, 6]} />
        <meshLambertMaterial color="#e63946" flatShading />
      </mesh>
      <Caja pos={[0.75, 1.63, -0.5]} tam={[0.18, 0.18, 0.01]} color="#ffe14d" rot={[0, 0, 0.1]} />
      <Caja pos={[-0.72, 1.4, -0.5]} tam={[0.18, 0.18, 0.01]} color="#7bf1a8" rot={[0, 0, -0.1]} />

      {/* Rack de servidores (¡la base de datos!) */}
      <group position={[-2.6, 0, -1.4]}>
        <Caja pos={[0, 1.25, 0]} tam={[1.0, 2.5, 0.8]} color="#1a1d26" />
        {Array.from({ length: 6 }).map((_, fila) => (
          <group key={fila}>
            <Caja pos={[0, 0.4 + fila * 0.36, 0.41]} tam={[0.86, 0.26, 0.02]} color="#2a2f3d" />
            {[0, 1, 2].map((led) => {
              const encendido = (frame + fila * 5 + led * 3) % 14 < 7;
              const color = alarma > 0.5 ? "#ff1a1a" : encendido ? "#3dff6e" : "#0d3a1a";
              return (
                <mesh key={led} position={[0.22 + led * 0.1, 0.4 + fila * 0.36, 0.43]}>
                  <boxGeometry args={[0.05, 0.05, 0.02]} />
                  <meshBasicMaterial color={alarma > 0.5 && !parpadeo ? "#400000" : color} />
                </mesh>
              );
            })}
          </group>
        ))}
        <mesh position={[0, 2.62, 0]}>
          <boxGeometry args={[0.5, 0.06, 0.2]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Planta */}
      <group position={[2.4, 0, -1.5]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.25, 0.2, 0.5, 6]} />
          <meshLambertMaterial color="#b5651d" flatShading />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <icosahedronGeometry args={[0.45, 0]} />
          <meshLambertMaterial color="#2e8b3a" flatShading />
        </mesh>
      </group>
    </>
  );
};

// Silla de oficina
export const Silla: React.FC<{ pos: [number, number, number]; rot: number; caida?: number }> = ({
  pos,
  rot,
  caida = 0,
}) => (
  <group position={pos} rotation={[0, rot, 0]}>
    <group rotation={[-caida * 1.3, 0, 0]}>
      <Caja pos={[0, 0.48, 0]} tam={[0.7, 0.1, 0.7]} color="#222831" />
      <Caja pos={[0, 0.95, -0.33]} tam={[0.7, 0.9, 0.1]} color="#222831" />
      <Caja pos={[0, 0.24, 0]} tam={[0.08, 0.42, 0.08]} color="#555" />
      <Caja pos={[0, 0.04, 0]} tam={[0.6, 0.05, 0.6]} color="#555" rot={[0, Math.PI / 4, 0]} />
    </group>
  </group>
);

// La IA: un robot flotante con cara de pantalla
export const Robot: React.FC<{
  pos: [number, number, number];
  rot: number;
  boca: number;
  frame: number;
  // "normal" | "feliz" (ojos ^ ^) | "malvado" (ojos rojos) | "asustado" (ojos muy abiertos)
  animo: "normal" | "feliz" | "malvado" | "asustado";
  // Temblor de miedo 0..1
  temblor?: number;
  // Gota de sudor 0..1
  sudor?: number;
  // Manos frotando muy rápido, como lavando 0..1
  lavando?: number;
  // Holograma de un plato de comida sobre la mano 0..1
  holograma?: number;
}> = ({ pos, rot, boca, frame, animo, temblor = 0, sudor = 0, lavando = 0, holograma = 0 }) => {
  const flota = Math.sin(frame * 0.12) * 0.07;
  const ladeo = Math.sin(frame * 0.07) * 0.12;
  const colorOjos = animo === "malvado" ? "#ff2a2a" : "#5ef2ff";
  const tx = Math.sin(frame * 3.1) * 0.035 * temblor;
  const ty = Math.cos(frame * 2.7) * 0.02 * temblor;
  return (
    <group position={[pos[0] + tx, pos[1] + flota + ty, pos[2]]} rotation={[0, rot, ladeo]}>
      {/* La IA brilla e ilumina la cara de quien tiene enfrente */}
      <pointLight position={[0, 0, 0.8]} intensity={5} distance={4} color={colorOjos} />
      {/* Cabeza */}
      <mesh>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshLambertMaterial color="#e8ecf2" flatShading />
      </mesh>
      {/* Visor */}
      <mesh position={[0, 0.02, 0.3]} scale={[1, 0.62, 0.5]}>
        <sphereGeometry args={[0.33, 8, 6]} />
        <meshBasicMaterial color="#0a0f1e" />
      </mesh>
      {/* Ojos */}
      {[-1, 1].map((lado) =>
        animo === "feliz" ? (
          [-1, 1].map((t) => (
            <mesh
              key={`${lado}${t}`}
              position={[lado * 0.13 + t * 0.03, 0.08, 0.47]}
              rotation={[0, 0, t * -0.8]}
            >
              <boxGeometry args={[0.08, 0.025, 0.02]} />
              <meshBasicMaterial color={colorOjos} />
            </mesh>
          ))
        ) : (
          <mesh
            key={lado}
            position={[lado * 0.13, 0.08, 0.47]}
            rotation={[0, 0, animo === "malvado" ? lado * 0.4 : 0]}
          >
            <boxGeometry
              args={[
                animo === "asustado" ? 0.13 : 0.09,
                animo === "malvado" ? 0.04 : animo === "asustado" ? 0.16 : 0.11,
                0.02,
              ]}
            />
            <meshBasicMaterial color={colorOjos} />
          </mesh>
        ),
      )}
      {/* Boca de luz que se abre con la voz */}
      <mesh position={[0, -0.08, 0.47]} scale={[1, 0.3 + boca * 2.2, 1]}>
        <boxGeometry args={[0.16, 0.03, 0.02]} />
        <meshBasicMaterial color={colorOjos} />
      </mesh>
      {/* Antena */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 4]} />
        <meshLambertMaterial color="#9aa3b5" />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <icosahedronGeometry args={[0.05, 0]} />
        <meshBasicMaterial color={frame % 20 < 10 ? colorOjos : "#334"} />
      </mesh>
      {/* Manitos flotantes: en reposo a los lados, o frotando en círculos al lavar */}
      {[-1, 1].map((lado) => {
        const giro = frame * 1.6 + lado * 1.5;
        const reposo: [number, number, number] = [
          lado * 0.55,
          -0.15 + Math.sin(frame * 0.15 + lado) * 0.05,
          0.05,
        ];
        const lavar: [number, number, number] = [
          lado * 0.28 + Math.cos(giro) * 0.14,
          -0.45 + Math.sin(giro) * 0.1,
          0.5,
        ];
        return (
          <mesh
            key={lado}
            position={[
              reposo[0] + (lavar[0] - reposo[0]) * lavando,
              reposo[1] + (lavar[1] - reposo[1]) * lavando,
              reposo[2] + (lavar[2] - reposo[2]) * lavando,
            ]}
          >
            <icosahedronGeometry args={[0.1, 0]} />
            <meshLambertMaterial color="#e8ecf2" flatShading />
          </mesh>
        );
      })}
      {/* Gota de sudor estilo anime */}
      {sudor > 0 && (
        <mesh position={[0.38, 0.25 - (frame % 20) * 0.006 * sudor, 0.25]} scale={sudor}>
          <coneGeometry args={[0.06, 0.16, 5]} />
          <meshBasicMaterial color="#7fd8ff" />
        </mesh>
      )}
      {/* Holograma: plato de quinoa con kale y aguacate */}
      {holograma > 0 && (
        <group position={[-0.1, 0.75, 0.25]} rotation={[0.3, frame * 0.05, 0]} scale={holograma}>
          <mesh rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.3, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshBasicMaterial color="#5ef2ff" transparent opacity={0.45} side={2} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[Math.cos(i * 1.3) * 0.14, 0.02, Math.sin(i * 1.3) * 0.14]}>
              <icosahedronGeometry args={[0.07, 0]} />
              <meshBasicMaterial
                color={i % 2 ? "#3fae49" : "#e9d8a6"}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
          {/* Medio aguacate */}
          <mesh position={[0, 0.06, 0]} scale={[1, 0.5, 1.3]}>
            <icosahedronGeometry args={[0.1, 0]} />
            <meshBasicMaterial color="#9acd32" transparent opacity={0.85} />
          </mesh>
        </group>
      )}
      {/* Propulsor */}
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.22, 5]} />
        <meshBasicMaterial color={colorOjos} transparent opacity={0.6} />
      </mesh>
    </group>
  );
};
