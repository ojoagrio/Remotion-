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
import { Sitcom } from "./sitcom/Sitcom";
import { DURACION as DURACION_SITCOM } from "./sitcom/tiempos";
import { EP2, SitcomEp2 } from "./sitcom/ep2/SitcomEp2";
import { EP_MENSAJE, MensajeEnviado } from "./mensaje/MensajeEnviado";
import { EP_MODO_MAMA, ModoMama } from "./mensaje/ep2/ModoMama";
import { EP3, GemeloDigital } from "./sitcom/ep3/GemeloDigital";
import { DURACION_PRESENTACION, HojaModeloJuanito, PresentacionJuanito } from "./personajes/juanito/Presentacion";
import { PropuestasJuanito } from "./personajes/juanito/Propuestas";

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
      {/* Sitcom en horizontal 16:9 */}
      <Composition
        id="Sitcom"
        component={Sitcom}
        durationInFrames={DURACION_SITCOM}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* Episodio 2 en vertical (TikTok), hecho con el motor de episodios */}
      <Composition id="SitcomEp2" component={SitcomEp2} durationInFrames={EP2.duracion} fps={30} width={1080} height={1920} />
      {/* Nueva sitcom: «Mensaje enviado» (vertical) */}
      <Composition id="MensajeEnviado" component={MensajeEnviado} durationInFrames={EP_MENSAJE.duracion} fps={30} width={1080} height={1920} />
      <Composition id="ModoMama" component={ModoMama} durationInFrames={EP_MODO_MAMA.duracion} fps={30} width={1080} height={1920} />
      <Composition id="GemeloDigital" component={GemeloDigital} durationInFrames={EP3.duracion} fps={30} width={1080} height={1920} />
      {/* Elenco fijo: presentación y hoja de modelo de cada personaje */}
      <Composition id="PresentacionJuanito" component={PresentacionJuanito} durationInFrames={DURACION_PRESENTACION} fps={30} width={1080} height={1920} />
      <Composition id="HojaModeloJuanito" component={HojaModeloJuanito} durationInFrames={1} fps={30} width={1920} height={1080} />
      <Composition id="PropuestasJuanito" component={PropuestasJuanito} durationInFrames={1} fps={30} width={1920} height={1080} />
    </>
  );
};
