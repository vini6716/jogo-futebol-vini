/**
 * Porta web do ClubCreator.cs / SquadManager.cs. Gera um clube customizado
 * e o elenco correspondente a partir dos dados escolhidos no formulário
 * "Crie seu Clube".
 */

const EMBLEMS = ["shield", "star", "crest", "leaf", "sun", "wing"];

const POSITION_PLAN = [
  "GOL", "GOL",
  "ZAG", "ZAG", "ZAG",
  "LAT", "LAT",
  "VOL", "VOL",
  "MEI", "MEI", "MEI",
  "ATA", "ATA", "ATA", "ATA",
];

const FIRST_NAMES = [
  "João", "Pedro", "Lucas", "Gabriel", "Matheus", "Rafael", "Bruno", "Diego",
  "Thiago", "Felipe", "Gustavo", "Vinícius", "Rodrigo", "Marcelo", "André",
  "Caio", "Daniel", "Eduardo", "Fábio", "Guilherme", "Henrique", "Igor",
];
const LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Rodrigues",
  "Almeida", "Nascimento", "Carvalho", "Araújo", "Ribeiro", "Ferreira",
  "Barbosa", "Cardoso", "Correia", "Dias", "Farias", "Gomes", "Lima",
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function statsForPosition(position, overall) {
  const noise = () => randInt(-6, 6);
  const base = overall;
  const table = {
    GOL: { pace: -20, shooting: -45, passing: -15, dribbling: -25, defending: -5, physical: 0 },
    ZAG: { pace: -10, shooting: -25, passing: -8, dribbling: -15, defending: 6, physical: 8 },
    LAT: { pace: 6, shooting: -15, passing: 2, dribbling: 0, defending: 2, physical: 0 },
    VOL: { pace: -4, shooting: -10, passing: 6, dribbling: 0, defending: 8, physical: 6 },
    MEI: { pace: 0, shooting: 2, passing: 10, dribbling: 8, defending: -12, physical: -4 },
    ATA: { pace: 8, shooting: 10, passing: -4, dribbling: 6, defending: -25, physical: 0 },
  };
  const t = table[position] || table.MEI;
  return {
    pace: clamp(base + t.pace + noise(), 20, 97),
    shooting: clamp(base + t.shooting + noise(), 10, 97),
    passing: clamp(base + t.passing + noise(), 20, 97),
    dribbling: clamp(base + t.dribbling + noise(), 20, 97),
    defending: clamp(base + t.defending + noise(), 10, 97),
    physical: clamp(base + t.physical + noise(), 20, 97),
  };
}

export class ClubCreator {
  constructor(database) {
    this.database = database;
  }

  static get emblems() {
    return EMBLEMS;
  }

  generateSquad(clubId, overallBase) {
    const players = [];
    let nextId = this.database.nextPlayerId();
    const usedNames = new Set();
    const uniqueName = () => {
      let name;
      let guard = 0;
      do {
        name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
        guard++;
      } while (usedNames.has(name) && guard < 50);
      usedNames.add(name);
      return name;
    };

    POSITION_PLAN.forEach((position) => {
      const overall = clamp(overallBase + randInt(-6, 6), 40, 95);
      players.push({
        id: nextId++,
        name: uniqueName(),
        age: randInt(18, 36),
        country: "Brasil",
        clubId,
        position,
        overall,
        custom: true,
        ...statsForPosition(position, overall),
      });
    });
    return players;
  }

  createClub({ name, city, country, stadiumName, primary, secondary, emblem, overallBase }) {
    const clubId = this.database.nextClubId();
    const club = {
      id: clubId,
      name,
      country,
      city,
      league: "Clubes Criados",
      leagueId: null,
      stadiumId: clubId,
      colors: { primary, secondary },
      emblem,
      overallBase,
      custom: true,
    };
    const players = this.generateSquad(clubId, overallBase);

    const stadium = {
      id: clubId,
      name: stadiumName,
      capacity: randInt(15, 60) * 1000,
      country,
      clubId,
    };

    this.database.addCustomClub(club, players, stadium);
    return { club, players };
  }
}
