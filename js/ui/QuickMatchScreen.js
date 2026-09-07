import { MatchManager } from "../match/MatchManager.js";
import { emblemSvg } from "./emblem.js";
import { groupClubsByLeagueHtml } from "./clubOptions.js";

export function initQuickMatch(router, game) {
  const el = document.getElementById("screen-quick-match");
  const setupEl = el.querySelector(".qm-setup");
  const liveEl = el.querySelector(".qm-live");
  const homeSelect = el.querySelector("#qm-home");
  const awaySelect = el.querySelector("#qm-away");
  const startBtn = el.querySelector("#qm-start");
  const backBtnSetup = el.querySelector("#qm-back-setup");
  const backBtnLive = el.querySelector("#qm-back-live");
  const homePreview = el.querySelector("#qm-home-preview");
  const awayPreview = el.querySelector("#qm-away-preview");

  const scoreHome = el.querySelector("#qm-score-home");
  const scoreAway = el.querySelector("#qm-score-away");
  const clockEl = el.querySelector("#qm-clock");
  const nameHome = el.querySelector("#qm-name-home");
  const nameAway = el.querySelector("#qm-name-away");
  const logEl = el.querySelector("#qm-log");
  const speedBtn = el.querySelector("#qm-speed");
  const skipBtn = el.querySelector("#qm-skip");
  const rematchBtn = el.querySelector("#qm-rematch");

  let mm = null;
  let intervalId = null;
  let speed = 1;

  function populateSelects() {
    const clubs = [...game.database.getClubs()];
    const optionsHtml = groupClubsByLeagueHtml(clubs);
    [homeSelect, awaySelect].forEach((select) => {
      select.innerHTML = optionsHtml;
    });
    if (clubs.length > 1) awaySelect.selectedIndex = 1;
    updatePreviews();
  }

  function updatePreviews() {
    const home = game.database.getClub(Number(homeSelect.value));
    const away = game.database.getClub(Number(awaySelect.value));
    if (home) homePreview.innerHTML = emblemSvg(home, 72);
    if (away) awayPreview.innerHTML = emblemSvg(away, 72);
  }

  homeSelect.addEventListener("change", updatePreviews);
  awaySelect.addEventListener("change", updatePreviews);

  function appendLog(text, type) {
    const line = document.createElement("div");
    line.className = `log-line log-${type}`;
    line.textContent = text;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function startMatch() {
    const homeId = Number(homeSelect.value);
    const awayId = Number(awaySelect.value);
    if (homeId === awayId) {
      alert("Escolha dois clubes diferentes.");
      return;
    }
    const homeClub = game.database.getClub(homeId);
    const awayClub = game.database.getClub(awayId);
    const homePlayers = game.database.getPlayersByClub(homeId);
    const awayPlayers = game.database.getPlayersByClub(awayId);

    mm = new MatchManager({
      homeClub,
      awayClub,
      homePlayers,
      awayPlayers,
      difficulty: game.settings.difficulty,
      referee: game.database.randomReferee(),
    });
    mm.stadiumName = game.database.getStadiumForClub(homeId)?.name;
    mm.startMatch();

    nameHome.textContent = homeClub.name;
    nameAway.textContent = awayClub.name;
    scoreHome.textContent = "0";
    scoreAway.textContent = "0";
    clockEl.textContent = "0'";
    logEl.innerHTML = "";
    appendLog(mm.events[0].text, "apito");

    setupEl.hidden = true;
    liveEl.hidden = false;
    rematchBtn.hidden = true;
    skipBtn.hidden = false;

    game.audio.whistle();
    runInterval();
  }

  function tick() {
    if (!mm || mm.matchEnded) return;
    const events = mm.simulateMinute();
    clockEl.textContent = `${mm.minute}'`;
    scoreHome.textContent = String(mm.homeGoals);
    scoreAway.textContent = String(mm.awayGoals);
    events.forEach((ev) => {
      appendLog(`${ev.minute}' — ${ev.text}`, ev.type);
      if (ev.type === "gol") game.audio.goal();
      if (ev.type === "amarelo" || ev.type === "vermelho") game.audio.card();
    });
    if (mm.matchEnded) {
      clearInterval(intervalId);
      intervalId = null;
      skipBtn.hidden = true;
      rematchBtn.hidden = false;
      game.audio.whistle();
    }
  }

  function runInterval() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(tick, 350 / speed);
  }

  speedBtn.addEventListener("click", () => {
    speed = speed >= 4 ? 1 : speed * 2;
    speedBtn.textContent = `Velocidade x${speed}`;
    if (intervalId) runInterval();
  });

  skipBtn.addEventListener("click", () => {
    if (!mm) return;
    while (!mm.matchEnded) {
      const events = mm.simulateMinute();
      events.forEach((ev) => {
        if (ev.type === "gol") appendLog(`${ev.minute}' — ${ev.text}`, ev.type);
      });
    }
    clockEl.textContent = "90'";
    scoreHome.textContent = String(mm.homeGoals);
    scoreAway.textContent = String(mm.awayGoals);
    appendLog(mm.events[mm.events.length - 1].text, "fim");
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    skipBtn.hidden = true;
    rematchBtn.hidden = false;
  });

  startBtn.addEventListener("click", () => {
    game.audio.click();
    startMatch();
  });

  rematchBtn.addEventListener("click", () => {
    game.audio.click();
    setupEl.hidden = false;
    liveEl.hidden = true;
  });

  function backToMenu() {
    game.audio.click();
    if (intervalId) clearInterval(intervalId);
    setupEl.hidden = false;
    liveEl.hidden = true;
    router.show("main-menu");
  }
  backBtnSetup.addEventListener("click", backToMenu);
  backBtnLive.addEventListener("click", backToMenu);

  router.onChange((screen) => {
    if (screen === "quick-match") populateSelects();
  });
}
