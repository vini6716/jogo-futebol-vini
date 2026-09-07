/**
 * Monta as <option>/<optgroup> de um <select> de clubes agrupadas por liga
 * (e depois por país, pros clubes criados pelo jogador), ordenadas por
 * força do elenco. Com centenas de clubes reais no banco, uma lista plana
 * ficaria impossível de navegar.
 */
export function groupClubsByLeagueHtml(clubs) {
  const groups = new Map();
  clubs.forEach((c) => {
    const key = c.league || c.country || "Outros";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  });

  const groupNames = [...groups.keys()].sort((a, b) => a.localeCompare(b));

  return groupNames
    .map((groupName) => {
      const options = groups
        .get(groupName)
        .sort((a, b) => b.overallBase - a.overallBase || a.name.localeCompare(b.name))
        .map((c) => `<option value="${c.id}">${c.name} (${c.overallBase} OVR)</option>`)
        .join("");
      return `<optgroup label="${groupName}">${options}</optgroup>`;
    })
    .join("");
}
