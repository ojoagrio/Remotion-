import ceoJson from "../../sitcom-laoficinitamx/personajes/ceo/ceo.json";
import { CEO } from "../elenco";
import { DatosPresentacion, MuestraVoz } from "../Presentacion";
import mdur1 from "./muestra1/duraciones.json";
import menv1 from "./muestra1/envolventes.json";
import mguion1 from "./muestra1/guion.json";
import mdur2 from "./muestra2/duraciones.json";
import menv2 from "./muestra2/envolventes.json";
import mguion2 from "./muestra2/guion.json";
import mdur3 from "./muestra3/duraciones.json";
import menv3 from "./muestra3/envolventes.json";
import mguion3 from "./muestra3/guion.json";

// Muestras de 5 s de las voces candidatas de Mr. CEO (look C)
const MUESTRAS: DatosPresentacion[] = [
  { guion: mguion1, duraciones: mdur1, envolventes: menv1 },
  { guion: mguion2, duraciones: mdur2, envolventes: menv2 },
  { guion: mguion3, duraciones: mdur3, envolventes: menv3 },
].map((v, i) => ({
  ficha: CEO,
  ...v,
  chips: [],
  simbolos: ["AI", "$$$", "KPI", "Q4", "ROI", "x10"],
  etiquetaVoz: `VOZ ${i + 1} · ${ceoJson.vozOpciones[i].estilo}`,
}));
export const MuestraCeo1: React.FC = () => <MuestraVoz datos={MUESTRAS[0]} />;
export const MuestraCeo2: React.FC = () => <MuestraVoz datos={MUESTRAS[1]} />;
export const MuestraCeo3: React.FC = () => <MuestraVoz datos={MUESTRAS[2]} />;
