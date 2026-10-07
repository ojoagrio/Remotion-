import { Easing } from "remotion";
import { fijo } from "./lineaDeTiempo";
import { Vec3 } from "./Lienzo";

// Estado de la cámara en un frame: posición, punto de mira, apertura, giro y desenfoque
export type Toma = { pos: Vec3; mira: Vec3; fov: number; giro: number; desenfoque: number };

export const mezclar = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export const sumar = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// Movimiento de cámara en mano: suma de senos con frecuencias distintas
export const enMano = (frame: number, fuerza: number): Vec3 => [
  (Math.sin(frame * 1.7) + Math.sin(frame * 3.1) * 0.5) * fuerza,
  (Math.sin(frame * 2.3 + 1) + Math.sin(frame * 4.3) * 0.4) * fuerza,
  Math.sin(frame * 1.3 + 2) * fuerza * 0.5,
];

// Punto en una órbita horizontal alrededor de "centro"
export const orbita = (centro: Vec3, radio: number, angulo: number, altura: number): Vec3 => [
  centro[0] + Math.sin(angulo) * radio,
  altura,
  centro[2] + Math.cos(angulo) * radio,
];

export const suave = { ...fijo, easing: Easing.inOut(Easing.cubic) };
export const golpe = { ...fijo, easing: Easing.out(Easing.exp) };
