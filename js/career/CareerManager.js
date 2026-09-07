/**
 * Porta web do CareerManager.cs / SaveCareer.cs.
 *
 * Suporta dois modos de campeonato:
 * - "liga": calendário de turno e returno contra os demais clubes da mesma
 *   liga do clube escolhido (comportamento original).
 * - "copa": campeonatos de mata-mata (Copa do Brasil, Libertadores, Mundial
 *   de Clubes, Mundo Livre) ou fase de grupos + mata-mata (Copa do Mundo),
 *   usando os dados de `database.getCompetitions()`.
 */
import { MatchManager } from "../match/MatchManager.js";

function buildDoubleRoundRobin(clubIds) {
  const ids = [...clubIds];
  if (ids.length % 2 !== 0) ids.push(null); // bye
  const n = ids.length;
  const rounds = [];
  const half = n / 2;
  let arr = [...ids];

  for (let r = 0; r < n - 1; r++) {
    const round = [];
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a !== null && b !== null) {
        round.push(r % 2 === 0 ? [a, b] : [b, a]);
      }
    }
    rounds.push(round);
    arr = [arr[0], ...[arr[n - 1], ...arr.slice(1, n - 1)]];
  }

  const secondLeg = rounds.map((round) => round.map(([h, a]) => [a, h]));
  return [...rounds, ...secondLeg];
}

function buildSingleRoundRobin(clubIds) {
  return buildDoubleRoundRobin(clubIds).slice(0, clubIds.length % 2 === 0 ? clubIds.length - 1 : clubIds.length);
}

