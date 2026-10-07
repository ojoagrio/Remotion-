import { GuionEpisodio, prepararEpisodio } from "../sitcom/motor/datos";
import { EpisodioSitcom } from "../sitcom/motor/Episodio";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";
import { Sala } from "./Sala";
import { POSICIONES_SALA, REPARTO } from "./serie";

// «Mensaje enviado», episodio 1: Laura le pide a su asistente de IA que conteste «algo casual»
// a Marco... y la IA lo manda al grupo de la familia. Hecho con el motor de episodios.

export const EP_MENSAJE = prepararEpisodio(guion as GuionEpisodio, duraciones, envolventes, POSICIONES_SALA);

export const MensajeEnviado: React.FC = () => (
  <EpisodioSitcom ep={EP_MENSAJE} reparto={REPARTO} escenario={Sala} gancho="Cuando le pides a la IA un mensaje «casual»" />
);
