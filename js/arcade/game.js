/**
 * Futebol Land Arena — protótipo de futebol arcade em tempo real.
 * Canvas 2D puro, sem bibliotecas. Você controla o jogador do seu time
 * mais próximo da bola; o resto é decidido por uma IA simples.
 */

// ---------------------------------------------------------------- CONFIG
const FIELD_W = 900;
const FIELD_H = 560;
const GOAL_HEIGHT = 150;
const GOAL_Y0 = FIELD_H / 2 - GOAL_HEIGHT / 2;
const GOAL_Y1 = FIELD_H / 2 + GOAL_HEIGHT / 2;
const GOAL_DEPTH = 22;

const PLAYER_RADIUS = 14;
const BALL_RADIUS = 8;
const PLAYER_MAX_SPEED = 205; // px/s
const PLAYER_ACCEL = 950; // px/s^2
const PLAYER_FRICTION = 8; // 1/s
const BALL_FRICTION = 0.6; // 1/s (exponential decay factor)
const DRIBBLE_RANGE = PLAYER_RADIUS + BALL_RADIUS + 6;
const KICK_MAX_CHARGE_MS = 650;
const KICK_MIN_SPEED = 260;
const KICK_MAX_SPEED = 620;
const MATCH_SECONDS = 180;

const HOME_COLOR = "#2e7d32";
const HOME_COLOR2 = "#1b5e20";
const AWAY_COLOR = "#c62828";
const AWAY_COLOR2 = "#8e0000";

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ---------------------------------------------------------------- ENTITIES
function makePlayer(team, role, homePos, isUser) {
  return {
    team,
    role,
    isUser,
    homePos: { ...homePos },
    pos: { ...homePos },
    vel: { x: 0, y: 0 },
    facing: { x: team === "home" ? 1 : -1, y: 0 },
    radius: PLAYER_RADIUS,
    chargeStart: 0,
    charging: false,
  };
}

function buildFormation(team) {
  const dir = team === "home" ? 1 : -1;
  const cx = FIELD_H / 2;
  const gkX = team === "home" ? 34 : FIELD_W - 34;
  const defX = team === "home" ? 190 : FIELD_W - 190;
  const midX = team === "home" ? 370 : FIELD_W - 370;
  const attX = team === "home" ? 540 : FIELD_W - 540;

  return [
    makePlayer(team, "GK", { x: gkX, y: cx }, false),
    makePlayer(team, "DEF", { x: defX, y: cx - 120 }, false),
    makePlayer(team, "DEF", { x: defX, y: cx + 120 }, false),
    makePlayer(team, "MID", { x: midX, y: cx - 90 }, false),
    makePlayer(team, "ATT", { x: attX, y: cx + 60 }, false),
  ];
}

// ---------------------------------------------------------------- GAME
export class ArcadeGame {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onScore = opts.onScore || (() => {});
    this.onWhistle = opts.onWhistle || (() => {});
    this.onFullTime = opts.onFullTime || (() => {});

    this.home = buildFormation("home");
    this.away = buildFormation("away");
    this.allPlayers = [...this.home, ...this.away];
    this.ball = { pos: { x: FIELD_W / 2, y: FIELD_H / 2 }, vel: { x: 0, y: 0 } };

    this.score = { home: 0, away: 0 };
    this.timeLeft = MATCH_SECONDS;
    this.paused = false;
    this.celebrating = 0;
    this.matchOver = false;
    this.userTeam = "home";

    this.input = { x: 0, y: 0, kicking: false, kickStarted: 0 };
    this.activeUserPlayer = this.home[3];

    this._raf = null;
    this._lastTs = null;

