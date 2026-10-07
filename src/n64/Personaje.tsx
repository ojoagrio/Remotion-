import { useMemo } from "react";
import * as THREE from "three";

// Personaje low-poly al estilo N64: pocas caras, sombreado plano y colores sólidos.
// Se construye solo con primitivas, sin modelos externos.

export type ColoresPersonaje = {
  piel: string;
  camisa: string;
  pantalon: string;
  sombrero: string;
  zapatos: string;
  // Opcionales para variar el aspecto
  bigote?: boolean;
  gorra?: boolean;
  cabello?: string;
  // Si se indica, dibuja coletas y un moño de este color
  mono?: string;
  lentes?: boolean;
  // Delantal de cocina de este color
  mandil?: string;
  // Chongo (moño de pelo) en la nuca
  chongo?: boolean;
  // Texto corto en el pecho (p. ej. "</>"), copete despeinado y audífonos al cuello
  emblema?: string;
  copete?: boolean;
  audifonos?: string;
  // Ropa extra: chaqueta abierta (la camisa se ve al frente), gorro, cadena y cristal de lentes
  chaqueta?: string;
  gorro?: string;
  cadena?: string;
  lentesCristal?: string;
  // Rasgos exagerados (1 = normal): tamaño de lentes, copete, sonrisa, cejas, orejas y nariz
  rasgos?: {
    lentes?: number;
    copete?: number;
    sonrisa?: number;
    cejas?: number;
    orejas?: number;
    nariz?: number;
    // Rasgos extra: coletas y chongo más grandes, pecas, una ceja levantada (escéptica) y frenos
    coletas?: number;
    chongo?: number;
    pecas?: number;
    cejaEsceptica?: number;
    frenos?: boolean;
  };
  // Melena larga detrás de la cabeza y lápiz atravesando el chongo
  melena?: boolean;
  lapiz?: boolean;
};

export type PosePersonaje = {
  // Posición en el suelo y orientación (radianes, 0 = mirando a cámara)
  x: number;
  z: number;
  rotacion: number;
  // Fase del ciclo de caminar (avanza con el tiempo) y su intensidad 0..1
  fasePaso: number;
  caminar: number;
  // Intensidad del saludo 0..1 y con qué brazo
  saludo: number;
  brazoSaludo?: "izquierdo" | "derecho";
  // Altura del salto
  salto: number;
  // Fase de la respiración en reposo
  respiracion: number;
  // Apertura de la boca 0..1 (para sincronizar con la voz)
  boca?: number;
  // Sujeta un teléfono en la oreja con el brazo derecho 0..1
  telefono?: number;
  // Ambos brazos al frente, como agarrando un volante 0..1
  brazosAdelante?: number;
  // Golpeteo impaciente con el pie 0..1
  impaciencia?: number;
  // Enojo 0..1: la cara se pone roja y el cuerpo tiembla
  enojo?: number;
  // Ojos cerrados 0..1 (dormido)
  sueno?: number;
  // Sentado en una silla 0..1
  sentado?: number;
  // Brazos al frente tecleando 0..1
  teclear?: number;
  // Brazos arriba, agarrándose la cabeza 0..1
  manosCabeza?: number;
  // Manos "en jarras" (en la cintura) 0..1
  jarras?: number;
  // Llanto 0..1: lágrimas que caen de los ojos
  llanto?: number;
  // Sujeta una chancla en la mano del saludo (brazoSaludo) 0..1 (escala de la chancla)
  chancla?: number;
};

const Material: React.FC<{ color: string }> = ({ color }) => (
  <meshLambertMaterial color={color} flatShading />
);

// Textura pequeña con el emblema del pecho (look pixelado)
const useEmblema = (texto?: string) =>
  useMemo(() => {
    if (!texto) return null;
    const c = document.createElement("canvas");
    c.width = 32;
    c.height = 16;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(texto, 16, 9);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    return t;
  }, [texto]);

const ROJO_ENOJO = new THREE.Color("#ff2a2a");

