import { fin } from "../comun/lineaDeTiempo";
import { Sonido } from "../comun/Sonido";
import { ABUCHEO, DALI_T, INGLATERRA, JUANGA, L, LINEAS, PICASSO_T, TABASCO } from "./tiempos";

const s = (nombre: string) => `sonidos/${nombre}.wav`;

// Banda sonora de «El chisme»: synth-pop de fondo, cortinilla, abucheo y efectos
export const Sonidos: React.FC = () => {
  const voces = { lineas: LINEAS, volumen: 0.07 };
  const corazones = Array.from({ length: 10 }, (_, i) => L(4).inicio + 20 + i * 27);
  return (
    <>
      <Sonido archivo={s("sting-chisme")} desde={0} volumen={0.6} />
      {/* Música de fondo hasta el «¿pero no que ya no más gratis?» */}
      <Sonido
        archivo={s("musica-synthpop")}
        desde={12}
        hasta={L(6).inicio}
        volumen={0.2}
        bajarConVoces={{ ...voces, volumen: 0.09 }}
        fundido={8}
        bucle
      />
      <Sonido archivo={s("whoosh")} desde={JUANGA - 6} volumen={0.45} />
      <Sonido archivo={s("abucheo")} desde={ABUCHEO} volumen={0.4} />
      <Sonido archivo={s("whoosh")} desde={L(3).inicio - 6} volumen={0.4} />

      {/* El live: pitido de entrada, corazones, cuadros y avión */}
      <Sonido archivo={s("ding")} desde={L(4).inicio - 8} volumen={0.3} />
      {corazones.map((f) => (
        <Sonido key={f} archivo={s("pop")} desde={f} volumen={0.2} />
      ))}
      <Sonido archivo={s("whoosh")} desde={DALI_T - 4} volumen={0.35} />
      <Sonido archivo={s("whoosh")} desde={PICASSO_T - 4} volumen={0.35} />
      <Sonido archivo={s("whoosh-largo")} desde={INGLATERRA} volumen={0.4} />

      <Sonido archivo={s("whoosh")} desde={L(5).inicio - 6} volumen={0.35} />
      <Sonido archivo={s("brillo")} desde={TABASCO} volumen={0.35} />

      {/* «¿Pero no que ya no más gratis?»: se raya el disco y golpe */}
      <Sonido archivo={s("scratch")} desde={L(6).inicio - 4} volumen={0.55} />
      <Sonido archivo={s("impacto")} desde={L(6).inicio} volumen={0.35} />

      {/* Final en Tabasco: vuelve la música y remate */}
      <Sonido
        archivo={s("musica-synthpop")}
        desde={L(7).inicio - 4}
        volumen={0.2}
        bajarConVoces={{ ...voces, volumen: 0.12 }}
        fundido={6}
      />
      <Sonido archivo={s("rimshot")} desde={fin(L(7)) + 4} volumen={0.55} />
    </>
  );
};
