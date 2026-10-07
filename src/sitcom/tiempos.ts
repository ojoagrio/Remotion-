import { crearLineas, fin } from "../comun/lineaDeTiempo";
import duraciones from "./duraciones.json";
import guion from "./guion.json";

export type Quien = "raul" | "sofi" | "tono" | "kai";
export const FPS = 30;

// La presentación con la canción de la serie va justo después de la línea marcada con "tema"
export const TITULO_SEG = 5;
const RISA_ANTES_DEL_TITULO = 2.0;
type LineaGuion = (typeof guion.lineas)[number] & { tema?: boolean; risa?: string; pausa?: number };
const lineas = (guion.lineas as LineaGuion[]).map((l) => ({ ...l, pausa: (l.pausa ?? 0) + (l.tema ? TITULO_SEG : 0) }));

export const LINEAS = crearLineas<Quien>(lineas, duraciones, { inicio: 0.8, fps: FPS, pausa: 0.25 });
export const L = (n: number) => LINEAS[n - 1];

const lineaTema = lineas.findIndex((l) => l.tema) + 1;
export const TITULO = fin(L(lineaTema)) + Math.round(RISA_ANTES_DEL_TITULO * FPS);
export const TITULO_FIN = TITULO + TITULO_SEG * FPS;

// Risas grabadas: empiezan justo al terminar el remate y duran lo que su pausa
const ARCHIVO_RISA: Record<string, string> = {
  chica: "risa-chica",
  grande: "risa-grande",
  ooh: "ooh",
  aplauso: "risa-aplauso",
};
export const RISAS = lineas
  .map((l, i) => ({ l, linea: LINEAS[i] }))
  .filter(({ l }) => l.risa)
  .map(({ l, linea }) => ({
    linea: Number(linea.id),
    tipo: l.risa as string,
    archivo: ARCHIVO_RISA[l.risa as string],
    desde: fin(linea) - 3,
    hasta: fin(linea) + Math.round(((l.tema ? RISA_ANTES_DEL_TITULO + 0.6 : l.pausa) ?? 1) * FPS),
  }));

// Final: imagen congelada y créditos mientras siguen los aplausos
export const CONGELAR = fin(L(18)) + 24;
export const DURACION = fin(L(18)) + 6 * FPS;
