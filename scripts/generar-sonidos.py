"""Genera efectos de sonido y música retro (8 bits) por síntesis, sin servicios externos.

Uso: python3 scripts/generar-sonidos.py
Escribe archivos WAV en public/sonidos/. Solo necesita numpy.
"""

import os
import wave

import numpy as np

SR = 44100
CARPETA = "public/sonidos"
rng = np.random.default_rng(64)


def t(seg):
    return np.arange(int(SR * seg)) / SR


def nota(n):
    """Frecuencia de una nota MIDI."""
    return 440.0 * 2 ** ((n - 69) / 12)


def cuadrada(f, seg, ciclo=0.5):
    fase = np.cumsum(np.broadcast_to(f, t(seg).shape) / SR) % 1.0
    return np.where(fase < ciclo, 1.0, -1.0)


def triangular(f, seg):
    fase = np.cumsum(np.broadcast_to(f, t(seg).shape) / SR) % 1.0
    return 4 * np.abs(fase - 0.5) - 1


def sierra(f, seg):
    fase = np.cumsum(np.broadcast_to(f, t(seg).shape) / SR) % 1.0
    return 2 * fase - 1


def senoidal(f, seg):
    return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, t(seg).shape) / SR))


def ruido(seg):
    return rng.uniform(-1, 1, int(SR * seg))


def paso_bajo(x, ventana):
    """Filtro paso bajo simple (media móvil)."""
    if ventana <= 1:
        return x
    return np.convolve(x, np.ones(ventana) / ventana, mode="same")


def paso_alto(x):
    return np.diff(x, prepend=0.0)


def envolvente(n, ataque=0.005, caida=None):
    """Ataque lineal y caída exponencial (caida = constante de tiempo en segundos)."""
    e = np.ones(n)
    a = max(1, int(SR * ataque))
    e[:a] = np.linspace(0, 1, a)
    if caida:
        e *= np.exp(-np.arange(n) / (SR * caida))
    return e


def mezclar(longitud, *partes):
    """partes: (inicio_seg, señal)"""
    salida = np.zeros(int(SR * longitud))
    for inicio, s in partes:
        i = int(SR * inicio)
        fin = min(len(salida), i + len(s))
        salida[i:fin] += s[: fin - i]
    return salida


def guardar(nombre, x, volumen=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * volumen
    # Rampa corta al final para evitar chasquidos
    r = min(len(x), int(SR * 0.01))
    x[-r:] *= np.linspace(1, 0, r)
    datos = (x * 32767).astype(np.int16)
    ruta = os.path.join(CARPETA, f"{nombre}.wav")
    with wave.open(ruta, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(datos.tobytes())
    print(f"{ruta}  {len(x) / SR:.2f} s")


# ---------------------------------------------------------------- música
def musica_chiptune():
    """Bucle alegre de 16 compases cortos a 120 bpm: C - Am - F - G."""
    bpm = 120
    negra = 60 / bpm
    acordes = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [53, 57, 60]), (43, [55, 59, 62])]
    melodia = [
        72, 76, 79, 76, 74, 72, 74, 76,
        72, 69, 72, 76, 74, 72, 69, 67,
        69, 72, 77, 76, 74, 72, 74, 77,
        79, 77, 76, 74, 71, 74, 79, 0,
    ]
    corcheas_por_acorde = 8
    total = len(acordes) * corcheas_por_acorde * (negra / 2) * 2  # dos vueltas
    partes = []
    for vuelta in range(2):
        for i, (bajo, triada) in enumerate(acordes):
            base = (vuelta * 4 + i) * corcheas_por_acorde * negra / 2
            # Bajo triangular en negras
            for b in range(4):
                n = bajo if b % 2 == 0 else bajo + 12
                s = triangular(nota(n), negra * 0.9) * envolvente(int(SR * negra * 0.9), caida=0.25)
                partes.append((base + b * negra, s * 0.5))
            # Arpegio de cuadrada fina en semicorcheas
            for k in range(16):
                n = triada[k % 3] + 12
                d = negra / 4
                s = cuadrada(nota(n), d * 0.8, 0.125) * envolvente(int(SR * d * 0.8), caida=0.05)
                partes.append((base + k * d, s * 0.12))
            # Melodía en corcheas
            for k in range(corcheas_por_acorde):
                n = melodia[(i * corcheas_por_acorde + k) % len(melodia)]
                if n:
                    d = negra / 2
                    s = cuadrada(nota(n), d * 0.85, 0.25) * envolvente(int(SR * d * 0.85), caida=0.18)
                    partes.append((base + k * d, s * 0.22))
            # Percusión: bombo en 1 y 3, caja en 2 y 4, platillo en corcheas
            for b in range(4):
                if b % 2 == 0:
                    f = np.linspace(150, 40, int(SR * 0.15))
                    bombo = senoidal(f, 0.15) * envolvente(int(SR * 0.15), caida=0.05)
                    partes.append((base + b * negra, bombo * 0.6))
                else:
                    caja = paso_alto(ruido(0.12)) * envolvente(int(SR * 0.12), caida=0.03)
                    partes.append((base + b * negra, caja * 0.25))
            for k in range(8):
                plat = paso_alto(paso_alto(ruido(0.04))) * envolvente(int(SR * 0.04), caida=0.01)
                partes.append((base + k * negra / 2, plat * 0.08))
    return mezclar(total, *partes)


