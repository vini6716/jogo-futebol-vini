/**
 * Gerador do banco de dados do FutebolLand.
 *
 * Roda uma vez com `node tools/generate-database.js` e escreve os arquivos
 * JSON em /database, a partir dos dados "reais" (ligas, clubes, seleções e
 * jogadores conhecidos) definidos em `tools/real-world-data.js`. Usa um RNG
 * com seed fixa pra completar o elenco de cada clube (reservas gerados) e
 * variar levemente os atributos — o resultado é reproduzível.
 */
const fs = require("fs");
const path = require("path");
const core = require("./db-core");
const { LEAGUE_DEFS, NATIONAL_TEAM_LEAGUE } = require("./real-world-data");

const { POSITION_MIN, POSITION_ORDER, statsForPosition, parseReal, uniqueGeneratedName, randInt, clamp } = core;

const countries = core.COUNTRIES_UNIQUE;
const countryNames = new Set(countries.map((c) => c.name));

const leagues = [];
const clubs = [];
const stadiums = [];
const players = [];
const referees = [
  { id: 1, name: "Márcio Andrade", country: "Brasil", strictness: "Moderado" },
  { id: 2, name: "Fernanda Kist", country: "Brasil", strictness: "Rigoroso" },
  { id: 3, name: "Otávio Prado", country: "Brasil", strictness: "Tolerante" },
  { id: 4, name: "Luana Beckert", country: "Brasil", strictness: "Moderado" },
  { id: 5, name: "Michael Oliver", country: "Inglaterra", strictness: "Rigoroso" },
  { id: 6, name: "Clément Turpin", country: "França", strictness: "Moderado" },
  { id: 7, name: "Daniele Orsato", country: "Itália", strictness: "Rigoroso" },
  { id: 8, name: "Felix Zwayer", country: "Alemanha", strictness: "Moderado" },
  { id: 9, name: "Jesús Gil Manzano", country: "Espanha", strictness: "Tolerante" },
  { id: 10, name: "Fábio Veríssimo", country: "Portugal", strictness: "Moderado" },
];

let leagueId = 1;
let clubId = 1;
let stadiumId = 1;
let playerId = 1;

function buildSquad(def, leagueCountry, forClubId) {
  const country = def.country || leagueCountry;
  const realByPosition = {};
  POSITION_ORDER.forEach((pos) => (realByPosition[pos] = []));
  parseReal(def.real).forEach((p) => {
    if (!realByPosition[p.position]) realByPosition[p.position] = [];
    realByPosition[p.position].push(p);
  });

  const squad = [];
  POSITION_ORDER.forEach((position) => {
    const real = realByPosition[position] || [];
    const target = Math.max(POSITION_MIN[position], real.length);

    real.forEach((p, index) => {
      const tierBonus = index === 0 ? 9 : index === 1 ? 5 : index === 2 ? 2 : 0;
      const overall = clamp(def.base + tierBonus + randInt(-3, 3), 50, 99);
      const playerCountry = countryNames.has(p.country) ? p.country : country;
      squad.push({
        id: playerId++,
        name: p.name,
        age: p.age || randInt(20, 34),
        country: playerCountry,
        clubId: forClubId,
        position,
        overall,
        real: true,
        ...statsForPosition(position, overall),
      });
    });

    for (let i = real.length; i < target; i++) {
      const overall = clamp(def.base - 8 + randInt(-6, 6), 45, 90);
      squad.push({
        id: playerId++,
        name: uniqueGeneratedName(country),
        age: randInt(18, 34),
        country,
        clubId: forClubId,
        position,
        overall,
        generated: true,
        ...statsForPosition(position, overall),
      });
    }
  });

  return squad;
}

function addLeague(def) {
  const league = {
    id: leagueId++,
    name: def.name,
    country: def.country,
    division: 1,
    clubIds: [],
  };
  leagues.push(league);

  def.clubs.forEach((clubDef) => {
    const id = clubId++;
    league.clubIds.push(id);

    clubs.push({
      id,
      name: clubDef.n,
      country: clubDef.country || def.country,
      city: clubDef.city,
      league: league.name,
      leagueId: league.id,
      stadiumId,
      colors: { primary: clubDef.p, secondary: clubDef.s },
      emblem: ["shield", "star", "crest", "leaf", "sun", "wing"][clubId % 6],
      overallBase: clubDef.base,
      custom: false,
    });

    stadiums.push({
      id: stadiumId,
      name: clubDef.stadium,
      capacity: randInt(12, 85) * 1000,
      country: clubDef.country || def.country,
      clubId: id,
    });
    stadiumId++;

    const squad = buildSquad(clubDef, def.country, id);
    squad.forEach((p) => players.push(p));
  });

  return league;
}

LEAGUE_DEFS.forEach((def) => addLeague(def));
const nationalLeague = addLeague(NATIONAL_TEAM_LEAGUE);

const competitions = [];
let competitionId = 1;

LEAGUE_DEFS.forEach((def) => {
  const league = leagues.find((l) => l.name === def.name);
  competitions.push({
    id: competitionId++,
    name: league.name,
    type: "Liga",
    country: def.country,
    clubIds: [...league.clubIds],
  });
  if (def.cup) {
    competitions.push({
      id: competitionId++,
      name: def.cup,
      type: "Copa",
      country: def.country,
      clubIds: [...league.clubIds],
    });
  }
});

function topClubIds(leagueName, count) {
  const league = leagues.find((l) => l.name === leagueName);
  if (!league) return [];
  return [...league.clubIds]
    .map((id) => clubs.find((c) => c.id === id))
    .sort((a, b) => b.overallBase - a.overallBase)
    .slice(0, count)
    .map((c) => c.id);
}

competitions.push({
  id: competitionId++,
  name: "Liga dos Campeões",
  type: "Continental",
  country: "Europa",
  clubIds: [
    ...topClubIds("Premier League", 4),
    ...topClubIds("La Liga", 4),
    ...topClubIds("Serie A", 4),
    ...topClubIds("Bundesliga", 4),
    ...topClubIds("Ligue 1", 3),
    ...topClubIds("Liga Portugal", 2),
    ...topClubIds("Eredivisie", 2),
  ],
});

competitions.push({
  id: competitionId++,
  name: "Copa Libertadores",
  type: "Continental",
  country: "América do Sul",
  clubIds: topClubIds("Campeonato Brasileiro Série A", 8),
});

competitions.push({
  id: competitionId++,
  name: "Copa do Mundo FIFA",
  type: "Seleções",
  country: "Internacional",
  clubIds: [...nationalLeague.clubIds],
});

const outDir = path.join(__dirname, "..", "database");
fs.mkdirSync(outDir, { recursive: true });

function write(file, data) {
  fs.writeFileSync(path.join(outDir, file), JSON.stringify(data, null, 2) + "\n");
  console.log(`escrito database/${file} (${Array.isArray(data) ? data.length : 1} registros)`);
}

write("countries.json", countries);
write("leagues.json", leagues);
write("clubs.json", clubs);
write("players.json", players);
write("stadiums.json", stadiums);
write("competitions.json", competitions);
write("referees.json", referees);
