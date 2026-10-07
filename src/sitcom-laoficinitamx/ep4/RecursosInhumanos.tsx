import { Sequence } from "remotion";
import { fin } from "../../comun/lineaDeTiempo";
import { Sonido } from "../../comun/Sonido";
import { GuionEpisodio, prepararEpisodio } from "../../sitcom/motor/datos";
import { EpisodioSitcom } from "../../sitcom/motor/Episodio";
import { Cortinillas, finRisa, lineaDe, PasoDeVerdad, POSICIONES_MX, REPARTO_MX, SetOficinita, TarjetaAmarilla } from "../serie";
import duraciones from "./duraciones.json";
import envolventes from "./envolventes.json";
import guion from "./guion.json";

// La Oficinita MX · Episodio 4: «Recursos inhumanos». El CEO pone a Nova a medir emociones y a
// decidir despidos. Basado en las leyes de California contra los «robo bosses» (sep 2026).

export const EP4_MX = prepararEpisodio(guion as unknown as GuionEpisodio, duraciones, envolventes, POSICIONES_MX);

const L = (id: string) => lineaDe(EP4_MX, id);
const CORTINILLAS = [0, finRisa(EP4_MX, "07") - 10];

const Extras: React.FC = () => (
  <>
    <Cortinillas desde={CORTINILLAS} />
    <Sequence from={L("05").inicio} durationInFrames={L("05").duracion + 20} layout="none">
      <PasoDeVerdad detalle="California prohíbe a la IA leer emociones · sep 2026" />
    </Sequence>
    <Sequence from={L("09").inicio} durationInFrames={L("09").duracion + 15} layout="none">
      <PasoDeVerdad detalle="Ley «No Robo Bosses»: un humano revisa los despidos" />
    </Sequence>
    <Sonido archivo="sonidos/procesando.wav" desde={L("01").inicio + 50} hasta={L("01").inicio + 90} volumen={0.3} />
    <Sonido archivo="sonidos/bip-robot.wav" desde={L("02").inicio - 4} volumen={0.35} />
    <Sonido archivo="sonidos/suspenso.wav" desde={L("03").inicio} hasta={L("04").inicio + 30} volumen={0.3} />
    <Sonido archivo="sonidos/rimshot.wav" desde={fin(L("04")) - 2} volumen={0.4} />
    <Sonido archivo="sonidos/impacto.wav" desde={L("05").inicio} volumen={0.35} />
    <Sonido archivo="sonidos/misterio.wav" desde={L("06").inicio} hasta={L("07").inicio + 40} volumen={0.3} />
    <Sonido archivo="sonidos/vine-boom.wav" desde={L("07").inicio - 2} volumen={0.4} />
    <Sonido archivo="sonidos/dun-dun-dunnn.wav" desde={L("08").inicio} volumen={0.45} />
    <Sonido archivo="sonidos/impacto.wav" desde={L("09").inicio} volumen={0.35} />
    <Sonido archivo="sonidos/ding.wav" desde={L("11").inicio + 25} volumen={0.45} />
  </>
);

export const RecursosInhumanos: React.FC = () => (
  <EpisodioSitcom ep={EP4_MX} reparto={REPARTO_MX} gancho="Tu jefe le pregunta a la IA a quién correr" escenario={SetOficinita} tarjeta={TarjetaAmarilla} encima={<Extras />} />
);
