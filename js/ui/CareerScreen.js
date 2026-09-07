import { MatchManager } from "../match/MatchManager.js";
import { emblemSvg } from "./emblem.js";
import { groupClubsByLeagueHtml } from "./clubOptions.js";

export function initCareer(router, game) {
  const el = document.getElementById("screen-career");
  const setupEl = el.querySelector(".career-setup");
  const dashboardEl = el.querySelector(".career-dashboard");
  const matchEl = el.querySelector(".career-match");

  const clubSelect = el.querySelector("#career-club");
  const nameInput = el.querySelector("#career-manager-name");
  const startBtn = el.querySelector("#career-start");
  const backFromSetup = el.querySelector("#career-back-setup");

  const clubHeader = el.querySelector("#career-club-header");
  const seasonInfo = el.querySelector("#career-season-info");
  const moneyInfo = el.querySelector("#career-money-info");
  const fixtureInfo = el.querySelector("#career-fixture-info");
  const playRoundBtn = el.querySelector("#career-play-round");
  const standingsBody = el.querySelector("#career-standings-body");
  const historyEl = el.querySelector("#career-history");
  const trophiesEl = el.querySelector("#career-trophies");
  const newCareerBtn = el.querySelector("#career-new");
  const backFromDashboard = el.querySelector("#career-back-dashboard");

  const matchScoreHome = el.querySelector("#career-score-home");
  const matchScoreAway = el.querySelector("#career-score-away");
  const matchClock = el.querySelector("#career-clock");
  const matchNameHome = el.querySelector("#career-name-home");
  const matchNameAway = el.querySelector("#career-name-away");
  const matchLog = el.querySelector("#career-log");
  const matchSkip = el.querySelector("#career-match-skip");
  const matchContinue = el.querySelector("#career-match-continue");

  let liveMM = null;
  let liveInterval = null;

  function populateClubSelect() {
    const clubs = [...game.database.getClubs()];
    clubSelect.innerHTML = groupClubsByLeagueHtml(clubs);
  }

  function showSetup() {
    setupEl.hidden = false;
    dashboardEl.hidden = true;
    matchEl.hidden = true;
  }

  function showDashboard() {
    setupEl.hidden = true;
    dashboardEl.hidden = false;
    matchEl.hidden = true;
    renderDashboard();
  }

  function renderDashboard() {
    const state = game.career.state;
    const club = game.database.getClub(state.userClubId);
    clubHeader.innerHTML = `${emblemSvg(club, 56)} <div><strong>${club.name}</strong><br><span class="muted">${state.leagueName || "Liga Livre"} · Técnico: ${state.managerName}</span></div>`;
    seasonInfo.textContent = `Temporada ${state.season} · Rodada ${Math.min(state.round + 1, game.career.totalRounds)} de ${game.career.totalRounds}`;
    moneyInfo.textContent = `Caixa: R$ ${state.money.toLocaleString("pt-BR")}`;

    if (game.career.isSeasonOver()) {
      fixtureInfo.textContent = "Temporada encerrada!";
      playRoundBtn.textContent = "Iniciar Nova Temporada";
    } else {
      const fixture = game.career.getUserFixtureThisRound();
      if (fixture) {
        const [homeId, awayId] = fixture;
        const home = game.database.getClub(homeId);
        const away = game.database.getClub(awayId);
        fixtureInfo.textContent = `Próximo jogo: ${home.name} x ${away.name}`;
      } else {
        fixtureInfo.textContent = "Rodada livre — sem jogo dessa vez.";
      }
      playRoundBtn.textContent = "Jogar Rodada";
    }

    renderStandings();
    renderHistory();
    renderTrophies();
  }

  function renderStandings() {
    const standings = game.career.getStandings();
    standingsBody.innerHTML = standings
      .map((row, i) => {
        const club = game.database.getClub(row.clubId);
        const isUser = row.clubId === game.career.state.userClubId;
        return `<tr class="${isUser ? "is-user" : ""}">
          <td>${i + 1}</td>
          <td>${club ? club.name : "?"}</td>
          <td>${row.j}</td>
          <td>${row.v}</td>
          <td>${row.e}</td>
          <td>${row.d}</td>
          <td>${row.gp}</td>
          <td>${row.gc}</td>
          <td>${row.gp - row.gc}</td>
          <td><strong>${row.pts}</strong></td>
        </tr>`;
      })
      .join("");
  }

  function renderHistory() {
    const results = game.career.state.results.slice(-5).reverse();
    if (!results.length) {
      historyEl.innerHTML = `<p class="muted">Nenhuma rodada jogada ainda.</p>`;
      return;
    }
    historyEl.innerHTML = results
      .map((r) => {
        const lines = r.matches
          .map((m) => {
            const home = game.database.getClub(m.homeId);
            const away = game.database.getClub(m.awayId);
            return `<div class="history-line">${home.name} ${m.homeGoals} x ${m.awayGoals} ${away.name}</div>`;
          })
          .join("");
        return `<details><summary>Rodada ${r.round}</summary>${lines}</details>`;
      })
      .join("");
  }

  function renderTrophies() {
    const trophies = game.career.state.trophies;
    if (!trophies.length) {
      trophiesEl.innerHTML = `<p class="muted">Nenhuma taça ainda. Vença o campeonato!</p>`;
      return;
    }
    trophiesEl.innerHTML = trophies
      .map(
        (t) =>
          `<div class="trophy-row">${t.champion ? "🏆" : "🎖️"} Temporada ${t.season} — ${t.competition}: ${
            t.champion ? "Campeão!" : `${t.position}º lugar`
          }</div>`
      )
      .join("");
  }

  function appendLog(text, type) {
    const line = document.createElement("div");
    line.className = `log-line log-${type}`;
    line.textContent = text;
    matchLog.appendChild(line);
    matchLog.scrollTop = matchLog.scrollHeight;
  }

  function playUserMatch(homeId, awayId) {
    const homeClub = game.database.getClub(homeId);
    const awayClub = game.database.getClub(awayId);
    liveMM = new MatchManager({
      homeClub,
      awayClub,
      homePlayers: game.database.getPlayersByClub(homeId),
      awayPlayers: game.database.getPlayersByClub(awayId),
      difficulty: game.settings.difficulty,
      userTeam: homeId === game.career.state.userClubId ? "home" : "away",
      referee: game.database.randomReferee(),
    });
    liveMM.startMatch();

    matchNameHome.textContent = homeClub.name;
    matchNameAway.textContent = awayClub.name;
    matchScoreHome.textContent = "0";
    matchScoreAway.textContent = "0";
    matchClock.textContent = "0'";
    matchLog.innerHTML = "";
    appendLog(liveMM.events[0].text, "apito");

    matchEl.hidden = false;
    dashboardEl.hidden = true;
    matchSkip.hidden = false;
    matchContinue.hidden = true;

    game.audio.whistle();
    liveInterval = setInterval(tick, 220);
  }

  function tick() {
    if (!liveMM || liveMM.matchEnded) return;
    const events = liveMM.simulateMinute();
    matchClock.textContent = `${liveMM.minute}'`;
    matchScoreHome.textContent = String(liveMM.homeGoals);
    matchScoreAway.textContent = String(liveMM.awayGoals);
    events.forEach((ev) => {
      appendLog(`${ev.minute}' — ${ev.text}`, ev.type);
      if (ev.type === "gol") game.audio.goal();
    });
    if (liveMM.matchEnded) {
      clearInterval(liveInterval);
      liveInterval = null;
      matchSkip.hidden = true;
      matchContinue.hidden = false;
      game.audio.whistle();
    }
  }

  matchSkip.addEventListener("click", () => {
    if (!liveMM) return;
    while (!liveMM.matchEnded) liveMM.simulateMinute();
    matchClock.textContent = "90'";
    matchScoreHome.textContent = String(liveMM.homeGoals);
    matchScoreAway.textContent = String(liveMM.awayGoals);
    appendLog(liveMM.events[liveMM.events.length - 1].text, "fim");
    if (liveInterval) {
      clearInterval(liveInterval);
      liveInterval = null;
    }
    matchSkip.hidden = true;
    matchContinue.hidden = false;
  });

  matchContinue.addEventListener("click", () => {
    game.audio.click();
    game.career.playRound({ homeGoals: liveMM.homeGoals, awayGoals: liveMM.awayGoals });
    liveMM = null;
    showDashboard();
  });

  playRoundBtn.addEventListener("click", () => {
    game.audio.click();
    if (game.career.isSeasonOver()) {
      game.career.startNextSeason();
      renderDashboard();
      return;
    }
    const fixture = game.career.getUserFixtureThisRound();
    if (fixture) {
      playUserMatch(fixture[0], fixture[1]);
    } else {
      game.career.playRound(null);
      renderDashboard();
    }
  });

  startBtn.addEventListener("click", () => {
    game.audio.click();
    const clubId = Number(clubSelect.value);
    const managerName = nameInput.value.trim() || "Técnico";
    game.career.startNewCareer(clubId, managerName);
    showDashboard();
  });

  newCareerBtn.addEventListener("click", () => {
    if (confirm("Isso vai apagar a carreira atual. Continuar?")) {
      game.career.deleteCareer();
      showSetup();
    }
  });

  backFromSetup.addEventListener("click", () => {
    game.audio.click();
    router.show("main-menu");
  });
  backFromDashboard.addEventListener("click", () => {
    game.audio.click();
    router.show("main-menu");
  });

  router.onChange((screen) => {
    if (screen !== "career") return;
    if (game.career.hasSavedCareer()) {
      game.career.loadSavedCareer();
      showDashboard();
    } else {
      populateClubSelect();
      showSetup();
    }
  });
}
