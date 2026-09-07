import { ArcadeGame, MATCH_SECONDS } from "./game.js";
import { attachKeyboard, attachJoystick, attachKickButton } from "./controls.js";

const canvas = document.getElementById("canvas");
const scoreHomeEl = document.getElementById("score-home");
const scoreAwayEl = document.getElementById("score-away");
const clockEl = document.getElementById("clock");
const startOverlay = document.getElementById("start-overlay");
const startBtn = document.getElementById("start-btn");
const endOverlay = document.getElementById("end-overlay");
const endTitle = document.getElementById("end-title");
const endScore = document.getElementById("end-score");
const restartBtn = document.getElementById("restart-btn");

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", () => setTimeout(resizeCanvas, 200));
resizeCanvas();

// Em celular na vertical, o CSS mostra o aviso pra girar e esconde o jogo.
// Aqui a gente só garante que o relógio/física não correm enquanto isso.
const portraitQuery = window.matchMedia("(orientation: portrait) and (max-width: 900px)");
portraitQuery.addEventListener("change", (e) => {
  if (game) game.paused = e.matches;
  resizeCanvas();
});

function formatClock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

let game = null;

function newGame() {
  game = new ArcadeGame(canvas, {
    onScore: (score) => {
      scoreHomeEl.textContent = score.home;
      scoreAwayEl.textContent = score.away;
    },
    onFullTime: (score) => {
      endTitle.textContent =
        score.home === score.away
          ? "Empate!"
          : score.home > score.away
          ? "Vitória do seu time!"
          : "Derrota...";
      endScore.textContent = `Placar final: ${score.home} x ${score.away}`;
      endOverlay.hidden = false;
    },
  });

  attachKeyboard(game);
  attachJoystick(game, document.getElementById("joy-base"), document.getElementById("joy-knob"));
  attachKickButton(game, document.getElementById("kick-btn"));

  game.paused = portraitQuery.matches;
  game.start();

  const tick = () => {
    if (!game) return;
    clockEl.textContent = formatClock(game.timeLeft);
    if (!game.matchOver) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

startBtn.addEventListener("click", () => {
  startOverlay.hidden = true;
  clockEl.textContent = formatClock(MATCH_SECONDS);
  newGame();
});

restartBtn.addEventListener("click", () => {
  endOverlay.hidden = true;
  if (game) game.stop();
  clockEl.textContent = formatClock(MATCH_SECONDS);
  scoreHomeEl.textContent = "0";
  scoreAwayEl.textContent = "0";
  newGame();
});
