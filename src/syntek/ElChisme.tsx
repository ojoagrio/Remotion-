import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { enMano, golpe, mezclar, orbita, suave, sumar, Toma } from "../comun/camara";
import { fijo, fin, saltar } from "../comun/lineaDeTiempo";
import { Camara, Lienzo, Vec3 } from "../comun/Lienzo";
import { estiloContorno, FUENTE, Gancho, Subtitulo } from "../comun/Textos";
import { useBocas } from "../comun/useBocas";
import { ColoresPersonaje, Personaje, PosePersonaje } from "../n64/Personaje";
import { Concierto, CuartoLive, DALI, ESCENARIO_Y, Estudio, Pantalla, PICASSO } from "./Sets";
import { Sonidos } from "./Sonidos";
import {
  ABUCHEO,
  DALI_T,
  DURACION,
  INGLATERRA,
  JUANGA,
  L,
  LINEAS,
  PICASSO_T,
  Quien,
  TABASCO,
} from "./tiempos";

// «El chisme»: PARODIA de la polémica de Aleks Syntek (septiembre-octubre de 2026),
// contada por un programa de chismes. Las voces NO son la del cantante y los hechos
// siguen lo publicado por la prensa (ver README).

const ALEKS: ColoresPersonaje = {
  piel: "#e3a982",
  camisa: "#1b1b1f",
  pantalon: "#2a2a33",
  sombrero: "#1b1b1f",
  zapatos: "#f2f2f2",
  bigote: false,
  gorra: false,
  cabello: "#3b2a1a",
};

const CONDUCTOR: ColoresPersonaje = {
  piel: "#d9956b",
  camisa: "#2459c9",
  pantalon: "#14213d",
  sombrero: "#2459c9",
  zapatos: "#111",
  bigote: true,
  gorra: false,
  cabello: "#111111",
};

const CONDUCTORA: ColoresPersonaje = {
  piel: "#f0b892",
  camisa: "#ff4fa3",
  pantalon: "#7a1f5c",
  sombrero: "#ff4fa3",
  zapatos: "#111",
  bigote: false,
  gorra: false,
  cabello: "#f2c14e",
  mono: "#ffffff",
};

const POSE: PosePersonaje = {
  x: 0,
  z: 0,
  rotacion: 0,
  fasePaso: 0,
  caminar: 0,
  saludo: 0,
  salto: 0,
  respiracion: 0,
};

type Set = "estudio" | "grito" | "live" | "tabasco";

// Qué escenario se ve en cada frame
const setEn = (f: number): Set => {
  if (f < JUANGA) return "estudio";
  if (f < L(3).inicio) return "grito";
  if (f < L(4).inicio) return "estudio";
  if (f < L(5).inicio) return "live";
  if (f < TABASCO) return "estudio";
  if (f < L(6).inicio) return "tabasco";
  if (f < L(7).inicio) return "estudio";
  return "tabasco";
};

const CONDUCTOR_POS: Vec3 = [-0.75, 0, 0];
const CONDUCTORA_POS: Vec3 = [0.75, 0, 0];
const CANTANTE_ESCENARIO: Vec3 = [0, ESCENARIO_Y, -2.0];
const CABEZA_ESCENARIO: Vec3 = [0, ESCENARIO_Y + 1.85, -2.0];

