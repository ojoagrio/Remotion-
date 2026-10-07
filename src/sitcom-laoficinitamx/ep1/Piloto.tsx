import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fijo, fin } from "../../comun/lineaDeTiempo";
import { Sonido } from "../../comun/Sonido";
import { estiloContorno, FUENTE } from "../../comun/Textos";
import { CEO, comoMiembro, JUANITO, PATY } from "../../personajes/elenco";
import { ColoresNova, DisenoNova } from "../../personajes/nova/Nova3D";
import { Startup } from "../../sitcom/Startup";
import { GuionEpisodio, prepararEpisodio } from "../../sitcom/motor/datos";
import { EpisodioSitcom, Miembro, TarjetaTitulo } from "../../sitcom/motor/Episodio";
import nova from "../personajes/nova/nova.json";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";

// La Oficinita MX · Episodio 1 (piloto): «IA para todo». El CEO anuncia que usarán IA para TODO.

const AMARILLO = "#ffe600";

export const EP1 = prepararEpisodio(guion as GuionEpisodio, duraciones, envolventes, {
  juanito: { pos: [-1.5, 0, 0.0], rot: 0.35 },
  // Paty (bajita) frente al escritorio de la derecha; Nova flota alto entre ella y el CEO
  paty: { pos: [1.2, 0, 1.6], rot: -0.3 },
  ceo: { pos: [-0.55, 0, 1.25], rot: 0.1 },
  nova: { pos: [0.4, 0, 1.4], rot: -0.15 },
});

const REPARTO_MX: Record<string, Miembro> = {
  ceo: comoMiembro(CEO, { brazos: "jarras" }),
  juanito: comoMiembro(JUANITO, { postura: "sentado", brazos: "teclea" }),
  paty: { ...comoMiembro(PATY), escala: 0.82 },
  nova: { tipo: "nova", nombre: nova.nombre, color: nova.color, diseno: nova.diseno as DisenoNova, colores: nova.colores as ColoresNova, altura: 2.2, escala: 0.8, inicial: { cara: "feliz" } },
};

const Set: React.FC<{ frame: number }> = ({ frame }) => (
  <Startup
    frame={frame}
    cafeCancelado={false}
    pantallaTono="#ffe600"
    pantallaSofi="#4cc9f0"
    letrero="OFICINITA MX"
    pizarronFinal="IA P/ TODO!!"
    escritorios={[
      { pos: [-1.5, 0, 0.0], rot: 0.35 },
      { pos: [1.5, 0, 0.0], rot: -0.35 },
    ]}
  />
);

// Tarjeta de título amarilla con el logo y el elenco
const TarjetaAmarilla: TarjetaTitulo = ({ reparto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 3, fps, config: { damping: 9, stiffness: 140 } });
  return (
    <AbsoluteFill style={{ background: AMARILLO, alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ opacity: 0.12, transform: `rotate(${frame * 0.5}deg) scale(2.4)` }}>
        <div style={{ width: "100%", height: "100%", background: "repeating-conic-gradient(#000 0deg 10deg, transparent 10deg 20deg)" }} />
      </AbsoluteFill>
      <div style={{ ...estiloContorno, fontSize: 150, transform: `scale(${logo}) rotate(-4deg)`, textAlign: "center", lineHeight: 0.9 }}>
        LA
        <br />
        OFICINITA
        <br />
        <span style={{ color: "#e63946" }}>MX</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, marginTop: 50, maxWidth: 950 }}>
        {Object.values(reparto).map((m, i) => (
          <div
            key={m.nombre}
            style={{
              background: m.color,
              color: "white",
              fontFamily: FUENTE,
              fontSize: 44,
              padding: "8px 22px",
              borderRadius: 16,
              border: "4px solid #000",
              transform: `scale(${spring({ frame: frame - 20 - i * 6, fps, config: { damping: 10 } })}) rotate(${i % 2 ? 3 : -3}deg)`,
            }}
          >
            {m.nombre}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Cortinilla: franja amarilla diagonal que cruza la pantalla con el logo
const DURACION_CORTINILLA = 20;
const Cortinilla: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 8, 12, DURACION_CORTINILLA], [-130, 0, 0, 130], fijo);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateX(${x}%) skewX(-12deg)`, background: AMARILLO, borderLeft: "24px solid #000", borderRight: "24px solid #000", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...estiloContorno, fontSize: 110, transform: "skewX(12deg) rotate(-4deg)", textAlign: "center", lineHeight: 0.9 }}>
          LA OFICINITA <span style={{ color: "#e63946" }}>MX</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const L = (id: string) => EP1.lineas.find((l) => l.id === id)!;
const finRisa = (id: string) => EP1.risas.find((r) => r.id === id)?.hasta ?? fin(L(id));
// Cortinillas: al abrir, y después de los chistes grandes de la segunda mitad
const CORTINILLAS = [0, finRisa("06") - 10, finRisa("08") - 10];

const Extras: React.FC = () => (
  <>
    {CORTINILLAS.map((d) => (
      <Sequence key={d} from={d} durationInFrames={DURACION_CORTINILLA} layout="none">
        <Cortinilla />
        <Sonido archivo="sonidos/whoosh.wav" desde={0} volumen={0.45} />
      </Sequence>
    ))}
    <Sonido archivo="sonidos/brillo.wav" desde={L("04").inicio} volumen={0.35} />
    <Sonido archivo="sonidos/rimshot.wav" desde={fin(L("04")) - 2} volumen={0.4} />
    <Sonido archivo="sonidos/vine-boom.wav" desde={L("06").inicio - 2} volumen={0.4} />
    <Sonido archivo="sonidos/scratch.wav" desde={L("08").inicio + 30} volumen={0.3} />
    <Sonido archivo="sonidos/golpe.wav" desde={L("09").inicio - 2} volumen={0.5} />
    <Sonido archivo="sonidos/procesando.wav" desde={L("11").inicio} hasta={L("11").inicio + 45} volumen={0.3} />
    <Sonido archivo="sonidos/error.wav" desde={L("11").inicio + 50} volumen={0.4} />
    <Sonido archivo="sonidos/bip-robot.wav" desde={fin(L("11")) - 15} volumen={0.4} />
  </>
);

export const PilotoOficinita: React.FC = () => (
  <EpisodioSitcom ep={EP1} reparto={REPARTO_MX} gancho="Cuando tu jefe descubre la IA" escenario={Set} tarjeta={TarjetaAmarilla} encima={<Extras />} />
);
