import { fin } from "../comun/lineaDeTiempo";
import { Sonido } from "../comun/Sonido";
import { L, LINEAS, T } from "./tiempos";

const s = (nombre: string) => `sonidos/${nombre}.wav`;

// Banda sonora del documental de Clawd
export const Sonidos: React.FC = () => {
  const voces = { lineas: LINEAS, volumen: 0.06 };
  return (
    <>
      {/* Noche en la terminal: grillos y después música 8 bits suave */}
      <Sonido archivo={s("grillos")} desde={0} hasta={L(2).inicio + 20} volumen={0.35} fundido={10} bucle />
      <Sonido archivo={s("musica-chiptune")} desde={L(2).inicio - 6} hasta={L(7).inicio} volumen={0.16} bajarConVoces={voces} fundido={12} bucle />
      <Sonido archivo={s("brillo")} desde={T.clawd - 4} volumen={0.4} />
      {[T.naranja, T.ojos, T.patitas].map((t) => (
        <Sonido key={t} archivo={s("pop")} desde={t - 2} volumen={0.35} />
      ))}
      {/* Pinzas: «clic, clic» */}
      {[0, 8, 16].map((d) => (
        <Sonido key={d} archivo={s("pop")} desde={T.claw + d} volumen={0.3} velocidad={1.5} />
      ))}
      <Sonido archivo={s("ding")} desde={T.claude + 4} volumen={0.3} />
      {/* $ claude y aparición */}
      <Sonido archivo={s("teclado")} desde={L(4).inicio} hasta={T.inicias + 25} volumen={0.3} fundido={3} />
      <Sonido archivo={s("bip-robot")} desde={T.inicias + 28} volumen={0.3} />
      {/* Conflictos de git */}
      <Sonido archivo={s("error")} desde={T.git} volumen={0.25} />
      <Sonido archivo={s("alarma")} desde={T.git + 4} hasta={L(6).inicio} volumen={0.08} fundido={6} />
      <Sonido archivo={s("ding")} desde={T.creyendo} volumen={0.35} />
      {/* Comunidad */}
      <Sonido archivo={s("whoosh")} desde={L(6).inicio - 6} volumen={0.3} />
      <Sonido archivo={s("brillo")} desde={T.tresD} volumen={0.35} />
      <Sonido archivo={s("burbujas")} desde={T.emojis} hasta={L(7).inicio} volumen={0.25} />
      {/* El misterio azul */}
      <Sonido archivo={s("misterio")} desde={L(7).inicio} hasta={L(8).inicio + 10} volumen={0.35} fundido={10} />
      <Sonido archivo={s("vine-boom")} desde={T.azul} volumen={0.35} />
      {/* Despedida */}
      <Sonido archivo={s("musica-chiptune")} desde={L(8).inicio} volumen={0.16} bajarConVoces={voces} fundido={10} />
      <Sonido archivo={s("ding")} desde={T.saludalo} volumen={0.3} />
      <Sonido archivo={s("actualizacion")} desde={fin(L(8)) + 6} volumen={0.3} />
    </>
  );
};
