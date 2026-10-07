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
  color: "#3a86ff",
  colores: {
    piel: "#e8b08a",
    camisa: "#3a86ff", // sudadera azul eléctrico
    pantalon: "#3d5a80", // jeans
    sombrero: "#3a86ff",
    zapatos: "#e63946", // tenis rojos
    gorra: false,
    bigote: false,
    cabello: "#1d1d1d",
    lentes: true,
    copete: true,
    emblema: "</>",
    audifonos: "#ffbe0b",
  },
  // ElevenLabs: «Gil – Cálida, natural y mexicana»
  voz: { id: "SzatlCk7ZMTGly6rtgt4", nombre: "Gil", ajustes: { stability: 0.0, similarity_boost: 0.8 } },
  personalidad: [
    "Simpático y bromista: todo lo convierte en chiste de programador",
    "Optimista incluso con producción caída",
    "Ama el café, los atajos de teclado y el modo oscuro",
  ],
  muletillas: [
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
