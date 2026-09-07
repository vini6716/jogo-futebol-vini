/**
 * Gerador do banco de dados do FutebolLand.
 * Roda uma vez com `node tools/generate-database.js` e escreve os arquivos
 * JSON em /database. Usa um RNG com seed fixa para o resultado ser
 * reproduzível (mesma "base de dados" toda vez que rodar de novo).
 */
const fs = require("fs");
const path = require("path");

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20240613);
const rand = () => rng();
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[randInt(0, arr.length - 1)];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const COUNTRIES = [
  { id: 1, name: "Brasil", continent: "América do Sul", fifa: true },
  { id: 2, name: "Argentina", continent: "América do Sul", fifa: true },
  { id: 3, name: "Espanha", continent: "Europa", fifa: true },
  { id: 4, name: "Inglaterra", continent: "Europa", fifa: true },
  { id: 5, name: "Alemanha", continent: "Europa", fifa: true },
  { id: 6, name: "França", continent: "Europa", fifa: true },
  { id: 7, name: "Itália", continent: "Europa", fifa: true },
  { id: 8, name: "Portugal", continent: "Europa", fifa: true },
];

const CLUB_DEFS = [
  { name: "Porto Novo FC", city: "Porto Novo", primary: "#0d47a1", secondary: "#ffffff", emblem: "shield", base: 82 },
  { name: "Estrela do Sul EC", city: "Baía Grande", primary: "#1b5e20", secondary: "#ffd600", emblem: "star", base: 78 },
  { name: "Atlético Litoral", city: "Litoral Novo", primary: "#b71c1c", secondary: "#000000", emblem: "crest", base: 75 },
  { name: "Coração Verde FC", city: "Serra Alta", primary: "#004d40", secondary: "#c8e6c9", emblem: "leaf", base: 73 },
  { name: "União Dourada AC", city: "Vale Dourado", primary: "#e65100", secondary: "#212121", emblem: "sun", base: 70 },
  { name: "Real Cerrado FC", city: "Cerrado Alto", primary: "#4a148c", secondary: "#ffffff", emblem: "shield", base: 68 },
  { name: "Fênix Atlântico", city: "Costa Azul", primary: "#01579b", secondary: "#ffab00", emblem: "wing", base: 65 },
  { name: "Leões do Vale", city: "Vale Verde", primary: "#f9a825", secondary: "#1b1b1b", emblem: "crest", base: 62 },
];

const FIRST_NAMES = [
  "João", "Pedro", "Lucas", "Gabriel", "Matheus", "Rafael", "Bruno", "Diego",
  "Thiago", "Felipe", "Gustavo", "Vinícius", "Rodrigo", "Marcelo", "André",
  "Caio", "Daniel", "Eduardo", "Fábio", "Guilherme", "Henrique", "Igor",
  "Júlio", "Leandro", "Márcio", "Nathan", "Otávio", "Paulo", "Renato",
  "Samuel", "Tiago", "Ubirajara", "Valdir", "Wesley", "Yago", "Alan",
];
const LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Rodrigues",
  "Almeida", "Nascimento", "Carvalho", "Araújo", "Ribeiro", "Ferreira",
  "Barbosa", "Cardoso", "Correia", "Dias", "Farias", "Gomes", "Lima",
  "Machado", "Nogueira", "Pinto", "Queiroz", "Rezende", "Teixeira",
  "Vieira", "Xavier", "Amaral", "Brandão",
];

const POSITION_PLAN = [
  "GOL", "GOL",
  "ZAG", "ZAG", "ZAG",
  "LAT", "LAT",
  "VOL", "VOL",
  "MEI", "MEI", "MEI",
  "ATA", "ATA", "ATA", "ATA",
];

