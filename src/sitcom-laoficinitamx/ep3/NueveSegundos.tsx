import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fin } from "../../comun/lineaDeTiempo";
import { Sonido } from "../../comun/Sonido";
import { FUENTE } from "../../comun/Textos";
import { GuionEpisodio, prepararEpisodio } from "../../sitcom/motor/datos";
import { EpisodioSitcom } from "../../sitcom/motor/Episodio";
import { AMARILLO, Cortinillas, finRisa, lineaDe, POSICIONES_MX, REPARTO_MX, SetOficinita, TarjetaAmarilla } from "../serie";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";

// La Oficinita MX · Episodio 3: «Nueve segundos». Nova recibe acceso de administrador y borra
// la base de datos (y los respaldos). Basado en el caso real de PocketOS (abril 2026).

export const EP3_MX = prepararEpisodio(guion as unknown as GuionEpisodio, duraciones, envolventes, POSICIONES_MX);

const L = (id: string) => lineaDe(EP3_MX, id);
const CORTINILLAS = [0, finRisa(EP3_MX, "06") - 10];

// Sello «PASÓ DE VERDAD» mientras Paty cuenta el caso real
const PasoDeVerdad: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 8, stiffness: 180 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
      <div style={{ transform: `scale(${pop}) rotate(-5deg)`, background: AMARILLO, border: "6px solid #000", borderRadius: 18, padding: "10px 28px", textAlign: "center", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>
        <div style={{ fontFamily: FUENTE, fontSize: 64, color: "#e63946" }}>¡PASÓ DE VERDAD!</div>
        <div style={{ fontFamily: FUENTE, fontSize: 30, color: "#000" }}>IA borra empresa en 9 s · abril 2026</div>
      </div>
    </AbsoluteFill>
  );
};

const Extras: React.FC = () => (
  <>
    <Cortinillas desde={CORTINILLAS} />
    <Sequence from={L("07").inicio} durationInFrames={L("07").duracion + 20} layout="none">
      <PasoDeVerdad />
    </Sequence>
    <Sonido archivo="sonidos/brillo.wav" desde={L("01").inicio + 40} volumen={0.35} />
    <Sonido archivo="sonidos/burbujas.wav" desde={L("02").inicio} hasta={L("02").inicio + 45} volumen={0.3} />
    <Sonido archivo="sonidos/ding.wav" desde={L("02").inicio + 4} volumen={0.4} />
    <Sonido archivo="sonidos/grillos.wav" desde={fin(L("02"))} hasta={L("03").inicio + 20} volumen={0.35} />
    <Sonido archivo="sonidos/error.wav" desde={L("04").inicio} volumen={0.35} />
    <Sonido archivo="sonidos/rimshot.wav" desde={fin(L("04")) - 2} volumen={0.4} />
    <Sonido archivo="sonidos/vine-boom.wav" desde={L("06").inicio - 2} volumen={0.4} />
    <Sonido archivo="sonidos/impacto.wav" desde={L("07").inicio} volumen={0.4} />
    <Sonido archivo="sonidos/golpe.wav" desde={L("09").inicio - 2} volumen={0.5} />
    <Sonido archivo="sonidos/teclado.wav" desde={L("10").inicio} hasta={L("10").inicio + 50} volumen={0.3} />
    <Sonido archivo="sonidos/dun-dun-dunnn.wav" desde={L("11").inicio} volumen={0.45} />
  </>
);

export const NueveSegundos: React.FC = () => (
  <EpisodioSitcom ep={EP3_MX} reparto={REPARTO_MX} gancho="Le di acceso total a la IA. Error." escenario={SetOficinita} tarjeta={TarjetaAmarilla} encima={<Extras />} />
);
