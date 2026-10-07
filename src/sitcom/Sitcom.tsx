import {
  AbsoluteFill,
  Audio,
  Freeze,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { golpe, mezclar, Toma } from "../comun/camara";
import { fijo, fin, saltar } from "../comun/lineaDeTiempo";
import { Camara, Lienzo, Vec3 } from "../comun/Lienzo";
import { estiloContorno, FUENTE, Subtitulo } from "../comun/Textos";
import { useBocas } from "../comun/useBocas";
import { Robot } from "../ia/Oficina";
import { ColoresPersonaje, Personaje, PosePersonaje } from "../n64/Personaje";
import envolventes from "./envolventes.json";
import { Sonidos } from "./Sonidos";
import { CAFETERA, ESCRITORIO_SOFI, ESCRITORIO_TONO, ROT_SOFI, ROT_TONO, Startup } from "./Startup";
import { CONGELAR, L, LINEAS, Quien, TITULO, TITULO_FIN } from "./tiempos";

// «Prompt & Compañía»: sitcom de una startup que se vuelve «AI-first» y contrata a KAI,
// un agente de IA demasiado eficiente. Cámaras de sitcom (plano general, primeros planos
// y reacciones durante las risas), presentación con canción y final congelado.

const POSE: PosePersonaje = { x: 0, z: 0, rotacion: 0, fasePaso: 0, caminar: 0, saludo: 0, salto: 0, respiracion: 0 };
const persona = (camisa: string, pantalon: string, cabello: string, extra: Partial<ColoresPersonaje> = {}): ColoresPersonaje => ({
  piel: "#e0a47c",
  camisa,
  pantalon,
  sombrero: camisa,
  zapatos: "#222",
  gorra: false,
  bigote: false,
  cabello,
  ...extra,
});

const RAUL = persona("#1d3557", "#14213d", "#9e9e9e", { bigote: true });
const SOFI = persona("#7b2cbf", "#22223b", "#2b1a12", { lentes: true, mono: "#ffd166" });
const TONO = persona("#2a9d8f", "#264653", "#111", { gorra: true, sombrero: "#e76f51" });

const KAI: Vec3 = [-0.8, 1.8, 0.6];
const PUERTA: Vec3 = [4.3, 0, -1.9];
const RAUL_POS: Vec3 = [0.6, 0, 1.0];
const CABEZA_SOFI: Vec3 = [ESCRITORIO_SOFI[0], 1.53, ESCRITORIO_SOFI[2]];
const CABEZA_TONO: Vec3 = [ESCRITORIO_TONO[0], 1.53, ESCRITORIO_TONO[2]];
const CABEZA_RAUL: Vec3 = [RAUL_POS[0], 1.82, RAUL_POS[2]];

// Momento en que Raúl dice «¡KAI!» y aparece el robot
const APARECE_KAI = fin(L(3)) - 22;
const ENTRADA_RAUL = L(1).inicio + 70;

// ---------------------------------------------------------------- planos de cámara
type Plano = "general" | "sofi" | "tono" | "tonoCrash" | "raul" | "kai" | "cafe" | "tonoKai";

const frente = (cabeza: Vec3, giro: number, distancia: number, altura = 0.18): Vec3 => [
  cabeza[0] + Math.sin(giro) * distancia,
  cabeza[1] + altura,
  cabeza[2] + Math.cos(giro) * distancia,
];

const PLANOS: Record<Plano, { pos: Vec3; mira: Vec3; fov: number }> = {
  general: { pos: [0, 2.4, 8.2], mira: [0, 1.4, -0.3], fov: 40 },
  sofi: { pos: frente(CABEZA_SOFI, ROT_SOFI, 4.8), mira: [CABEZA_SOFI[0], 1.35, CABEZA_SOFI[2]], fov: 30 },
  tono: { pos: frente(CABEZA_TONO, ROT_TONO, 4.8), mira: [CABEZA_TONO[0], 1.35, CABEZA_TONO[2]], fov: 30 },
  tonoCrash: { pos: frente(CABEZA_TONO, ROT_TONO, 4.2), mira: CABEZA_TONO, fov: 26 },
  raul: { pos: frente(CABEZA_RAUL, -0.1, 5.0), mira: [CABEZA_RAUL[0], 1.55, CABEZA_RAUL[2]], fov: 30 },
  kai: { pos: frente(KAI, 0.05, 4.6, 0.05), mira: KAI, fov: 28 },
  cafe: { pos: [0.9, 1.7, 0.6], mira: [CAFETERA[0] - 0.2, 1.4, CAFETERA[2]], fov: 34 },
  tonoKai: { pos: [0.9, 2.1, 6.4], mira: [0.8, 1.5, 0.4], fov: 32 },
};

// Qué plano va durante cada línea y, si la hay, durante la risa que le sigue
const GUION_CAMARA: [Plano, Plano?][] = [
  ["general"],
  ["sofi", "general"],
  ["raul", "general"],
  ["kai", "cafe"],
  ["tonoCrash", "general"],
  ["tonoKai"],
  ["kai", "tono"],
  ["sofi"],
  ["kai"],
  ["sofi"],
  ["kai", "general"],
  ["raul", "general"],
  ["kai", "raul"],
  ["raul"],
  ["sofi", "general"],
  ["kai"],
  ["raul"],
  ["kai", "general"],
];

const CORTES: { desde: number; plano: Plano }[] = (() => {
  const lista: { desde: number; plano: Plano }[] = [{ desde: 0, plano: "general" }];
  LINEAS.forEach((l, i) => {
    const [durante, risa] = GUION_CAMARA[i];
    lista.push({ desde: l.inicio - 2, plano: durante });
    if (i === 2) lista.push({ desde: APARECE_KAI, plano: "general" });
    if (risa) lista.push({ desde: fin(l) + 2, plano: risa });
  });
  lista.push({ desde: TITULO_FIN, plano: "general" });
  return lista.sort((a, b) => a.desde - b.desde);
})();

const camaraEn = (f: number): Toma => {
  let corte = CORTES[0];
  for (const c of CORTES) if (c.desde <= f) corte = c;
  const p = PLANOS[corte.plano];
  const t = f - corte.desde;
  // Empuje muy lento en cada plano, como una cámara de estudio
  let fov = p.fov - Math.min(t, 120) * 0.012;
  if (corte.plano === "tonoCrash") fov = 40 - interpolate(t, [0, 5], [0, 1], golpe) * 20;
  return { pos: p.pos, mira: p.mira, fov, giro: 0, desenfoque: 0 };
};

// ---------------------------------------------------------------- mundo
const Mundo: React.FC<{ bocas: Partial<Record<Quien, number>> }> = ({ bocas }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const camara = camaraEn(f);
  const t = f / 15;
  const en = (a: number, b: number) => f >= a && f < b;

  // Raúl entra por la puerta y camina al centro
  const camino = interpolate(f, [8, ENTRADA_RAUL], [0, 1], fijo);
  const raulPos = mezclar(PUERTA, RAUL_POS, camino);
  const caminando = camino > 0 && camino < 1;
  const raul: PosePersonaje = {
    ...POSE,
    respiracion: t,
    boca: bocas.raul ?? 0,
    caminar: caminando ? 1 : 0,
    fasePaso: f * 0.35,
    rotacion: caminando ? Math.atan2(RAUL_POS[0] - PUERTA[0], RAUL_POS[2] - PUERTA[2]) : en(L(9).inicio, L(12).inicio) ? -0.4 : 0,
    jarras: !caminando && !en(APARECE_KAI - 4, fin(L(3)) + 25) && !en(L(12).inicio, fin(L(12))) && f < L(13).inicio ? 1 : 0,
    saludo: en(APARECE_KAI - 4, fin(L(3)) + 25) || en(L(17).inicio, fin(L(17))) ? 1 : 0,
    brazoSaludo: "izquierdo",
    manosCabeza: en(L(12).inicio, fin(L(12))) || f >= fin(L(18)) ? 1 : 0,
    sueno: en(L(13).inicio + 20, L(16).inicio) ? 0.35 : 0,
    enojo: en(fin(L(13)), L(16).inicio) ? 0.35 : 0,
  };

  const sofiDePie = en(L(10).inicio, L(12).inicio);
  const sofi: PosePersonaje = {
    ...POSE,
    rotacion: 0,
    respiracion: t + 1,
    boca: bocas.sofi ?? 0,
    sentado: sofiDePie ? 0 : 1,
    teclear: sofiDePie ? 0 : en(L(2).inicio, fin(L(2))) || en(L(8).inicio, fin(L(8))) || en(L(15).inicio, fin(L(15))) ? 0.3 : 1,
    salto: saltar(f, L(10).inicio, 10, 0.4),
    enojo: en(L(8).inicio, L(12).inicio) ? 0.5 : 0,
    sueno: en(L(2).inicio, fin(L(2))) || en(L(15).inicio, fin(L(15)) + 30) ? 0.45 : 0,
  };

  const tonoDePie = en(L(5).inicio, TITULO);
  const tono: PosePersonaje = {
    ...POSE,
    rotacion: 0,
    respiracion: t + 2,
    boca: bocas.tono ?? 0,
    sentado: tonoDePie ? 0 : 1,
    teclear: tonoDePie ? 0 : en(L(6).inicio, fin(L(6))) ? 0.3 : 1,
    manosCabeza: tonoDePie || en(fin(L(7)), L(8).inicio) ? 1 : 0,
    salto: saltar(f, L(5).inicio, 10, 0.5),
    enojo: tonoDePie || en(fin(L(7)), L(8).inicio) ? 0.7 : 0,
  };

  const kaiEscala = spring({ frame: f - APARECE_KAI, fps, config: { damping: 9 } });

  return (
    <>
      <Camara pos={camara.pos} mira={camara.mira} fov={camara.fov} giro={camara.giro} />
      <Startup
        frame={f}
        cafeCancelado={f >= fin(L(4)) - 15}
        pantallaTono={f >= fin(L(7)) - 20 ? "#ffb703" : "#4fc3f7"}
        pantallaSofi={f >= L(8).inicio ? "#ff006e" : "#80ed99"}
      />
      <group position={raulPos}>
        <Personaje colores={RAUL} pose={raul} />
      </group>
      <group position={ESCRITORIO_SOFI} rotation={[0, ROT_SOFI, 0]}>
        <Personaje colores={SOFI} pose={sofi} escala={0.95} />
      </group>
      <group position={ESCRITORIO_TONO} rotation={[0, ROT_TONO, 0]}>
        <Personaje colores={TONO} pose={tono} />
      </group>
      {kaiEscala > 0.01 && (
        <group position={KAI} scale={kaiEscala}>
          <Robot pos={[0, 0, 0]} rot={0} boca={bocas.kai ?? 0} frame={f} animo="feliz" />
        </group>
      )}
    </>
  );
};

// ---------------------------------------------------------------- textos
const Presentacion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 4, fps, config: { damping: 9, stiffness: 140 } });
  const reparto = ["RAÚL", "SOFI", "TOÑO", "y KAI"];
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 45%, #ffd166 0%, #ef476f 55%, #3a0ca3 100%)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Rayos girando */}
      <AbsoluteFill style={{ opacity: 0.18, transform: `rotate(${frame * 0.6}deg) scale(2)` }}>
        <div style={{ width: "100%", height: "100%", background: "repeating-conic-gradient(#fff 0deg 10deg, transparent 10deg 20deg)" }} />
      </AbsoluteFill>
      <div style={{ ...estiloContorno, fontSize: 150, transform: `scale(${logo}) rotate(-4deg)`, textAlign: "center", lineHeight: 0.95 }}>
        PROMPT
        <br />
        <span style={{ color: "#ffd166" }}>& COMPAÑÍA</span>
      </div>
      <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
        {reparto.map((n, i) => (
          <div
            key={n}
            style={{
              fontFamily: FUENTE,
              fontSize: 48,
              color: "white",
              textShadow: "0 4px 0 #000",
              transform: `scale(${spring({ frame: frame - 30 - i * 8, fps, config: { damping: 10 } })})`,
            }}
          >
            {n}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 60, fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 34, color: "white", opacity: interpolate(frame, [60, 80], [0, 1], fijo) }}>
        Grabada ante un público en vivo (de voces sintéticas)
      </div>
    </AbsoluteFill>
  );
};