const camaraEn = (f: number): Toma => {
  const base = { giro: 0, desenfoque: 0, fov: 50 };

  // Estudio: grúa de apertura hasta el plano de los dos conductores
  if (f < JUANGA) {
    const t = interpolate(f, [0, JUANGA], [0, 1], suave);
    return { ...base, pos: mezclar([0, 4.8, 7.5], [0, 2.0, 5.2], t), mira: mezclar([0, 1.0, 0], [0, 1.6, 0], t) };
  }
  // Concierto: sobre el público, del cartel «¡JUANGA!» al escenario
  if (f < L(2).inicio) {
    const t = interpolate(f, [JUANGA, L(2).inicio], [0, 1], suave);
    return {
      ...base,
      pos: mezclar([0.9, 2.1, 5.2], [0.6, 2.2, 4.6], t),
      mira: mezclar([0.4, 2.3, 1.6], [0, 2.4, -2], t),
      desenfoque: interpolate(f, [JUANGA, JUANGA + 4], [5, 0], fijo),
    };
  }
  // Contrapicado del cantante desde el público
  if (f < ABUCHEO) {
    const t = interpolate(f, [L(2).inicio, ABUCHEO], [0, 1], suave);
    return { ...base, pos: mezclar([0.7, 1.3, 1.6], [0.4, 1.4, 0.9], t), mira: CABEZA_ESCENARIO, fov: 50 };
  }
  // El abucheo: desde detrás del cantante hacia el público, con cámara en mano
  if (f < L(3).inicio) {
    return {
      ...base,
      pos: sumar([1.9, 3.5, -3.3], enMano(f, 0.03)),
      mira: [0, 1.0, 2.5],
      fov: 58,
    };
  }
  // Estudio: primer plano del conductor
  if (f < L(4).inicio) {
    const t = interpolate(f, [L(3).inicio, L(4).inicio], [0, 1], suave);
    return { ...base, pos: mezclar([-0.3, 1.9, 3.4], [-0.5, 1.85, 2.6], t), mira: [-0.75, 1.7, 0], fov: 45 };
  }
  // El live: entrada, panorámicas a los cuadros y órbita final
  if (f < DALI_T) {
    const zoom = interpolate(f, [L(4).inicio, L(4).inicio + 8], [0, 1], golpe);
    return { ...base, pos: mezclar([0, 2.2, 5.0], [0, 1.85, 3.4], zoom), mira: [0, 1.6, 0], fov: 50 };
  }
  if (f < PICASSO_T) {
    const t = interpolate(f, [DALI_T, DALI_T + 8], [0, 1], suave);
    return {
      ...base,
      pos: [0.5, 2.0, 2.6],
      mira: mezclar([0, 1.6, 0], DALI, t),
      fov: 48 - t * 8,
      desenfoque: Math.sin(t * Math.PI) * 5,
    };
  }
  if (f < INGLATERRA) {
    const t = interpolate(f, [PICASSO_T, PICASSO_T + 8], [0, 1], suave);
    return {
      ...base,
      pos: [-0.5, 2.0, 2.6],
      mira: mezclar(DALI, PICASSO, t),
      fov: 40,
      desenfoque: Math.sin(t * Math.PI) * 6,
    };
  }
  if (f < L(5).inicio) {
    const vuelta = interpolate(f, [INGLATERRA, INGLATERRA + 8], [0, 1], suave);
    const a = interpolate(f, [INGLATERRA, fin(L(4))], [0.5, -0.5], suave);
    return {
      ...base,
      pos: orbita([0, 0, 0], 3.6, a, 2.0),
      mira: mezclar(PICASSO, [0, 1.9, 0], vuelta),
      fov: 52,
      desenfoque: Math.sin(vuelta * Math.PI) * 5,
    };
  }
  // Estudio: conductora
  if (f < TABASCO) {
    const t = interpolate(f, [L(5).inicio, TABASCO], [0, 1], suave);
    return { ...base, pos: mezclar([0.3, 1.9, 3.4], [0.5, 1.85, 2.6], t), mira: [0.75, 1.7, 0], fov: 45 };
  }
  // Tabasco: grúa sobre el escenario del Festival del Chocolate
  if (f < L(6).inicio) {
    const t = interpolate(f, [TABASCO, L(6).inicio], [0, 1], suave);
    return { ...base, pos: mezclar([-2.4, 4.0, 6.0], [-0.6, 2.4, 4.4], t), mira: [0, 1.8, -2], fov: 52 };
  }
  // «¿Pero no que ya no más gratis?»: crash zoom al conductor con plano holandés
  if (f < L(7).inicio) {
    const zoom = interpolate(f, [L(6).inicio, L(6).inicio + 6], [0, 1], golpe);
    return {
      pos: sumar([-0.4, 1.85, 2.4], enMano(f, 0.012)),
      mira: [-0.75, 1.8, 0],
      fov: 62 - zoom * 22,
      giro: zoom * 0.16,
      desenfoque: 0,
    };
  }
  // Final en Tabasco: órbita baja con lluvia de chocolates
  const a = interpolate(f, [L(7).inicio, DURACION], [-0.5, 0.4], suave);
  return {
    ...base,
    pos: orbita([0, 0, -2], 5.2, a, 3.0),
    mira: [0, 2.3, -2],
    fov: 50,
  };
};

