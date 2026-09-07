/**
 * Gerador do banco de dados do FutebolLand.
 *
 * Roda uma vez com `node tools/generate-database.js` e escreve os arquivos
 * JSON em /database. Usa um RNG com seed fixa (variação de atributos e
 * elenco reserva) para o resultado ser reproduzível.
 *
 * A base cobre as principais ligas do mundo (com clubes e jogadores REAIS,
 * de conhecimento público) mais as principais seleções nacionais. Os
 * escudos continuam sendo desenhados em SVG genérico (não usamos logos
 * oficiais). Como elencos de futebol mudam a cada janela de transferência,
 * trate isto como um "retrato" best-effort — dá pra rodar o gerador de novo
 * depois de editar `LEAGUE_DEFS`/`NATIONAL_TEAM_DEFS` pra atualizar nomes.
 *
 * Cada clube real vem com uma lista de jogadores REAIS conhecidos (astros e
 * titulares) na chave `real`, no formato "Nome|POS|Nacionalidade|Idade".
 * O restante do elenco (até completar o plano de posições) é preenchido com
 * nomes gerados de um pool de nomes por estilo/nacionalidade, só pra não
 * faltar jogador pra escalação — esses ficam marcados com `generated: true`.
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

// ---------------------------------------------------------------------------
// Países (ligas + nacionalidades que aparecem entre os jogadores reais)
// ---------------------------------------------------------------------------
const COUNTRIES = [
  { name: "Brasil", continent: "América do Sul" },
  { name: "Argentina", continent: "América do Sul" },
  { name: "Uruguai", continent: "América do Sul" },
  { name: "Colômbia", continent: "América do Sul" },
  { name: "Equador", continent: "América do Sul" },
  { name: "Paraguai", continent: "América do Sul" },
  { name: "Chile", continent: "América do Sul" },
  { name: "Venezuela", continent: "América do Sul" },
  { name: "Espanha", continent: "Europa" },
  { name: "Inglaterra", continent: "Europa" },
  { name: "Escócia", continent: "Europa" },
  { name: "País de Gales", continent: "Europa" },
  { name: "Irlanda", continent: "Europa" },
  { name: "Alemanha", continent: "Europa" },
  { name: "França", continent: "Europa" },
  { name: "Itália", continent: "Europa" },
  { name: "Portugal", continent: "Europa" },
  { name: "Holanda", continent: "Europa" },
  { name: "Bélgica", continent: "Europa" },
  { name: "Croácia", continent: "Europa" },
  { name: "Sérvia", continent: "Europa" },
  { name: "Polônia", continent: "Europa" },
  { name: "Áustria", continent: "Europa" },
  { name: "Suíça", continent: "Europa" },
  { name: "Dinamarca", continent: "Europa" },
  { name: "Suécia", continent: "Europa" },
  { name: "Noruega", continent: "Europa" },
  { name: "Ucrânia", continent: "Europa" },
  { name: "Turquia", continent: "Europa" },
  { name: "Hungria", continent: "Europa" },
  { name: "Eslovênia", continent: "Europa" },
  { name: "Geórgia", continent: "Europa" },
  { name: "Marrocos", continent: "África" },
  { name: "Senegal", continent: "África" },
  { name: "Nigéria", continent: "África" },
  { name: "Gana", continent: "África" },
  { name: "Egito", continent: "África" },
  { name: "Argélia", continent: "África" },
  { name: "Tunísia", continent: "África" },
  { name: "Costa do Marfim", continent: "África" },
  { name: "Camarões", continent: "África" },
  { name: "Mali", continent: "África" },
  { name: "República Democrática do Congo", continent: "África" },
  { name: "Estados Unidos", continent: "América do Norte" },
  { name: "México", continent: "América do Norte" },
  { name: "Canadá", continent: "América do Norte" },
  { name: "Costa Rica", continent: "América do Norte" },
  { name: "Jamaica", continent: "América do Norte" },
  { name: "Japão", continent: "Ásia" },
  { name: "Coreia do Sul", continent: "Ásia" },
  { name: "Austrália", continent: "Oceania" },
  { name: "Catar", continent: "Ásia" },
  { name: "Arábia Saudita", continent: "Ásia" },
  { name: "Irã", continent: "Ásia" },
  { name: "Jamaica", continent: "América do Norte" },
];
// remove duplicatas (Jamaica aparece 2x acima por segurança de digitação)
const seenCountry = new Set();
const COUNTRIES_UNIQUE = COUNTRIES.filter((c) => {
  if (seenCountry.has(c.name)) return false;
  seenCountry.add(c.name);
  return true;
}).map((c, i) => ({ id: i + 1, ...c, fifa: true }));

// ---------------------------------------------------------------------------
// Pools de nomes por estilo, usados só pra completar o elenco (reservas
// genéricos) quando não há jogador real suficiente pra aquela posição.
// ---------------------------------------------------------------------------
const NAME_POOLS = {
  br: {
    first: ["João", "Pedro", "Lucas", "Gabriel", "Matheus", "Rafael", "Bruno", "Diego", "Thiago", "Felipe", "Gustavo", "Vinícius", "Rodrigo", "Marcelo", "André", "Caio"],
    last: ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Rodrigues", "Almeida", "Nascimento", "Carvalho", "Araújo", "Ribeiro", "Ferreira", "Barbosa", "Cardoso", "Correia"],
  },
  es: {
    first: ["Javier", "Carlos", "Diego", "Sergio", "Pablo", "Álvaro", "Iker", "Mateo", "Nicolás", "Santiago", "Martín", "Facundo", "Joaquín", "Ignacio", "Emiliano", "Agustín"],
    last: ["García", "Martínez", "López", "Fernández", "González", "Rodríguez", "Pérez", "Sánchez", "Romero", "Torres", "Ramírez", "Flores", "Acosta", "Medina", "Herrera", "Molina"],
  },
  en: {
    first: ["Jack", "Harry", "George", "Oliver", "Thomas", "James", "Charlie", "Daniel", "Josh", "Callum", "Marcus", "Ryan", "Liam", "Ethan", "Connor", "Tyler"],
    last: ["Smith", "Jones", "Taylor", "Brown", "Wilson", "Evans", "Thomas", "Roberts", "Walker", "Wright", "Robinson", "Clarke", "Cooper", "Bailey", "Morgan", "Hughes"],
  },
  de: {
    first: ["Lukas", "Jonas", "Maximilian", "Felix", "Niklas", "Leon", "Tim", "Julian", "Moritz", "Finn", "Paul", "Elias", "Jan", "David", "Fabian", "Nico"],
    last: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Wagner", "Becker", "Hoffmann", "Schulz", "Koch", "Richter", "Klein", "Wolf", "Neumann", "Braun", "Krüger"],
  },
  fr: {
    first: ["Antoine", "Hugo", "Théo", "Lucas", "Enzo", "Nathan", "Maxime", "Baptiste", "Rayan", "Kylian", "Yanis", "Mathis", "Adam", "Noah", "Léo", "Jules"],
    last: ["Bernard", "Dubois", "Thomas", "Robert", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Girard", "Bonnet", "Roux", "Fournier"],
  },
  it: {
    first: ["Marco", "Luca", "Matteo", "Alessandro", "Davide", "Francesco", "Andrea", "Simone", "Riccardo", "Federico", "Gianluca", "Stefano", "Enrico", "Nicolò", "Emanuele", "Salvatore"],
    last: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "Deluca", "Mancini", "Costa"],
  },
  nl: {
    first: ["Daan", "Sem", "Milan", "Luuk", "Bram", "Thijs", "Jesse", "Ruben", "Stan", "Tim", "Wout", "Joris", "Niek", "Sven", "Guus", "Pim"],
    last: ["De Jong", "Jansen", "De Vries", "Van den Berg", "Van Dijk", "Bakker", "Visser", "Smit", "Meijer", "De Boer", "Mulder", "De Groot", "Bos", "Vos", "Peters", "Hendriks"],
  },
  hr: {
    first: ["Ivan", "Marko", "Luka", "Ante", "Josip", "Filip", "Petar", "Toni", "Dario", "Mario", "Domagoj", "Bruno", "Nikola", "Stipe", "Tin", "Karlo"],
    last: ["Horvat", "Kovačević", "Babić", "Marić", "Jurić", "Kovač", "Perić", "Vuković", "Tomić", "Knežević", "Barišić", "Grgić", "Radić", "Šarić", "Novak", "Pavić"],
  },
  ma: {
    first: ["Youssef", "Karim", "Amine", "Rachid", "Hamza", "Zakaria", "Bilal", "Adil", "Anas", "Yassine", "Reda", "Soufiane", "Nabil", "Othmane", "Walid", "Ismail"],
    last: ["El Amrani", "Benali", "Chakir", "Bakkali", "Idrissi", "Alaoui", "Ziani", "Bennani", "Fassi", "Rachidi", "Saidi", "Ouazzani", "Tazi", "Berrada", "Lahlou", "Naciri"],
  },
  ng: {
    first: ["Emeka", "Chidi", "Uche", "Obi", "Tunde", "Femi", "Kelechi", "Chinedu", "Ikechukwu", "Segun", "Wale", "Ayo", "Kingsley", "Sunday", "Musa", "Bright"],
    last: ["Okafor", "Eze", "Nwosu", "Adeyemi", "Balogun", "Okonkwo", "Chukwu", "Danjuma", "Ogundele", "Okoro", "Abubakar", "Bello", "Yusuf", "Obiora", "Igwe", "Onuoha"],
  },
  gh: {
    first: ["Kwame", "Kofi", "Kwesi", "Yaw", "Kojo", "Nana", "Emmanuel", "Samuel", "Isaac", "Daniel", "Joseph", "Prince", "Richard", "Benjamin", "Frank", "Michael"],
    last: ["Mensah", "Owusu", "Boateng", "Asante", "Appiah", "Agyemang", "Osei", "Amankwah", "Danquah", "Frimpong", "Antwi", "Yeboah", "Acheampong", "Baidoo", "Sarpong", "Adjei"],
  },
  jp: {
    first: ["Haruto", "Yuto", "Sota", "Ren", "Kaito", "Riku", "Sho", "Kenta", "Takumi", "Yuki", "Daiki", "Hayato", "Naoki", "Ryo", "Shun", "Taiga"],
    last: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Saito", "Kato", "Yoshida", "Yamada", "Sasaki", "Matsumoto", "Inoue"],
  },
  kr: {
    first: ["Min-jun", "Seo-jun", "Do-yoon", "Ji-ho", "Joon-ho", "Hyun-woo", "Jae-hyun", "Sung-min", "Tae-yang", "Woo-jin", "Dong-hyun", "Jin-woo", "Kyung-soo", "Sang-hoon", "Yong-jae", "Chan-woo"],
    last: ["Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon", "Jang", "Lim", "Han", "Oh", "Seo", "Shin", "Kwon", "Hwang"],
  },
  dk: {
    first: ["Mikkel", "Rasmus", "Jonas", "Frederik", "Christian", "Anders", "Mathias", "Kasper", "Nikolaj", "Emil", "Magnus", "Simon", "Victor", "Oscar", "Andreas", "Lucas"],
    last: ["Nielsen", "Jensen", "Hansen", "Pedersen", "Andersen", "Christensen", "Larsen", "Sørensen", "Rasmussen", "Jørgensen", "Petersen", "Madsen", "Kristensen", "Olsen", "Thomsen", "Poulsen"],
  },
};

const COUNTRY_STYLE = {
  Brasil: "br", Portugal: "br",
  Espanha: "es", Argentina: "es", Uruguai: "es", Colômbia: "es", Equador: "es", Paraguai: "es", Chile: "es", Venezuela: "es", México: "es",
  Inglaterra: "en", Escócia: "en", "País de Gales": "en", Irlanda: "en", "Estados Unidos": "en", Austrália: "en", Canadá: "en", Jamaica: "en",
  Alemanha: "de", Áustria: "de", Suíça: "de",
  França: "fr", "Costa do Marfim": "fr", Mali: "fr", Camarões: "fr", "República Democrática do Congo": "fr",
  Itália: "it",
  Holanda: "nl", Bélgica: "nl",
  Croácia: "hr", Sérvia: "hr", Eslovênia: "hr",
  Marrocos: "ma", Argélia: "ma", Tunísia: "ma", Egito: "ma", "Arábia Saudita": "ma", Catar: "ma", Turquia: "ma", Irã: "ma",
  Nigéria: "ng",
  Gana: "gh",
  Japão: "jp",
  "Coreia do Sul": "kr",
  Dinamarca: "dk", Suécia: "dk", Noruega: "dk", Polônia: "dk", Ucrânia: "dk", Hungria: "dk", Geórgia: "dk",
  "Costa Rica": "es",
};

function styleFor(country) {
  return NAME_POOLS[COUNTRY_STYLE[country]] ? COUNTRY_STYLE[country] : "en";
}

const usedNames = new Set();
function uniqueGeneratedName(country) {
  const style = NAME_POOLS[styleFor(country)];
  let name;
  let guard = 0;
  do {
    name = `${pick(style.first)} ${pick(style.last)}`;
    guard++;
  } while (usedNames.has(name) && guard < 60);
  usedNames.add(name);
  return name;
}

// ---------------------------------------------------------------------------
// Plano de posições (mínimo por posição; jogadores reais podem ultrapassar)
// ---------------------------------------------------------------------------
const POSITION_MIN = { GOL: 2, ZAG: 3, LAT: 2, VOL: 2, MEI: 3, ATA: 4 };
const POSITION_ORDER = ["GOL", "ZAG", "LAT", "VOL", "MEI", "ATA"];

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
        defending: clamp(base - 5 + noise(), 40, 96),
        physical: clamp(base + noise(), 40, 96),
      };
    case "ZAG":
      return {
        pace: clamp(base - 10 + noise(), 35, 90),
        shooting: clamp(base - 25 + noise(), 20, 70),
        passing: clamp(base - 8 + noise(), 35, 90),
        dribbling: clamp(base - 15 + noise(), 25, 82),
        defending: clamp(base + 6 + noise(), 45, 97),
        physical: clamp(base + 8 + noise(), 45, 97),
      };
    case "LAT":
      return {
        pace: clamp(base + 6 + noise(), 45, 96),
        shooting: clamp(base - 15 + noise(), 25, 78),
        passing: clamp(base + 2 + noise(), 40, 92),
        dribbling: clamp(base + noise(), 35, 90),
        defending: clamp(base + 2 + noise(), 40, 92),
        physical: clamp(base + noise(), 40, 92),
      };
    case "VOL":
      return {
        pace: clamp(base - 4 + noise(), 35, 90),
        shooting: clamp(base - 10 + noise(), 30, 82),
        passing: clamp(base + 6 + noise(), 40, 94),
        dribbling: clamp(base + noise(), 35, 90),
        defending: clamp(base + 8 + noise(), 45, 95),
        physical: clamp(base + 6 + noise(), 45, 95),
      };
    case "MEI":
      return {
        pace: clamp(base + noise(), 40, 94),
        shooting: clamp(base + 2 + noise(), 35, 92),
        passing: clamp(base + 10 + noise(), 45, 98),
        dribbling: clamp(base + 8 + noise(), 45, 98),
        defending: clamp(base - 12 + noise(), 20, 78),
        physical: clamp(base - 4 + noise(), 35, 88),
      };
    case "ATA":
    default:
      return {
        pace: clamp(base + 8 + noise(), 45, 99),
        shooting: clamp(base + 10 + noise(), 45, 99),
        passing: clamp(base - 4 + noise(), 30, 88),
        dribbling: clamp(base + 6 + noise(), 40, 97),
        defending: clamp(base - 25 + noise(), 15, 65),
        physical: clamp(base + noise(), 35, 92),
      };
  }
}

function parseReal(list) {
  return (list || []).map((line) => {
    const [name, position, country, age] = line.split("|");
    return { name, position, country, age: Number(age) };
  });
}

module.exports = {
  COUNTRIES_UNIQUE,
  NAME_POOLS,
  COUNTRY_STYLE,
  POSITION_MIN,
  POSITION_ORDER,
  statsForPosition,
  parseReal,
  uniqueGeneratedName,
  randInt,
  clamp,
};
