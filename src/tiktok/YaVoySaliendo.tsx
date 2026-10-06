import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fijo, saltar } from "../comun/lineaDeTiempo";
import { Camara, Lienzo } from "../comun/Lienzo";
import { Etiqueta, Gancho, Subtitulo } from "../comun/Textos";
import { useBocas } from "../comun/useBocas";
import { ColoresPersonaje, Personaje, PosePersonaje } from "../n64/Personaje";
import { Cine, Cobija, Habitacion } from "./Escenas3D";
import { fin, linea, LINEAS } from "./linea";

// Video vertical (TikTok) en pantalla dividida: arriba Lola en el cine,
// abajo Pepe en su cama jurando que "ya va saliendo".

const PEPE: ColoresPersonaje = {
  // Piyama celeste
  piel: "#f2b48a",
  camisa: "#8ecae6",
  pantalon: "#5fa8d3",
  sombrero: "#d62828",
  zapatos: "#f2b48a",
  gorra: false,
  cabello: "#3b2414",
};

const LOLA: ColoresPersonaje = {
  piel: "#e9a77c",
  camisa: "#f72585",
  pantalon: "#3a0ca3",
  sombrero: "#f72585",
  zapatos: "#1b1b1f",
  bigote: false,
  gorra: false,
  cabello: "#5a2e0e",
  mono: "#ffd21f",
};

const MAMA: ColoresPersonaje = {
  piel: "#f0b892",
  camisa: "#c77dff",
  pantalon: "#9d4edd",
  sombrero: "#c77dff",
  zapatos: "#5a2e0e",
  bigote: false,
  gorra: false,
  cabello: "#cfcfcf",
};

const POSE_BASE: PosePersonaje = {
  x: 0,
  z: 0,
  rotacion: 0,
  fasePaso: 0,
  caminar: 0,
  saludo: 0,
  salto: 0,
  respiracion: 0,
};

const MundoLola: React.FC<{ boca: number }> = ({ boca }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const l3 = linea(3);
  const l5 = linea(5);
  const l7 = linea(7);

  // Se enoja al final: salta y tiembla
  const enojo = interpolate(frame, [l7.inicio, l7.inicio + 6], [0, 1], fijo);
  // Sospecha en la línea 3: se acerca la cámara
  const zoom = interpolate(frame, [l3.inicio, l3.inicio + 15, fin(l3), fin(l3) + 15], [0, 1, 1, 0], fijo);
  const zoomFinal = interpolate(frame, [l7.inicio, l7.inicio + 8], [0, 1], fijo);
  const acercar = Math.max(zoom * 0.6, zoomFinal);

  // La mamá de Pepe pasa por detrás saludando durante la línea 5
  const mamaX = interpolate(frame, [l5.inicio - 45, fin(l5) + 20], [-6, 6], fijo);
  const mamaVisible = frame > l5.inicio - 45 && frame < fin(l5) + 20;

  const lola: PosePersonaje = {
    ...POSE_BASE,
    respiracion: t * 2,
    boca,
    telefono: 1,
    impaciencia: frame < linea(2).inicio ? 1 : interpolate(frame, [l5.inicio, l5.inicio + 10], [0.4, 0], fijo),
    enojo,
    salto: saltar(frame, l7.inicio + 2, 14, 0.7) + saltar(frame, l7.inicio + 18, 14, 0.7),
  };

  const mama: PosePersonaje = {
    ...POSE_BASE,
    x: mamaX,
    z: -1.4,
    rotacion: Math.PI / 2,
    fasePaso: t * 9,
    caminar: 1,
    saludo: 0,
    respiracion: t * 2,
  };

  return (
    <>
      <Camara
        pos={[0, 2.2 - acercar * 0.2, 6.6 - acercar * 2.8]}
        mira={[0, 2.1 + acercar * 0.1, 0]}
      />
      <Cine frame={frame} />
      <Personaje colores={LOLA} pose={lola} escala={0.95} />
      {mamaVisible && <Personaje colores={MAMA} pose={mama} escala={0.95} />}
    </>
  );
};

