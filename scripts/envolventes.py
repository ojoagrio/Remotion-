"""Calcula la "envolvente" (volumen por frame, 0..1) de cada audio de un guion para mover
las bocas sin decodificar audio en el navegador durante el render.

Uso: python3 scripts/envolventes.py src/sitcom/guion.json [fps=30]
Escribe envolventes.json junto al guion. Solo necesita numpy.
"""

import json
import os
import subprocess
import sys
import wave

import numpy as np

ruta_guion = sys.argv[1]
fps = int(sys.argv[2]) if len(sys.argv) > 2 else 30
guion = json.load(open(ruta_guion, encoding="utf8"))
carpeta = os.path.join("public/voces", guion.get("carpeta", ""))
resultado = {}

for linea in guion["lineas"]:
    mp3 = os.path.join(carpeta, f"{linea['id']}.mp3")
    tmp = mp3 + ".wav"
    subprocess.run(
        ["npx", "remotion", "ffmpeg", "-y", "-i", mp3, "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", tmp],
        check=True,
        capture_output=True,
    )
    with wave.open(tmp) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
        sr = w.getframerate()
    os.remove(tmp)
    n = sr // fps
    bloques = x[: len(x) // n * n].reshape(-1, n)
    rms = np.sqrt((bloques**2).mean(axis=1))
    # Normaliza con el percentil 95 para que la boca abra bien sin saturar
    ref = np.percentile(rms, 95) + 1e-9
    resultado[linea["id"]] = [round(float(min(1.0, v / ref)), 2) for v in rms]

json.dump(resultado, open(os.path.join(os.path.dirname(ruta_guion), "envolventes.json"), "w"))
print(f"{len(resultado)} envolventes guardadas")
