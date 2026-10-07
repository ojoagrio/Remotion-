import { DatosPresentacion, duracionPresentacion, HojaModelo, MuestraVoz, Presentacion } from "../Presentacion";
import { JUANITO } from "../elenco";
import juanitoJson from "../../sitcom-laoficinitamx/personajes/juanito/juanito.json";
import mdur1 from "./muestra1/duraciones.json";
import menv1 from "./muestra1/envolventes.json";
import mguion1 from "./muestra1/guion.json";
import mdur2 from "./muestra2/duraciones.json";
import menv2 from "./muestra2/envolventes.json";
import mguion2 from "./muestra2/guion.json";
import mdur3 from "./muestra3/duraciones.json";
import menv3 from "./muestra3/envolventes.json";
import mguion3 from "./muestra3/guion.json";
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

// Muestras de 5 s de voces candidatas
const MUESTRAS: DatosPresentacion[] = [
  { guion: mguion1, duraciones: mdur1, envolventes: menv1 },
  { guion: mguion2, duraciones: mdur2, envolventes: menv2 },
  { guion: mguion3, duraciones: mdur3, envolventes: menv3 },
].map((v, i) => ({ ...DATOS, ...v, etiquetaVoz: `VOZ ${i + 1} · ${juanitoJson.vozOpciones[i].estilo}` }));
export const MuestraJuanito1: React.FC = () => <MuestraVoz datos={MUESTRAS[0]} />;
export const MuestraJuanito2: React.FC = () => <MuestraVoz datos={MUESTRAS[1]} />;
export const MuestraJuanito3: React.FC = () => <MuestraVoz datos={MUESTRAS[2]} />;
