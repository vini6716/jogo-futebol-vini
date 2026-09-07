/**
 * Desenha um escudo simples em SVG para cada clube, já que não existem
 * arquivos de imagem (Assets/Logos, Assets/Clubs na versão Unity).
 */
const SHAPES = {
  shield:
    "M50 4 L90 18 V50 C90 78 72 92 50 96 C28 92 10 78 10 50 V18 Z",
  star:
    "M50 4 L61 36 L96 36 L67 56 L78 90 L50 70 L22 90 L33 56 L4 36 L39 36 Z",
  crest:
    "M50 4 C70 4 88 12 88 12 V46 C88 74 72 90 50 98 C28 90 12 74 12 46 V12 C12 12 30 4 50 4 Z",
  leaf: "M50 6 C90 20 90 70 50 96 C10 70 10 20 50 6 Z",
  sun: "M50 50 m-30 0 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0 Z",
  wing: "M6 50 C30 20 70 20 94 50 C70 60 30 60 6 50 Z M50 6 C56 30 56 70 50 94 C44 70 44 30 50 6 Z",
};

export function emblemSvg(club, size = 64) {
  const shape = SHAPES[club.emblem] || SHAPES.shield;
  const primary = club.colors?.primary || "#1b5e20";
  const secondary = club.colors?.secondary || "#ffffff";
  const initials = (club.name || "??")
    .split(" ")
    .filter((w) => w.length > 2 || /[A-ZÀ-Ú]/.test(w[0]))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="emblem" role="img" aria-label="Escudo ${club.name}">
      <path d="${shape}" fill="${primary}" stroke="${secondary}" stroke-width="4"/>
      <text x="50" y="58" text-anchor="middle" font-size="34" font-weight="700"
        fill="${secondary}" font-family="Arial, sans-serif">${initials}</text>
    </svg>`;
}
