import { fin } from "../comun/lineaDeTiempo";
import { Sonido } from "../comun/Sonido";
import { DUELO, DUELO_CHANCLA, DUELO_ROBOT, ESCAPE, FINAL, L, LAVADO, LINEAS } from "./tiempos";

const s = (nombre: string) => `sonidos/${nombre}.wav`;

// Banda sonora de «La chancla»
export const Sonidos: React.FC = () => {
  const voces = { lineas: LINEAS, volumen: 0.07 };
  return (
    <>
      {/* Polka de cocina hasta que la IA se niega: ahí se raya el disco */}
      <Sonido
        archivo={s("musica-polka")}
        desde={0}
        hasta={fin(L(4)) + 2}
        volumen={0.22}
        bajarConVoces={voces}
        fundido={5}
        bucle
      />
      <Sonido archivo={s("bip-robot")} desde={L(2).inicio - 8} volumen={0.35} />
      <Sonido archivo={s("brillo")} desde={L(2).inicio + 8} volumen={0.4} />

      {/* «¿Quinoa?»: golpe de zoom y barrido hacia la torre de trastes */}
      <Sonido archivo={s("impacto")} desde={L(3).inicio} volumen={0.4} />
      <Sonido archivo={s("whoosh")} desde={L(3).inicio + 76} volumen={0.55} />

      <Sonido archivo={s("bip-robot")} desde={L(4).inicio - 8} volumen={0.3} />
      <Sonido archivo={s("scratch")} desde={fin(L(4)) - 2} volumen={0.6} />

      {/* Duelo del viejo oeste */}
      <Sonido archivo={s("silbido-western")} desde={DUELO + 2} volumen={0.45} />
      <Sonido archivo={s("gota")} desde={DUELO_ROBOT + 6} volumen={0.5} />
      <Sonido archivo={s("dun-dun-dunnn")} desde={DUELO_CHANCLA} volumen={0.5} />
      <Sonido archivo={s("plaf")} desde={L(5).inicio - 6} volumen={0.7} />

      {/* Pánico: el robot sale disparado, lava, se instala la actualización */}
      <Sonido archivo={s("impacto")} desde={L(6).inicio} volumen={0.35} />
      <Sonido archivo={s("whoosh-largo")} desde={ESCAPE - 4} volumen={0.5} />
      <Sonido archivo={s("burbujas")} desde={ESCAPE + 10} hasta={FINAL + 30} volumen={0.3} fundido={6} bucle />
      <Sonido archivo={s("actualizacion")} desde={L(6).inicio + 93} volumen={0.45} />

      {/* Cámara rápida con la polka acelerada y remate */}
      <Sonido
        archivo={s("musica-polka")}
        desde={LAVADO}
        volumen={0.22}
        velocidad={1.6}
        fundido={4}
      />
      <Sonido archivo={s("rimshot")} desde={FINAL + 4} volumen={0.6} />
      <Sonido archivo={s("ding")} desde={LAVADO + 60} volumen={0.3} />
    </>
  );
};
