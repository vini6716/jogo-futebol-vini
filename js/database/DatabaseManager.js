/**
 * Equivalente web do DatabaseManager/DatabaseLoader da versão Unity.
 * Carrega os JSONs de /database e depois mescla os clubes/jogadores
 * criados pelo jogador (Criar Clube), que ficam salvos no navegador.
 */
export class DatabaseManager {
  constructor(saveManager) {
    this.saveManager = saveManager;
    this.countries = [];
    this.leagues = [];
    this.clubs = [];
    this.players = [];
    this.stadiums = [];
    this.competitions = [];
    this.referees = [];
    this.loaded = false;
  }

  async loadAll() {
    const base = "database";
    const [countries, leagues, clubs, players, stadiums, competitions, referees] =
      await Promise.all([
        this._fetchJson(`${base}/countries.json`),
        this._fetchJson(`${base}/leagues.json`),
        this._fetchJson(`${base}/clubs.json`),
        this._fetchJson(`${base}/players.json`),
        this._fetchJson(`${base}/stadiums.json`),
        this._fetchJson(`${base}/competitions.json`),
        this._fetchJson(`${base}/referees.json`),
      ]);

    this.countries = countries;
    this.leagues = leagues;
    this.clubs = clubs;
    this.players = players;
    this.stadiums = stadiums;
    this.competitions = competitions;
    this.referees = referees;

    this.mergeCustomData();
    this.loaded = true;
  }

  async _fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Falha ao carregar ${url}: ${res.status}`);
    return res.json();
  }

  mergeCustomData() {
    const customClubs = this.saveManager.loadCustomClubs();
    const customPlayers = this.saveManager.loadCustomPlayers();
    const customStadiums = this.saveManager.loadCustomStadiums();
    const baseClubs = this.clubs.filter((c) => !c.custom);
    const basePlayers = this.players.filter((p) => !p.custom);
    const baseStadiums = this.stadiums.filter((s) => !s.custom);
    this.clubs = [...baseClubs, ...customClubs];
    this.players = [...basePlayers, ...customPlayers];
    this.stadiums = [...baseStadiums, ...customStadiums];
  }

  addCustomClub(club, players, stadium) {
    const customClubs = this.saveManager.loadCustomClubs();
    customClubs.push(club);
    this.saveManager.saveCustomClubs(customClubs);

    const customPlayers = this.saveManager.loadCustomPlayers();
    customPlayers.push(...players);
    this.saveManager.saveCustomPlayers(customPlayers);

    if (stadium) {
      const customStadiums = this.saveManager.loadCustomStadiums();
      customStadiums.push({ ...stadium, custom: true });
      this.saveManager.saveCustomStadiums(customStadiums);
    }

    this.mergeCustomData();
  }

  removeCustomClub(clubId) {
    const customClubs = this.saveManager.loadCustomClubs().filter((c) => c.id !== clubId);
    this.saveManager.saveCustomClubs(customClubs);
    const customPlayers = this.saveManager.loadCustomPlayers().filter((p) => p.clubId !== clubId);
    this.saveManager.saveCustomPlayers(customPlayers);
    const customStadiums = this.saveManager.loadCustomStadiums().filter((s) => s.clubId !== clubId);
    this.saveManager.saveCustomStadiums(customStadiums);
    this.mergeCustomData();
  }

  getClubs() {
    return this.clubs;
  }

  getClub(id) {
    return this.clubs.find((c) => c.id === id) || null;
  }

  getPlayersByClub(clubId) {
    return this.players.filter((p) => p.clubId === clubId);
  }

  getStadium(id) {
    return this.stadiums.find((s) => s.id === id) || null;
  }

  getStadiumForClub(clubId) {
    return this.stadiums.find((s) => s.clubId === clubId) || null;
  }

  getLeague(id) {
    return this.leagues.find((l) => l.id === id) || null;
  }

  getLeagueByName(name) {
    return this.leagues.find((l) => l.name === name) || null;
  }

  getCountries() {
    return this.countries;
  }

  getCompetitions() {
    return this.competitions;
  }

  randomReferee() {
    return this.referees[Math.floor(Math.random() * this.referees.length)];
  }

  nextClubId() {
    return this.clubs.reduce((max, c) => Math.max(max, c.id), 0) + 1;
  }

  nextPlayerId() {
    return this.players.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  }
}
