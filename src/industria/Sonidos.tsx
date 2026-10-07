import { fin } from "../comun/lineaDeTiempo";
import { Sonido } from "../comun/Sonido";
import { L, LINEAS, T } from "./tiempos";

const s = (nombre: string) => `sonidos/${nombre}.wav`;

// Banda sonora de «La industria tech»: ritmo trap, glitch en los cortes y «boom» en los remates
export const Sonidos: React.FC = () => {
  const cortes = [L(2).inicio, L(3).inicio, L(4).inicio, L(5).inicio, L(6).inicio, L(7).inicio];
  const remates = [T.doler, T.rompio, T.innovacion, T.leer, T.quemado, T.tu];
  return (
    <>
      <Sonido archivo={s("glitch")} desde={0} volumen={0.35} />
      <Sonido
        archivo={s("musica-trap")}
        desde={2}
        volumen={0.3}
        bajarConVoces={{ lineas: LINEAS, volumen: 0.11 }}
        fundido={6}
        bucle
      />
      {cortes.map((c) => (
        <Sonido key={`g${c}`} archivo={s("glitch")} desde={c - 1} volumen={0.18} />
      ))}
      {cortes.map((c) => (
        <Sonido key={`w${c}`} archivo={s("whoosh")} desde={c - 6} volumen={0.3} />
      ))}
      {remates.map((r) => (
        <Sonido key={r} archivo={s("vine-boom")} desde={r} volumen={0.5} />
      ))}

      {/* Despidos: «puf» de cada trabajador y llegada de los robots */}
      {[0, 1, 2, 3].map((i) => (
        <Sonido key={`p${i}`} archivo={s("pop")} desde={T.despiden + i * 5} volumen={0.35} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Sonido key={`b${i}`} archivo={s("bip-robot")} desde={T.ia3 + i * 5} volumen={0.18} />
      ))}

      {/* Juntas: teclado de los agentes */}
      <Sonido archivo={s("teclado")} desde={T.doce} hasta={T.nadie} volumen={0.25} fundido={4} />

      {/* Vitrina: brillo al aparecer cada producto, la tostadora salta y se quema */}
      {[T.refri, T.cepillo, T.tostadora].map((t) => (
        <Sonido key={t} archivo={s("brillo")} desde={t - 3} volumen={0.3} />
      ))}
      <Sonido archivo={s("plaf")} desde={T.pan} volumen={0.45} />
      <Sonido archivo={s("error")} desde={T.pan + 18} volumen={0.2} />

      {/* Giro y llamada final */}
      <Sonido archivo={s("ding")} desde={T.alguien} volumen={0.3} />
      <Sonido archivo={s("bip-robot")} desde={T.prueba} volumen={0.35} />
      <Sonido archivo={s("actualizacion")} desde={fin(L(7)) - 2} volumen={0.4} />
    </>
  );
};
