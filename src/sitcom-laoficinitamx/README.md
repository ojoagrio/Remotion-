# La Oficinita MX — configuración reutilizable

- `serie.json`: datos de la serie (título, formato, modelo de voz, ritmo, elenco).
- `serie.tsx`: piezas compartidas por todos los episodios (elenco, set, posiciones, tarjeta de título y cortinillas amarillas).
- `personajes/<id>/<id>.json`: ficha completa de cada personaje (aspecto 3D, voz de ElevenLabs con sus ajustes, personalidad, muletillas) + imágenes de referencia. `src/personajes/elenco.ts` lee estas fichas.
- `epN/`: cada episodio (guion.json + su componente con los efectos de sonido).

## Proceso para cada capítulo nuevo

1. **Research en la web** de temas recientes de IA en la industria que generen asombro,
   incomodidad o conversación (despidos por IA, agentes que fallan, deepfakes, «vibe coding»,
   IA que miente o adula, privacidad, empresas «AI-first», etc.). Elegir uno y anotar la fuente.
2. **Sin salirse del concepto**: la oficina de la startup y su elenco fijo —
   Mr. CEO (optimista, le mete IA a todo, explota con las fechas de entrega),
   Juanito (dev bromista), Paty (niña sabelotodo, escéptica de la IA),
   Nova (robot asistente servicial que alucina). El tema real se cuenta a través de ellos.
3. **Guion con estructura TikTok** (~50 s, vertical):
   - Gancho escrito arriba (corto, provocador) + primera frase que plantea el conflicto en 3 s.
   - Primer chiste fuerte antes de los 12 s → risa → tarjeta amarilla de la serie.
   - Escalada con 2–3 chistes (risas grabadas después de cada uno, cortinillas amarillas entre bloques).
   - Giro/remate final que deje la conversación abierta → risas con aplausos → «CONTINUARÁ…».
4. Producir: `node scripts/producir.mjs src/sitcom-laoficinitamx/epN/guion.json`, revisar con
   `node scripts/hoja.mjs <Composición>` y renderizar.
