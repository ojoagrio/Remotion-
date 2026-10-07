"""Procesa las voces crudas de un guion (audio-fuente/voces/<carpeta>) y deja todo listo
para Remotion en un solo paso:

- public/voces/<carpeta>/<id>.mp3: con ritmo opcional (recorta silencios largos y acelera
  sin cambiar el tono) si el guion tiene "ritmo": {"velocidad": 1.1, "pausa": 0.3}
- duraciones.json, palabras.json (si hay tiempos por palabra) y envolventes.json (volumen
  por frame para las bocas) junto al guion.

Uso: python3 scripts/procesar-voces.py src/sitcom/ep2/guion.json
Solo necesita numpy. Lo llama scripts/producir.mjs.
"""

import json
import os
import subprocess
import sys
import wave

import numpy as np

SR = 44100
FPS = 30


def ffmpeg(*args):
    subprocess.run(["npx", "remotion", "ffmpeg", "-y", *args], check=True, capture_output=True)


def leer_mp3(ruta):
    tmp = ruta + ".wav"
    ffmpeg("-i", ruta, "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", tmp)
    with wave.open(tmp) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    os.remove(tmp)
    return x


def escribir_mp3(ruta, x, velocidad):
    tmp = ruta + ".wav"
    with wave.open(tmp, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    filtro = ["-filter:a", f"atempo={velocidad}"] if velocidad != 1 else []
    ffmpeg("-i", tmp, *filtro, "-c:a", "libmp3lame", "-b:a", "128k", ruta)
    os.remove(tmp)


def tramos_con_voz(x, umbral_db=-38, ventana=0.02):
    n = int(SR * ventana)
    bloques = x[: len(x) // n * n].reshape(-1, n)
    voz = 20 * np.log10(np.sqrt((bloques**2).mean(axis=1)) + 1e-9) > umbral_db
    lista, inicio = [], None
    for i, v in enumerate(voz):
        if v and inicio is None:
            inicio = i
        if not v and inicio is not None:
            lista.append({"palabra": "", "inicio": inicio * ventana, "fin": i * ventana})
            inicio = None
    if inicio is not None:
        lista.append({"palabra": "", "inicio": inicio * ventana, "fin": len(voz) * ventana})
    return lista or [{"palabra": "", "inicio": 0.0, "fin": len(x) / SR}]


def palabras_de_alineacion(a):
    lista, actual, etiqueta = [], None, False
    for c, ini, fin in zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]):
        if c == "[":
            etiqueta = True
        if etiqueta:
            etiqueta = c != "]"
            continue
        if c.isspace():
            actual = None
            continue
        if actual is None:
            actual = {"palabra": "", "inicio": ini, "fin": fin}
            lista.append(actual)
        actual["palabra"] += c
        actual["fin"] = fin
    return lista


def main(ruta_guion):
    guion = json.load(open(ruta_guion, encoding="utf8"))
    carpeta = guion.get("carpeta", "")
    crudo = os.path.join("audio-fuente/voces", carpeta)
    destino = os.path.join("public/voces", carpeta)
    os.makedirs(destino, exist_ok=True)
    ritmo = guion.get("ritmo") or {}
    velocidad = float(ritmo.get("velocidad", 1.0))
    pausa_max = float(ritmo.get("pausa", 0)) or None

    duraciones, palabras, envolventes = {}, {}, {}
    for linea in guion["lineas"]:
        i = linea["id"]
        x = leer_mp3(os.path.join(crudo, f"{i}.mp3"))
        ruta_alin = os.path.join(crudo, f"{i}.json")
        ws = palabras_de_alineacion(json.load(open(ruta_alin))) if os.path.exists(ruta_alin) else None
        segmentos = ws or tramos_con_voz(x)

        # Tramos que se conservan (cortes de salto en silencios largos)
        if pausa_max:
            tramos, inicio = [], max(0.0, segmentos[0]["inicio"] - 0.05)
            for a, b in zip(segmentos, segmentos[1:]):
                if b["inicio"] - a["fin"] > pausa_max:
                    tramos.append((inicio, a["fin"] + pausa_max / 2))
                    inicio = b["inicio"] - pausa_max / 2
            tramos.append((inicio, min(len(x) / SR, segmentos[-1]["fin"] + 0.2)))
        else:
            tramos = [(0.0, len(x) / SR)]

        f = int(SR * 0.01)
        partes = []
        for a, b in tramos:
            seg = x[int(a * SR) : int(b * SR)].copy()
            if len(seg) > 2 * f:
                seg[:f] *= np.linspace(0, 1, f)
                seg[-f:] *= np.linspace(1, 0, f)
            partes.append(seg)
        y = np.concatenate(partes)

        def nuevo(t):
            acumulado = 0.0
            for a, b in tramos:
                if t < a:
                    break
                if t <= b:
                    return (acumulado + t - a) / velocidad
                acumulado += b - a
            return acumulado / velocidad

        if ws:
            palabras[i] = [{"palabra": w["palabra"], "inicio": round(nuevo(w["inicio"]), 3), "fin": round(nuevo(w["fin"]), 3)} for w in ws]

        escribir_mp3(os.path.join(destino, f"{i}.mp3"), y, velocidad)
        z = leer_mp3(os.path.join(destino, f"{i}.mp3"))
        duraciones[i] = round(len(z) / SR, 4)
        # Envolvente para las bocas (volumen por frame normalizado)
        n = SR // FPS
        rms = np.sqrt((z[: len(z) // n * n].reshape(-1, n) ** 2).mean(axis=1))
        ref = np.percentile(rms, 95) + 1e-9
        envolventes[i] = [round(float(min(1.0, v / ref)), 2) for v in rms]
        print(f"{i}: {len(x) / SR:.2f} s -> {duraciones[i]:.2f} s")

    base = os.path.dirname(ruta_guion)
    json.dump(duraciones, open(os.path.join(base, "duraciones.json"), "w"), indent=2)
    json.dump(envolventes, open(os.path.join(base, "envolventes.json"), "w"))
    if palabras:
        json.dump(palabras, open(os.path.join(base, "palabras.json"), "w", encoding="utf8"), indent=1, ensure_ascii=False)
    print(f"Total voz: {sum(duraciones.values()):.1f} s")


if __name__ == "__main__":
    main(sys.argv[1])
