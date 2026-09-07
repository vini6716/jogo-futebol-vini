/**
 * Porta web do CareerManager.cs / SaveCareer.cs: gera o calendário de uma
 * temporada (turno e returno contra os demais clubes da mesma liga do clube
 * escolhido), simula rodadas e mantém a tabela de classificação.
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

  startNewCareer(userClubId, managerName) {
    const userClub = this.database.getClub(userClubId);
    const league = userClub && userClub.leagueId != null ? this.database.getLeague(userClub.leagueId) : null;
    let clubIds = league ? [...league.clubIds] : this.database.getClubs().map((c) => c.id);
    if (!clubIds.includes(userClubId)) clubIds.push(userClubId);

    const fixtures = buildDoubleRoundRobin(clubIds);
    const table = {};
    clubIds.forEach((id) => {
      table[id] = { clubId: id, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, pts: 0 };
    });

    this.state = {
      managerName,
      userClubId,
      leagueName: league ? league.name : "Liga Livre",
      clubIds,
      season: 1,
      round: 0,
      fixtures,
      table,
      results: [],
      trophies: [],
      money: 500000,
    };
    this._persist();
    return this.state;
  }

  get totalRounds() {
    return this.state ? this.state.fixtures.length : 0;
  }

  isSeasonOver() {
    return this.state.round >= this.totalRounds;
  }

  getCurrentFixtures() {
    if (this.isSeasonOver()) return [];
    return this.state.fixtures[this.state.round];
  }

  getUserFixtureThisRound() {
    const fixtures = this.getCurrentFixtures();
    return fixtures.find(([h, a]) => h === this.state.userClubId || a === this.state.userClubId) || null;
  }

  _applyResult(homeId, awayId, homeGoals, awayGoals) {
    const t = this.state.table;
    t[homeId].j++;
    t[awayId].j++;
    t[homeId].gp += homeGoals;
    t[homeId].gc += awayGoals;
    t[awayId].gp += awayGoals;
    t[awayId].gc += homeGoals;
    if (homeGoals > awayGoals) {
      t[homeId].v++;
      t[homeId].pts += 3;
      t[awayId].d++;
    } else if (homeGoals < awayGoals) {
      t[awayId].v++;
      t[awayId].pts += 3;
      t[homeId].d++;
    } else {
      t[homeId].e++;
      t[awayId].e++;
      t[homeId].pts += 1;
      t[awayId].pts += 1;
    }
  }

  /**
   * Simula a rodada atual. Se `userMatchManager` for informado (partida do
   * usuário já simulada minuto a minuto na tela), usa o resultado dela;
   * os demais jogos da rodada são resolvidos instantaneamente.
   */
  playRound(userResult) {
    const fixtures = this.getCurrentFixtures();
    const roundSummary = [];

    fixtures.forEach(([homeId, awayId]) => {
      let homeGoals, awayGoals;
      const isUserMatch =
        homeId === this.state.userClubId || awayId === this.state.userClubId;

      if (isUserMatch && userResult) {
        homeGoals = userResult.homeGoals;
        awayGoals = userResult.awayGoals;
      } else {
        const sim = this._quickSimResult(homeId, awayId);
        homeGoals = sim.homeGoals;
        awayGoals = sim.awayGoals;
      }

      this._applyResult(homeId, awayId, homeGoals, awayGoals);
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

  _closeSeason() {
    const standings = this.getStandings();
    const position = standings.findIndex((row) => row.clubId === this.state.userClubId) + 1;
    const champion = position === 1;
    this.state.trophies.push({
      season: this.state.season,
      position,
      champion,
      competition: this.state.leagueName || "Liga Livre",
    });
    if (champion) this.state.money += 2000000;
    this.state.money += 300000;
  }

  startNextSeason() {
    this.state.season += 1;
    this.state.round = 0;
    this.state.fixtures = buildDoubleRoundRobin(this.state.clubIds);
    this.state.results = [];
    Object.keys(this.state.table).forEach((id) => {
      this.state.table[id] = { clubId: Number(id), j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, pts: 0 };
    });
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