const RotuloEpisodio: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 10, 80, 100], [0, 1, 1, 0], fijo);
  return (
    <div style={{ position: "absolute", left: 70, top: 60, opacity: o, fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 40, color: "white", textShadow: "0 3px 6px #000" }}>
      Episodio 1: «AI-first»
    </div>
  );
};

const Creditos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...estiloContorno, fontSize: 120, transform: `scale(${pop}) rotate(-3deg)`, color: "#ffd166" }}>PROMPT & COMPAÑÍA</div>
      <div style={{ fontFamily: FUENTE, fontSize: 44, color: "white", marginTop: 20, textShadow: "0 4px 0 #000", opacity: interpolate(frame, [15, 30], [0, 1], fijo) }}>
        CONTINUARÁ...
      </div>
      <div style={{ position: "absolute", bottom: 50, fontFamily: "sans-serif", fontWeight: 700, fontSize: 26, color: "#f1f1f1", opacity: interpolate(frame, [25, 40], [0, 1], fijo) }}>
        Creada con Remotion · Voces: ElevenLabs · Personajes ficticios
      </div>
    </AbsoluteFill>
  );
};

const COLORES: Record<Quien, string> = { raul: "#1d3557", sofi: "#7b2cbf", tono: "#2a9d8f", kai: "#13a8c8" };
const NOMBRES: Record<Quien, string> = { raul: "RAÚL (CEO)", sofi: "SOFI", tono: "TOÑO", kai: "KAI" };

