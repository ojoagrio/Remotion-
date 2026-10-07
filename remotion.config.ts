// Configuración de Remotion: https://www.remotion.dev/docs/config
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// En servidores sin GPU: REMOTION_GL=swangle npm run render:...
if (process.env.REMOTION_GL) {
  Config.setChromiumOpenGlRenderer(process.env.REMOTION_GL as "swangle" | "angle" | "egl" | "swiftshader");
}
// Por defecto Remotion usa la mitad de los núcleos; REMOTION_CONCURRENCY permite subirlo
if (process.env.REMOTION_CONCURRENCY) {
  Config.setConcurrency(Number(process.env.REMOTION_CONCURRENCY));
}
