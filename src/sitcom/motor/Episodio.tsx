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
import { golpe } from "../../comun/camara";
import { fijo, saltar } from "../../comun/lineaDeTiempo";
import { Camara, Lienzo, Vec3 } from "../../comun/Lienzo";
import { Sonido } from "../../comun/Sonido";
import { estiloContorno, FUENTE, Gancho, Subtitulo } from "../../comun/Textos";
import { useBocas } from "../../comun/useBocas";
import { Robot } from "../../ia/Oficina";
import { ColoresPersonaje, Personaje, PosePersonaje } from "../../n64/Personaje";
import { Startup } from "../Startup";
import { Episodio as DatosEpisodio, Estado, estadoEn } from "./datos";

// Motor de episodios de «Prompt & Compañía»: set, reparto, cámaras de sitcom, risas,
// presentación y final congelado salen del guion; cada episodio solo aporta su guion.json.

type Humano = { tipo: "humano"; nombre: string; color: string; colores: ColoresPersonaje; inicial?: Partial<Estado> };
type Bot = { tipo: "robot"; nombre: string; color: string; cuerpo?: string; escala?: number; inicial?: Partial<Estado> };
export type Miembro = Humano | Bot;

export const persona = (camisa: string, pantalon: string, cabello: string, extra: Partial<ColoresPersonaje> = {}): ColoresPersonaje => ({
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

// Reparto fijo de la serie
export const REPARTO: Record<string, Miembro> = {
  raul: { tipo: "humano", nombre: "RAÚL (CEO)", color: "#1d3557", colores: persona("#1d3557", "#14213d", "#9e9e9e", { bigote: true }) },
  sofi: { tipo: "humano", nombre: "SOFI", color: "#7b2cbf", colores: persona("#7b2cbf", "#22223b", "#2b1a12", { lentes: true, mono: "#ffd166" }), inicial: { postura: "sentado", brazos: "teclea" } },
  tono: { tipo: "humano", nombre: "TOÑO", color: "#2a9d8f", colores: persona("#2a9d8f", "#264653", "#111", { gorra: true, sombrero: "#e76f51" }), inicial: { postura: "sentado", brazos: "teclea" } },
  kai: { tipo: "robot", nombre: "KAI", color: "#13a8c8", inicial: { cara: "feliz" } },
};

// Posiciones según el formato (en vertical todo se junta hacia el centro)
const POSICIONES: Record<"vertical" | "horizontal", Record<string, { pos: Vec3; rot: number }>> = {
  vertical: {
    sofi: { pos: [-1.5, 0, 0.0], rot: 0.35 },
    tono: { pos: [1.5, 0, 0.0], rot: -0.35 },
    raul: { pos: [-0.35, 0, 1.3], rot: 0 },
    kai: { pos: [0.85, 1.85, 1.0], rot: -0.2 },
    extra: { pos: [-1.0, 1.65, 1.6], rot: 0.2 },
  },
  horizontal: {
    sofi: { pos: [-2.5, 0, 0.3], rot: 0.45 },
    tono: { pos: [2.5, 0, 0.3], rot: -0.45 },
    raul: { pos: [0.6, 0, 1.0], rot: 0 },
    kai: { pos: [-0.8, 1.8, 0.6], rot: 0 },
    extra: { pos: [-2.0, 1.6, 1.4], rot: 0.2 },
  },
};

const posicionDe = (ep: DatosEpisodio, id: string) =>
  ep.posiciones?.[id] ?? POSICIONES[ep.formato][id] ?? POSICIONES[ep.formato].extra;

const cabezaDe = (ep: DatosEpisodio, reparto: Record<string, Miembro>, id: string, frame: number): Vec3 => {
  const { pos } = posicionDe(ep, id);
  if (reparto[id]?.tipo === "robot") return pos;
  const sentado = estadoEn(ep, id, reparto[id]?.inicial ?? {}, frame).postura === "sentado";
  return [pos[0], sentado ? 1.53 : 1.82, pos[2]];
};

const camaraEn = (ep: DatosEpisodio, reparto: Record<string, Miembro>, f: number) => {
  let corte = ep.cortes[0];
  for (const c of ep.cortes) if (c.desde <= f) corte = c;
  const t = f - corte.desde;
  const vertical = ep.formato === "vertical";
  const empuje = Math.min(t, 120) * 0.012;

  if (corte.plano === "general" || !reparto[corte.plano.replace("!", "")]) {
    return vertical
      ? { pos: [0, 2.5, 7.8] as Vec3, mira: [0, 1.35, 0.2] as Vec3, fov: 50 - empuje }
      : { pos: [0, 2.4, 8.2] as Vec3, mira: [0, 1.4, -0.3] as Vec3, fov: 40 - empuje };
  }
  // "kai!" = crash zoom al personaje
  const crash = corte.plano.endsWith("!");
  const id = corte.plano.replace("!", "");
  const cabeza = cabezaDe(ep, reparto, id, f);
  const { rot } = posicionDe(ep, id);
  const d = vertical ? 4.6 : 4.8;
  const pos: Vec3 = [cabeza[0] + Math.sin(rot * 0.6) * d, cabeza[1] + 0.15, cabeza[2] + Math.cos(rot * 0.6) * d];
  const mira: Vec3 = [cabeza[0], cabeza[1] - (vertical ? 0.15 : 0.3), cabeza[2]];
  const fovBase = vertical ? 38 : 30;
  const fov = crash ? fovBase + 16 - interpolate(t, [0, 5], [0, 1], golpe) * 22 : fovBase - empuje;
  return { pos, mira, fov };
};

const poseHumano = (e: Estado, f: number, boca: number): PosePersonaje => ({
  x: 0,
  z: 0,
  rotacion: 0,
  fasePaso: 0,
  caminar: 0,
  saludo: e.brazos === "saluda" ? 1 : 0,
  brazoSaludo: "izquierdo",
  salto: e.saltos.reduce((s, d) => s + saltar(f, d, 10, 0.45), 0),
  respiracion: f / 15,
  boca,
  sentado: e.postura === "sentado" ? 1 : 0,
  teclear: e.brazos === "teclea" ? (boca > 0.05 ? 0.3 : 1) : 0,
  jarras: e.brazos === "jarras" ? 1 : 0,
  manosCabeza: e.brazos === "brazos-arriba" ? 1 : 0,
  telefono: e.brazos === "telefono" ? 1 : 0,
  enojo: e.cara === "enojo" ? 0.8 : e.cara === "asustado" ? 0.3 : 0,
  sueno: e.cara === "sueno" ? 0.5 : e.cara === "llora" ? 0.3 : 0,
  llanto: e.cara === "llora" ? 1 : 0,
});

// Escenario: por defecto la oficina; un episodio de otra serie puede pasar el suyo
export type Escenario = React.FC<{ frame: number }>;

const Mundo: React.FC<{ ep: DatosEpisodio; reparto: Record<string, Miembro>; escenario?: Escenario }> = ({
  ep,
  reparto,
  escenario: EscenarioPropio,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bocas = useBocas(ep.lineas, ep.envolventes) as Record<string, number | undefined>;
  const cam = camaraEn(ep, reparto, f);
  const vertical = ep.formato === "vertical";
  const pos = POSICIONES[ep.formato];

  return (
    <>
      <Camara pos={cam.pos} mira={cam.mira} fov={cam.fov} />
      {EscenarioPropio ? (
        <EscenarioPropio frame={f} />
      ) : (
        <Startup
          frame={f}
          cafeCancelado
          pantallaTono="#4fc3f7"
          pantallaSofi="#80ed99"
          escritorios={vertical ? [pos.sofi, pos.tono] : undefined}
        />
      )}
      {Object.entries(reparto).map(([id, m]) => {
        const e = estadoEn(ep, id, m.inicial ?? {}, f);
        if (!e.visible) return null;
        const { pos: p, rot } = posicionDe(ep, id);
        const aparicion = e.desdeVisible > 0 ? spring({ frame: f - e.desdeVisible, fps, config: { damping: 9 } }) : 1;
        if (m.tipo === "robot") {
          const animo = e.cara === "malvado" || e.cara === "asustado" || e.cara === "feliz" ? e.cara : "normal";
          return (
            <group key={id} position={p} scale={(m.escala ?? 1) * aparicion}>
              <Robot
                pos={[0, 0, 0]}
                rot={rot}
                boca={bocas[id] ?? 0}
                frame={f}
                animo={animo}
                temblor={e.cara === "asustado" ? 1 : 0}
                sudor={e.cara === "asustado" ? 1 : 0}
                color={m.cuerpo}
                lentesSol={e.lentesSol}
              />
            </group>
          );
        }
        return (
          <group key={id} position={p} rotation={[0, rot, 0]} scale={aparicion}>
            <Personaje colores={m.colores} pose={poseHumano(e, f, bocas[id] ?? 0)} />
          </group>
        );
      })}
    </>
  );
};

const Presentacion: React.FC<{ titulo: string; reparto: Record<string, Miembro>; vertical: boolean }> = ({ titulo, reparto, vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 3, fps, config: { damping: 9, stiffness: 140 } });
  const [a, b] = titulo.split(" & ");
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #ffd166 0%, #ef476f 55%, #3a0ca3 100%)", alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ opacity: 0.18, transform: `rotate(${frame * 0.6}deg) scale(2.4)` }}>
        <div style={{ width: "100%", height: "100%", background: "repeating-conic-gradient(#fff 0deg 10deg, transparent 10deg 20deg)" }} />
      </AbsoluteFill>
      <div style={{ ...estiloContorno, fontSize: vertical ? 130 : 150, transform: `scale(${logo}) rotate(-4deg)`, textAlign: "center", lineHeight: 0.95 }}>
        {a}
        {b && (
          <>
            <br />
            <span style={{ color: "#ffd166" }}>& {b}</span>
          </>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 30, marginTop: 40, maxWidth: 900 }}>
        {Object.values(reparto).map((m, i) => (
          <div key={m.nombre} style={{ fontFamily: FUENTE, fontSize: 46, color: "white", textShadow: "0 4px 0 #000", transform: `scale(${spring({ frame: frame - 20 - i * 6, fps, config: { damping: 10 } })})` }}>
            {m.nombre.split(" ")[0]}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Creditos: React.FC<{ titulo: string; vertical: boolean }> = ({ titulo, vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...estiloContorno, fontSize: vertical ? 96 : 120, transform: `scale(${pop}) rotate(-3deg)`, color: "#ffd166", textAlign: "center" }}>{titulo}</div>
      <div style={{ fontFamily: FUENTE, fontSize: 48, color: "white", marginTop: 20, textShadow: "0 4px 0 #000", opacity: interpolate(frame, [15, 30], [0, 1], fijo) }}>CONTINUARÁ...</div>
    </AbsoluteFill>
  );
};

export const EpisodioSitcom: React.FC<{
  ep: DatosEpisodio;
  reparto?: Record<string, Miembro>;
  gancho?: string;
  escenario?: Escenario;
}> = ({
  ep,
  reparto = REPARTO,
  gancho,
  escenario,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = ep.formato === "vertical";
  const titulo = ep.guion.titulo ?? "PROMPT & COMPAÑÍA";
  const congelado = frame >= ep.congelar;
  const escena = (
    <Lienzo ancho={width} alto={height}>
      <Mundo ep={ep} reparto={reparto} escenario={escenario} />
    </Lienzo>
  );
  const s = (n: string) => `sonidos/${n}.wav`;
  const apariciones = ep.eventos.filter((e) => e.tokens.includes("aparece"));

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ filter: congelado ? "sepia(0.6) contrast(1.05)" : undefined }}>
        {congelado ? <Freeze frame={ep.congelar}>{escena}</Freeze> : escena}
      </AbsoluteFill>
      <AbsoluteFill style={{ boxShadow: "inset 0 0 200px 40px rgba(0,0,0,0.45)", pointerEvents: "none" }} />

      {vertical && gancho && frame < ep.congelar && <Gancho texto={gancho} />}
      {ep.guion.episodio && ep.tituloFin > 0 && (
        <Sequence from={ep.tituloFin} durationInFrames={100} layout="none">
          <div style={{ position: "absolute", left: 60, top: vertical ? 300 : 60, fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 40, color: "white", textShadow: "0 3px 6px #000" }}>
            {ep.guion.episodio}
          </div>
        </Sequence>
      )}

      {ep.lineas.map((l) => (
        <Sequence key={l.id} from={l.inicio} durationInFrames={l.duracion + 4} layout="none">
          <Audio src={staticFile(`voces/${ep.guion.carpeta}/${l.id}.mp3`)} />
          <Subtitulo texto={l.texto} nombre={reparto[l.personaje]?.nombre ?? l.personaje.toUpperCase()} color={reparto[l.personaje]?.color ?? "#333"} centroY={vertical ? 1180 : 800} />
        </Sequence>
      ))}

      {ep.titulo >= 0 && (
        <Sequence from={ep.titulo} durationInFrames={ep.tituloFin - ep.titulo} layout="none">
          <Presentacion titulo={titulo} reparto={reparto} vertical={vertical} />
        </Sequence>
      )}
      <Sequence from={ep.congelar + 6} layout="none">
        <Creditos titulo={titulo} vertical={vertical} />
      </Sequence>

      {/* Sonido: riff, risas, apariciones, tema y aplausos finales */}
      <Sonido archivo={s("riff-slap")} desde={0} volumen={0.45} />
      {ep.risas.map((r) => (
        <Sonido key={r.id} archivo={s(r.archivo)} desde={r.desde} hasta={r.hasta} volumen={r.tipo === "aplauso" ? 0.6 : 0.55} fundido={4} />
      ))}
      {apariciones.map((a) => (
        <Sonido key={`${a.personaje}${a.desde}`} archivo={s("brillo")} desde={a.desde} volumen={0.4} />
      ))}
      {ep.titulo >= 0 && (
        <>
          <Sonido archivo={s("whoosh")} desde={ep.titulo - 4} volumen={0.35} />
          <Sonido archivo={s("tema-sitcom")} desde={ep.titulo} hasta={ep.tituloFin} volumen={0.6} fundido={4} />
          <Sonido archivo={s("riff-slap")} desde={ep.tituloFin - 2} volumen={0.45} />
        </>
      )}
      <Sonido archivo={s("aplausos")} desde={ep.congelar} volumen={0.4} />
      <Sonido archivo={s("tema-sitcom")} desde={ep.congelar + 6} volumen={0.45} fundido={6} />
    </AbsoluteFill>
  );
};