# ---------------------------------------------------------------- efectos
def teclado():
    partes = []
    pos = 0.0
    while pos < 6:
        clic = paso_alto(ruido(0.03)) * envolvente(int(SR * 0.03), 0.001, 0.006)
        golpe = senoidal(rng.uniform(1800, 2600), 0.03) * envolvente(int(SR * 0.03), 0.001, 0.004)
        partes.append((pos, clic * rng.uniform(0.5, 1) + golpe * 0.3))
        # Ritmo irregular, con alguna pausa de "pensar"
        pos += rng.uniform(0.06, 0.16) if rng.random() > 0.08 else rng.uniform(0.3, 0.5)
    return mezclar(6.2, *partes)


def whoosh(seg=0.7):
    n = int(SR * seg)
    x = ruido(seg)
    # Paso bajo que se abre y se cierra
    graves = paso_bajo(x, 40)
    agudos = x - paso_bajo(x, 4)
    forma = np.sin(np.linspace(0, np.pi, n)) ** 2
    mezcla = graves * (1 - forma) + agudos * forma
    return mezcla * forma


def scratch():
    seg = 0.55
    # Tono que sube y baja muy rápido, como un disco frenado a mano
    f = 300 + 900 * np.abs(np.sin(np.linspace(0, 3 * np.pi, int(SR * seg)))) * np.linspace(1, 0.3, int(SR * seg))
    tono = sierra(f, seg)
    textura = paso_bajo(ruido(seg), 3) * 0.6
    return (tono * 0.6 + textura) * envolvente(int(SR * seg), 0.002) * np.linspace(1, 0.2, int(SR * seg))


def impacto():
    seg = 1.2
    f = np.geomspace(110, 30, int(SR * seg))
    cuerpo = senoidal(f, seg) * envolvente(int(SR * seg), 0.001, 0.35)
    golpe = paso_bajo(ruido(seg), 6) * envolvente(int(SR * seg), 0.001, 0.05)
    return cuerpo + golpe * 0.7


def bip_robot():
    partes = []
    for i, n in enumerate([84, 91, 88, 96]):
        s = cuadrada(nota(n), 0.07, 0.25) * envolvente(int(SR * 0.07), 0.002, 0.04)
        partes.append((i * 0.08, s))
    return mezclar(0.4, *partes)


def procesando():
    partes = []
    pos = 0.0
    while pos < 3:
        n = int(rng.integers(84, 100))
        s = cuadrada(nota(n), 0.05, 0.5) * envolvente(int(SR * 0.05), 0.001, 0.02)
        partes.append((pos, s))
        pos += 0.09
    return mezclar(3.1, *partes)


def suspenso():
    seg = 3.6
    n = int(SR * seg)
    tremolo = 0.6 + 0.4 * np.sin(2 * np.pi * 3 * t(seg))
    dron = (sierra(nota(33), seg) + sierra(nota(33) * 1.007, seg) + sierra(nota(40), seg) * 0.5)
    dron = paso_bajo(dron, 30) * tremolo
    subida = np.linspace(0.3, 1, n)
    return dron * subida * envolvente(n, 0.3)


def error():
    seg = 0.7
    s = cuadrada(nota(45), seg) + cuadrada(nota(45) * 1.06, seg)
    corte = (np.floor(t(seg) / 0.12) % 2 == 0).astype(float)
    return s * corte * envolvente(int(SR * seg), 0.002)


