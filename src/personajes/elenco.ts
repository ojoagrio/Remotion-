import { ColoresPersonaje } from "../n64/Personaje";
import type { Miembro } from "../sitcom/motor/Episodio";
import type { Estado } from "../sitcom/motor/datos";

// Elenco fijo: cada personaje tiene SIEMPRE el mismo aspecto, la misma voz y la misma
// personalidad en cualquier video o serie. Para usarlo en un guion, copia su "voz" en
// "voces"/"ajustes" del guion y su miembro en el reparto con comoMiembro().

export type FichaPersonaje = {
  id: string;
  nombre: string;
  rol: string;
  color: string; // color de su etiqueta en subtítulos
  colores: ColoresPersonaje;
  voz: { id: string; nombre: string; ajustes: { stability: number; similarity_boost: number } };
  personalidad: string[];
  muletillas: string[];
};

export const JUANITO: FichaPersonaje = {
  id: "juanito",
  nombre: "JUANITO",
  rol: "Desarrollador de software",
  color: "#ffbe0b",
  // Look oficial: propuesta A «Lentes XL» (bomber negra, lentes gigantes con cristal azul)
  colores: {
    piel: "#e8b08a",
    camisa: "#ffbe0b", // playera amarilla
    chaqueta: "#1b1b1f", // bomber negra
    pantalon: "#8d7b68", // cargo
    sombrero: "#1b1b1f",
    zapatos: "#f8f9fa", // tenis blancos
    gorra: false,
    bigote: false,
    cabello: "#1d1d1d",
    lentes: true,
    lentesCristal: "#4cc9f0",
    copete: true,
    emblema: "</>",
    audifonos: "#ffbe0b",
    rasgos: { lentes: 1.65, sonrisa: 0.35 },
  },
  // ElevenLabs: «Javi – Social Media» (mexicano, casual y con flow)
  voz: { id: "HxRDsm0E8jdUUrG0lqbK", nombre: "Javi", ajustes: { stability: 0.0, similarity_boost: 0.8 } },
  personalidad: [
    "Simpático y bromista: todo lo convierte en chiste de programador",
    "Optimista incluso con producción caída",
    "Ama el café, los atajos de teclado y el modo oscuro",
  ],
  muletillas: [
    "Aquí se programa con flow.",
    "No es un bug, es una funcionalidad sorpresa.",
    "En mi máquina sí funciona.",
    "Dame cinco minutos (de programador).",
  ],
};

export const ELENCO: Record<string, FichaPersonaje> = { juanito: JUANITO };

// Convierte una ficha en miembro del reparto del motor de sitcom
export const comoMiembro = (p: FichaPersonaje, inicial?: Partial<Estado>): Miembro => ({
  tipo: "humano",
  nombre: p.nombre,
  color: p.color,
  colores: p.colores,
  inicial,
});
