import { fin } from "../comun/lineaDeTiempo";
import { Sonido } from "../comun/Sonido";
import { L, LINEAS, SECCIONES as S, T } from "./tiempos";

const s = (nombre: string) => `sonidos/${nombre}.wav`;

// Banda sonora de «5 tipos de personas usando la IA»
export const Sonidos: React.FC = () => {
  const cortes = [S.tipo1, S.tipo2, S.tipo3, S.tipo4, S.tipo5, S.cta];
  return (
    <>
      <Sonido archivo={s("glitch")} desde={0} volumen={0.3} />
      {/* Música alegre de fondo; se apaga de golpe en la escena de las 3 AM */}
      <Sonido archivo={s("musica-chiptune")} desde={2} hasta={S.tipo4} volumen={0.22} bajarConVoces={{ lineas: LINEAS, volumen: 0.08 }} fundido={4} bucle />
      <Sonido archivo={s("suspenso")} desde={S.tipo4} hasta={S.tipo5} volumen={0.18} fundido={6} />
      <Sonido archivo={s("musica-chiptune")} desde={S.tipo5} volumen={0.22} bajarConVoces={{ lineas: LINEAS, volumen: 0.08 }} fundido={6} bucle />

      {cortes.map((c) => (
        <Sonido key={`w${c}`} archivo={s("whoosh")} desde={c - 6} volumen={0.3} />
      ))}
      {[T.tu, T.ensayo, L(8).inicio, T.visto, T.comer].map((r) => (
        <Sonido key={`b${r}`} archivo={s("vine-boom")} desde={r} volumen={0.45} />
      ))}

      {/* #1 educado: la IA «toma nota» */}
      <Sonido archivo={s("bip-robot")} desde={T.mundo - 4} volumen={0.3} />
      <Sonido archivo={s("dun-dun-dunnn")} desde={T.mundo + 6} volumen={0.35} />
      {/* #2 copy-paste: tecleo, hoja y 0/10 */}
      <Sonido archivo={s("teclado")} desde={S.tipo2} hasta={T.claro - 20} volumen={0.3} fundido={4} />
      <Sonido archivo={s("whoosh")} desde={T.claro - 30} volumen={0.35} />
      <Sonido archivo={s("error")} desde={T.ensayo + 12} volumen={0.3} />
      {/* #3 discute: la IA da la razón con campanita */}
      <Sonido archivo={s("ding")} desde={L(7).inicio} volumen={0.3} />
      {/* #4 las 3 AM: gota (lágrima) */}
      <Sonido archivo={s("gota")} desde={L(10).inicio + 10} volumen={0.4} />
      <Sonido archivo={s("gota")} desde={L(10).inicio + 40} volumen={0.4} />
      {/* #5 chat con mamá y chanclazo */}
      <Sonido archivo={s("pop")} desde={S.tipo5 + 8} volumen={0.35} />
      <Sonido archivo={s("pop")} desde={T.ia11 + 4} volumen={0.35} />
      <Sonido archivo={s("plaf")} desde={T.comer + 10} volumen={0.6} />
      {/* Llamada final */}
      <Sonido archivo={s("actualizacion")} desde={fin(L(13)) - 30} volumen={0.4} />
    </>
  );
};
