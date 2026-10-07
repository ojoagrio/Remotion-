import { prepararEpisodio, GuionEpisodio } from "../motor/datos";
import { EpisodioSitcom, REPARTO } from "../motor/Episodio";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";

// Episodio 2 «Vacaciones» (vertical): KAI pide vacaciones y deja a KAI Lite a cargo
export const EP2 = prepararEpisodio(guion as GuionEpisodio, duraciones, envolventes);

const REPARTO_EP2 = {
  ...REPARTO,
  lite: { tipo: "robot" as const, nombre: "KAI LITE", color: "#2a9d8f", cuerpo: "#80ed99", escala: 0.6, inicial: { visible: false } },
};

export const SitcomEp2: React.FC = () => (
  <EpisodioSitcom ep={EP2} reparto={REPARTO_EP2} gancho="Cuando la IA de tu empresa pide vacaciones" />
);
