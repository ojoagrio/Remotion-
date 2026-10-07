import { GuionEpisodio, prepararEpisodio } from "../sitcom/motor/datos";
import { EpisodioSitcom, Miembro, persona } from "../sitcom/motor/Episodio";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";
import { Sala } from "./Sala";

// «Mensaje enviado», episodio 1: Laura le pide a su asistente de IA que conteste «algo casual»
// a Marco... y la IA lo manda al grupo de la familia. Hecho con el motor de episodios.

const REPARTO: Record<string, Miembro> = {
  laura: {
    tipo: "humano",
    nombre: "LAURA",
    color: "#f4a261",
    colores: persona("#ffbe0b", "#3a0ca3", "#4a2c2a", { mono: "#ef476f" }),
    inicial: { postura: "sentado", brazos: "telefono" },
  },
  beto: {
    tipo: "humano",
    nombre: "BETO",
    color: "#6c757d",
    colores: persona("#adb5bd", "#264653", "#111", { bigote: true, gorra: true, sombrero: "#2a9d8f" }),
    inicial: { postura: "sentado" },
  },
  nube: { tipo: "robot", nombre: "NUBE (IA)", color: "#9d4edd", cuerpo: "#e0c3fc", escala: 0.55, inicial: { cara: "feliz" } },
  mama: {
    tipo: "humano",
    nombre: "MAMÁ",
    color: "#c1121f",
    colores: persona("#c1121f", "#5e3c99", "#bdbdbd", { chongo: true, mandil: "#fdf0d5", zapatos: "#ff5fa2" }),
    inicial: { visible: false },
  },
};

export const EP_MENSAJE = prepararEpisodio(guion as GuionEpisodio, duraciones, envolventes, {
  laura: { pos: [-0.65, 0, 0.15], rot: 0.15 },
  beto: { pos: [0.7, 0, 0.15], rot: -0.15 },
  nube: { pos: [0, 1.25, 1.55], rot: 0 },
  mama: { pos: [-1.15, 0, 1.25], rot: 0.45 },
});

export const MensajeEnviado: React.FC = () => (
  <EpisodioSitcom ep={EP_MENSAJE} reparto={REPARTO} escenario={Sala} gancho="Cuando le pides a la IA un mensaje «casual»" />
);
