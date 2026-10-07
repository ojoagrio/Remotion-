import { fin } from "../../comun/lineaDeTiempo";
import { Sonido } from "../../comun/Sonido";
import { GuionEpisodio, prepararEpisodio } from "../../sitcom/motor/datos";
import { EpisodioSitcom } from "../../sitcom/motor/Episodio";
import { Cortinillas, finRisa, lineaDe, POSICIONES_MX, REPARTO_MX, SetOficinita, TarjetaAmarilla } from "../serie";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";

// La Oficinita MX · Episodio 2: «Para el viernes». El CEO promete una app con IA para mañana.

export const EP2 = prepararEpisodio(guion as unknown as GuionEpisodio, duraciones, envolventes, POSICIONES_MX);

const L = (id: string) => lineaDe(EP2, id);
// Cortinillas: al abrir y después del pánico de Nova
const CORTINILLAS = [0, finRisa(EP2, "07") - 10];

const Extras: React.FC = () => (
  <>
    <Cortinillas desde={CORTINILLAS} />
    <Sonido archivo="sonidos/alarma.wav" desde={L("02").inicio} hasta={L("02").inicio + 40} volumen={0.2} />
    <Sonido archivo="sonidos/brillo.wav" desde={L("04").inicio} volumen={0.35} />
    <Sonido archivo="sonidos/rimshot.wav" desde={fin(L("04")) - 2} volumen={0.4} />
    <Sonido archivo="sonidos/golpe.wav" desde={L("06").inicio} volumen={0.4} />
    <Sonido archivo="sonidos/vine-boom.wav" desde={L("07").inicio - 2} volumen={0.4} />
    <Sonido archivo="sonidos/teclado.wav" desde={L("09").inicio} hasta={L("09").inicio + 40} volumen={0.3} />
    <Sonido archivo="sonidos/ding.wav" desde={L("09").inicio + 4} volumen={0.4} />
    <Sonido archivo="sonidos/dun-dun-dunnn.wav" desde={L("10").inicio} volumen={0.45} />
    <Sonido archivo="sonidos/bip-robot.wav" desde={L("11").inicio - 4} volumen={0.35} />
  </>
);

export const ParaElViernes: React.FC = () => (
  <EpisodioSitcom ep={EP2} reparto={REPARTO_MX} gancho="La IA dijo «5 minutos»" escenario={SetOficinita} tarjeta={TarjetaAmarilla} encima={<Extras />} />
);
