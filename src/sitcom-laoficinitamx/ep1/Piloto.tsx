import { fin } from "../../comun/lineaDeTiempo";
import { Sonido } from "../../comun/Sonido";
import { GuionEpisodio, prepararEpisodio } from "../../sitcom/motor/datos";
import { EpisodioSitcom } from "../../sitcom/motor/Episodio";
import { Cortinillas, finRisa, lineaDe, POSICIONES_MX, REPARTO_MX, SetOficinita, TarjetaAmarilla } from "../serie";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";

// La Oficinita MX · Episodio 1 (piloto): «IA para todo». El CEO anuncia que usarán IA para TODO.

export const EP1 = prepararEpisodio(guion as GuionEpisodio, duraciones, envolventes, POSICIONES_MX);

const L = (id: string) => lineaDe(EP1, id);
// Cortinillas: al abrir, y después de los chistes grandes de la segunda mitad
const CORTINILLAS = [0, finRisa(EP1, "06") - 10, finRisa(EP1, "08") - 10];

const Extras: React.FC = () => (
  <>
    <Cortinillas desde={CORTINILLAS} />
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
  <EpisodioSitcom ep={EP1} reparto={REPARTO_MX} gancho="Cuando tu jefe descubre la IA" escenario={SetOficinita} tarjeta={TarjetaAmarilla} encima={<Extras />} />
);
