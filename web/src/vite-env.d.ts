// web/src/vite-env.d.ts

/// <reference types="vite/client" />

// Añadimos estas declaraciones explícitas para que TypeScript reconozca los assets.
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.png";
declare module "*.svg";