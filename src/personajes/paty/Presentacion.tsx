import { interpolate } from "remotion";
import { fijo, fin } from "../../comun/lineaDeTiempo";
import { DatosPresentacion, duracionPresentacion, HojaModelo, Presentacion } from "../Presentacion";
import { PATY } from "../elenco";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";
import patyJson from "../../sitcom-laoficinitamx/personajes/paty/paty.json";
import dur1 from "./voz1/duraciones.json";
import env1 from "./voz1/envolventes.json";
import guion1 from "./voz1/guion.json";
import dur2 from "./voz2/duraciones.json";
import env2 from "./voz2/envolventes.json";
import guion2 from "./voz2/guion.json";
import dur3 from "./voz3/duraciones.json";
import env3 from "./voz3/envolventes.json";
import guion3 from "./voz3/guion.json";

const DATOS: DatosPresentacion = {
  ficha: PATY,
  guion,
  duraciones,
  envolventes,
  chips: ["Sabelotodo", "Escéptica de la IA", "Cita sus fuentes"],
  simbolos: ["A+", "¿IA?", "π", "2+2=4", "ABC", "E=mc²"],
  poseChiste: "jarras",
  // Las coletas se levantan cuando dice «O sea... siempre» (y se quedan arriba un momento)
  aspecto: (f, L) => {
    const arriba = fin(L(2)) - 28;
    const coletas = interpolate(f, [arriba, arriba + 6, arriba + 40, arriba + 55], [1.9, 2.6, 2.6, 1.9], fijo);
    return { ...PATY.colores, rasgos: { ...PATY.colores.rasgos, coletas } };
  },
};

export const DURACION_PRESENTACION_PATY = duracionPresentacion(DATOS);
export const PresentacionPaty: React.FC = () => <Presentacion datos={DATOS} />;
export const HojaModeloPaty: React.FC = () => <HojaModelo ficha={PATY} />;

// Opciones de voz con acento: argentina, venezolana y colombiana
const VOCES = [
  { guion: guion1, duraciones: dur1, envolventes: env1 },
  { guion: guion2, duraciones: dur2, envolventes: env2 },
  { guion: guion3, duraciones: dur3, envolventes: env3 },
];
const OPCIONES: DatosPresentacion[] = VOCES.map((v, i) => ({
  ...DATOS,
  ...v,
  etiquetaVoz: `VOZ ${i + 1} · ${patyJson.vozOpciones[i].estilo}`,
}));
export const DURACIONES_PATY_VOCES = OPCIONES.map(duracionPresentacion);
export const PresentacionPaty1: React.FC = () => <Presentacion datos={OPCIONES[0]} />;
export const PresentacionPaty2: React.FC = () => <Presentacion datos={OPCIONES[1]} />;
export const PresentacionPaty3: React.FC = () => <Presentacion datos={OPCIONES[2]} />;
