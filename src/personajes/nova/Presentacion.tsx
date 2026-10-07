import { AbsoluteFill } from "remotion";
import { fin } from "../../comun/lineaDeTiempo";
import { Sonido } from "../../comun/Sonido";
import { FUENTE } from "../../comun/Textos";
import nova from "../../sitcom-laoficinitamx/personajes/nova/nova.json";
import { DatosPresentacion, duracionPresentacion, Presentacion } from "../Presentacion";
import { ColoresNova, DisenoNova, Nova3D } from "./Nova3D";
import dur1 from "./voz1/duraciones.json";
import env1 from "./voz1/envolventes.json";
import guion1 from "./voz1/guion.json";
import dur2 from "./voz2/duraciones.json";
import env2 from "./voz2/envolventes.json";
import guion2 from "./voz2/guion.json";
import dur3 from "./voz3/duraciones.json";
import env3 from "./voz3/envolventes.json";
import guion3 from "./voz3/guion.json";

// Presentación de Nova (look A «Orbe») con 3 voces a elegir

const VOCES = [
  { guion: guion1, duraciones: dur1, envolventes: env1 },
  { guion: guion2, duraciones: dur2, envolventes: env2 },
  { guion: guion3, duraciones: dur3, envolventes: env3 },
];

const datosVoz = (i: number): DatosPresentacion => {
  const opcion = nova.vozOpciones[i];
  return {
    ficha: { id: nova.id, nombre: nova.nombre, rol: nova.rol, color: nova.color },
    ...VOCES[i],
    chips: ["Servicial (de más)", "Optimista", "Alucina poquito"],
    simbolos: ["01", "AI", "</>", "?", "GPU", "∞"],
    modelo: (pose, f) => (
      <group position={[0, 0.1, 0]}>
        <Nova3D
          diseno={nova.diseno as DisenoNova}
          colores={nova.colores as ColoresNova}
          altura={1.1}
          pose={{
            flotar: f / 12,
            giro: pose.rotacion,
            saludo: pose.saludo,
            boca: pose.boca,
            // Parpadea cada 3 s y entrecierra los ojos con «sueño»
            parpadeo: Math.max(f % 90 < 4 ? 1 : 0, pose.sueno ?? 0),
          }}
        />
      </group>
    ),
    sonidos: (L) => (
      <>
        <Sonido archivo="sonidos/bip-robot.wav" desde={L(1).inicio - 6} volumen={0.4} />
        <Sonido archivo="sonidos/procesando.wav" desde={L(3).inicio + 20} hasta={L(3).inicio + 50} volumen={0.3} />
        <Sonido archivo="sonidos/error.wav" desde={fin(L(3)) - 45} volumen={0.3} />
        <AbsoluteFill style={{ padding: 36 }}>
          <div style={{ alignSelf: "flex-start", background: "#000000aa", color: "white", fontFamily: FUENTE, fontSize: 34, padding: "10px 22px", borderRadius: 16, border: "3px solid #4cc9f0" }}>
            VOZ {opcion.opcion} · {opcion.estilo}
          </div>
        </AbsoluteFill>
      </>
    ),
  };
};

const DATOS = [0, 1, 2].map(datosVoz);
export const DURACIONES_NOVA = DATOS.map(duracionPresentacion);
export const PresentacionNova1: React.FC = () => <Presentacion datos={DATOS[0]} />;
export const PresentacionNova2: React.FC = () => <Presentacion datos={DATOS[1]} />;
export const PresentacionNova3: React.FC = () => <Presentacion datos={DATOS[2]} />;
