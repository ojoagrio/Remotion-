import { GuionEpisodio, prepararEpisodio } from "../motor/datos";
import { EpisodioSitcom, persona, REPARTO } from "../motor/Episodio";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";

// Episodio 3 «Gemelo digital» (vertical): Sofi manda a su gemelo digital a la junta y acepta todo
export const EP3 = prepararEpisodio(guion as GuionEpisodio, duraciones, envolventes, {
  // El gemelo ocupa el escritorio de Sofi; la Sofi real entra por delante al final
  avatar: { pos: [-1.5, 0, 0.0], rot: 0.35 },
  sofi: { pos: [-1.45, 0, 1.55], rot: 0.5 },
});

const REPARTO_EP3 = {
  raul: REPARTO.raul,
  tono: REPARTO.tono,
  kai: REPARTO.kai,
  avatar: {
    tipo: "humano" as const,
    nombre: "SOFI 2.0 (GEMELO DIGITAL)",
    color: "#4cc9f0",
    // Versión "digital": piel y ropa en tonos azul holograma
    colores: persona("#4cc9f0", "#3a0ca3", "#3a86ff", { piel: "#a9def9", lentes: true, mono: "#80ffdb" }),
    inicial: { postura: "sentado" as const, brazos: "teclea" as const },
  },
  sofi: { ...REPARTO.sofi, inicial: { visible: false } },
};

export const GemeloDigital: React.FC = () => (
  <EpisodioSitcom ep={EP3} reparto={REPARTO_EP3} gancho="Mandé a mi gemelo digital a la junta. Error." />
);
