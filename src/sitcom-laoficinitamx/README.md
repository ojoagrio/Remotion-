# La Oficinita MX — configuración reutilizable

- `serie.json`: datos de la serie (título, formato, modelo de voz, ritmo, elenco).
- `personajes/<id>/<id>.json`: ficha completa de cada personaje (aspecto 3D, voz de ElevenLabs con sus ajustes, personalidad, muletillas) + imágenes de referencia.
- Presentación y hoja de modelo de cualquier personaje: `src/personajes/Presentacion.tsx` (cada personaje solo define sus datos en `src/personajes/<id>/Presentacion.tsx`).

`src/personajes/elenco.ts` lee estas fichas, así que cambiar aquí cambia al personaje en todos los videos.

Para usar a Juanito en un guion: `"voces": { "juanito": "HxRDsm0E8jdUUrG0lqbK" }`, `"ajustes": { "juanito": { "stability": 0.0, "similarity_boost": 0.8 } }`, y en el reparto `comoMiembro(JUANITO)`.
