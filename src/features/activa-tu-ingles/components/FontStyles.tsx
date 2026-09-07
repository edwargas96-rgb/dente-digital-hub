/**
 * Fuentes de la marca con stacks de respaldo, para que el diseño no se
 * rompa si Google Fonts tarda o falla en cargar.
 */
export function FontStyles() {
  return (
    <style>{`
      .font-display {
        font-family: "Baloo 2", ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
      }
      .font-body {
        font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
      }
      .font-script {
        font-family: "Caveat", cursive;
      }
    `}</style>
  );
}
