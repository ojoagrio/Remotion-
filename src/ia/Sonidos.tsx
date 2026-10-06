import { fin, Linea } from "../comun/lineaDeTiempo";
import { Sonido } from "../comun/Sonido";

// Banda sonora y efectos de «El bug chiquito», sincronizados con cada toma.
// Los sonidos se generan con scripts/generar-sonidos.py (síntesis retro de 8 bits).
export const Sonidos: React.FC<{ lineas: Linea[] }> = ({ lineas }) => {
  const L = (n: number) => lineas[n - 1];
  const s = (nombre: string) => `sonidos/${nombre}.wav`;
  const voces = { lineas, volumen: 0.07 };
  const desmayo = fin(L(6)) + 6;

  return (
    <>
      {/* 1. Apertura: barrido de la grúa, música alegre y tecleo */}
      <Sonido archivo={s("whoosh-largo")} desde={0} volumen={0.35} />
      <Sonido
        archivo={s("musica-chiptune")}
        desde={0}
        hasta={L(3).inicio - 2}
        volumen={0.2}
        bajarConVoces={voces}
        fundido={6}
        bucle
      />
      <Sonido archivo={s("teclado")} desde={4} hasta={fin(L(1)) + 8} volumen={0.3} fundido={4} />

      {/* 2. La IA responde: pitido de robot y procesamiento mientras "reescribe en Rust" */}
      <Sonido archivo={s("bip-robot")} desde={L(2).inicio - 8} volumen={0.35} />
      <Sonido archivo={s("procesando")} desde={L(2).inicio + 5} hasta={fin(L(2)) + 12} volumen={0.12} fundido={5} />

      {/* 3. Crash zoom: el disco se raya, la música se corta y golpe */}
      <Sonido archivo={s("scratch")} desde={L(3).inicio - 6} volumen={0.6} />
      <Sonido archivo={s("impacto")} desde={L(3).inicio} volumen={0.55} />

      {/* 4. La IA se pone "malvada": tensión, barrido hacia los servidores, error y alarma */}
      <Sonido archivo={s("bip-robot")} desde={L(4).inicio - 8} volumen={0.3} />
      <Sonido archivo={s("suspenso")} desde={L(4).inicio} hasta={fin(L(4)) + 4} volumen={0.35} fundido={8} />
      <Sonido archivo={s("whoosh")} desde={fin(L(4)) - 2} volumen={0.6} />
      <Sonido archivo={s("error")} desde={fin(L(4)) + 2} volumen={0.3} />
      <Sonido archivo={s("dun-dun-dunnn")} desde={fin(L(4)) + 4} volumen={0.45} />
      <Sonido
        archivo={s("alarma")}
        desde={fin(L(4)) + 8}
        hasta={L(6).inicio + 6}
        volumen={0.16}
        bajarConVoces={{ lineas, volumen: 0.06 }}
        fundido={6}
        bucle
      />

      {/* 5. Efecto vértigo sobre el grito */}
      <Sonido archivo={s("impacto")} desde={L(5).inicio} volumen={0.35} />

      {/* 6. La IA se disculpa muy tranquila: campanita y vuelve la música, irónica */}
      <Sonido archivo={s("ding")} desde={L(6).inicio - 2} volumen={0.35} />
      <Sonido
        archivo={s("musica-chiptune")}
        desde={L(6).inicio + 8}
        hasta={desmayo + 2}
        volumen={0.14}
        bajarConVoces={voces}
        fundido={8}
      />

      {/* 7. Desmayo: silbato de caída, golpe y remate */}
      <Sonido archivo={s("silbato-caida")} desde={desmayo} volumen={0.45} />
      <Sonido archivo={s("golpe")} desde={desmayo + 14} volumen={0.8} />
      <Sonido archivo={s("whoosh-largo")} desde={desmayo + 8} volumen={0.25} />
      <Sonido archivo={s("rimshot")} desde={fin(L(6)) + 30} volumen={0.6} />
    </>
  );
};