function nextPowerOfTwo(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function seedOrder(size) {
  let order = [0];
  let n = 1;
  while (n < size) {
    const next = [];
    n *= 2;
    order.forEach((seed) => {
      next.push(seed);
      next.push(n - 1 - seed);
    });
    order = next;
  }
  return order;
}

function buildBracketRound(clubIds, strengthOf) {
  const sorted = [...clubIds].sort((a, b) => strengthOf(b) - strengthOf(a));
  const size = nextPowerOfTwo(sorted.length);
  const slots = [...sorted];
  while (slots.length < size) slots.push(null); // byes preenchem as posições mais fracas
  const order = seedOrder(size);
  const bracketSlots = order.map((i) => slots[i] ?? null);
  const round = [];
  for (let i = 0; i < bracketSlots.length; i += 2) {
    const tie = { homeId: bracketSlots[i], awayId: bracketSlots[i + 1], homeGoals: null, awayGoals: null, winnerId: null, played: false };
    if (tie.homeId == null || tie.awayId == null) {
      tie.winnerId = tie.homeId ?? tie.awayId;
      tie.played = true;
      tie.bye = true;
    }
    round.push(tie);
  }
  return round;
}

function roundNamesFor(firstRoundSize) {
  const totalRounds = Math.log2(firstRoundSize);
  const namesFromFinal = ["Final", "Semifinal", "Quartas de Final", "Oitavas de Final", "16-avos de Final", "32-avos de Final"];
  const names = [];
  for (let i = 0; i < totalRounds; i++) {
    const fromEnd = totalRounds - i;
    names.push(namesFromFinal[fromEnd - 1] || `Rodada ${i + 1}`);
  }
  return names;
}

function clubEligibleForCompetition(club, competition, database) {
  if (!competition || !competition.eligibility) return false;
  switch (competition.eligibility) {
    case "qualquer":
      return true;
    case "selecao":
      return !!club.nationalTeam;
    case "clube":
      return !club.nationalTeam;
    case "Europa": {
      if (club.nationalTeam) return false;
      const country = database.getCountries().find((c) => c.name === club.country);
      return !!country && country.continent === "Europa";
    }
    default:
      return club.country === competition.eligibility && !club.nationalTeam;
  }
}

export class CareerManager {
  constructor(database, saveManager) {
    this.database = database;
    this.saveManager = saveManager;
    this.state = null;
  }

  hasSavedCareer() {
    return !!this.saveManager.loadCareer();
  }

  loadSavedCareer() {
    this.state = this.saveManager.loadCareer();
    return this.state;
  }

  /**
   * Lista as competições jogáveis (mata-mata / grupos+mata-mata) que o
   * clube escolhido pode disputar, além da própria liga dele.
   */
  getAvailableCompetitions(clubId) {
    const club = this.database.getClub(clubId);
    if (!club) return [];
    return this.database
      .getCompetitions()
      .filter((c) => c.format && clubEligibleForCompetition(club, c, this.database));
  }

  /**
   * `competitionName` opcional: se vazio, joga a liga do próprio clube
   * (comportamento original). Se for o nome de uma competição de copa
   * disponível pro clube, inicia o modo "copa".
   */
  startNewCareer(userClubId, managerName, competitionName) {
    const competition = competitionName
      ? this.database.getCompetitions().find((c) => c.name === competitionName && c.format)
      : null;

    if (competition) {
      this._startCup(userClubId, managerName, competition);
    } else {
      this._startLeague(userClubId, managerName);
    }
    this._persist();
    return this.state;
  }

  _startLeague(userClubId, managerName) {
    const userClub = this.database.getClub(userClubId);
    const league = userClub && userClub.leagueId != null ? this.database.getLeague(userClub.leagueId) : null;
    // Clube sem liga (ex.: criado em "Crie seu Clube") joga uma liguinha
    // "Mundo Livre" com um grupo pequeno de clubes, em vez de um turno e
    // returno contra TODOS os clubes do banco (centenas de rodadas).
    const freeWorldPool = this.database.getCompetitions().find((c) => c.name === "Mundo Livre");
    let clubIds = league
      ? [...league.clubIds]
      : freeWorldPool
      ? [...freeWorldPool.clubIds]
      : this.database.getClubs().map((c) => c.id);
    if (!clubIds.includes(userClubId)) clubIds.push(userClubId);

    const fixtures = buildDoubleRoundRobin(clubIds);
    const table = {};
    clubIds.forEach((id) => {
      table[id] = { clubId: id, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, pts: 0 };
    });

    this.state = {
      mode: "liga",
      managerName,
      userClubId,
      leagueName: league ? league.name : "Mundo Livre",
      clubIds,
      season: 1,
      round: 0,
      fixtures,
      table,
      results: [],
      trophies: [],
      money: 500000,
    };
  }

  _startCup(userClubId, managerName, competition) {
    let clubIds = [...competition.clubIds];
    if (!clubIds.includes(userClubId)) clubIds.push(userClubId);
    const strengthOf = (id) => (this.database.getClub(id) || {}).overallBase || 50;

    this.state = {
      mode: "copa",
      managerName,
      userClubId,
      competitionName: competition.name,
      season: 1,
      trophies: [],
      money: 500000,
      finished: false,
      champion: false,
      eliminated: false,
    };

    if (competition.format === "grupos-mata-mata") {
      this._setupGroupStage(clubIds);
    } else {
      const round1 = buildBracketRound(clubIds, strengthOf);
      this.state.stage = "mata-mata";
      this.state.bracket = [round1];
      this.state.roundIndex = 0;
      this.state.roundNames = roundNamesFor(round1.length * 2);
    }
  }

  _setupGroupStage(clubIds) {
    const strengthOf = (id) => (this.database.getClub(id) || {}).overallBase || 50;
    const groupCount = 4;
    const sorted = [...clubIds].sort((a, b) => strengthOf(b) - strengthOf(a));
    const groups = Array.from({ length: groupCount }, (_, i) => ({
      name: `Grupo ${String.fromCharCode(65 + i)}`,
      clubIds: [],
    }));
    // distribuição em "serpentina" pra espalhar os times mais fortes entre os grupos
    sorted.forEach((id, index) => {
      const round = Math.floor(index / groupCount);
      const posInRound = index % groupCount;
      const groupIndex = round % 2 === 0 ? posInRound : groupCount - 1 - posInRound;
      groups[groupIndex].clubIds.push(id);
    });

    const groupOf = {};
    const table = {};
    groups.forEach((g, gi) => {
      g.clubIds.forEach((id) => {
        groupOf[id] = gi;
        table[id] = { clubId: id, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, pts: 0 };
      });
    });

    const perGroupFixtures = groups.map((g) => buildSingleRoundRobin(g.clubIds));
    const roundCount = Math.max(...perGroupFixtures.map((f) => f.length));
    const combinedFixtures = [];
    for (let r = 0; r < roundCount; r++) {
      combinedFixtures.push(perGroupFixtures.flatMap((f) => f[r] || []));
    }

    this.state.stage = "grupos";
    this.state.groups = groups;
    this.state.groupOf = groupOf;
    this.state.groupTable = table;
    this.state.groupFixtures = combinedFixtures;
    this.state.groupRound = 0;
    this.state.groupResults = [];
  }

  get totalRounds() {
    if (!this.state) return 0;
    if (this.state.mode === "copa") {
      if (this.state.stage === "grupos") return this.state.groupFixtures.length;
      return this.state.roundNames.length;
    }
    return this.state.fixtures.length;
  }

  get currentRoundLabel() {
    if (!this.state) return "";
    if (this.state.mode === "copa") {
      if (this.state.stage === "grupos") return `Fase de grupos — rodada ${Math.min(this.state.groupRound + 1, this.state.groupFixtures.length)} de ${this.state.groupFixtures.length}`;
      return this.state.roundNames[this.state.roundIndex] || "Final";
    }
    return `Rodada ${Math.min(this.state.round + 1, this.totalRounds)} de ${this.totalRounds}`;
  }

  isSeasonOver() {
    if (this.state.mode === "copa") return !!this.state.finished;
    return this.state.round >= this.totalRounds;
  }

  getCurrentFixtures() {
    if (this.isSeasonOver()) return [];
    if (this.state.mode === "copa") {
      if (this.state.stage === "grupos") return this.state.groupFixtures[this.state.groupRound];
      return this.state.bracket[this.state.roundIndex]
        .filter((t) => !t.played)
        .map((t) => [t.homeId, t.awayId]);
    }
    return this.state.fixtures[this.state.round];
  }

  getUserFixtureThisRound() {
    const fixtures = this.getCurrentFixtures();
    return fixtures.find(([h, a]) => h === this.state.userClubId || a === this.state.userClubId) || null;
  }

  _applyResult(table, homeId, awayId, homeGoals, awayGoals) {
    table[homeId].j++;
    table[awayId].j++;
    table[homeId].gp += homeGoals;
    table[homeId].gc += awayGoals;
    table[awayId].gp += awayGoals;
    table[awayId].gc += homeGoals;
    if (homeGoals > awayGoals) {
      table[homeId].v++;
      table[homeId].pts += 3;
      table[awayId].d++;
    } else if (homeGoals < awayGoals) {
      table[awayId].v++;
      table[awayId].pts += 3;
      table[homeId].d++;
    } else {
      table[homeId].e++;
      table[awayId].e++;
      table[homeId].pts += 1;
      table[awayId].pts += 1;
    }
  }

  /**
   * Simula a rodada atual. Se `userResult` for informado (partida do
   * usuário já simulada minuto a minuto na tela), usa o resultado dela; os
   * demais jogos da rodada são resolvidos instantaneamente.
   */
  playRound(userResult) {
    if (this.state.mode === "copa") {
      const summary = this.state.stage === "grupos" ? this._playGroupRound(userResult) : this._playBracketRound(userResult);
      this._persist();
      return summary;
    }

    const fixtures = this.getCurrentFixtures();
    const roundSummary = [];

    fixtures.forEach(([homeId, awayId]) => {
      let homeGoals, awayGoals;
      const isUserMatch = homeId === this.state.userClubId || awayId === this.state.userClubId;

      if (isUserMatch && userResult) {
        homeGoals = userResult.homeGoals;
        awayGoals = userResult.awayGoals;
      } else {
        const sim = this._quickSimResult(homeId, awayId);
        homeGoals = sim.homeGoals;
        awayGoals = sim.awayGoals;
      }

      this._applyResult(this.state.table, homeId, awayId, homeGoals, awayGoals);
      roundSummary.push({ homeId, awayId, homeGoals, awayGoals });
    });

    this.state.results.push({ round: this.state.round + 1, matches: roundSummary });
    this.state.round += 1;

    if (this.isSeasonOver()) {
      this._closeSeason();
    }

    this._persist();
    return roundSummary;
  }

  _playGroupRound(userResult) {
    const round = this.state.groupFixtures[this.state.groupRound];
    const roundSummary = [];

    round.forEach(([homeId, awayId]) => {
      let homeGoals, awayGoals;
      const isUserMatch = homeId === this.state.userClubId || awayId === this.state.userClubId;
      if (isUserMatch && userResult) {
        homeGoals = userResult.homeGoals;
        awayGoals = userResult.awayGoals;
      } else {
        const sim = this._quickSimResult(homeId, awayId);
        homeGoals = sim.homeGoals;
        awayGoals = sim.awayGoals;
      }
      this._applyResult(this.state.groupTable, homeId, awayId, homeGoals, awayGoals);
      roundSummary.push({ homeId, awayId, homeGoals, awayGoals });
    });

    this.state.groupResults.push({ round: this.state.groupRound + 1, matches: roundSummary });
    this.state.groupRound += 1;

    if (this.state.groupRound >= this.state.groupFixtures.length) {
      this._finishGroupStage();
    }
    return roundSummary;
  }

  _finishGroupStage() {
    const qualifiers = [];
    this.state.groups.forEach((g) => {
      const ranked = [...g.clubIds]
        .map((id) => this.state.groupTable[id])
        .sort((a, b) => {
          if (b.pts !== a.pts) return b.pts - a.pts;
          const sgA = a.gp - a.gc;
          const sgB = b.gp - b.gc;
          if (sgB !== sgA) return sgB - sgA;
          return b.gp - a.gp;
        });
      qualifiers.push(ranked[0].clubId, ranked[1].clubId);
    });

    this.state.qualifiers = qualifiers;

    if (!qualifiers.includes(this.state.userClubId)) {
      // Não se classificou: a competição acaba aqui pro jogador (a fase de
      // grupos continua visível na tela com a classificação final).
      this.state.finished = true;
      this.state.eliminated = true;
      this.state.trophies.push({
        season: this.state.season,
        position: null,
        champion: false,
        eliminated: true,
        stage: "Fase de Grupos",
        competition: this.state.competitionName,
      });
      this.state.money += 150000;
      return;
    }

    const strengthOf = (id) => (this.database.getClub(id) || {}).overallBase || 50;
    const round1 = buildBracketRound(qualifiers, strengthOf);

    this.state.stage = "mata-mata";
    this.state.bracket = [round1];
    this.state.roundIndex = 0;
    this.state.roundNames = roundNamesFor(round1.length * 2);
  }

  _playBracketRound(userResult) {
    const round = this.state.bracket[this.state.roundIndex];

    round.forEach((tie) => {
      if (tie.played) return;
      let homeGoals, awayGoals;
      const isUserMatch = tie.homeId === this.state.userClubId || tie.awayId === this.state.userClubId;
      if (isUserMatch && userResult) {
        homeGoals = userResult.homeGoals;
        awayGoals = userResult.awayGoals;
      } else {
        const sim = this._quickSimResult(tie.homeId, tie.awayId);
        homeGoals = sim.homeGoals;
        awayGoals = sim.awayGoals;
      }
      tie.homeGoals = homeGoals;
      tie.awayGoals = awayGoals;
      tie.played = true;
      if (homeGoals === awayGoals) {
        tie.penalties = true;
        tie.winnerId = Math.random() < 0.5 ? tie.homeId : tie.awayId;
      } else {
        tie.winnerId = homeGoals > awayGoals ? tie.homeId : tie.awayId;
      }
    });

    const winners = round.map((t) => t.winnerId);
    const userWasInRound = round.some((t) => t.homeId === this.state.userClubId || t.awayId === this.state.userClubId);
    const userWon = winners.includes(this.state.userClubId);

    if (winners.length === 1) {
      // Ao chegar aqui a final acabou de ser disputada; se o jogador ainda
      // está na competição, ele é obrigatoriamente um dos dois finalistas.
      this.state.finished = true;
      this.state.champion = winners[0] === this.state.userClubId;
      this.state.eliminated = userWasInRound && !this.state.champion;
      this.state.trophies.push({
        season: this.state.season,
        position: this.state.champion ? 1 : userWasInRound ? 2 : null,
        champion: this.state.champion,
        runnerUp: userWasInRound && !this.state.champion,
        competition: this.state.competitionName,
      });
      if (this.state.champion) this.state.money += 3000000;
      this.state.money += 400000;
    } else if (userWasInRound && !userWon) {
      this.state.finished = true;
      this.state.eliminated = true;
      this.state.trophies.push({
        season: this.state.season,
        position: null,
        champion: false,
        eliminated: true,
        stage: this.state.roundNames[this.state.roundIndex],
        competition: this.state.competitionName,
      });
      this.state.money += 150000;
    } else {
      this.state.roundIndex += 1;
      const nextRound = [];
      for (let i = 0; i < winners.length; i += 2) {
        const tie = { homeId: winners[i], awayId: winners[i + 1], homeGoals: null, awayGoals: null, winnerId: null, played: false };
        nextRound.push(tie);
      }
      this.state.bracket.push(nextRound);
    }

    return round;
  }

  _quickSimResult(homeId, awayId) {
    const homeClub = this.database.getClub(homeId);
    const awayClub = this.database.getClub(awayId);
    const homePlayers = this.database.getPlayersByClub(homeId);
    const awayPlayers = this.database.getPlayersByClub(awayId);
    const mm = new MatchManager({
      homeClub,
      awayClub,
      homePlayers,
      awayPlayers,
      difficulty: "Semiprofissional",
    });
    const result = mm.simulateFullMatch();
    return result;
  }

  getStandings() {
    return Object.values(this.state.table).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      const sgA = a.gp - a.gc;
      const sgB = b.gp - b.gc;
      if (sgB !== sgA) return sgB - sgA;
      return b.gp - a.gp;
    });
  }

  getGroupStandings(groupIndex) {
    const group = this.state.groups[groupIndex];
    return group.clubIds
      .map((id) => this.state.groupTable[id])
      .sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        const sgA = a.gp - a.gc;
        const sgB = b.gp - b.gc;
        if (sgB !== sgA) return sgB - sgA;
        return b.gp - a.gp;
      });
  }

  _closeSeason() {
    const standings = this.getStandings();
    const position = standings.findIndex((row) => row.clubId === this.state.userClubId) + 1;
    const champion = position === 1;
    this.state.trophies.push({
      season: this.state.season,
      position,
      champion,
      competition: this.state.leagueName || "Mundo Livre",
    });
    if (champion) this.state.money += 2000000;
    this.state.money += 300000;
  }

  startNextSeason() {
    if (this.state.mode === "copa") {
      const competition = this.database.getCompetitions().find((c) => c.name === this.state.competitionName);
      const managerName = this.state.managerName;
      const userClubId = this.state.userClubId;
      const season = this.state.season + 1;
      const money = this.state.money;
      const trophies = this.state.trophies;
      this._startCup(userClubId, managerName, competition);
      this.state.season = season;
      this.state.money = money;
      this.state.trophies = trophies;
    } else {
      this.state.season += 1;
      this.state.round = 0;
      this.state.fixtures = buildDoubleRoundRobin(this.state.clubIds);
      this.state.results = [];
      Object.keys(this.state.table).forEach((id) => {
        this.state.table[id] = { clubId: Number(id), j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, pts: 0 };
      });
    }
    this._persist();
  }

  _persist() {
    this.saveManager.saveCareer(this.state);
  }

  deleteCareer() {
    this.state = null;
    this.saveManager.clearCareer();
  }
}