export const Personaje: React.FC<{
  colores: ColoresPersonaje;
  pose: PosePersonaje;
  escala?: number;
  sombra?: boolean;
}> = ({ colores, pose, escala = 1, sombra = true }) => {
  const { x, z, rotacion, fasePaso, caminar, saludo, salto, respiracion } = pose;
  const brazoSaludo = pose.brazoSaludo ?? "derecho";
  const boca = pose.boca ?? 0;
  const telefono = pose.telefono ?? 0;
  const adelante = pose.brazosAdelante ?? 0;
  const impaciencia = pose.impaciencia ?? 0;
  const enojo = pose.enojo ?? 0;
  const sueno = pose.sueno ?? 0;
  const sentado = pose.sentado ?? 0;
  const teclear = pose.teclear ?? 0;
  const manosCabeza = pose.manosCabeza ?? 0;
  const jarras = pose.jarras ?? 0;
  const chancla = pose.chancla ?? 0;
  const llanto = pose.llanto ?? 0;

  const balanceo = Math.sin(fasePaso) * 0.7 * caminar;
  const rebote = Math.abs(Math.sin(fasePaso)) * 0.08 * caminar;
  const respira = Math.sin(respiracion) * 0.02 * (1 - caminar);
  const temblor = Math.sin(respiracion * 40) * 0.04 * enojo;
  // Pie derecho golpeando el suelo
  const golpePie = Math.max(0, Math.sin(respiracion * 7)) * 0.35 * impaciencia;
  // Volante: los brazos giran a un lado y a otro
  const volante = Math.sin(respiracion * 5) * 0.35 * adelante;

  // En el aire, brazos arriba y piernas recogidas
  const enAire = Math.min(1, salto / 0.6);

  // Sombra que se encoge al saltar
  const tamSombra = 1 - Math.min(0.5, salto * 0.25);

  const colorPiel = useMemo(
    () => "#" + new THREE.Color(colores.piel).lerp(ROJO_ENOJO, enojo * 0.6).getHexString(),
    [colores.piel, enojo],
  );
  const geoCabeza = useMemo(() => new THREE.SphereGeometry(0.45, 8, 6), []);
  const conBigote = colores.bigote ?? true;
  const conGorra = colores.gorra ?? true;
  const { cabello, mono } = colores;
  const r = colores.rasgos ?? {};
  const ropaArriba = colores.chaqueta ?? colores.camisa;
  const emblema = useEmblema(colores.emblema);

  return (
    <group position={[x + temblor, 0, z]} rotation={[0, rotacion, 0]} scale={escala}>
      {/* Sombra circular falsa, típica de los juegos de N64 */}
      {sombra && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} scale={tamSombra}>
          <circleGeometry args={[0.5, 8]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} />
        </mesh>
      )}

      <group position={[0, salto + rebote + respira - sentado * 0.32, 0]}>
        {/* Piernas (pivotan desde la cadera) */}
        {[-1, 1].map((lado) => (
          <group
            key={lado}
            position={[lado * 0.18, 0.75, 0]}
            rotation={[
              lado * balanceo - enAire * 0.6 - (lado === 1 ? golpePie : 0) - sentado * (Math.PI / 2),
              0,
              0,
            ]}
          >
            <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[0.24, 0.6, 0.26]} />
              <Material color={colores.pantalon} />
            </mesh>
            <mesh position={[0, -0.66, 0.08]}>
              <boxGeometry args={[0.28, 0.16, 0.42]} />
              <Material color={colores.zapatos} />
            </mesh>
          </group>
        ))}

        {/* Torso (con chaqueta abierta si la hay) */}
        <mesh position={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.36, 0.42, 0.75, 6]} />
          <Material color={ropaArriba} />
        </mesh>
        {colores.chaqueta && (
          <mesh position={[0, 1.1, 0.36]} rotation={[-0.07, 0, 0]}>
            <boxGeometry args={[0.3, 0.72, 0.04]} />
            <Material color={colores.camisa} />
          </mesh>
        )}
        {colores.cadena && (
          <mesh position={[0, 1.18, 0.38]} rotation={[-0.2, 0, 0]}>
            <torusGeometry args={[0.16, 0.025, 4, 10, Math.PI]} />
            <meshLambertMaterial color={colores.cadena} emissive="#5a4300" flatShading />
          </mesh>
        )}
        {emblema && (
          <mesh position={[0, 1.18, 0.4]} rotation={[-0.06, 0, 0]}>
            <planeGeometry args={[0.44, 0.22]} />
            <meshBasicMaterial map={emblema} transparent />
          </mesh>
        )}
        {colores.audifonos && (
          <>
            <mesh position={[0, 1.5, 0.05]} rotation={[Math.PI / 2 - 0.25, 0, 0]}>
              <torusGeometry args={[0.3, 0.04, 4, 10, Math.PI]} />
              <meshLambertMaterial color={colores.audifonos} flatShading />
            </mesh>
            {[-1, 1].map((l) => (
              <mesh key={l} position={[l * 0.3, 1.5, 0.12]}>
                <cylinderGeometry args={[0.1, 0.1, 0.08, 8]} />
                <meshLambertMaterial color={colores.audifonos} flatShading />
              </mesh>
            ))}
          </>
        )}
        {/* Overol / cinturón */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.43, 0.4, 0.3, 6]} />
          <Material color={colores.pantalon} />
        </mesh>

        {colores.mandil && (
          <>
            <mesh position={[0, 0.98, 0.38]} rotation={[-0.08, 0, 0]}>
              <boxGeometry args={[0.55, 0.72, 0.05]} />
              <Material color={colores.mandil} />
            </mesh>
            <mesh position={[0, 0.82, 0.41]}>
              <boxGeometry args={[0.3, 0.16, 0.03]} />
              <Material color="#e63946" />
            </mesh>
          </>
        )}

        {/* Brazos (pivotan desde el hombro). lado -1 = izquierdo, 1 = derecho */}
        {[-1, 1].map((lado) => {
          const saluda = lado === (brazoSaludo === "derecho" ? 1 : -1);
          const s = saluda ? saludo : 0;
          // El brazo derecho sujeta el teléfono si no está manejando
          const tel = lado === 1 ? telefono * (1 - adelante) : 0;
          const libre =
            (1 - s) * (1 - tel) * (1 - adelante) * (1 - teclear) * (1 - manosCabeza) * (1 - jarras);
          const tecleo = Math.sin(respiracion * 30 + lado * 2) * 0.12 * teclear;
          // Ángulo de apertura lateral: en reposo un poco abierto, arriba al saltar o saludar
          const apertura =
            (0.25 + enAire * 2.2) * libre +
            s * (2.6 + Math.sin(respiracion * 6) * 0.35) +
            tel * -0.35 +
            adelante * (0.12 + lado * volante) +
            teclear * -0.12 +
            manosCabeza * (2.75 + Math.sin(respiracion * 20) * 0.08) +
            jarras * 0.75;
          const frente =
            -lado * balanceo * libre -
            tel * 2.5 -
            adelante * 1.45 -
            teclear * 1.25 +
            tecleo +
            jarras * 0.35;
          return (
            <group key={lado} position={[lado * 0.5, 1.4, 0]} rotation={[frente, 0, lado * apertura]}>
              <mesh position={[0, -0.3, 0]}>
                <boxGeometry args={[0.2, 0.6, 0.2]} />
                <Material color={ropaArriba} />
              </mesh>
              <mesh position={[0, -0.66, 0]}>
                <icosahedronGeometry args={[0.15, 0]} />
                <Material color="#ffffff" />
              </mesh>
              {saluda && chancla > 0 && (
                <group position={[0, -0.8, 0.05]} scale={chancla}>
                  {/* Suela */}
                  <mesh>
                    <boxGeometry args={[0.2, 0.45, 0.05]} />
                    <meshLambertMaterial color="#ff5fa2" flatShading />
                  </mesh>
                  {/* Tira en V */}
                  {[-1, 1].map((l) => (
                    <mesh key={l} position={[l * 0.05, 0.05, 0.05]} rotation={[0, 0, l * 0.5]}>
                      <boxGeometry args={[0.03, 0.2, 0.04]} />
                      <meshLambertMaterial color="#ffffff" flatShading />
                    </mesh>
                  ))}
                </group>
              )}
              {lado === 1 && telefono > 0 && (
                <mesh position={[0, -0.72, 0.05]} rotation={[0.3, 0, 0]}>
                  <boxGeometry args={[0.13, 0.3, 0.06]} />
                  <meshLambertMaterial color="#1b1b1f" flatShading />
                </mesh>
              )}
            </group>
          );
        })}

        {/* Cabeza grande, proporciones caricaturescas */}
        <group position={[0, 1.85, 0]}>
          <mesh geometry={geoCabeza}>
            <Material color={colorPiel} />
          </mesh>
          {/* Nariz */}
          <mesh position={[0, -0.02, 0.45]} scale={r.nariz ?? 1}>
            <icosahedronGeometry args={[conBigote ? 0.13 : 0.08, 0]} />
            <Material color={colorPiel} />
          </mesh>
          {/* Ojos: se aplanan al dormir */}
          {[-1, 1].map((lado) => (
            <mesh
              key={lado}
              position={[lado * 0.15, 0.12, 0.39]}
              scale={[1, 1 - sueno * 0.85, 1]}
            >
              <boxGeometry args={[0.08, 0.16, 0.05]} />
              <meshBasicMaterial color="#1a1a40" />
            </mesh>
          ))}
          {colores.lentes && (
            <group position={[0, 0.12, 0.43]} scale={r.lentes ?? 1}>
              {[-1, 1].map((lado) => (
                <group key={lado} position={[lado * 0.16, 0, 0]}>
                  <mesh>
                    <torusGeometry args={[0.11, 0.025, 3, 6]} />
                    <meshBasicMaterial color="#111111" />
                  </mesh>
                  {colores.lentesCristal && (
                    <mesh position={[0, 0, 0.005]}>
                      <circleGeometry args={[0.1, 6]} />
                      <meshBasicMaterial color={colores.lentesCristal} transparent opacity={0.55} />
                    </mesh>
                  )}
                </group>
              ))}
              <mesh position={[0, 0.02, 0.02]}>
                <boxGeometry args={[0.1, 0.03, 0.03]} />
                <meshBasicMaterial color="#111111" />
              </mesh>
            </group>
          )}
          {/* Cejas pobladas (rasgo exagerado) */}
          {(r.cejas ?? 0) > 0 &&
            enojo <= 0.05 &&
            [-1, 1].map((lado) => (
              <mesh key={lado} position={[lado * 0.16, 0.3 + (r.lentes ?? 1) * 0.02, 0.42]} rotation={[0, 0, -lado * 0.12]}>
                <boxGeometry args={[0.2, 0.04 * (1 + (r.cejas ?? 0)), 0.05]} />
                <meshBasicMaterial color={cabello ?? "#2b1608"} />
              </mesh>
            ))}
          {/* Ceja escéptica: una normal y otra muy levantada */}
          {(r.cejaEsceptica ?? 0) > 0 &&
            enojo <= 0.05 &&
            [-1, 1].map((lado) => (
              <mesh
                key={lado}
                position={[lado * 0.16, 0.27 + (r.lentes ?? 1) * 0.02 + (lado === 1 ? 0.07 * (r.cejaEsceptica ?? 0) : 0), 0.46]}
                rotation={[0, 0, lado === 1 ? 0.35 : -0.1]}
              >
                <boxGeometry args={[0.18, 0.05 * (1 + (r.cejaEsceptica ?? 0) * 0.5), 0.05]} />
                <meshBasicMaterial color="#120a06" />
              </mesh>
            ))}
          {/* Pecas */}
          {(r.pecas ?? 0) > 0 &&
            [-1, 1].map((lado) =>
              [
                [0.0, 0.0],
                [0.07, 0.03],
                [0.05, -0.05],
                [0.12, -0.01],
              ].map(([dx, dy], k) => (
                <mesh key={`${lado}${k}`} position={[lado * (0.13 + dx), -0.06 + dy, 0.42 - dx * 0.4]} scale={r.pecas}>
                  <boxGeometry args={[0.03, 0.03, 0.03]} />
                  <meshBasicMaterial color="#b5653a" />
                </mesh>
              )),
            )}
          {/* Orejas (rasgo exagerado) */}
          {(r.orejas ?? 0) > 0 &&
            [-1, 1].map((lado) => (
              <mesh key={lado} position={[lado * 0.45, 0.02, 0]} scale={[0.6, 1, 0.5].map((v) => v * (1 + (r.orejas ?? 0))) as [number, number, number]}>
                <icosahedronGeometry args={[0.12, 0]} />
                <Material color={colorPiel} />
              </mesh>
            ))}
          {llanto > 0 &&
            [-1, 1].map((lado) =>
              [0, 1].map((k) => {
                const caida = ((respiracion * 0.9 + k * 0.5 + (lado > 0 ? 0.25 : 0)) % 1) * 0.5;
                return (
                  <mesh key={`${lado}${k}`} position={[lado * 0.17, 0.02 - caida, 0.42]} scale={llanto}>
                    <icosahedronGeometry args={[0.045, 0]} />
                    <meshBasicMaterial color="#6fd3ff" />
                  </mesh>
                );
              }),
            )}
          {/* Cejas enojadas */}
          {enojo > 0.05 &&
            [-1, 1].map((lado) => (
              <mesh
                key={lado}
                position={[lado * 0.15, 0.27, 0.4]}
                rotation={[0, 0, lado * 0.5 * enojo]}
              >
                <boxGeometry args={[0.16, 0.04, 0.04]} />
                <meshBasicMaterial color="#2b1608" />
              </mesh>
            ))}
          {/* Boca: se abre con la voz; con "sonrisa" es más ancha y enseña los dientes */}
          <mesh position={[0, -0.24, 0.37]} scale={[1 + (r.sonrisa ?? 0) * 0.9, 0.15 + Math.max(boca, (r.sonrisa ?? 0) * 0.45) * 1.1, 1]}>
            <boxGeometry args={[0.18, 0.14, 0.06]} />
            <meshBasicMaterial color="#5a0f12" />
          </mesh>
          {(r.sonrisa ?? 0) > 0 && (
            <mesh position={[0, -0.215, 0.405]}>
              <boxGeometry args={[0.18 * (1 + (r.sonrisa ?? 0) * 0.9) * 0.85, 0.035, 0.02]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          )}
          {r.frenos && (r.sonrisa ?? 0) > 0 && (
            <mesh position={[0, -0.215, 0.418]}>
              <boxGeometry args={[0.18 * (1 + (r.sonrisa ?? 0) * 0.9) * 0.8, 0.012, 0.02]} />
              <meshBasicMaterial color="#8d99ae" />
            </mesh>
          )}
          {conBigote && (
            <mesh position={[0, -0.15, 0.4]}>
              <boxGeometry args={[0.32, 0.08, 0.08]} />
              <meshBasicMaterial color="#2b1608" />
            </mesh>
          )}
          {cabello && (
            <>
              {/* Pelo: casquete sobre la cabeza y flequillo */}
              <mesh position={[0, 0.1, -0.08]} scale={1.06}>
                <sphereGeometry args={[0.45, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2.3]} />
                <Material color={cabello} />
              </mesh>
              {colores.melena && (
                <mesh position={[0, -0.12, -0.24]}>
                  <boxGeometry args={[0.92, 0.78, 0.4]} />
                  <Material color={cabello} />
                </mesh>
              )}
              {mono &&
                [-1, 1].map((lado) => (
                  <group key={lado} position={[lado * (0.45 + 0.05 * (r.coletas ?? 1)), 0.1, -0.1]} scale={r.coletas ?? 1}>
                    <mesh position={[lado * 0.08, -0.2, 0]} rotation={[0, 0, lado * 0.4]}>
                      <coneGeometry args={[0.14, 0.5, 5]} />
                      <Material color={cabello} />
                    </mesh>
                    <mesh>
                      <boxGeometry args={[0.12, 0.18, 0.18]} />
                      <Material color={mono} />
                    </mesh>
                  </group>
                ))}
            </>
          )}
          {colores.copete && cabello && (
            <group position={[0.05, 0.48, 0.12]} scale={r.copete ?? 1}>
              {[-1, 0, 1].map((k) => (
                <mesh key={k} position={[k * 0.11, 0, -k * 0.02]} rotation={[0.5, 0, -k * 0.35]}>
                  <coneGeometry args={[0.09, 0.26, 4]} />
                  <Material color={cabello} />
                </mesh>
              ))}
            </group>
          )}
          {colores.gorro && (
            <group position={[0, 0.16, -0.02]}>
              <mesh scale={[1.12, 1.05, 1.12]}>
                <sphereGeometry args={[0.45, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
                <Material color={colores.gorro} />
              </mesh>
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.52, 0.52, 0.12, 8]} />
                <Material color={colores.gorro} />
              </mesh>
            </group>
          )}
          {colores.chongo && cabello && (
            <group position={r.chongo ? [0, 0.44 + r.chongo * 0.06, -0.14] : [0, 0.3, -0.33]} scale={r.chongo ?? 1}>
              <mesh>
                <icosahedronGeometry args={[0.2, 0]} />
                <Material color={cabello} />
              </mesh>
              {colores.lapiz && (
                <group rotation={[0, 0, 0.9]}>
                  <mesh>
                    <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
                    <meshLambertMaterial color="#ffd60a" flatShading />
                  </mesh>
                  <mesh position={[0, 0.33, 0]}>
                    <coneGeometry args={[0.03, 0.07, 6]} />
                    <meshLambertMaterial color="#f1c27d" flatShading />
                  </mesh>
                  <mesh position={[0, -0.31, 0]}>
                    <cylinderGeometry args={[0.032, 0.032, 0.05, 6]} />
                    <meshLambertMaterial color="#ff8fab" flatShading />
                  </mesh>
                </group>
              )}
            </group>
          )}
          {conGorra && (
            <>
              <mesh position={[0, 0.27, 0]}>
                <cylinderGeometry args={[0.38, 0.46, 0.28, 8]} />
                <Material color={colores.sombrero} />
              </mesh>
              <mesh position={[0, 0.15, 0.32]} rotation={[0.15, 0, 0]}>
                <boxGeometry args={[0.6, 0.05, 0.35]} />
                <Material color={colores.sombrero} />
              </mesh>
            </>
          )}
        </group>
      </group>
    </group>
  );
};
