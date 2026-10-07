import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { crearTexturaCuadros } from "../n64/Escenario";

// Escenarios de «El chisme»: estudio de TV, concierto (Grito o Tabasco) y cuarto del live.

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

// Textura dibujada en un canvas pequeño, con filtro "nearest" para el look pixelado
const useLienzo = (
  ancho: number,
  alto: number,
  dibujar: (ctx: CanvasRenderingContext2D) => void,
  clave: string,
) => {
  const textura = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = ancho;
    c.height = alto;
    dibujar(c.getContext("2d")!);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);
  useEffect(() => () => textura.dispose(), [textura]);
  return textura;
};

const texto = (
  ctx: CanvasRenderingContext2D,
  t: string,
  x: number,
  y: number,
  color: string,
  tam: number,
) => {
  ctx.fillStyle = color;
  ctx.font = `bold ${tam}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(t, x, y);
};

// ---------------------------------------------------------------- Estudio de TV
export type Pantalla = "logo" | "chisme" | "envivo" | "gratis";

export const Estudio: React.FC<{ frame: number; pantalla: Pantalla }> = ({ frame, pantalla }) => {
  const piso = useMemo(() => crearTexturaCuadros("#2a1446", "#160a26", 12), []);
  const parpadeo = Math.floor(frame / 10) % 2 === 0;
  const pantallaTex = useLienzo(
    128,
    72,
    (ctx) => {
      const fondos: Record<Pantalla, string> = {
        logo: "#3a0ca3",
        chisme: "#ff2e88",
        envivo: "#1a0010",
        gratis: "#5a2d0c",
      };
      ctx.fillStyle = fondos[pantalla];
      ctx.fillRect(0, 0, 128, 72);
      if (pantalla === "logo") {
        texto(ctx, "CHISMÓGRAFO", 64, 30, "#ffd21f", 15);
        texto(ctx, "64", 64, 52, "#ffffff", 18);
      } else if (pantalla === "chisme") {
        texto(ctx, "¡CHISME!", 64, 36, parpadeo ? "#ffffff" : "#ffd21f", 22);
      } else if (pantalla === "envivo") {
        ctx.fillStyle = parpadeo ? "#ff1a1a" : "#600";
        ctx.beginPath();
        ctx.arc(26, 36, 8, 0, Math.PI * 2);
        ctx.fill();
        texto(ctx, "EN VIVO", 74, 36, "#ffffff", 18);
      } else {
        texto(ctx, "GRATIS", 64, 26, "#ffd21f", 20);
        texto(ctx, "TABASCO", 64, 52, "#ffffff", 14);
      }
    },
    `${pantalla}-${parpadeo}`,
  );

  return (
    <>
      <color attach="background" args={["#12061f"]} />
      <ambientLight intensity={1.0} />
      <directionalLight position={[2, 5, 5]} intensity={1.6} color="#ffe6f5" />
      <pointLight position={[0, 2.5, -1.5]} intensity={8} distance={6} color="#ff4fd8" />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshLambertMaterial map={piso} />
      </mesh>
      {/* Fondo y pantalla gigante */}
      <Caja pos={[0, 3, -2.4]} tam={[12, 6, 0.2]} color="#1d0b33" />
      <Caja pos={[0, 2.4, -2.25]} tam={[3.8, 2.2, 0.1]} color="#0a0a0a" />
      <mesh position={[0, 2.4, -2.19]}>
        <planeGeometry args={[3.6, 2.0]} />
        <meshBasicMaterial map={pantallaTex} />
      </mesh>
      {/* Tubos de neón */}
      {[-2.6, 2.6].map((x) => (
        <Caja key={x} pos={[x, 2.4, -2.2]} tam={[0.08, 3.2, 0.08]} color="#00f0ff" emisivo="#00c8d8" />
      ))}
      <Caja pos={[0, 4.0, -2.2]} tam={[5.3, 0.08, 0.08]} color="#ff4fd8" emisivo="#d02ab0" />
      {/* Escritorio de los conductores */}
      <Caja pos={[0, 0.5, 0.55]} tam={[3.2, 1.0, 0.7]} color="#ff2e88" />
      <Caja pos={[0, 1.02, 0.55]} tam={[3.3, 0.06, 0.8]} color="#ffffff" />
      <Caja pos={[0, 0.5, 0.91]} tam={[2.2, 0.12, 0.02]} color="#ffd21f" emisivo="#8a6a00" />
    </>
  );
};

// ---------------------------------------------------------------- Concierto
const Persona: React.FC<{
  pos: [number, number, number];
  color: string;
  frame: number;
  indice: number;
  euforia: number;
  abucheo: number;
}> = ({ pos, color, frame, indice, euforia, abucheo }) => {
  const brinco = Math.abs(Math.sin(frame * 0.25 + indice)) * 0.18 * euforia;
  const brazos = 2.6 * euforia + Math.sin(frame * 0.5 + indice) * 0.3 * (euforia + abucheo);
  return (
    <group position={[pos[0], pos[1] + brinco, pos[2]]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.5, 0.9, 0.3]} />
        <meshLambertMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <icosahedronGeometry args={[0.24, 0]} />
        <meshLambertMaterial color="#d79a74" flatShading />
      </mesh>
      {[-1, 1].map((l) => (
        <mesh
          key={l}
          position={[l * 0.3, 1.0, 0]}
          rotation={[abucheo * -1.2, 0, l * (0.2 + brazos)]}
        >
          <boxGeometry args={[0.12, 0.5, 0.12]} />
          <meshLambertMaterial color={color} flatShading />
        </mesh>
      ))}
    </group>
  );
};

const Teclado: React.FC<{ pos: [number, number, number] }> = ({ pos }) => {
  const teclas = useLienzo(
    64,
    8,
    (ctx) => {
      ctx.fillStyle = "#f4f4f4";
      ctx.fillRect(0, 0, 64, 8);
      ctx.fillStyle = "#111";
      for (let i = 0; i < 64; i += 4) if ([0, 4, 12, 16, 20].indexOf(i % 28) >= 0) ctx.fillRect(i + 2, 0, 2, 5);
    },
    "teclas",
  );
  return (
    <group position={pos}>
      {[-1, 1].map((l) => (
        <Caja key={l} pos={[l * 0.45, 0.45, 0]} tam={[0.06, 0.9, 0.06]} color="#333" rot={[0, 0, l * 0.3]} />
      ))}
      <Caja pos={[0, 0.95, 0]} tam={[1.4, 0.1, 0.4]} color="#1b1b1f" />
      <mesh position={[0, 1.01, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.3, 0.22]} />
        <meshBasicMaterial map={teclas} />
      </mesh>
    </group>
  );
};

export const ESCENARIO_Y = 0.8;
export const TECLADO_CONCIERTO: [number, number, number] = [0, ESCENARIO_Y, -1.45];

const Chocolate: React.FC<{ pos: [number, number, number]; rot?: number; escala?: number }> = ({
  pos,
  rot = 0,
  escala = 1,
}) => (
  <group position={pos} rotation={[rot, rot * 0.7, rot * 0.3]} scale={escala}>
    <Caja pos={[0, 0, 0]} tam={[0.4, 0.7, 0.08]} color="#5a2d0c" />
    <Caja pos={[0, -0.12, 0.03]} tam={[0.42, 0.42, 0.06]} color="#d62828" />
  </group>
);

export const Concierto: React.FC<{
  frame: number;
  variante: "grito" | "tabasco";
  euforia: number;
  abucheo: number;
}> = ({ frame, variante, euforia, abucheo }) => {
  const piso = useMemo(() => crearTexturaCuadros("#3b3b48", "#30303b", 14), []);
  const tabasco = variante === "tabasco";
  const manta = useLienzo(
    128,
    24,
    (ctx) => {
      ctx.fillStyle = tabasco ? "#5a2d0c" : "#006847";
      ctx.fillRect(0, 0, 128, 24);
      if (!tabasco) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(43, 0, 42, 24);
        ctx.fillStyle = "#ce1126";
        ctx.fillRect(85, 0, 43, 24);
      }
      texto(ctx, tabasco ? "FESTIVAL DEL CHOCOLATE" : "¡VIVA MÉXICO!", 64, 13, tabasco ? "#ffd21f" : "#111", 11);
    },
    variante,
  );
  const cartel = useLienzo(
    48,
    20,
    (ctx) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 48, 20);
      texto(ctx, "¡JUANGA!", 24, 11, "#d62828", 10);
    },
    "cartel",
  );
  const colores = ["#e63946", "#457b9d", "#2a9d8f", "#f4a261", "#8338ec", "#ffbe0b"];
  const luz = frame * 0.05;

  return (
    <>
      <color attach="background" args={[tabasco ? "#1b0d05" : "#0b0b1a"]} />
      <fog attach="fog" args={[tabasco ? "#1b0d05" : "#0b0b1a", 9, 20]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[0, 6, 4]} intensity={1.4} />
      {/* Luces de colores que barren el escenario */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <pointLight
          key={x}
          position={[x + Math.sin(luz + i) * 1.2, 4, -1.5]}
          intensity={10}
          distance={7}
          color={["#ff4fd8", "#4fc3f7", "#ffd21f"][i]}
        />
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshLambertMaterial map={piso} />
      </mesh>
      {/* Tarima, pantalla trasera y manta */}
      <Caja pos={[0, ESCENARIO_Y / 2, -2.4]} tam={[6, ESCENARIO_Y, 3]} color="#1d1d26" />
      <Caja pos={[0, 2.8, -3.9]} tam={[6.4, 4, 0.2]} color="#14141c" />
      <mesh position={[0, 3.9, -3.78]}>
        <planeGeometry args={[5.4, 1.0]} />
        <meshBasicMaterial map={manta} />
      </mesh>
      {/* Torres de bocinas */}
      {[-2.7, 2.7].map((x) => (
        <Caja key={x} pos={[x, ESCENARIO_Y + 0.9, -1.4]} tam={[0.7, 1.8, 0.6]} color="#0d0d12" />
      ))}
      <Teclado pos={TECLADO_CONCIERTO} />

      {/* Público */}
      {Array.from({ length: 15 }).map((_, i) => {
        const fila = Math.floor(i / 5);
        const x = (i % 5) * 1.0 - 2 + (fila % 2) * 0.4;
        return (
          <Persona
            key={i}
            indice={i}
            pos={[x, 0, 1.0 + fila * 1.0]}
            color={colores[i % colores.length]}
            frame={frame}
            euforia={euforia}
            abucheo={abucheo}
          />
        );
      })}
      {/* Cartel de "¡JUANGA!" en el Grito */}
      {!tabasco && (
        <group position={[0.4, 2.3 + Math.sin(frame * 0.3) * 0.05, 1.6]}>
          <Caja pos={[0, -0.5, 0]} tam={[0.05, 1, 0.05]} color="#8a5a33" />
          <mesh position={[0, 0.05, 0.03]} rotation={[0, 0, Math.sin(frame * 0.2) * 0.08]}>
            <planeGeometry args={[1.2, 0.5]} />
            <meshBasicMaterial map={cartel} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
      {/* Tabasco: barras de chocolate en el escenario y lloviendo con la euforia */}
      {tabasco && (
        <>
          {[-2.2, -1.6, 1.6, 2.2].map((x, i) => (
            <Chocolate key={x} pos={[x, ESCENARIO_Y + 0.4, -1.0]} rot={i * 0.2 - 0.3} escala={1.3} />
          ))}
          {euforia > 0 &&
            Array.from({ length: 16 }).map((_, i) => {
              const caida = ((frame * 0.06 + i * 0.37) % 1) * 6;
              return (
                <Chocolate
                  key={i}
                  pos={[((i * 7) % 11) * 0.55 - 2.8, 5.5 - caida, -1.5 + ((i * 5) % 7) * 0.5]}
                  rot={frame * 0.1 + i}
                  escala={0.5}
                />
              );
            })}
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- Cuarto del live
export const DALI: [number, number, number] = [-1.5, 2.3, -1.95];
export const PICASSO: [number, number, number] = [1.5, 2.3, -1.95];

export const CuartoLive: React.FC<{ frame: number; avion: number }> = ({ frame, avion }) => {
  const piso = useMemo(() => crearTexturaCuadros("#6b4b8a", "#5d3f79", 8), []);
  // Cuadro "estilo Dalí": desierto y reloj derretido
  const dali = useLienzo(
    48,
    40,
    (ctx) => {
      const cielo = ctx.createLinearGradient(0, 0, 0, 40);
      cielo.addColorStop(0, "#f7b267");
      cielo.addColorStop(1, "#f4845f");
      ctx.fillStyle = cielo;
      ctx.fillRect(0, 0, 48, 40);
      ctx.fillStyle = "#c9a227";
      ctx.fillRect(0, 28, 48, 12);
      ctx.fillStyle = "#e9e3c9";
      ctx.beginPath();
      ctx.moveTo(10, 14);
      ctx.bezierCurveTo(22, 6, 34, 10, 34, 18);
      ctx.bezierCurveTo(34, 26, 30, 30, 28, 36);
      ctx.bezierCurveTo(26, 30, 18, 26, 10, 22);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.beginPath();
      ctx.moveTo(22, 16);
      ctx.lineTo(22, 12);
      ctx.moveTo(22, 16);
      ctx.lineTo(27, 19);
      ctx.stroke();
    },
    "dali",
  );
  // Cuadro "estilo Picasso": cara cubista
  const picasso = useLienzo(
    40,
    48,
    (ctx) => {
      ctx.fillStyle = "#3d5a80";
      ctx.fillRect(0, 0, 40, 48);
      const poligono = (color: string, pts: number[]) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
        ctx.closePath();
        ctx.fill();
      };
      poligono("#ee6c4d", [8, 8, 24, 4, 30, 30, 12, 40]);
      poligono("#f4d35e", [20, 6, 34, 14, 30, 38, 18, 30]);
      poligono("#111", [12, 16, 17, 14, 16, 19]);
      poligono("#111", [24, 22, 29, 20, 28, 26]);
      poligono("#98c1d9", [16, 30, 26, 32, 20, 36]);
    },
    "picasso",
  );
  // Bandera para la cola del avión
  const bandera = useLienzo(
    30,
    20,
    (ctx) => {
      ctx.fillStyle = "#012169";
      ctx.fillRect(0, 0, 30, 20);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(30, 20);
      ctx.moveTo(30, 0);
      ctx.lineTo(0, 20);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(12, 0, 6, 20);
      ctx.fillRect(0, 7, 30, 6);
      ctx.fillStyle = "#c8102e";
      ctx.fillRect(13.5, 0, 3, 20);
      ctx.fillRect(0, 8.5, 30, 3);
    },
    "bandera",
  );

  const avionX = -5 + avion * 10;
  return (
    <>
      <color attach="background" args={["#2b1d3a"]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 5, 5]} intensity={1.5} />
      {/* Aro de luz de streamer */}
      <pointLight position={[1.2, 1.9, 1.4]} intensity={6} distance={5} color="#ffffff" />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshLambertMaterial map={piso} />
      </mesh>
      <Caja pos={[0, 2.5, -2.1]} tam={[10, 5, 0.2]} color="#7b5ea7" />
      <Caja pos={[-3.2, 2.5, 0]} tam={[0.2, 5, 10]} color="#6c4f96" />
      {/* Cuadros con marco dorado */}
      {[
        { pos: DALI, tex: dali, tam: [1.6, 1.35] as [number, number] },
        { pos: PICASSO, tex: picasso, tam: [1.25, 1.5] as [number, number] },
      ].map(({ pos, tex, tam }, i) => (
        <group key={i} position={pos}>
          <Caja pos={[0, 0, -0.03]} tam={[tam[0] + 0.16, tam[1] + 0.16, 0.05]} color="#c9a227" />
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={tam} />
            <meshBasicMaterial map={tex} />
          </mesh>
        </group>
      ))}
      <Teclado pos={[0, 0, 0.6]} />
      {/* Aro de luz */}
      <group position={[1.3, 1.9, 1.5]} rotation={[0, -0.6, 0]}>
        <mesh>
          <torusGeometry args={[0.35, 0.05, 4, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <Caja pos={[0, -0.95, 0]} tam={[0.04, 1.6, 0.04]} color="#222" />
      </group>
      {/* Avión rumbo a Inglaterra */}
      {avion > 0 && avion < 1 && (
        <group position={[avionX, 2.9 + Math.sin(avion * 8) * 0.1, 1.2]} rotation={[0, 0, 0.12]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.12, 1.4, 6]} />
            <meshLambertMaterial color="#f2f2f2" flatShading />
          </mesh>
          <Caja pos={[0, 0, 0]} tam={[0.3, 0.04, 1.4]} color="#d9d9d9" />
          <mesh position={[-0.62, 0.22, 0]}>
            <planeGeometry args={[0.36, 0.26]} />
            <meshBasicMaterial map={bandera} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </>
  );
};
