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