def alarma():
    seg = 4.8
    f = 700 + 400 * (0.5 + 0.5 * np.sin(2 * np.pi * 1.2 * t(seg)))
    return (cuadrada(f, seg, 0.5) * 0.6 + senoidal(f * 0.5, seg) * 0.4) * envolvente(int(SR * seg), 0.02)


def dun_dun_dunnn():
    """El clásico efecto dramático: dos notas cortas y una larga con trémolo."""
    partes = []

    def metales(n, seg, trem=False):
        x = sierra(nota(n), seg) + sierra(nota(n) * 1.005, seg) + sierra(nota(n - 12), seg) * 0.8
        x = paso_bajo(x, 8)
        if trem:
            x *= 0.75 + 0.25 * np.sin(2 * np.pi * 6 * t(seg))
        return x * envolvente(int(SR * seg), 0.01, seg * 0.8)

    partes.append((0.0, metales(55, 0.28)))
    partes.append((0.35, metales(55, 0.28)))
    partes.append((0.7, metales(51, 1.6, True)))
    return mezclar(2.4, *partes)


def ding():
    seg = 1.2
    partes = []
    for i, n in enumerate([88, 84]):
        s = senoidal(nota(n), seg) + senoidal(nota(n) * 2.01, seg) * 0.3
        partes.append((i * 0.15, s * envolvente(int(SR * seg), 0.002, 0.35)))
    return mezclar(1.4, *partes)


def silbato_caida():
    seg = 0.9
    f = np.geomspace(1700, 250, int(SR * seg)) * (1 + 0.03 * np.sin(2 * np.pi * 9 * t(seg)))
    return senoidal(f, seg) * envolvente(int(SR * seg), 0.02)


def golpe_seco():
    seg = 0.5
    f = np.geomspace(120, 40, int(SR * seg))
    cuerpo = senoidal(f, seg) * envolvente(int(SR * seg), 0.001, 0.09)
    polvo = paso_bajo(ruido(seg), 10) * envolvente(int(SR * seg), 0.001, 0.06)
    return cuerpo + polvo * 0.8


def rimshot():
    """Ba-dum-tss."""
    partes = []
    for i, f0 in enumerate([220, 160]):
        f = np.geomspace(f0, f0 * 0.5, int(SR * 0.25))
        tom = senoidal(f, 0.25) * envolvente(int(SR * 0.25), 0.001, 0.08)
        partes.append((i * 0.18, tom))
    platillo = paso_alto(paso_alto(ruido(1.2))) * envolvente(int(SR * 1.2), 0.001, 0.35)
    partes.append((0.4, platillo * 0.5))
    bombo = senoidal(np.geomspace(150, 45, int(SR * 0.2)), 0.2) * envolvente(int(SR * 0.2), 0.001, 0.06)
    partes.append((0.4, bombo))
    return mezclar(1.7, *partes)


# ---------------------------------------------------------------- «La chancla»
def musica_polka():
    """Polka alegre de cocina a 140 bpm (oom-pah) en Sol mayor."""
    negra = 60 / 140
    # (raíz del bajo, notas del acorde)
    acordes = [(43, [67, 71, 74]), (38, [66, 69, 74]), (38, [66, 69, 72]), (43, [67, 71, 74]),
               (43, [67, 71, 74]), (36, [64, 67, 72]), (38, [66, 69, 74]), (43, [67, 71, 74])]
    melodia = [
        [74, 71, 74, 79], [78, 76, 74, 72], [72, 74, 76, 78], [79, 0, 74, 0],
        [71, 74, 79, 83], [84, 83, 81, 79], [78, 79, 81, 78], [79, 0, 0, 0],
    ]
    compas = 2 * negra
    total = len(acordes) * compas * 2
    partes = []
    for vuelta in range(2):
        for i, (raiz, acorde) in enumerate(acordes):
            base = (vuelta * len(acordes) + i) * compas
            for b in range(2):
                # "Oom": bajo en el tiempo
                n = raiz if b == 0 else raiz + 7
                s = triangular(nota(n), negra * 0.45) * envolvente(int(SR * negra * 0.45), caida=0.12)
                partes.append((base + b * negra, s * 0.6))
                # "Pah": acorde en el contratiempo
                for a in acorde:
                    d = negra * 0.3
                    s = cuadrada(nota(a), d, 0.25) * envolvente(int(SR * d), caida=0.05)
                    partes.append((base + b * negra + negra / 2, s * 0.07))
            # Melodía tipo trompeta (sierra suavizada) en corcheas
            for k, n in enumerate(melodia[i]):
                if n:
                    d = negra / 2
                    s = paso_bajo(sierra(nota(n), d * 0.9), 4) * envolvente(int(SR * d * 0.9), 0.01, 0.2)
                    s *= 1 + 0.05 * np.sin(2 * np.pi * 6 * t(d * 0.9))
                    partes.append((base + k * d, s * 0.28))
            # Caja en el contratiempo
            for b in range(2):
                caja = paso_alto(ruido(0.08)) * envolvente(int(SR * 0.08), caida=0.02)
                partes.append((base + b * negra + negra / 2, caja * 0.15))
    return mezclar(total, *partes)


