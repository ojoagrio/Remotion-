import { GuionEpisodio, prepararEpisodio } from "../../sitcom/motor/datos";
import { EpisodioSitcom } from "../../sitcom/motor/Episodio";
import { Sala } from "../Sala";
import { POSICIONES_SALA, REPARTO } from "../serie";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";

// «Mensaje enviado», episodio 2 «Modo mamá»: Laura le instala la IA a su mamá... error.
export const EP_MODO_MAMA = prepararEpisodio(guion as GuionEpisodio, duraciones, envolventes, POSICIONES_SALA);

// En este episodio la mamá está desde el principio
const REPARTO_EP2 = { ...REPARTO, mama: { ...REPARTO.mama, inicial: { visible: true } } };

export const ModoMama: React.FC = () => (
  <EpisodioSitcom ep={EP_MODO_MAMA} reparto={REPARTO_EP2} escenario={Sala} gancho="Le instalé la IA a mi mamá. Error." />
);
