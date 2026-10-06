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