def silbido_western():
    """Silbido de duelo del viejo oeste: wa-wa-wa-wa-waaaa."""
    notas = [(69, 0.2), (74, 0.2), (69, 0.2), (74, 0.2), (69, 1.0)]
    partes = []
    pos = 0.0
    for n, d in notas:
        f = nota(n + 12) * (1 + 0.012 * np.sin(2 * np.pi * 6 * t(d)))
        # Pequeño deslizamiento al empezar cada nota
        f = f * (1 - 0.04 * np.exp(-t(d) / 0.03))
        s = senoidal(f, d) + paso_bajo(ruido(d), 3) * 0.04
        partes.append((pos, s * envolvente(int(SR * d), 0.02, d * 1.5)))
        pos += d + 0.03
    return mezclar(pos + 0.2, *partes)


def plaf():
    """Chanclazo: golpe seco y brillante."""
    seg = 0.35
    golpe = paso_alto(ruido(seg)) * envolvente(int(SR * seg), 0.0005, 0.03)
    cuerpo = senoidal(np.geomspace(300, 90, int(SR * seg)), seg) * envolvente(int(SR * seg), 0.0005, 0.05)
    return golpe + cuerpo * 0.8


def burbujas():
    partes = []
    pos = 0.0
    while pos < 3:
        d = rng.uniform(0.05, 0.1)
        f = np.geomspace(rng.uniform(300, 600), rng.uniform(900, 1600), int(SR * d))
        partes.append((pos, senoidal(f, d) * envolvente(int(SR * d), 0.002, d / 3)))
        pos += rng.uniform(0.05, 0.14)
    return mezclar(3.2, *partes)


def brillo():
    partes = []
    for i, n in enumerate([88, 91, 96, 100, 103]):
        s = senoidal(nota(n), 0.5) * envolvente(int(SR * 0.5), 0.002, 0.15)
        partes.append((i * 0.06, s))
    return mezclar(0.9, *partes)


def gota():
    seg = 0.25
    f = np.geomspace(500, 1400, int(SR * seg))
    return senoidal(f, seg) * envolvente(int(SR * seg), 0.002, 0.05)


def actualizacion():
    """Melodía de sistema operativo: «actualización instalada»."""
    partes = []
    for i, n in enumerate([72, 76, 79, 84]):
        s = (cuadrada(nota(n), 0.35, 0.25) * 0.4 + senoidal(nota(n), 0.35)) * envolvente(int(SR * 0.35), 0.005, 0.2)
        partes.append((i * 0.11, s))
    return mezclar(1.0, *partes)


