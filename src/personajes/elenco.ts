import { ColoresPersonaje } from "../n64/Personaje";
import type { Miembro } from "../sitcom/motor/Episodio";
import type { Estado } from "../sitcom/motor/datos";
import juanito from "../sitcom-laoficinitamx/personajes/juanito/juanito.json";

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

// Fichas guardadas en src/sitcom-laoficinitamx (fuente única para reutilizarlas)
export const JUANITO = juanito as FichaPersonaje;

export const ELENCO: Record<string, FichaPersonaje> = { juanito: JUANITO };

// Convierte una ficha en miembro del reparto del motor de sitcom
export const comoMiembro = (p: FichaPersonaje, inicial?: Partial<Estado>): Miembro => ({
  tipo: "humano",
  nombre: p.nombre,
  color: p.color,
  colores: p.colores,
  inicial,
});
