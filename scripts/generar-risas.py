"""Fabrica las risas grabadas (laugh track) de la sitcom mezclando grabaciones de varias
voces como si fueran un público en un estudio, y sintetiza aplausos.

Uso: python3 scripts/generar-risas.py
Lee audio-fuente/risas/{risa,ooh}_N.mp3 (generadas con ElevenLabs eleven_v3 y etiquetas
[laughs]) y escribe public/sonidos/{risa-chica,risa-grande,ooh,aplausos,risa-aplauso}.wav.
Solo necesita numpy.
"""

import glob
import os
import subprocess
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(7)
SALIDA = "public/sonidos"


def leer(ruta):
    tmp = ruta + ".wav"
    subprocess.run(
        ["npx", "remotion", "ffmpeg", "-y", "-i", ruta, "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", tmp],
        check=True,
        capture_output=True,
    )
    with wave.open(tmp) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
    os.remove(tmp)
    # Recorta silencio inicial
    inicio = np.argmax(np.abs(x) > 0.02)
    return x[inicio:]


def cambiar_tono(x, factor):
    """Remuestreo simple: factor > 1 = voz más aguda (y más corta)."""
    idx = np.arange(0, len(x) - 1, factor)
    return np.interp(idx, np.arange(len(x)), x)


def sala(x):
    """Eco de estudio: varias reflexiones cortas y un poco de pérdida de agudos."""
    y = x.copy()
    for retraso, ganancia in [(0.023, 0.35), (0.041, 0.28), (0.067, 0.22), (0.11, 0.15), (0.17, 0.1)]:
        r = int(SR * retraso)
        y[r:] += x[:-r] * ganancia
    suave = np.convolve(y, np.ones(4) / 4, mode="same")
    return suave


def mezclar(capas, duracion, fundido=0.6):
    n = int(SR * duracion)
    total = np.zeros(n)
    for inicio, x, ganancia in capas:
        i = int(SR * inicio)
        if i >= n:
            continue
        trozo = x[: n - i]
        total[i : i + len(trozo)] += trozo * ganancia
    f = int(SR * fundido)
    total[-f:] *= np.linspace(1, 0, f) ** 1.5
    total[: int(SR * 0.04)] *= np.linspace(0, 1, int(SR * 0.04))
    return total


def guardar(nombre, x, volumen=0.85):
    x = sala(x)
    x = x / (np.max(np.abs(x)) + 1e-9) * volumen
    with wave.open(os.path.join(SALIDA, f"{nombre}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    print(f"{SALIDA}/{nombre}.wav  {len(x) / SR:.2f} s")


def aplausos(duracion=4.0, densidad=420):
    """Muchas palmadas cortas al azar: ruido filtrado con caída rápida."""
    n = int(SR * duracion)
    total = np.zeros(n)
    golpes = int(densidad * duracion)
    for _ in range(golpes):
        i = int(rng.uniform(0, duracion - 0.05) * SR)
        largo = int(SR * rng.uniform(0.008, 0.02))
        ruido = rng.uniform(-1, 1, largo)
        ruido = np.diff(ruido, prepend=0)  # más brillante
        env = np.exp(-np.arange(largo) / (largo / 4))
        total[i : i + largo] += ruido * env * rng.uniform(0.3, 1.0)
    # Sube rápido y baja lento
    forma = np.minimum(1, np.arange(n) / (SR * 0.25)) * np.linspace(1, 0.15, n) ** 0.8
    return total * forma


if __name__ == "__main__":
    risas = [leer(r) for r in sorted(glob.glob("audio-fuente/risas/risa_*.mp3"))]
    oohs = [leer(r) for r in sorted(glob.glob("audio-fuente/risas/ooh_*.mp3"))]

    # Público: cada grabación aparece varias veces con otro tono y otro momento
    def publico(fuentes, copias, dispersion, rango_tono):
        capas = []
        for x in fuentes:
            for _ in range(copias):
                capas.append((rng.uniform(0, dispersion), cambiar_tono(x, rng.uniform(*rango_tono)), rng.uniform(0.4, 1.0)))
        return capas

    guardar("risa-chica", mezclar(publico(risas[:5], 1, 0.25, (0.95, 1.1)), 1.8))
    grande = publico(risas, 3, 0.35, (0.85, 1.2))
    guardar("risa-grande", mezclar(grande, 3.0, 0.9))
    guardar("ooh", mezclar(publico(oohs, 2, 0.2, (0.9, 1.1)), 2.0, 0.7))
    guardar("aplausos", aplausos(4.0))
    # Carcajada con aplausos: lo más fuerte, para los remates principales
    risa = mezclar(grande, 3.6, 1.0)
    palmas = aplausos(3.6, 520)
    guardar("risa-aplauso", risa / (np.abs(risa).max() + 1e-9) + palmas / (np.abs(palmas).max() + 1e-9) * 0.5)
