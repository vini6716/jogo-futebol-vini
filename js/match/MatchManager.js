/**
 * MatchManager - motor de simulação de partida.
 * Porta em JS da ideia original (MatchManager.cs / BallController /
 * GoalSystem / RefereeSystem / AIManager do projeto Unity), simplificada
 * para um modelo estatístico: cada minuto tem uma chance de "lance" para
 * cada time, ponderada pela força ofensiva/defensiva dos elencos.
 */

const DIFFICULTY_FACTORS = {
  Iniciante: { userBoost: 10, aiBoost: -6 },
  Amador: { userBoost: 4, aiBoost: -2 },
  Semiprofissional: { userBoost: 0, aiBoost: 0 },
  Profissional: { userBoost: -4, aiBoost: 4 },
  Lenda: { userBoost: -10, aiBoost: 10 },
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function weightedPick(items, weightFn) {
  const total = items.reduce((sum, it) => sum + weightFn(it), 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)];
  let roll = Math.random() * total;
  for (const it of items) {
    roll -= weightFn(it);
    if (roll <= 0) return it;
  }
  return items[items.length - 1];
}

export class MatchManager {
  /**
   * @param {object} opts
   * @param {object} opts.homeClub, opts.awayClub - registros de clube
   * @param {object[]} opts.homePlayers, opts.awayPlayers - elencos
   * @param {string} opts.difficulty - uma das chaves de DIFFICULTY_FACTORS
   * @param {number|null} opts.userTeam - 'home' | 'away' | null (partida neutra)
   */
  constructor(opts) {
    this.homeClub = opts.homeClub;
    this.awayClub = opts.awayClub;
    this.homePlayers = opts.homePlayers;
    this.awayPlayers = opts.awayPlayers;
    this.difficulty = opts.difficulty || "Amador";
    this.userTeam = opts.userTeam || null;

    this.homeGoals = 0;
    this.awayGoals = 0;
    this.minute = 0;
    this.matchStarted = false;
    this.matchEnded = false;
    this.events = [];
    this.referee = opts.referee || { name: "Árbitro Neutro" };

    this._prepareStrengths();
  }

  _bestEleven(players) {
    return [...players].sort((a, b) => b.overall - a.overall).slice(0, 11);
  }

  _prepareStrengths() {
    const homeXI = this._bestEleven(this.homePlayers);
    const awayXI = this._bestEleven(this.awayPlayers);

    const avg = (list, key) => list.reduce((s, p) => s + p[key], 0) / (list.length || 1);

    let homeAttack = avg(homeXI, "overall") + 3; // mando de campo
    let awayAttack = avg(awayXI, "overall");
    const homeDefense = avg(
      homeXI.filter((p) => ["ZAG", "LAT", "VOL", "GOL"].includes(p.position)),
      "defending"
    ) || avg(homeXI, "overall");
    const awayDefense = avg(
      awayXI.filter((p) => ["ZAG", "LAT", "VOL", "GOL"].includes(p.position)),
      "defending"
    ) || avg(awayXI, "overall");

    const factors = DIFFICULTY_FACTORS[this.difficulty] || DIFFICULTY_FACTORS.Amador;
    if (this.userTeam === "home") {
      homeAttack += factors.userBoost;
      awayAttack += factors.aiBoost;
    } else if (this.userTeam === "away") {
      awayAttack += factors.userBoost;
      homeAttack += factors.aiBoost;
    }

    this.homeXI = homeXI;
    this.awayXI = awayXI;
    this.homeStrength = clamp(homeAttack - awayDefense * 0.35, 10, 99);
    this.awayStrength = clamp(awayAttack - homeDefense * 0.35, 10, 99);
  }

  startMatch() {
    this.matchStarted = true;
    this.minute = 0;
    this._log(0, "apito", `${this.referee.name} apita o início da partida em ${this._stadiumLabel()}.`);
  }

  _stadiumLabel() {
    return this.stadiumName || "estádio neutro";
  }

