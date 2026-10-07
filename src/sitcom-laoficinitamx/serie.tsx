import { AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fijo, fin } from "../comun/lineaDeTiempo";
import { Sonido } from "../comun/Sonido";
import { estiloContorno, FUENTE } from "../comun/Textos";
import { CEO, comoMiembro, JUANITO, PATY } from "../personajes/elenco";
import { ColoresNova, DisenoNova } from "../personajes/nova/Nova3D";
import { Startup } from "../sitcom/Startup";
import { Episodio, Posiciones } from "../sitcom/motor/datos";
import { Miembro, TarjetaTitulo } from "../sitcom/motor/Episodio";
import nova from "./personajes/nova/nova.json";

// Piezas compartidas por todos los episodios de La Oficinita MX: elenco, set,
// posiciones, tarjeta de título y cortinillas amarillas.

export const AMARILLO = "#ffe600";

export const POSICIONES_MX: Posiciones = {
  juanito: { pos: [-1.5, 0, 0.0], rot: 0.12 },
  // Paty (bajita) frente al escritorio de la derecha; Nova flota alto entre ella y el CEO
  paty: { pos: [1.2, 0, 1.6], rot: -0.3 },
  ceo: { pos: [-0.55, 0, 1.25], rot: 0.1 },
  nova: { pos: [0.4, 0, 1.4], rot: -0.15 },
};

export const REPARTO_MX: Record<string, Miembro> = {
  ceo: comoMiembro(CEO, { brazos: "jarras" }),
  juanito: comoMiembro(JUANITO, { postura: "sentado", brazos: "teclea" }),
  paty: { ...comoMiembro(PATY), escala: 0.82 },
  nova: { tipo: "nova", nombre: nova.nombre, color: nova.color, diseno: nova.diseno as DisenoNova, colores: nova.colores as ColoresNova, altura: 2.2, escala: 0.8, inicial: { cara: "feliz" } },
};

export const SetOficinita: React.FC<{ frame: number }> = ({ frame }) => (
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

// Fondo de rayos amarillos y blancos que parten del centro (girando)
export const Rayos: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ background: AMARILLO, overflow: "hidden" }}>
    <AbsoluteFill style={{ transform: `rotate(${frame * 0.8}deg) scale(2.6)` }}>
      <div style={{ width: "100%", height: "100%", background: `repeating-conic-gradient(from 0deg at 50% 50%, #ffffff 0deg 9deg, ${AMARILLO} 9deg 18deg)` }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 45%)" }} />
  </AbsoluteFill>
);

// Tarjeta de título amarilla con el logo y el elenco
export const TarjetaAmarilla: TarjetaTitulo = ({ reparto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 3, fps, config: { damping: 9, stiffness: 140 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Rayos frame={frame} />
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

// Cortinilla: los rayos amarillos y blancos se abren desde el centro, aparece el logo y se cierran
export const DURACION_CORTINILLA = 22;
export const Cortinilla: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const radio = interpolate(frame, [0, 7, 15, DURACION_CORTINILLA], [0, 120, 120, 0], fijo);
  const logo = spring({ frame: frame - 4, fps, config: { damping: 9, stiffness: 180 } });
  const sale = interpolate(frame, [14, 19], [1, 0], fijo);
  return (
    <AbsoluteFill style={{ clipPath: `circle(${radio}% at 50% 50%)` }}>
      <Rayos frame={frame * 3} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...estiloContorno, fontSize: 120, transform: `scale(${logo * sale}) rotate(-4deg)`, textAlign: "center", lineHeight: 0.9 }}>
          LA
          <br />
          OFICINITA
          <br />
          <span style={{ color: "#e63946" }}>MX</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Utilidades para ubicar momentos del episodio
export const lineaDe = (ep: Episodio, id: string) => ep.lineas.find((l) => l.id === id)!;
export const finRisa = (ep: Episodio, id: string) => ep.risas.find((r) => r.id === id)?.hasta ?? fin(lineaDe(ep, id));

// Cortinillas (con su whoosh) en los frames indicados
export const Cortinillas: React.FC<{ desde: number[] }> = ({ desde }) => (
  <>
    {desde.map((d) => (
      <Sequence key={d} from={d} durationInFrames={DURACION_CORTINILLA} layout="none">
        <Cortinilla />
        <Sonido archivo="sonidos/whoosh.wav" desde={0} volumen={0.45} />
      </Sequence>
    ))}
  </>
);

// Sello «¡PASÓ DE VERDAD!» para cuando se cita el caso real del episodio
export const PasoDeVerdad: React.FC<{ detalle: string }> = ({ detalle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 8, stiffness: 180 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
      <div style={{ transform: `scale(${pop}) rotate(-5deg)`, background: AMARILLO, border: "6px solid #000", borderRadius: 18, padding: "10px 28px", textAlign: "center", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>
        <div style={{ fontFamily: FUENTE, fontSize: 64, color: "#e63946" }}>¡PASÓ DE VERDAD!</div>
        <div style={{ fontFamily: FUENTE, fontSize: 30, color: "#000" }}>{detalle}</div>
      </div>
    </AbsoluteFill>
  );
};
