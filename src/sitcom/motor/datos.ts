import { crearLineas, fin, Linea } from "../../comun/lineaDeTiempo";
import { Envolventes } from "../../comun/useBocas";

// Datos de un episodio de la sitcom. Un episodio nuevo solo necesita su guion.json:
//
// {
//   "carpeta": "sitcom-ep2", "formato": "vertical",
//   "titulo": "PROMPT & COMPAÑÍA", "episodio": "Episodio 2: «Vacaciones»",
//   "voces": {...}, "lineas": [
//     { "id": "01", "personaje": "kai", "texto": "...", "pausa": 1.8, "risa": "grande",
//       "acciones": { "sofi": "de-pie salta" }, "accionesRisa": { "raul": "brazos-arriba" },
//       "camara": "general", "camaraRisa": "raul", "tema": true }
//   ]
// }
//
// Si una línea no indica cámara, se usa el primer plano de quien habla; en las risas, el plano general.

export type Formato = "vertical" | "horizontal";

export type LineaEpisodio = {
  id: string;
  personaje: string;
  texto: string;
  pausa?: number;
  risa?: "chica" | "grande" | "ooh" | "aplauso";
  tema?: boolean;
  camara?: string;
  camaraRisa?: string;
  acciones?: Record<string, string>;
  accionesRisa?: Record<string, string>;
};

export type GuionEpisodio = {
  carpeta: string;
  formato?: Formato;
  titulo?: string;
  episodio?: string;
  lineas: LineaEpisodio[];
};

export const FPS = 30;
const TITULO_SEG = 4;
const RISA_ANTES_DEL_TITULO = 1.8;
const ARCHIVO_RISA = { chica: "risa-chica", grande: "risa-grande", ooh: "ooh", aplauso: "risa-aplauso" };

export type Episodio = ReturnType<typeof prepararEpisodio>;

export const prepararEpisodio = (guion: GuionEpisodio, duraciones: Record<string, number>, envolventes: Envolventes) => {
  const lineasGuion = guion.lineas.map((l) => ({ ...l, pausa: (l.pausa ?? 0) + (l.tema ? TITULO_SEG : 0) }));
  const lineas: Linea[] = crearLineas(lineasGuion, duraciones, { inicio: 0.6, fps: FPS, pausa: 0.22 });
  const indiceTema = guion.lineas.findIndex((l) => l.tema);
  const titulo = indiceTema >= 0 ? fin(lineas[indiceTema]) + Math.round(RISA_ANTES_DEL_TITULO * FPS) : -1;

  const risas = guion.lineas
    .map((l, i) => ({ l, linea: lineas[i] }))
    .filter(({ l }) => l.risa)
    .map(({ l, linea }) => ({
      id: linea.id,
      tipo: l.risa!,
      archivo: ARCHIVO_RISA[l.risa!],
      desde: fin(linea) - 3,
      hasta: fin(linea) + Math.round((l.tema ? RISA_ANTES_DEL_TITULO + 0.5 : l.pausa ?? 1) * FPS),
    }));

  // Cortes de cámara: quien habla durante su línea, la cámara de la risa después
  const cortes: { desde: number; plano: string }[] = [{ desde: 0, plano: "general" }];
  guion.lineas.forEach((l, i) => {
    cortes.push({ desde: lineas[i].inicio - 2, plano: l.camara ?? l.personaje });
    if (l.risa || l.camaraRisa) cortes.push({ desde: fin(lineas[i]) + 2, plano: l.camaraRisa ?? "general" });
  });
  if (titulo >= 0) cortes.push({ desde: titulo + TITULO_SEG * FPS, plano: "general" });
  cortes.sort((a, b) => a.desde - b.desde);

  // Acciones: cada una empieza al inicio de su línea (o de su risa) y dura hasta que otra la cambie
  const eventos: { desde: number; personaje: string; tokens: string[] }[] = [];
  guion.lineas.forEach((l, i) => {
    Object.entries(l.acciones ?? {}).forEach(([p, t]) => eventos.push({ desde: lineas[i].inicio, personaje: p, tokens: t.split(" ") }));
    Object.entries(l.accionesRisa ?? {}).forEach(([p, t]) =>
      eventos.push({ desde: fin(lineas[i]), personaje: p, tokens: t.split(" ") }),
    );
  });
  eventos.sort((a, b) => a.desde - b.desde);

  const ultima = lineas[lineas.length - 1];
  const congelar = fin(ultima) + 24;
  return {
    guion,
    formato: guion.formato ?? "vertical",
    lineas,
    duraciones,
    envolventes,
    titulo,
    tituloFin: titulo >= 0 ? titulo + TITULO_SEG * FPS : -1,
    risas,
    cortes,
    eventos,
    congelar,
    duracion: fin(ultima) + 5 * FPS,
  };
};

// Estado de un personaje en un frame, a partir de sus acciones
export type Estado = {
  postura: "sentado" | "de-pie";
  brazos: "nada" | "teclea" | "jarras" | "brazos-arriba" | "saluda" | "telefono";
  cara: "neutral" | "enojo" | "sueno" | "feliz" | "malvado" | "asustado" | "llora";
  visible: boolean;
  desdeVisible: number;
  saltos: number[];
  lentesSol: boolean;
};

const GRUPO: Record<string, keyof Estado> = {
  sentado: "postura",
  "de-pie": "postura",
  nada: "brazos",
  teclea: "brazos",
  jarras: "brazos",
  "brazos-arriba": "brazos",
  saluda: "brazos",
  telefono: "brazos",
  neutral: "cara",
  enojo: "cara",
  sueno: "cara",
  feliz: "cara",
  malvado: "cara",
  asustado: "cara",
  llora: "cara",
};

export const estadoEn = (ep: Episodio, personaje: string, inicial: Partial<Estado>, frame: number): Estado => {
  const e: Estado = {
    postura: "de-pie",
    brazos: "nada",
    cara: "neutral",
    visible: true,
    desdeVisible: -100,
    saltos: [],
    lentesSol: false,
    ...inicial,
  };
  for (const ev of ep.eventos) {
    if (ev.personaje !== personaje || ev.desde > frame) continue;
    for (const t of ev.tokens) {
      if (t === "salta") e.saltos.push(ev.desde);
      else if (t === "aparece") {
        e.visible = true;
        e.desdeVisible = ev.desde;
      } else if (t === "desaparece") e.visible = false;
      else if (t === "lentes-sol") e.lentesSol = true;
      else if (GRUPO[t]) (e as Record<string, unknown>)[GRUPO[t]] = t;
    }
  }
  return e;
};
