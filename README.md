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