# ---------------------------------------------------------------- «El chisme»
def musica_synthpop():
    """Synth-pop ochentero a 112 bpm en La menor: Am - F - C - G, con bajo arpegiado y pads."""
    negra = 60 / 112
    acordes = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [55, 60, 64]), (43, [55, 59, 62])]
    compas = 4 * negra
    vueltas = 4
    total = len(acordes) * compas * vueltas
    partes = []
    gancho = [76, 74, 72, 74, 76, 79, 76, 0]
    for v in range(vueltas):
        for i, (raiz, acorde) in enumerate(acordes):
            base = (v * len(acordes) + i) * compas
            # Pad: sierras desafinadas y suavizadas
            pad = sum(sierra(nota(n) * d, compas) for n in acorde for d in (0.997, 1.003))
            pad = paso_bajo(pad, 12) * envolvente(int(SR * compas), 0.15) * np.linspace(1, 0.7, int(SR * compas))
            partes.append((base, pad * 0.05))
            # Bajo en corcheas, octavas alternas
            for k in range(8):
                n = raiz if k % 2 == 0 else raiz + 12
                d = negra / 2
                s = paso_bajo(sierra(nota(n), d * 0.9), 5) * envolvente(int(SR * d * 0.9), 0.003, 0.12)
                partes.append((base + k * d, s * 0.35))
            # Gancho de sintetizador (solo en vueltas pares)
            if v % 2 == 1:
                for k, n in enumerate(gancho):
                    if n:
                        d = negra / 2
                        s = cuadrada(nota(n), d * 0.8, 0.3) * envolvente(int(SR * d * 0.8), 0.005, 0.15)
                        partes.append((base + k * d, s * 0.1))
            # Batería: bombo a negras, caja en 2 y 4 con eco, charles en corcheas
            for b in range(4):
                bombo = senoidal(np.geomspace(140, 45, int(SR * 0.18)), 0.18) * envolvente(int(SR * 0.18), 0.001, 0.06)
                partes.append((base + b * negra, bombo * 0.7))
                if b % 2 == 1:
                    caja = (paso_alto(ruido(0.25)) + senoidal(190, 0.25) * 0.5) * envolvente(int(SR * 0.25), 0.001, 0.07)
                    partes.append((base + b * negra, caja * 0.3))
                    partes.append((base + b * negra + negra * 0.75, caja * 0.08))
            for k in range(8):
                charles = paso_alto(paso_alto(ruido(0.05))) * envolvente(int(SR * 0.05), 0.001, 0.012)
                partes.append((base + k * negra / 2, charles * 0.1))
    return mezclar(total, *partes)


def sting_chisme():
    """Cortinilla de programa de chismes: tres golpes y un brillo."""
    partes = []
    for i, n in enumerate([64, 67, 72]):
        s = (sierra(nota(n), 0.18) + sierra(nota(n + 7), 0.18)) * envolvente(int(SR * 0.18), 0.003, 0.08)
        partes.append((i * 0.14, paso_bajo(s, 4)))
        golpe = senoidal(np.geomspace(150, 50, int(SR * 0.15)), 0.15) * envolvente(int(SR * 0.15), 0.001, 0.05)
        partes.append((i * 0.14, golpe))
    platillo = paso_alto(paso_alto(ruido(1.0))) * envolvente(int(SR * 1.0), 0.001, 0.3)
    partes.append((0.42, platillo * 0.4))
    partes.append((0.42, brillo() * 0.5))
    return mezclar(1.4, *partes)


def abucheo():
    """Público abucheando: muchas voces graves «buuu» que bajan de tono."""
    seg = 2.4
    n = int(SR * seg)
    total = np.zeros(n)
    for _ in range(24):
        f0 = rng.uniform(95, 180)
        caida = np.linspace(1.0, rng.uniform(0.8, 0.9), n)
        vibrato = 1 + 0.02 * np.sin(2 * np.pi * rng.uniform(4, 7) * t(seg) + rng.uniform(0, 6))
        voz = sierra(f0 * caida * vibrato, seg)
        retraso = int(SR * rng.uniform(0, 0.3))
        total[retraso:] += voz[: n - retraso]
    # Formante de «u»: muy suavizado
    total = paso_bajo(paso_bajo(total, 20), 20)
    return total * envolvente(n, 0.25) * np.linspace(1, 0.3, n)


def pop():
    seg = 0.12
    f = np.geomspace(600, 1500, int(SR * seg))
    return senoidal(f, seg) * envolvente(int(SR * seg), 0.001, 0.03)