function statsForPosition(position, overall) {
  const noise = () => randInt(-6, 6);
  const base = overall;
  switch (position) {
    case "GOL":
      return {
        pace: clamp(base - 20 + noise(), 30, 90),
        shooting: clamp(base - 45 + noise(), 10, 60),
        passing: clamp(base - 15 + noise(), 30, 85),
        dribbling: clamp(base - 25 + noise(), 20, 75),
        defending: clamp(base - 5 + noise(), 40, 95),
        physical: clamp(base + noise(), 40, 95),
      };
    case "ZAG":
      return {
        pace: clamp(base - 10 + noise(), 35, 88),
        shooting: clamp(base - 25 + noise(), 20, 70),
        passing: clamp(base - 8 + noise(), 35, 88),
        dribbling: clamp(base - 15 + noise(), 25, 80),
        defending: clamp(base + 6 + noise(), 45, 96),
        physical: clamp(base + 8 + noise(), 45, 96),
      };
    case "LAT":
      return {
        pace: clamp(base + 6 + noise(), 45, 95),
        shooting: clamp(base - 15 + noise(), 25, 78),
        passing: clamp(base + 2 + noise(), 40, 90),
        dribbling: clamp(base + noise(), 35, 88),
        defending: clamp(base + 2 + noise(), 40, 90),
        physical: clamp(base + noise(), 40, 90),
      };
    case "VOL":
      return {
        pace: clamp(base - 4 + noise(), 35, 88),
        shooting: clamp(base - 10 + noise(), 30, 80),
        passing: clamp(base + 6 + noise(), 40, 92),
        dribbling: clamp(base + noise(), 35, 88),
        defending: clamp(base + 8 + noise(), 45, 93),
        physical: clamp(base + 6 + noise(), 45, 93),
      };
    case "MEI":
      return {
        pace: clamp(base + noise(), 40, 92),
        shooting: clamp(base + 2 + noise(), 35, 90),
        passing: clamp(base + 10 + noise(), 45, 96),
        dribbling: clamp(base + 8 + noise(), 45, 96),
        defending: clamp(base - 12 + noise(), 20, 75),
        physical: clamp(base - 4 + noise(), 35, 85),
      };
    case "ATA":
    default:
      return {
        pace: clamp(base + 8 + noise(), 45, 97),
        shooting: clamp(base + 10 + noise(), 45, 97),
        passing: clamp(base - 4 + noise(), 30, 85),
        dribbling: clamp(base + 6 + noise(), 40, 95),
        defending: clamp(base - 25 + noise(), 15, 65),
        physical: clamp(base + noise(), 35, 90),
      };
  }
}

const usedNames = new Set();
function uniqueName() {
  let name;
  let guard = 0;
  do {
    name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    guard++;
  } while (usedNames.has(name) && guard < 50);
  usedNames.add(name);
  return name;
}

const leagues = [
  {
    id: 1,
    name: "Campeonato Brasileiro Série A",
    country: "Brasil",
    division: 1,
    clubIds: CLUB_DEFS.map((_, i) => i + 1),
  },
];

const clubs = [];
const stadiums = [];
const players = [];
let playerId = 1;

CLUB_DEFS.forEach((def, index) => {
  const clubId = index + 1;
  const stadiumId = clubId;

  clubs.push({
    id: clubId,
    name: def.name,
    country: "Brasil",
    city: def.city,
    league: leagues[0].name,
    leagueId: leagues[0].id,
    stadiumId,
    colors: { primary: def.primary, secondary: def.secondary },
    emblem: def.emblem,
    overallBase: def.base,
    custom: false,
  });

  stadiums.push({
    id: stadiumId,
    name: `Arena ${def.city}`,
    capacity: randInt(18, 65) * 1000,
    country: "Brasil",
    clubId,
  });

  POSITION_PLAN.forEach((position) => {
    const variance = randInt(-6, 6);
    const overall = clamp(def.base + variance, 45, 92);
    players.push({
      id: playerId++,
      name: uniqueName(),
      age: randInt(18, 36),
      country: "Brasil",
      clubId,
      position,
      overall,
      ...statsForPosition(position, overall),
    });
  });
});

const competitions = [
  {
    id: 1,
    name: "Copa FutebolLand",
    type: "Copa",
    country: "Brasil",
    clubIds: clubs.map((c) => c.id),
  },
  {
    id: 2,
    name: leagues[0].name,
    type: "Liga",
    country: "Brasil",
    clubIds: leagues[0].clubIds,
  },
];

const referees = [
  { id: 1, name: "Márcio Andrade", country: "Brasil", strictness: "Moderado" },
  { id: 2, name: "Fernanda Kist", country: "Brasil", strictness: "Rigoroso" },
  { id: 3, name: "Otávio Prado", country: "Brasil", strictness: "Tolerante" },
  { id: 4, name: "Luana Beckert", country: "Brasil", strictness: "Moderado" },
];

const outDir = path.join(__dirname, "..", "database");
fs.mkdirSync(outDir, { recursive: true });

function write(file, data) {
  fs.writeFileSync(path.join(outDir, file), JSON.stringify(data, null, 2) + "\n");
  console.log(`escrito database/${file} (${Array.isArray(data) ? data.length : 1} registros)`);
}

write("countries.json", COUNTRIES);
write("leagues.json", leagues);
write("clubs.json", clubs);
write("players.json", players);
write("stadiums.json", stadiums);
write("competitions.json", competitions);
write("referees.json", referees);