    // exposto pra debug/teste automatizado
    window.__arcade = this;
  }

  start() {
    this._lastTs = performance.now();
    const loop = (ts) => {
      const dt = Math.min(0.033, (ts - this._lastTs) / 1000);
      this._lastTs = ts;
      if (!this.paused) this.update(dt);
      this.render();
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
  }

  setInput(x, y) {
    this.input.x = clamp(x, -1, 1);
    this.input.y = clamp(y, -1, 1);
  }

  startKick() {
    if (this.input.kicking) return;
    this.input.kicking = true;
    this.input.kickStarted = performance.now();
  }

  releaseKick() {
    if (!this.input.kicking) return;
    const held = performance.now() - this.input.kickStarted;
    this.input.kicking = false;
    this._tryKick(held);
  }

  // -------------------------------------------------------------- UPDATE
  update(dt) {
    if (this.matchOver) return;

    if (this.celebrating > 0) {
      this.celebrating -= dt;
      if (this.celebrating <= 0) this._kickoff();
      return;
    }

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.matchOver = true;
      this.onFullTime(this.score);
      return;
    }

    this._pickActiveUserPlayer();
    this._updatePlayers(dt);
    this._updateBall(dt);
    this._checkGoal();
  }

  _pickActiveUserPlayer() {
    let best = null;
    let bestD = Infinity;
    for (const p of this.home) {
      const d = dist(p.pos, this.ball.pos);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    this.activeUserPlayer = best;
  }

  _updatePlayers(dt) {
    for (const p of this.allPlayers) {
      let desired = { x: 0, y: 0 };

      if (p === this.activeUserPlayer) {
        desired = { x: this.input.x, y: this.input.y };
      } else {
        desired = this._aiDesiredDir(p);
      }

      const mag = Math.hypot(desired.x, desired.y);
      if (mag > 0.05) {
        const nx = desired.x / mag;
        const ny = desired.y / mag;
        p.vel.x += nx * PLAYER_ACCEL * dt;
        p.vel.y += ny * PLAYER_ACCEL * dt;
        p.facing = { x: nx, y: ny };
      }

      const speed = Math.hypot(p.vel.x, p.vel.y);
      if (speed > PLAYER_MAX_SPEED) {
        p.vel.x = (p.vel.x / speed) * PLAYER_MAX_SPEED;
        p.vel.y = (p.vel.y / speed) * PLAYER_MAX_SPEED;
      }
      const damp = Math.max(0, 1 - PLAYER_FRICTION * dt * (mag > 0.05 ? 0.15 : 1));
      p.vel.x *= damp;
      p.vel.y *= damp;

      p.pos.x = clamp(p.pos.x + p.vel.x * dt, p.radius, FIELD_W - p.radius);
      p.pos.y = clamp(p.pos.y + p.vel.y * dt, p.radius, FIELD_H - p.radius);
    }
    this._resolvePlayerCollisions();
  }

  _resolvePlayerCollisions() {
    for (let i = 0; i < this.allPlayers.length; i++) {
      for (let j = i + 1; j < this.allPlayers.length; j++) {
        const a = this.allPlayers[i];
        const b = this.allPlayers[j];
        const d = dist(a.pos, b.pos);
        const minD = a.radius + b.radius;
        if (d > 0 && d < minD) {
          const overlap = (minD - d) / 2;
          const nx = (a.pos.x - b.pos.x) / d;
          const ny = (a.pos.y - b.pos.y) / d;
          a.pos.x += nx * overlap;
          a.pos.y += ny * overlap;
          b.pos.x -= nx * overlap;
          b.pos.y -= ny * overlap;
        }
      }
    }
  }

  _aiDesiredDir(p) {
    const ball = this.ball.pos;
    const teamHasBall = this._closestPlayerToBall(p.team) !== null && this._teamOwnsBall() === p.team;
    const attackDir = p.team === "home" ? 1 : -1;

    let targetX = p.homePos.x;
    let targetY = p.homePos.y;

    if (p.role === "GK") {
      targetY = clamp(ball.y, GOAL_Y0 + 20, GOAL_Y1 - 20);
      targetX = p.homePos.x + (teamHasBall ? 0 : 0);
    } else {
      const isClosestPresser = this._closestPlayerToBall(p.team) === p;
      if (isClosestPresser && !teamHasBall) {
        // pressiona a bola quando o time não está com ela
        targetX = ball.x;
        targetY = ball.y;
      } else {
        // suporte: desloca a posição de formação em direção à bola
        const pull = 0.35;
        targetX = p.homePos.x + (ball.x - FIELD_W / 2) * pull * (attackDir > 0 ? 1 : 1);
        targetY = lerp(p.homePos.y, ball.y, 0.25);
        targetX = clamp(targetX, 20, FIELD_W - 20);
      }
    }

    const dx = targetX - p.pos.x;
    const dy = targetY - p.pos.y;
    const d = Math.hypot(dx, dy);
    if (d < 4) return { x: 0, y: 0 };
    return { x: dx / d, y: dy / d };
  }

  _closestPlayerToBall(team) {
    const list = team === "home" ? this.home : this.away;
    let best = null;
    let bestD = Infinity;
    for (const p of list) {
      const d = dist(p.pos, this.ball.pos);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  }

  _teamOwnsBall() {
    const h = this._closestPlayerToBall("home");
    const a = this._closestPlayerToBall("away");
    if (!h || !a) return null;
    const dh = dist(h.pos, this.ball.pos);
    const da = dist(a.pos, this.ball.pos);
    if (dh > DRIBBLE_RANGE && da > DRIBBLE_RANGE) return null;
    return dh <= da ? "home" : "away";
  }

  _updateBall(dt) {
    const b = this.ball;

    // drible: se algum jogador estiver bem perto, a bola "gruda" um pouco
    let closest = null;
    let closestD = Infinity;
    for (const p of this.allPlayers) {
      const d = dist(p.pos, b.pos);
      if (d < closestD) {
        closestD = d;
        closest = p;
      }
    }
    if (closest && closestD < DRIBBLE_RANGE && !this.input.kicking) {
      const followX = closest.pos.x + closest.facing.x * (closest.radius + BALL_RADIUS + 2);
      const followY = closest.pos.y + closest.facing.y * (closest.radius + BALL_RADIUS + 2);
      b.vel.x = lerp(b.vel.x, (followX - b.pos.x) * 6, 0.5);
      b.vel.y = lerp(b.vel.y, (followY - b.pos.y) * 6, 0.5);
    }

    // IA dos times chuta/passa sozinha quando dribla há um tempinho
    if (closest && !closest.isUser && closest !== this.activeUserPlayer && closestD < DRIBBLE_RANGE) {
      if (!closest._dribbleTicks) closest._dribbleTicks = 0;
      closest._dribbleTicks += dt;
      if (closest._dribbleTicks > 0.7 + Math.random() * 0.6) {
        closest._dribbleTicks = 0;
        this._aiKick(closest);
      }
    }

    b.pos.x += b.vel.x * dt;
    b.pos.y += b.vel.y * dt;

    const decay = Math.exp(-BALL_FRICTION * dt);
    b.vel.x *= decay;
    b.vel.y *= decay;

    // paredes superior/inferior
    if (b.pos.y < BALL_RADIUS) {
      b.pos.y = BALL_RADIUS;
      b.vel.y *= -0.55;
    } else if (b.pos.y > FIELD_H - BALL_RADIUS) {
      b.pos.y = FIELD_H - BALL_RADIUS;
      b.vel.y *= -0.55;
    }

    // laterais (só quebra fora da faixa do gol)
    const inGoalRangeY = b.pos.y > GOAL_Y0 && b.pos.y < GOAL_Y1;
    if (!inGoalRangeY) {
      if (b.pos.x < BALL_RADIUS) {
        b.pos.x = BALL_RADIUS;
        b.vel.x *= -0.55;
      } else if (b.pos.x > FIELD_W - BALL_RADIUS) {
        b.pos.x = FIELD_W - BALL_RADIUS;
        b.vel.x *= -0.55;
      }
    }
  }

  _aiKick(player) {
    const opponentGoalX = player.team === "home" ? FIELD_W : 0;
    const opponentGoalY = FIELD_H / 2 + (Math.random() - 0.5) * 80;
    const dx = opponentGoalX - this.ball.pos.x;
    const dy = opponentGoalY - this.ball.pos.y;
    const d = Math.hypot(dx, dy) || 1;
    const speed = KICK_MIN_SPEED + Math.random() * (KICK_MAX_SPEED - KICK_MIN_SPEED) * 0.7;
    this.ball.vel.x = (dx / d) * speed;
    this.ball.vel.y = (dy / d) * speed;
  }

  _tryKick(heldMs) {
    const p = this.activeUserPlayer;
    if (!p) return;
    const d = dist(p.pos, this.ball.pos);
    if (d > DRIBBLE_RANGE + 4) return;

    const t = clamp(heldMs / KICK_MAX_CHARGE_MS, 0, 1);
    const speed = lerp(KICK_MIN_SPEED, KICK_MAX_SPEED, t);

    let dirX = this.input.x;
    let dirY = this.input.y;
    const mag = Math.hypot(dirX, dirY);
    if (mag < 0.1) {
      dirX = p.facing.x;
      dirY = p.facing.y;
    } else {
      dirX /= mag;
      dirY /= mag;
    }
    this.ball.vel.x = dirX * speed;
    this.ball.vel.y = dirY * speed;
  }

  _checkGoal() {
    const b = this.ball;
    if (b.pos.x <= BALL_RADIUS && b.pos.y > GOAL_Y0 && b.pos.y < GOAL_Y1) {
      this._scoreGoal("away");
    } else if (b.pos.x >= FIELD_W - BALL_RADIUS && b.pos.y > GOAL_Y0 && b.pos.y < GOAL_Y1) {
      this._scoreGoal("home");
    }
  }

  _scoreGoal(team) {
    this.score[team] += 1;
    this.celebrating = 2.2;
    this.lastScorer = team;
    this.onScore({ ...this.score, team });
  }

  _kickoff() {
    for (const p of this.allPlayers) {
      p.pos = { ...p.homePos };
      p.vel = { x: 0, y: 0 };
    }
    this.ball.pos = { x: FIELD_W / 2, y: FIELD_H / 2 };
    this.ball.vel = { x: 0, y: 0 };
    this.onWhistle();
  }

  // -------------------------------------------------------------- RENDER
  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const scale = Math.min(w / FIELD_W, h / FIELD_H);
    const offX = (w - FIELD_W * scale) / 2;
    const offY = (h - FIELD_H * scale) / 2;

    ctx.save();
    ctx.fillStyle = "#04170c";
    ctx.fillRect(0, 0, w, h);

    this._drawStands(ctx, w, h, offX, offY, scale);

    ctx.translate(offX, offY);
    ctx.scale(scale, scale);

    this._drawPitch(ctx);
    this._drawGoals(ctx);

    for (const p of this.allPlayers) this._drawPlayer(ctx, p);
    this._drawBall(ctx);

    if (this.celebrating > 0) this._drawGoalBanner(ctx);

    ctx.restore();
  }

  _drawStands(ctx, w, h, offX, offY, scale) {
    ctx.fillStyle = "#0a2113";
    ctx.fillRect(0, 0, w, h);
    const rows = 6;
    ctx.save();
    for (let i = 0; i < 240; i++) {
      const t = i / 240;
      const angle = t * Math.PI * 2;
      const rx = w / 2 + Math.cos(angle) * (w * 0.62);
      const ry = h / 2 + Math.sin(angle) * (h * 0.62);
      ctx.fillStyle = i % 7 === 0 ? "rgba(255,213,79,0.55)" : "rgba(200,220,255,0.12)";
      ctx.fillRect(rx, ry, 3, 3);
    }
    ctx.restore();

    const glow = ctx.createRadialGradient(offX, offY, 10, offX, offY, 260);
    glow.addColorStop(0, "rgba(255,255,255,0.18)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w * 0.5, h * 0.5);

    const glow2 = ctx.createRadialGradient(offX + FIELD_W * scale, offY, 10, offX + FIELD_W * scale, offY, 260);
    glow2.addColorStop(0, "rgba(255,255,255,0.18)");
    glow2.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(w * 0.5, 0, w * 0.5, h * 0.5);
  }

  _drawPitch(ctx) {
    const stripes = 12;
    const stripeW = FIELD_W / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#1f7a3d" : "#1c6f37";
      ctx.fillRect(i * stripeW, 0, stripeW, FIELD_H);
    }

    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, FIELD_W - 12, FIELD_H - 12);

    ctx.beginPath();
    ctx.moveTo(FIELD_W / 2, 6);
    ctx.lineTo(FIELD_W / 2, FIELD_H - 6);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(FIELD_W / 2, FIELD_H / 2, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(FIELD_W / 2, FIELD_H / 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    // grandes áreas
    ctx.strokeRect(6, FIELD_H / 2 - 110, 120, 220);
    ctx.strokeRect(FIELD_W - 126, FIELD_H / 2 - 110, 120, 220);
    // pequenas áreas
    ctx.strokeRect(6, FIELD_H / 2 - 55, 50, 110);
    ctx.strokeRect(FIELD_W - 56, FIELD_H / 2 - 55, 50, 110);
  }

  _drawGoals(ctx) {
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;

    // gol esquerdo (fundo da rede)
    ctx.strokeRect(-GOAL_DEPTH, GOAL_Y0, GOAL_DEPTH, GOAL_HEIGHT);
    ctx.fillRect(-GOAL_DEPTH, GOAL_Y0, GOAL_DEPTH, GOAL_HEIGHT);
    // gol direito
    ctx.strokeRect(FIELD_W, GOAL_Y0, GOAL_DEPTH, GOAL_HEIGHT);
    ctx.fillRect(FIELD_W, GOAL_Y0, GOAL_DEPTH, GOAL_HEIGHT);

    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = GOAL_Y0 + (GOAL_HEIGHT / 4) * i;
      ctx.beginPath();
      ctx.moveTo(-GOAL_DEPTH, y);
      ctx.lineTo(0, y);
      ctx.moveTo(FIELD_W, y);
      ctx.lineTo(FIELD_W + GOAL_DEPTH, y);
      ctx.stroke();
    }
  }

  _drawPlayer(ctx, p) {
    const isHome = p.team === "home";
    const base = isHome ? HOME_COLOR : AWAY_COLOR;
    const dark = isHome ? HOME_COLOR2 : AWAY_COLOR2;

    ctx.beginPath();
    ctx.ellipse(p.pos.x, p.pos.y + p.radius * 0.7, p.radius * 0.9, p.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();

    if (p === this.activeUserPlayer) {
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.radius + 7, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffd54f";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    const grad = ctx.createRadialGradient(
      p.pos.x - 4, p.pos.y - 4, 2,
      p.pos.x, p.pos.y, p.radius
    );
    grad.addColorStop(0, base);
    grad.addColorStop(1, dark);
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = p.role === "GK" ? "#ffd54f" : "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  _drawBall(ctx) {
    const b = this.ball;
    ctx.beginPath();
    ctx.ellipse(b.pos.x, b.pos.y + BALL_RADIUS * 0.8, BALL_RADIUS * 0.9, BALL_RADIUS * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(b.pos.x, b.pos.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#fdfdfd";
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(b.pos.x, b.pos.y, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = "#222";
    ctx.fill();
  }

  _drawGoalBanner(ctx) {
    ctx.save();
    ctx.globalAlpha = clamp(this.celebrating / 2.2, 0, 1);
    ctx.fillStyle = "#ffd54f";
    ctx.font = "bold 64px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 12;
    ctx.fillText("GOL!", FIELD_W / 2, FIELD_H / 2 - 20);
    ctx.restore();
  }
}

export { FIELD_W, FIELD_H, MATCH_SECONDS };
