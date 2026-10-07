import { interpolate } from "remotion";
import { fijo, fin } from "../../comun/lineaDeTiempo";
import { DatosPresentacion, duracionPresentacion, HojaModelo, Presentacion } from "../Presentacion";
import { PATY } from "../elenco";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";

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
