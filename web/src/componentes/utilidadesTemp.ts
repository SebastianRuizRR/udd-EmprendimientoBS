// src/utilidades.ts

/** Mezcla un arreglo sin mutar el original */
export function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  
  /** Genera un código de sala aleatorio, tipo UDD */
  export function generateCode(len: number = 5): string {
    const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < len; i++) {
      out += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return out;
  }
  