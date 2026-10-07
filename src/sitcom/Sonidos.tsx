import { fin } from "../comun/lineaDeTiempo";
import { Sonido } from "../comun/Sonido";
import { CONGELAR, L, RISAS, TITULO, TITULO_FIN } from "./tiempos";

const s = (nombre: string) => `sonidos/${nombre}.wav`;

// Banda sonora de la sitcom: risas grabadas, canción de la serie y transiciones
export const Sonidos: React.FC = () => (
  <>
    {/* Riff de bajo al abrir y puerta de Raúl */}
    <Sonido archivo={s("riff-slap")} desde={0} volumen={0.45} />
    <Sonido archivo={s("golpe")} desde={10} volumen={0.25} />
    {/* KAI aparece */}
    <Sonido archivo={s("brillo")} desde={fin(L(3)) - 24} volumen={0.4} />
    <Sonido archivo={s("bip-robot")} desde={L(4).inicio - 6} volumen={0.3} />

    {/* Risas grabadas después de cada remate */}
    {RISAS.map((r) => (
      <Sonido key={r.linea} archivo={s(r.archivo)} desde={r.desde} hasta={r.hasta} volumen={r.tipo === "aplauso" ? 0.6 : 0.55} fundido={4} />
    ))}

    {/* Presentación con la canción de la serie y vuelta a la escena con el riff */}
    <Sonido archivo={s("whoosh")} desde={TITULO - 4} volumen={0.35} />
    <Sonido archivo={s("tema-sitcom")} desde={TITULO} hasta={TITULO_FIN} volumen={0.6} fundido={4} />
    <Sonido archivo={s("riff-slap")} desde={TITULO_FIN - 2} volumen={0.45} />

    {/* Gags */}
    <Sonido archivo={s("error")} desde={fin(L(4)) - 15} volumen={0.2} />
    <Sonido archivo={s("teclado")} desde={L(6).inicio} hasta={fin(L(6))} volumen={0.12} fundido={4} />
    <Sonido archivo={s("vine-boom")} desde={L(13).inicio + 30} volumen={0.2} />

    {/* Final congelado: aplausos y canción */}
    <Sonido archivo={s("aplausos")} desde={CONGELAR} volumen={0.4} />
    <Sonido archivo={s("tema-sitcom")} desde={CONGELAR + 6} volumen={0.45} fundido={6} />
  </>
);