const MundoPepe: React.FC<{ boca: number }> = ({ boca }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const l2 = linea(2);
  const l4 = linea(4);
  const l5 = linea(5);
  const l6 = linea(6);
  const l7 = linea(7);

  // "¡Para nada!": salta de la cama y se pone a "manejar" de pie sobre el colchón
  const levantarse = l4.inicio + 30;
  const dePie =
    interpolate(frame, [levantarse, levantarse + 8], [0, 1], fijo) *
    interpolate(frame, [l6.inicio + 10, l6.inicio + 40], [1, 0], fijo);
  const maneja = interpolate(frame, [levantarse + 8, levantarse + 14, l5.inicio + 20, l5.inicio + 30], [0, 1, 1, 0], fijo);
  const brinco = saltar(frame, levantarse - 2, 14, 1.2);
  // Al final se tapa hasta la cabeza
  const tapado = interpolate(frame, [l7.inicio + 6, l7.inicio + 16], [0, 1], fijo);
  const sueno =
    frame < l2.inicio
      ? 1
      : frame < levantarse
        ? 0.6
        : 0;

  // Acostado: rotado -90° sobre el colchón; de pie: erguido sobre la cama
  const rotX = (-Math.PI / 2 + 0.4) * (1 - dePie);
  const y = 0.63 + brinco;
  const z = interpolate(dePie, [0, 1], [1.1, 0.1]);

  const pepe: PosePersonaje = {
    ...POSE_BASE,
    respiracion: t * 2,
    boca,
    telefono: 1,
    brazosAdelante: maneja,
    sueno,
    salto: 0,
  };

  // Zoom a la cara cuando lo descubren (línea 5)
  const zoom = interpolate(frame, [l5.inicio + 30, l5.inicio + 50, fin(l5) + 5, fin(l5) + 15], [0, 1, 1, 0], fijo);

  return (
    <>
      <Camara
        pos={[2.4 - zoom * 0.9, 3.0 - zoom * 0.2, 3.4 - zoom * 1.1]}
        mira={[0, 0.9 + dePie * 0.9 + zoom * 0.5, -0.2]}
      />
      <Habitacion />
      <group position={[0, y, z]} rotation={[rotX, 0, 0]}>
        <Personaje colores={PEPE} pose={pepe} sombra={false} />
      </group>
      <Cobija cubre={tapado} visible={1 - dePie} temblor={Math.sin(frame * 1.7) * 0.05 * tapado} />
    </>
  );
};

export const YaVoySaliendo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const bocas = useBocas(LINEAS, "voces");
  const mitad = height / 2;

  const l7 = linea(7);
  // Sacudida de pantalla con el grito final
  const sacudida = interpolate(frame, [l7.inicio, l7.inicio + 30], [1, 0], fijo);
  const dx = Math.sin(frame * 2.3) * 18 * sacudida;
  const dy = Math.cos(frame * 3.1) * 14 * sacudida;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px)` }}>
        <div style={{ position: "absolute", top: 0, left: 0, width, height: mitad, overflow: "hidden" }}>
          <Lienzo ancho={width} alto={mitad}>
            <MundoLola boca={bocas.lola ?? 0} />
          </Lienzo>
        </div>
        <div style={{ position: "absolute", top: mitad, left: 0, width, height: mitad, overflow: "hidden" }}>
          <Lienzo ancho={width} alto={mitad}>
            <MundoPepe boca={bocas.pepe ?? 0} />
          </Lienzo>
        </div>
        {/* Línea divisoria */}
        <div style={{ position: "absolute", top: mitad - 6, left: 0, width, height: 12, background: "white" }} />

        <Etiqueta texto="LOLA · EN EL CINE" color="#f72585" style={{ left: 40, top: 255 }} />
        <Etiqueta texto="PEPE · «EN CAMINO»" color="#2f8fd6" style={{ left: 40, top: height - 470 }} />
      </AbsoluteFill>

      <Gancho texto="Cuando dices «ya voy saliendo»" />

      {LINEAS.map((l) => (
        <Sequence key={l.id} from={l.inicio} durationInFrames={l.duracion + 4} layout="none">
          <Audio src={staticFile(`voces/${l.id}.mp3`)} />
          <Subtitulo
            texto={l.texto}
            nombre={l.personaje.toUpperCase()}
            color={l.personaje === "lola" ? "#f72585" : "#2f8fd6"}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