# ---------------------------------------------------------------- «La industria tech»
def musica_trap():
    """Ritmo trap a 140 bpm (medio tiempo) en Fa menor: 808, charles con redobles y campana."""
    negra = 60 / 140
    compas = 4 * negra
    raices = [41, 41, 44, 39]  # Fa, Fa, La bemol, Mi bemol
    vueltas = 4
    total = len(raices) * compas * vueltas
    partes = []
    for v in range(vueltas):
        for i, raiz in enumerate(raices):
            base = (v * len(raices) + i) * compas
            # 808: bombo largo con tono que cae ligeramente
            for pos in [0, 1.5, 2.75]:
                d = negra * 1.4
                f = nota(raiz - 12) * np.geomspace(1.25, 1.0, int(SR * d))
                s = np.tanh(senoidal(f, d) * 2.5) * envolvente(int(SR * d), 0.002, d * 0.6)
                partes.append((base + pos * negra, s * 0.5))
            # Caja/palmada en el tiempo 3 (medio tiempo)
            palma = paso_alto(ruido(0.2)) * envolvente(int(SR * 0.2), 0.001, 0.05)
            partes.append((base + 2 * negra, palma * 0.4))
            # Charles en corcheas con redoble de semifusas al final de cada compás
            for k in range(8):
                h = paso_alto(paso_alto(ruido(0.03))) * envolvente(int(SR * 0.03), 0.001, 0.008)
                partes.append((base + k * negra / 2, h * 0.12))
            if i % 2 == 1:
                for k in range(8):
                    h = paso_alto(paso_alto(ruido(0.02))) * envolvente(int(SR * 0.02), 0.001, 0.005)
                    partes.append((base + 3 * negra + k * negra / 8, h * 0.1))
            # Campana (melodía) oscura
            for k, n in enumerate([raiz + 24, raiz + 27, raiz + 31, raiz + 27]):
                d = negra * 0.9
                s = (senoidal(nota(n), d) + senoidal(nota(n) * 2.76, d) * 0.3) * envolvente(int(SR * d), 0.002, 0.2)
                partes.append((base + k * negra, s * 0.07))
    return mezclar(total, *partes)


def vine_boom():
    """El «boom» grave de los remates virales."""
    seg = 1.6
    f = np.geomspace(90, 38, int(SR * seg))
    cuerpo = np.tanh(senoidal(f, seg) * 3) * envolvente(int(SR * seg), 0.002, 0.45)
    golpe = paso_bajo(ruido(seg), 8) * envolvente(int(SR * seg), 0.001, 0.04)
    # Eco corto para que suene "grande"
    x = cuerpo + golpe * 0.6
    eco = np.zeros_like(x)
    r = int(SR * 0.09)
    eco[r:] = x[:-r] * 0.35
    return x + eco


def glitch():
    """Ruido digital entrecortado (bitcrush)."""
    seg = 0.5
    x = cuadrada(np.where(t(seg) % 0.08 < 0.04, 180, 1400), seg) * 0.5 + ruido(seg) * 0.5
    escalones = np.round(x * 4) / 4  # pocos bits
    corte = (rng.random(int(seg / 0.025) + 1) > 0.3).repeat(int(SR * 0.025))[: int(SR * seg)]
    return escalones * corte * envolvente(int(SR * seg), 0.001)


if __name__ == "__main__":
    os.makedirs(CARPETA, exist_ok=True)
    guardar("musica-chiptune", musica_chiptune(), 0.8)
    guardar("teclado", teclado(), 0.7)
    guardar("whoosh", whoosh())
    guardar("whoosh-largo", whoosh(1.6))
    guardar("scratch", scratch())
    guardar("impacto", impacto())
    guardar("bip-robot", bip_robot(), 0.6)
    guardar("procesando", procesando(), 0.5)
    guardar("suspenso", suspenso())
    guardar("error", error(), 0.6)
    guardar("alarma", alarma(), 0.6)
    guardar("dun-dun-dunnn", dun_dun_dunnn())
    guardar("ding", ding(), 0.7)
    guardar("silbato-caida", silbato_caida(), 0.7)
    guardar("golpe", golpe_seco())
    guardar("rimshot", rimshot())
    guardar("musica-polka", musica_polka(), 0.8)
    guardar("silbido-western", silbido_western(), 0.7)
    guardar("plaf", plaf())
    guardar("burbujas", burbujas(), 0.5)
    guardar("brillo", brillo(), 0.6)
    guardar("gota", gota(), 0.6)
    guardar("actualizacion", actualizacion(), 0.7)
    guardar("musica-synthpop", musica_synthpop(), 0.8)
    guardar("sting-chisme", sting_chisme(), 0.8)
    guardar("abucheo", abucheo(), 0.7)
    guardar("pop", pop(), 0.5)
    guardar("musica-trap", musica_trap(), 0.8)
    guardar("vine-boom", vine_boom())
    guardar("glitch", glitch(), 0.5)