const Mundo: React.FC<{ camara: Toma; bocas: Partial<Record<Quien, number>> }> = ({ camara, bocas }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const set = setEn(f);

  const pantalla: Pantalla =
    f < 40 ? "logo" : f < L(3).inicio ? "chisme" : f < L(5).inicio ? "envivo" : f < L(6).inicio ? "gratis" : "chisme";

  const conductor: PosePersonaje = {
    ...POSE,
    respiracion: t * 2,
    boca: bocas.conductor ?? 0,
    teclear: 0.35,
    // Mirada escéptica en el «¿pero no que ya no más gratis?»
    sueno: f >= L(6).inicio && f < L(7).inicio ? 0.45 : 0,
    enojo: f >= L(6).inicio && f < L(7).inicio ? 0.4 : 0,
    rotacion: 0.15,
  };
  const conductora: PosePersonaje = {
    ...POSE,
    respiracion: t * 2 + 1,
    boca: bocas.conductora ?? 0,
    teclear: 0.35,
    rotacion: -0.15,
  };

  // El cantante: toca el teclado, señala los cuadros, levanta los brazos
  const cantando = set === "live" || set === "tabasco";
  const aleks: PosePersonaje = {
    ...POSE,
    respiracion: t * 2,
    boca: bocas.aleks ?? 0,
    teclear:
      set === "grito"
        ? interpolate(f, [L(2).inicio, L(2).inicio + 8, ABUCHEO, ABUCHEO + 6], [1, 0.2, 0.2, 0], fijo)
        : set === "live" && f < DALI_T
          ? 1
          : 0,
    saludo: set === "live" && f >= DALI_T && f < INGLATERRA ? 1 : 0,
    brazoSaludo: f < PICASSO_T ? "derecho" : "izquierdo",
    manosCabeza: (set === "live" && f >= INGLATERRA + 10) || (set === "tabasco" && f >= L(7).inicio) ? 1 : 0,
    salto: set === "tabasco" && f >= L(7).inicio ? saltar(f, L(7).inicio + 10, 14, 0.4) + saltar(f, L(7).inicio + 60, 14, 0.4) : 0,
    rotacion: set === "live" && f >= DALI_T && f < PICASSO_T ? -0.5 : set === "live" && f >= PICASSO_T && f < INGLATERRA ? 0.5 : 0,
  };

  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      {set === "estudio" && (
        <>
          <Estudio frame={f} pantalla={pantalla} />
          <group position={CONDUCTOR_POS}>
            <Personaje colores={CONDUCTOR} pose={conductor} />
          </group>
          <group position={CONDUCTORA_POS}>
            <Personaje colores={CONDUCTORA} pose={conductora} escala={0.95} />
          </group>
        </>
      )}
      {(set === "grito" || set === "tabasco") && (
        <>
          <Concierto
            frame={f}
            variante={set}
            euforia={set === "tabasco" ? 1 : 0}
            abucheo={set === "grito" ? interpolate(f, [ABUCHEO, ABUCHEO + 8], [0, 1], fijo) : 0}
          />
          <group position={CANTANTE_ESCENARIO}>
            <Personaje colores={ALEKS} pose={{ ...aleks, teclear: cantando ? 0 : aleks.teclear }} />
          </group>
        </>
      )}
      {set === "live" && (
        <>
          <CuartoLive frame={f} avion={interpolate(f, [INGLATERRA, INGLATERRA + 70], [0, 1], fijo)} />
          <Personaje colores={ALEKS} pose={aleks} />
        </>
      )}
    </>
  );
};

