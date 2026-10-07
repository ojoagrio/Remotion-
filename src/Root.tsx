import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { EscenaEncuentro } from "./n64/EscenaEncuentro";
import { YaVoySaliendo } from "./tiktok/YaVoySaliendo";
import { BugChiquito } from "./ia/BugChiquito";
import { ChanclaIA } from "./chancla/ChanclaIA";
import { ElChisme } from "./syntek/ElChisme";
import { DURACION as DURACION_CHISME } from "./syntek/tiempos";
import { Industria } from "./industria/Industria";
import { DURACION as DURACION_INDUSTRIA } from "./industria/tiempos";
import { Tipos } from "./tipos/Tipos";
import { DURACION as DURACION_TIPOS } from "./tipos/tiempos";
import { ClawdDocumental } from "./clawd/ClawdDocumental";
import { DURACION as DURACION_CLAWD } from "./clawd/tiempos";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ titulo: "¡Hola, Remotion!" }}
      />
      <Composition
        id="EscenaN64"
        component={EscenaEncuentro}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Formato TikTok: vertical 9:16, 30 segundos */}
      <Composition
        id="YaVoySaliendo"
        component={YaVoySaliendo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="BugChiquito"
        component={BugChiquito}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ChanclaIA"
        component={ChanclaIA}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* Parodia: la duración sale de los audios del guion */}
      <Composition
        id="ElChisme"
        component={ElChisme}
        durationInFrames={DURACION_CHISME}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Industria"
        component={Industria}
        durationInFrames={DURACION_INDUSTRIA}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="TiposIA"
        component={Tipos}
        durationInFrames={DURACION_TIPOS}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ClawdDocumental"
        component={ClawdDocumental}
        durationInFrames={DURACION_CLAWD}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
