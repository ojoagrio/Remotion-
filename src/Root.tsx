import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { EscenaEncuentro } from "./n64/EscenaEncuentro";

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
    </>
  );
};
