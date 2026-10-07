import { ColoresPersonaje } from "../../n64/Personaje";
import { PropuestaLook, PropuestasLook } from "../Propuestas";

// Tres propuestas para Mr. CEO: bien vestido, optimista, exagera con la IA y explota con las fechas de entrega

const base: ColoresPersonaje = {
  piel: "#e0ac85",
  camisa: "#f8f9fa",
  pantalon: "#1d2d44",
  sombrero: "#2b2118",
  zapatos: "#3b2414",
  gorra: false,
  bigote: false,
  cabello: "#2b2118",
};

const PROPUESTAS: PropuestaLook[] = [
  {
    titulo: "A · SONRISA MILLONARIA",
    rasgo: "Sonrisa gigante de comercial y copete parado de energía",
    ropa: "Traje azul marino · camisa blanca · corbata roja",
    frase: "«¡Le metemos IA y lo lanzamos el lunes!»",
    fondo: "#a2d2ff",
    colores: { ...base, chaqueta: "#1d3557", pantalon: "#1d3557", corbata: "#e63946", copete: true, rasgos: { sonrisa: 1.8, copete: 1.3, cejas: 0.4 } },
    pose: { saludo: 1 },
  },
  {
    titulo: "B · VENA DE ENTREGA",
    rasgo: "Cejas pobladas y vena que salta cuando oye «fecha de entrega»",
    ropa: "Cuello de tortuga negro · saco gris · reloj inteligente",
    frase: "«¿Cómo que NO está listo? ¡Si la IA lo hace en 5 minutos!»",
    fondo: "#ffadad",
    colores: { ...base, cabello: "#7f5539", sombrero: "#7f5539", camisa: "#1b1b1f", chaqueta: "#6c757d", pantalon: "#343a40", lentes: true, rasgos: { cejas: 1.4, vena: 1.4 } },
    pose: { jarras: 1, boca: 0.6 },
  },
  {
    titulo: "C · BARBILLA DE LÍDER",
    rasgo: "Barbilla de superhéroe, bigotón y canas de «visionario»",
    ropa: "Chaleco de startup · camisa celeste · tenis de lujo",
    frase: "«Ya no somos startup: somos AI-first, AI-only, AI-todo.»",
    fondo: "#fdffb6",
    colores: { ...base, cabello: "#adb5bd", sombrero: "#adb5bd", bigote: true, camisa: "#8ecae6", chaqueta: "#14213d", pantalon: "#8d7b68", zapatos: "#f8f9fa", copete: true, rasgos: { barbilla: 1.2, sonrisa: 0.5, copete: 0.9 } },
    pose: { brazosAdelante: 1 },
  },
];

export const PropuestasCeo: React.FC = () => (
  <PropuestasLook nombre="MR. CEO" subtitulo="optimista, AI-first y alérgico a los retrasos · 3 propuestas" color="#ffd166" propuestas={PROPUESTAS} />
);
