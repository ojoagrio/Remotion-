import { DatosPresentacion, duracionPresentacion, HojaModelo, Presentacion } from "../Presentacion";
import { JUANITO } from "../elenco";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";

const DATOS: DatosPresentacion = {
  ficha: JUANITO,
  guion,
  duraciones,
  envolventes,
  chips: ["Simpático", "Bromista", "Ama el modo oscuro"],
  simbolos: ["</>", "{ }", ";", "=>", "git push", "0101"],
};

export const DURACION_PRESENTACION = duracionPresentacion(DATOS);
export const PresentacionJuanito: React.FC = () => <Presentacion datos={DATOS} />;
export const HojaModeloJuanito: React.FC = () => <HojaModelo ficha={JUANITO} />;
