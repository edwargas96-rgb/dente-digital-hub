import type { CSSProperties } from "react";

/**
 * Fondo "cuaderno de estudio": líneas de renglón muy sutiles sobre papel
 * crema. Es la firma visual que conecta todas las pantallas del quiz.
 */
export const paperBackgroundStyle: CSSProperties = {
  backgroundColor: "#FBF7EC",
  backgroundImage:
    "repeating-linear-gradient(to bottom, rgba(11,33,69,0.055) 0px, rgba(11,33,69,0.055) 1px, transparent 1px, transparent 30px)",
};