  /** Simula um único minuto e retorna a lista de eventos gerados nesse minuto. */
  simulateMinute() {
    if (!this.matchStarted || this.matchEnded) return [];
    this.minute += 1;
    const minuteEvents = [];

    const totalStrength = this.homeStrength + this.awayStrength;
    const chanceProbability = 0.14; // ~ chance de lance relevante por minuto

    if (Math.random() < chanceProbability) {
      const homeShare = this.homeStrength / totalStrength;
      const attackingSide = Math.random() < homeShare ? "home" : "away";
      const ev = this._resolveChance(attackingSide);
      if (ev) minuteEvents.push(ev);
    }

    if (Math.random() < 0.012) {
      const ev = this._resolveCard();
      if (ev) minuteEvents.push(ev);
    }

    if (this.minute === 45) {
      this._log(45, "intervalo", "Fim do primeiro tempo.");
      minuteEvents.push(this.events[this.events.length - 1]);
    }

    if (this.minute >= 90) {
      this._endMatch();
      minuteEvents.push(...this.events.slice(-1));
    }

    return minuteEvents;
  }

  _resolveChance(side) {
    const attackers = side === "home" ? this.homeXI : this.awayXI;
    const club = side === "home" ? this.homeClub : this.awayClub;
    const shooters = attackers.filter((p) => ["ATA", "MEI"].includes(p.position));
    const pool = shooters.length ? shooters : attackers;
    const scorer = weightedPick(pool, (p) => p.shooting + p.overall * 0.3);

    const goalChance = clamp(scorer.shooting / 260, 0.08, 0.42);
    if (Math.random() < goalChance) {
      if (side === "home") this.homeGoals += 1;
      else this.awayGoals += 1;
      const assistPool = attackers.filter((p) => p.id !== scorer.id && ["MEI", "LAT", "ATA"].includes(p.position));
      const assist = assistPool.length && Math.random() < 0.6
        ? weightedPick(assistPool, (p) => p.passing)
        : null;
      const text = assist
        ? `GOL de ${club.name}! ${scorer.name} balança as redes de assistência de ${assist.name}.`
        : `GOL de ${club.name}! ${scorer.name} marca um golaço!`;
      return this._log(this.minute, "gol", text, { side, scorer: scorer.name, assist: assist?.name || null });
    }

    return this._log(
      this.minute,
      "chance",
      `Chance perdida para o ${club.name}: finalização de ${scorer.name} não foi feliz.`,
      { side }
    );
  }

  _resolveCard() {
    const side = Math.random() < 0.5 ? "home" : "away";
    const players = side === "home" ? this.homeXI : this.awayXI;
    const club = side === "home" ? this.homeClub : this.awayClub;
    const defenders = players.filter((p) => ["ZAG", "LAT", "VOL"].includes(p.position));
    const pool = defenders.length ? defenders : players;
    const player = pool[Math.floor(Math.random() * pool.length)];
    const isRed = Math.random() < 0.08;
    const text = isRed
      ? `Cartão vermelho! ${player.name} (${club.name}) é expulso após falta dura.`
      : `Cartão amarelo para ${player.name} (${club.name}).`;
    return this._log(this.minute, isRed ? "vermelho" : "amarelo", text, { side, player: player.name });
  }

  _endMatch() {
    this.matchEnded = true;
    const result =
      this.homeGoals === this.awayGoals
        ? "Empate!"
        : this.homeGoals > this.awayGoals
        ? `Vitória do ${this.homeClub.name}!`
        : `Vitória do ${this.awayClub.name}!`;
    this._log(
      90,
      "fim",
      `Fim de jogo: ${this.homeClub.name} ${this.homeGoals} x ${this.awayGoals} ${this.awayClub.name}. ${result}`
    );
  }

  /** Roda a partida inteira de uma vez (para simulações rápidas em massa). */
  simulateFullMatch() {
    this.startMatch();
    while (!this.matchEnded) {
      this.simulateMinute();
    }
    return this.getResult();
  }

  _log(minute, type, text, extra = {}) {
    const ev = { minute, type, text, ...extra };
    this.events.push(ev);
    return ev;
  }

  getResult() {
    return {
      homeClub: this.homeClub,
      awayClub: this.awayClub,
      homeGoals: this.homeGoals,
      awayGoals: this.awayGoals,
      events: this.events,
    };
  }
}
