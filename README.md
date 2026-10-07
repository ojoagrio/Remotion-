# Proyecto de video con Remotion

Proyecto de edición de video programática con [Remotion](https://www.remotion.dev/) (React + TypeScript).

## Requisitos

- Node.js 18 o superior

## Uso

```bash
npm install        # instalar dependencias
npm run dev        # abrir Remotion Studio (vista previa y edición en el navegador)
npm run build      # renderizar la composición HelloWorld a out/video.mp4
npm run render:n64 # renderizar la escena 3D estilo N64 a out/escena-n64.mp4
npm run voces      # generar las voces del guion con ElevenLabs (ver abajo)
npm run render:tiktok # renderizar el video vertical de TikTok a out/ya-voy-saliendo.mp4
npm run render:ia  # renderizar «El bug chiquito» (dev vs IA) a out/bug-chiquito.mp4
npm run render:chancla # renderizar «La chancla» (mamá vs IA) a out/la-chancla.mp4
npm run render:chisme # renderizar «El chisme» (parodia) a out/el-chisme.mp4
npm run render:industria # renderizar «La industria tech» a out/industria-tech.mp4
npm run render:tipos # renderizar «5 tipos de personas usando la IA» a out/tipos-ia.mp4
npm run render:clawd # renderizar «Vida salvaje en la terminal» (Clawd) a out/clawd-documental.mp4
npm run render:sitcom # renderizar la sitcom «Prompt & Compañía» (16:9) a out/sitcom-prompt-y-compania.mp4
npm run render:sitcom2 # renderizar el episodio 2 «Vacaciones» (vertical)
npm run typecheck  # comprobar tipos
```

> Si renderizas en un servidor sin GPU y aparece `Error creating WebGL context`,
> añade `--gl=swangle` (renderizado por software): `npm run render:n64 -- --gl=swangle`.

## Estructura

- `src/index.ts`: punto de entrada (registra la raíz).
- `src/Root.tsx`: define las composiciones (duración, fps y resolución).
- `src/HelloWorld.tsx`: composición de ejemplo con animación.
- `src/n64/`: escena 3D low-poly estilo Nintendo 64 (Three.js + React Three Fiber + `@remotion/three`).
  - `Personaje.tsx`: personaje hecho con primitivas; se anima con una `pose` (caminar, saludar, saltar).
  - `Escenario.tsx`: suelo con textura pixelada, árboles, colinas, niebla y una estrella.
  - `Dialogo.tsx`: cuadro de diálogo retro con efecto de máquina de escribir.
  - `EscenaEncuentro.tsx`: el guion: qué hace cada personaje en cada frame, la cámara y los diálogos.
- `public/`: recursos estáticos (videos, audio, imágenes) accesibles con `staticFile()`.
- `remotion.config.ts`: configuración del CLI.

Documentación: https://www.remotion.dev/docs

## Cómo crear nuevas situaciones

1. Copia `src/n64/EscenaEncuentro.tsx` con otro nombre.
2. Cambia los colores de los personajes (`ColoresPersonaje`) o añade más personajes.
3. Escribe las acciones con `interpolate(frame, [inicio, fin], [valorInicial, valorFinal])`:
   posición `x`/`z`, `rotacion`, `caminar`, `saludo` y `salto` (usa la función `saltar`).
4. Añade diálogos con `<Sequence from={frame}>` y `<Dialogo>`.
5. Registra la nueva composición en `src/Root.tsx`.

El look N64 sale de: geometría con pocas caras y `flatShading`, texturas pequeñas con
`NearestFilter`, niebla, sombras circulares falsas y renderizar a 1/4 de resolución
(`ESCALA_PIXEL`) para ampliar después sin suavizado.

## Video para TikTok con voces de ElevenLabs

`src/tiktok/` contiene «Ya voy saliendo»: un video vertical de 1080x1920 y 30 s en pantalla
dividida. Arriba, Lola espera en el cine; abajo, Pepe le jura desde la cama que ya va en camino.

- `guion.json`: las líneas de diálogo y la voz de ElevenLabs de cada personaje.
- `duraciones.json`: duración de cada audio (lo genera el script; la línea de tiempo se
  calcula a partir de él).
- `public/voces/`: los MP3 generados.
- Las bocas se mueven según el volumen real del audio (`@remotion/media-utils`).

Para cambiar el diálogo, edita `guion.json` y vuelve a generar las voces. La clave de API
se pasa por variable de entorno y **nunca** debe guardarse en el repositorio:

```bash
ELEVENLABS_API_KEY=tu_clave npm run voces
npm run render:tiktok
```

## «El bug chiquito»: el desarrollador y la IA

`src/ia/` es un TikTok de 30 s en el que un dev le pide a la IA arreglar un botón y la IA
reescribe todo en Rust y borra la base de datos de producción. Cada línea tiene su propio
movimiento de cámara, definido en `camaraEn()` de `BugChiquito.tsx`:

1. Grúa de apertura desde un plano general.
2. Plano sobre el hombro con empuje lento hacia la IA.
3. Crash zoom con plano holandés y cámara en mano.
4. Contrapicado orbitando a la IA y barrido rápido (whip pan) con desenfoque hacia los servidores.
5. Efecto vértigo (dolly zoom): la cámara se aleja mientras el zoom se cierra.
6. Plano de dos con órbita lenta.
7. Subida a plano cenital girando mientras el dev se desmaya.

Las piezas comunes (línea de tiempo, lienzo pixelado, cámara, subtítulos y bocas) están en
`src/comun/`. Para generar las voces de este guion:

```bash
ELEVENLABS_API_KEY=tu_clave npm run voces -- src/ia/guion.json
```

Cada línea del guion admite `pausa` (segundos de silencio extra después) para dar ritmo cómico.

## Efectos de sonido y música

`npm run sonidos` (necesita Python 3 con numpy) sintetiza en `public/sonidos/` una música
chiptune y efectos retro de 8 bits: teclado, barridos (whoosh), disco rayado, impacto,
pitidos de robot, alarma, «dun dun dunnn», campanita, silbato de caída, golpe y «ba-dum-tss».
No usan servicios externos ni tienen problemas de derechos.

Se colocan en el video con el componente `<Sonido>` de `src/comun/Sonido.tsx`, que admite
fundidos, bucle y bajar el volumen automáticamente mientras alguien habla. Ejemplo de uso:
`src/ia/Sonidos.tsx`.

## «La chancla»: la mamá contra la IA

`src/chancla/` es un TikTok de 30 s: la mamá le pide a la IA que lave los trastes, la IA
responde «como modelo de lenguaje, no puedo»... y empieza un duelo del viejo oeste
(franjas de cine, silbido, primeros planos de ojos) hasta que aparece la chancla.

- `tiempos.ts`: la línea de tiempo y los momentos clave (duelo, escape, lavado, final).
- `ChanclaIA.tsx`: personajes, tomas de cámara y textos en pantalla.
- `Cocina.tsx`: el escenario, con la torre de trastes y las burbujas.
- `Sonidos.tsx`: música polka, silbido western, chanclazo, burbujas, etc.

Voces: `ELEVENLABS_API_KEY=tu_clave npm run voces -- src/chancla/guion.json`

La mamá usa la voz «Azu» de la biblioteca de ElevenLabs. Para cambiar solo la voz de un
personaje sin regenerar las demás, usa `--solo=<personaje>`:
`ELEVENLABS_API_KEY=tu_clave npm run voces -- src/chancla/guion.json --solo=mama`.
Si la nueva voz dura distinto, ajusta la `pausa` de esa línea para no mover el resto.

## «El chisme»: parodia de la polémica de Aleks Syntek

`src/syntek/` es una **parodia** (39 s, vertical) contada por un programa de chismes ficticio.
Las voces son de ElevenLabs y **no** imitan la voz del cantante. Las partes cantadas usan el
modelo `eleven_v3` con la etiqueta `[sings]` (campos `locucion` y `modelo` del guion). El
video muestra el aviso «PARODIA» todo el tiempo y un cartel final con las fuentes.

Hechos en los que se basa (septiembre de 2026):

- 15 de septiembre, concierto gratuito del Grito en la alcaldía Benito Juárez: le piden una
  canción de Juan Gabriel, responde «entre más me digas eso, menos voy a cantar» y lo abuchean.
- 20 de septiembre, en un live: dice «sí estoy loco», se compara con Dalí, Picasso y Frida
  Kahlo y anuncia que se va a Inglaterra porque «allá sí lo quieren». Algunos medios reportan
  que luego dijo que era «un juego».
- Después aclara que volverá y anuncia un concierto gratuito el 15 de noviembre en el
  Festival del Chocolate de Villahermosa, Tabasco.

Fuentes: [N+](https://www.nmas.com.mx/entretenimiento/foro-tv-video-si-estoy-loco-aleks-syntek-hace-polemico-live-en-redes-sociales/),
[Infobae](https://www.infobae.com/mexico/2026/09/25/aleks-syntek-confirma-que-se-va-a-inglaterra-y-publica-cancion-para-explicar-sus-razones/),
[Récord](https://www.record.com.mx/historia/video-aleks-syntek-dice-que-esta-loco-y-sorprende-con-comentario-sobre-zague-la-tiene-bien-grande-2026092022325323911),
[Criterio Hidalgo](https://www.criteriohidalgo.com/ticket/lo-que-circula-en-la-red/aleks-syntek-causa-polemica-tras-decir-si-estoy-loco-durante-un-live-en-redes-sociales),
[ABC Noticias](https://abcnoticias.mx/show/2026/10/6/y-el-no-mas-gratis-aleks-syntek-anuncia-concierto-gratuito-esto-se-sabe-291613.html).

## «La industria tech»: estructura viral

`src/industria/` (43 s, vertical) sigue la estructura de video viral: **gancho** en los primeros
2 segundos, **lista numerada** de puntos rápidos (#1 a #4, una escena por punto), **giro** y
**llamada a compartir**, con barra de progreso arriba para la retención.

- Narrador único con `eleven_v3` y etiquetas de tono (`[sarcastic]`, `[deadpan]`, `[laughs]`).
- Subtítulos palabra por palabra (`src/comun/SubtituloViral.tsx`) usando los tiempos que
  devuelve ElevenLabs con `"timestamps": true` en el guion (se guardan en `palabras.json`).
- `tiempos.ts` expone `momento(n, "palabra")` para sincronizar efectos con palabras concretas.
- Ritmo: `npm run ritmo -- src/industria/guion.json 1.15 0.3` recorta silencios largos
  (cortes de salto) y acelera la voz 1.15x sin cambiar el tono, actualizando los tiempos.

Flujo completo para regenerar:

```bash
ELEVENLABS_API_KEY=tu_clave npm run voces -- src/industria/guion.json
npm run ritmo -- src/industria/guion.json 1.15 0.3
npm run render:industria
```

## «5 tipos de personas usando la IA»

`src/tipos/` (45 s, vertical) usa el formato de lista con el que todos se identifican y
termina pidiendo **etiquetar a un amigo**, lo que lo hace muy compartible: el educado, el del
copy-paste, el que discute con la IA, el de las 3 AM y el hijo que le contesta a su mamá con
la IA (guiño a «La chancla»). Empieza y termina en una rueda de reconocimiento de policía.

Seis voces con `eleven_v3` y tiempos por palabra; los subtítulos virales cambian de color
según quién habla. Regenerar:

```bash
ELEVENLABS_API_KEY=tu_clave npm run voces -- src/tipos/guion.json
npm run ritmo -- src/tipos/guion.json 1.12 0.3
npm run render:tipos
```

## «Vida salvaje en la terminal»: Clawd, la mascota de Claude Code

`src/clawd/` (44 s, vertical) es un **video de fan** en formato de documental de naturaleza
sobre Clawd, el cangrejito de píxeles de Claude Code, modelado en vóxeles
(`Clawd3D.tsx`): cuerpo naranja, ojos cuadrados, pinzas y cuatro patitas. Narración con
`eleven_v3` (voz «Leon», documental) y etiquetas como `[whispers]`.

Datos usados y sus fuentes:

- Pixel art de 8 bits, naranja (RGB 218, 119, 88 según la comunidad), ojos negros cuadrados,
  aparece al iniciar Claude Code: [Stark Insider](https://www.starkinsider.com/2025/10/clawd-ai-retro-mascot-command-line.html),
  [Classmethod](https://dev.classmethod.jp/en/articles/love-clawd-claude-code/).
- Presentado en X a finales de septiembre de 2025:
  [anthropics/claude-code#8536](https://github.com/anthropics/claude-code/issues/8536).
- Nombre: juego de palabras entre «claw» (garra) y «Claude».
- Figuras para imprimir en 3D y emojis de la comunidad:
  [MakerWorld](https://makerworld.com/en/models/2576503-v2-updated-clawd-claude-code-mascot),
  [ClawdMoji](https://kompozy.io/ai-tools/clawdmoji).
- Reporte de que se veía azul en la v2.0.67, cerrado sin explicación:
  [issue #13755](https://claudeissues.com/issue/13755-question-why-did-the-clawd-mascot-color-change-from-orange-to-blue).

## Sitcom «Prompt & Compañía» (16:9, 1:31)

`src/sitcom/` es una sitcom de 1.5 minutos en horizontal: una startup que se declara
«AI-first» y contrata a KAI, un agente de IA demasiado eficiente (cancela el café, reescribe un
botón en 3,000 líneas y un poema, hace 47 pull requests a tu nombre... y despide al CEO).

- **Cámaras de sitcom** (`GUION_CAMARA` en `Sitcom.tsx`): plano general, planos medios de
  quien habla y **planos de reacción durante las risas**. Cold open, presentación con la
  canción de la serie y final congelado en sepia con créditos.
- **Risas grabadas**: se fabrican con `npm run risas` mezclando risas de 8 voces de ElevenLabs
  (`eleven_v3` con `[laughs]`, guardadas en `audio-fuente/risas/`) como un público de estudio,
  más aplausos sintetizados. En el guion, cada remate indica `"risa": "chica" | "grande" |
  "ooh" | "aplauso"` y su `pausa`.
- **Bocas sin decodificar audio**: `npm run bocas -- src/sitcom/guion.json` precalcula el
  volumen por frame (`envolventes.json`); `useBocas(LINEAS, envolventes)` lo usa. Así se evitan
  los límites de AudioContext del navegador cuando hay muchos audios.
- `ritmo-viral.py` también funciona sin tiempos por palabra (detecta la voz por volumen).

```bash
ELEVENLABS_API_KEY=tu_clave npm run voces -- src/sitcom/guion.json
npm run ritmo -- src/sitcom/guion.json 1.06 0.4
npm run bocas -- src/sitcom/guion.json
npm run render:sitcom
```

## Flujo rápido (recomendado para videos nuevos)

```bash
# 1. Voces con caché + ritmo + bocas, todo en uno (solo pide a ElevenLabs las líneas que cambiaron)
ELEVENLABS_API_KEY=tu_clave npm run producir -- src/sitcom/ep2/guion.json
# 2. Hoja de contactos rápida (empaqueta una vez y reutiliza el navegador): ~2 s por fotograma
REMOTION_GL=swangle npm run hoja -- SitcomEp2 12 0.25        # -> out/hoja-SitcomEp2.png
# 3. Render final
REMOTION_GL=swangle npx remotion render SitcomEp2 out/ep2.mp4
```

- `scripts/producir.mjs`: guarda los audios crudos en `audio-fuente/voces/<carpeta>/` con un
  hash por línea; volver a correrlo tras editar una frase solo regenera esa frase.
- `scripts/procesar-voces.py`: ritmo opcional (`"ritmo": {"velocidad", "pausa"}` en el guion),
  duraciones, palabras y envolventes de boca en un solo paso.
- `scripts/hoja.mjs`: 8 fotogramas en ~17 s (antes ~3 min con `remotion still` uno por uno).
- `REMOTION_GL=swangle` activa el renderizado por software desde `remotion.config.ts`.
  Subir `REMOTION_CONCURRENCY` no acelera en esta máquina (el 3D por software ya usa la CPU).
- TypeScript usa `lib: es2019` (Object.entries, includes, flatMap...).

## Motor de episodios de la sitcom (`src/sitcom/motor/`)

Un episodio nuevo = un `guion.json` + un componente de 5 líneas (ver `src/sitcom/ep2/`).
El guion indica `formato` (vertical u horizontal), las risas (`risa`, `pausa`), la canción de
presentación (`tema`) y acciones por personaje con palabras sencillas:

`sentado`, `de-pie`, `teclea`, `jarras`, `brazos-arriba`, `saluda`, `telefono`, `nada`,
`enojo`, `sueno`, `feliz`, `malvado`, `asustado`, `llora`, `neutral`, `salta`, `aparece`,
`desaparece`, `lentes-sol`.

Ejemplo: `"acciones": { "sofi": "de-pie brazos-arriba enojo salta" }` (al empezar la línea) o
`"accionesRisa"` (al empezar la risa). La cámara es automática: primer plano de quien habla y
plano general en las risas; se puede forzar con `"camara"`/`"camaraRisa"` (`"general"`, el id
de un personaje, o `"id!"` para un crash zoom).

## Sitcom «Mensaje enviado» (`src/mensaje/`)

Segunda serie hecha con el motor de episodios, con otro escenario (`Sala.tsx`) y otro reparto:
Laura le pide a su asistente de IA, Nube, que conteste «algo casual» a Marco... y Nube lo manda
al grupo de la familia. El motor acepta `escenario` y `posiciones` propios, así que una serie
nueva es: un set, un reparto y un `guion.json`.

```bash
ELEVENLABS_API_KEY=tu_clave npm run producir -- src/mensaje/guion.json
npm run render:mensaje
```

### Episodios hechos con el motor

| Serie | Episodio | Composición | Guion |
| --- | --- | --- | --- |
| Prompt & Compañía | 2 «Vacaciones» | `SitcomEp2` | `src/sitcom/ep2/guion.json` |
| Prompt & Compañía | 3 «Gemelo digital» | `GemeloDigital` | `src/sitcom/ep3/guion.json` |
| Mensaje enviado | 1 «Algo casual» | `MensajeEnviado` | `src/mensaje/guion.json` |
| Mensaje enviado | 2 «Modo mamá» | `ModoMama` | `src/mensaje/ep2/guion.json` |

Una línea del guion puede usar la voz de otro personaje con `"voz": "<personaje>"` (en «Modo
mamá», Nube habla con la voz de la mamá).
