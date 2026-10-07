import { Posiciones } from "../sitcom/motor/datos";
import { Miembro, persona } from "../sitcom/motor/Episodio";

// Reparto y posiciones comunes de «Mensaje enviado» (todos los episodios ocurren en la sala)

export const REPARTO: Record<string, Miembro> = {
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

export const POSICIONES_SALA: Posiciones = {
  laura: { pos: [-0.65, 0, 0.15], rot: 0.15 },
  beto: { pos: [0.7, 0, 0.15], rot: -0.15 },
  nube: { pos: [0, 1.25, 1.55], rot: 0 },
  mama: { pos: [-1.15, 0, 1.25], rot: 0.45 },
};