// Interfaz de transmisión en vivo: insignia, espectadores, corazones y comentarios
const InterfazLive: React.FC = () => {
  const frame = useCurrentFrame();
  const espectadores = Math.round(interpolate(frame, [0, 300], [1200, 98000], fijo));
  const comentarios = [
    "¿Inglaterra?",
    "¡Toca Duele el amor!",
    "¿y Juan Gabriel?",
    "Picasso no cantaba jaja",
    "Te queremos Aleks",
    "¿es un juego?",
  ];
  const visibles = Math.min(comentarios.length, Math.floor(frame / 40) + 1);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 370,
          left: 50,
          display: "flex",
          gap: 14,
          alignItems: "center",
          fontFamily: FUENTE,
          fontSize: 36,
          color: "white",
        }}
      >
        <span style={{ background: "#ff1744", padding: "4px 16px", borderRadius: 10 }}>EN VIVO</span>
        <span style={{ background: "rgba(0,0,0,0.5)", padding: "4px 16px", borderRadius: 10 }}>
          {espectadores.toLocaleString("es-MX")} viendo
        </span>
      </div>
      {/* Comentarios */}
      <div style={{ position: "absolute", left: 50, top: 1530, display: "flex", flexDirection: "column", gap: 8 }}>
        {comentarios.slice(Math.max(0, visibles - 3), visibles).map((c) => (
          <div
            key={c}
            style={{
              background: "rgba(0,0,0,0.45)",
              color: "white",
              fontFamily: "sans-serif",
              fontWeight: 700,
              fontSize: 32,
              padding: "6px 16px",
              borderRadius: 14,
              alignSelf: "flex-start",
            }}
          >
            {c}
          </div>
        ))}
      </div>
      {/* Corazones que suben */}
      {Array.from({ length: 10 }).map((_, i) => {
        const inicio = 20 + i * 27;
        const p = (frame - inicio) / 50;
        if (p < 0 || p > 1) return null;
        return (
          <svg
            key={i}
            width={70}
            height={70}
            viewBox="0 0 24 24"
            style={{
              position: "absolute",
              right: 60 + Math.sin(i * 2.1 + p * 4) * 30,
              top: 1500 - p * 600,
              opacity: 1 - p,
              transform: `scale(${0.7 + p * 0.5})`,
            }}
          >
            <path
              d="M12 21s-7-4.5-9.5-9C.8 8.5 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.2 4.5 4.5 8-2.5 4.5-9.5 9-9.5 9z"
              fill={["#ff4fa3", "#ff1744", "#ffd21f"][i % 3]}
            />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

const Sello: React.FC<{ texto: string; color: string; top: number }> = ({ texto, color, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 8, stiffness: 180 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: top }}>
      <div style={{ ...estiloContorno, fontSize: 110, color, transform: `scale(${pop}) rotate(-6deg)` }}>{texto}</div>
    </AbsoluteFill>
  );
};

const CartelFinal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(0,0,0,${0.55 * pop})` }}>
      <div style={{ ...estiloContorno, fontSize: 130, color: "#ffd21f", transform: `scale(${pop})` }}>PARODIA</div>
      <div
        style={{
          marginTop: 24,
          maxWidth: 860,
          textAlign: "center",
          color: "white",
          fontFamily: "sans-serif",
          fontWeight: 700,
          fontSize: 34,
          opacity: pop,
        }}
      >
        Voces y personajes ficticios. Basado en lo publicado por Infobae, N+, Récord y Criterio
        Hidalgo (septiembre de 2026).
      </div>
    </AbsoluteFill>
  );
};

const COLORES: Record<Quien, string> = { conductor: "#2459c9", conductora: "#ff4fa3", aleks: "#8338ec" };
const NOMBRES: Record<Quien, string> = {
  conductor: "CONDUCTOR",
  conductora: "CONDUCTORA",
  aleks: "«ALEKS» (PARODIA)",
};

export const ElChisme: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const bocas = useBocas(LINEAS, "voces/syntek");
  const camara = camaraEn(frame);
  const flash = (inicio: number, fuerza: number) =>
    frame < inicio ? 0 : interpolate(frame, [inicio, inicio + 4], [fuerza, 0], fijo);
  const destello = Math.max(flash(JUANGA, 0.5), flash(L(4).inicio, 0.6), flash(L(6).inicio, 0.5));

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Lienzo ancho={width} alto={height} desenfoque={camara.desenfoque}>
        <Mundo camara={camara} bocas={bocas} />
      </Lienzo>
      <AbsoluteFill style={{ backgroundColor: "white", opacity: destello }} />

      <Gancho texto="El chisme de Aleks Syntek, explicado" />
      <div
        style={{
          position: "absolute",
          top: 268,
          right: 70,
          background: "#ffd21f",
          color: "#111",
          fontFamily: FUENTE,
          fontSize: 30,
          padding: "4px 16px",
          borderRadius: 10,
          transform: "rotate(3deg)",
        }}
      >
        PARODIA
      </div>

      <Sequence from={L(4).inicio} durationInFrames={L(5).inicio - L(4).inicio} layout="none">
        <InterfazLive />
      </Sequence>
      <Sequence from={ABUCHEO + 4} durationInFrames={L(3).inicio - ABUCHEO - 4} layout="none">
        <Sello texto="¡BUUU!" color="#ff4040" top={560} />
      </Sequence>
      <Sequence from={INGLATERRA + 8} durationInFrames={fin(L(4)) - INGLATERRA - 8} layout="none">
        <Sello texto="RUMBO A INGLATERRA" color="#4fc3f7" top={560} />
      </Sequence>

      {LINEAS.map((l) => (
        <Sequence key={l.id} from={l.inicio} durationInFrames={l.duracion + 4} layout="none">
          <Audio src={staticFile(`voces/syntek/${l.id}.mp3`)} />
          <Subtitulo texto={l.texto} nombre={NOMBRES[l.personaje]} color={COLORES[l.personaje]} centroY={1150} />
        </Sequence>
      ))}

      <Sequence from={fin(L(7)) + 6} layout="none">
        <CartelFinal />
      </Sequence>

      <Sonidos />
    </AbsoluteFill>
  );
};
