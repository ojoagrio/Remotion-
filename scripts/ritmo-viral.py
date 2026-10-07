"""Da ritmo viral a las voces de un guion: quita silencios largos (cortes de salto) y
acelera la voz sin cambiar el tono. Actualiza duraciones.json y palabras.json.

Uso: python3 scripts/ritmo-viral.py src/industria/guion.json [velocidad=1.15] [pausa_max=0.3]
Requiere haber generado antes las voces con "timestamps": true. Solo necesita numpy.
"""

import json
import os
import subprocess
import sys
import wave

import numpy as np

ruta_guion = sys.argv[1]
velocidad = float(sys.argv[2]) if len(sys.argv) > 2 else 1.15
pausa_max = float(sys.argv[3]) if len(sys.argv) > 3 else 0.3

carpeta_src = os.path.dirname(ruta_guion)
guion = json.load(open(ruta_guion, encoding="utf8"))
carpeta_audio = os.path.join("public/voces", guion.get("carpeta", ""))
palabras = json.load(open(os.path.join(carpeta_src, "palabras.json"), encoding="utf8"))
duraciones = {}


def ffmpeg(*args):
    subprocess.run(["npx", "remotion", "ffmpeg", "-y", *args], check=True, capture_output=True)


def leer_wav(ruta):
    with wave.open(ruta) as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16), w.getframerate()


def escribir_wav(ruta, x, sr):
    with wave.open(ruta, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(x.astype(np.int16).tobytes())


for linea in guion["lineas"]:
    i = linea["id"]
    mp3 = os.path.join(carpeta_audio, f"{i}.mp3")
    tmp = os.path.join(carpeta_audio, f"_{i}.wav")
    ffmpeg("-i", mp3, "-ac", "1", "-ar", "44100", "-c:a", "pcm_s16le", tmp)
    x, sr = leer_wav(tmp)
    dur = len(x) / sr
    ws = palabras[i]

    # Tramos que se conservan: desde poco antes de la primera palabra hasta poco después
    # de la última, recortando cada silencio entre palabras a "pausa_max"
    tramos = []
    inicio = max(0.0, ws[0]["inicio"] - 0.05)
    for a, b in zip(ws, ws[1:]):
        hueco = b["inicio"] - a["fin"]
        if hueco > pausa_max:
            tramos.append((inicio, a["fin"] + pausa_max / 2))
            inicio = b["inicio"] - pausa_max / 2
    tramos.append((inicio, min(dur, ws[-1]["fin"] + 0.2)))

    # Une los tramos con un fundido muy corto para que no se oigan chasquidos
    f = int(sr * 0.01)
    partes = []
    for a, b in tramos:
        seg = x[int(a * sr) : int(b * sr)].astype(float)
        if len(seg) > 2 * f:
            seg[:f] *= np.linspace(0, 1, f)
            seg[-f:] *= np.linspace(1, 0, f)
        partes.append(seg)
    escribir_wav(tmp, np.concatenate(partes), sr)

    # Reajusta los tiempos de cada palabra al audio recortado y acelerado
    def nuevo_tiempo(t):
        acumulado = 0.0
        for a, b in tramos:
            if t < a:
                return acumulado / velocidad
            if t <= b:
                return (acumulado + t - a) / velocidad
            acumulado += b - a
        return acumulado / velocidad

    palabras[i] = [
        {"palabra": w["palabra"], "inicio": round(nuevo_tiempo(w["inicio"]), 3), "fin": round(nuevo_tiempo(w["fin"]), 3)}
        for w in ws
    ]

    # Acelera sin cambiar el tono (atempo) y vuelve a MP3
    ffmpeg("-i", tmp, "-filter:a", f"atempo={velocidad}", "-c:a", "libmp3lame", "-b:a", "128k", mp3)
    os.remove(tmp)
    salida = subprocess.run(
        ["npx", "remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3],
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    duraciones[i] = float(salida.splitlines()[-1])
    print(f"{mp3}  {dur:.2f} s -> {duraciones[i]:.2f} s")

json.dump(duraciones, open(os.path.join(carpeta_src, "duraciones.json"), "w"), indent=2)
json.dump(palabras, open(os.path.join(carpeta_src, "palabras.json"), "w", encoding="utf8"), indent=1, ensure_ascii=False)
print(f"Total: {sum(duraciones.values()):.1f} s")
