import type { CSSProperties } from "react";
import { tema } from "./tema";

export const panelBox: CSSProperties = {
  background: "#fff",
  border: `1px solid ${tema.border}`,
  borderRadius: 16,
  padding: 16,
};

export const badgeTitle: CSSProperties = {
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  opacity: 0.7,
  marginBottom: 8,
};
