# Proyecto de video con Remotion

Proyecto de edición de video programática con [Remotion](https://www.remotion.dev/) (React + TypeScript).

## Requisitos

- Node.js 18 o superior

## Uso

```bash
npm install        # instalar dependencias
npm run dev        # abrir Remotion Studio (vista previa y edición en el navegador)
npm run build      # renderizar la composición HelloWorld a out/video.mp4
npm run typecheck  # comprobar tipos
```

## Estructura

- `src/index.ts`: punto de entrada (registra la raíz).
- `src/Root.tsx`: define las composiciones (duración, fps y resolución).
- `src/HelloWorld.tsx`: composición de ejemplo con animación.
- `public/`: recursos estáticos (videos, audio, imágenes) accesibles con `staticFile()`.
- `remotion.config.ts`: configuración del CLI.

Documentación: https://www.remotion.dev/docs