// ---------------------------------------------------------------- composición
export const Sitcom: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const bocas = useBocas(LINEAS, envolventes);
  const congelado = frame >= CONGELAR;

  const escena = (
    <Lienzo ancho={width} alto={height}>
      <Mundo bocas={bocas} />
    </Lienzo>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Imagen congelada al final, en sepia, como las sitcoms clásicas */}
      <AbsoluteFill style={{ filter: congelado ? "sepia(0.6) contrast(1.05)" : undefined }}>
        {congelado ? <Freeze frame={CONGELAR}>{escena}</Freeze> : escena}
      </AbsoluteFill>
      {/* Viñeta suave de cámara de estudio */}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 200px 40px rgba(0,0,0,0.45)", pointerEvents: "none" }} />

      <Sequence from={TITULO_FIN} durationInFrames={110} layout="none">
        <RotuloEpisodio />
      </Sequence>

      {LINEAS.map((l) => (
        <Sequence key={l.id} from={l.inicio} durationInFrames={l.duracion + 4} layout="none">
          <Audio src={staticFile(`voces/sitcom/${l.id}.mp3`)} />
          <Subtitulo texto={l.texto} nombre={NOMBRES[l.personaje]} color={COLORES[l.personaje]} centroY={800} />
        </Sequence>
      ))}

      <Sequence from={TITULO} durationInFrames={TITULO_FIN - TITULO} layout="none">
        <Presentacion />
      </Sequence>
      <Sequence from={CONGELAR + 6} layout="none">
        <Creditos />
      </Sequence>

      <Sonidos />
    </AbsoluteFill>
  );
};
