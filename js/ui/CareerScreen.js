import { MatchManager } from "../match/MatchManager.js";
import { emblemSvg } from "./emblem.js";
import { groupClubsByLeagueHtml } from "./clubOptions.js";

export function initCareer(router, game) {
  const el = document.getElementById("screen-career");
  const setupEl = el.querySelector(".career-setup");
  const dashboardEl = el.querySelector(".career-dashboard");
  const matchEl = el.querySelector(".career-match");

  const clubSelect = el.querySelector("#career-club");
  const competitionSelect = el.querySelector("#career-competition");
  const nameInput = el.querySelector("#career-manager-name");
  const startBtn = el.querySelector("#career-start");
  const backFromSetup = el.querySelector("#career-back-setup");

  const clubHeader = el.querySelector("#career-club-header");
  const seasonInfo = el.querySelector("#career-season-info");
  const moneyInfo = el.querySelector("#career-money-info");
  const fixtureInfo = el.querySelector("#career-fixture-info");
  const playRoundBtn = el.querySelector("#career-play-round");
  const leagueView = el.querySelector("#career-league-view");
  const standingsBody = el.querySelector("#career-standings-body");
  const groupsView = el.querySelector("#career-groups-view");
  const groupsEl = el.querySelector("#career-groups");
  const bracketView = el.querySelector("#career-bracket-view");
  const bracketTitleEl = el.querySelector("#career-bracket-title");
  const bracketEl = el.querySelector("#career-bracket");
  const historyCol = el.querySelector("#career-history-col");
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
    populateCompetitionSelect();
  }

  function populateCompetitionSelect() {
    const clubId = Number(clubSelect.value);
    const club = game.database.getClub(clubId);
    const league = club && club.leagueId != null ? game.database.getLeague(club.leagueId) : null;
    const ligaOption = `<option value="">Liga — ${league ? league.name : "Mundo Livre"}</option>`;
    const cupOptions = game.career
      .getAvailableCompetitions(clubId)
      .map((c) => `<option value="${c.name}">${c.name}${c.format === "grupos-mata-mata" ? " (grupos + mata-mata)" : " (mata-mata)"}</option>`)
      .join("");
    competitionSelect.innerHTML = ligaOption + cupOptions;
  }

  clubSelect.addEventListener("change", populateCompetitionSelect);

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
    const subtitle = state.mode === "copa" ? state.competitionName : state.leagueName || "Mundo Livre";
    clubHeader.innerHTML = `${emblemSvg(club, 56)} <div><strong>${club.name}</strong><br><span class="muted">${subtitle} · Técnico: ${state.managerName}</span></div>`;
    seasonInfo.textContent = `Temporada ${state.season} · ${game.career.currentRoundLabel}`;
    moneyInfo.textContent = `Caixa: R$ ${state.money.toLocaleString("pt-BR")}`;

    if (game.career.isSeasonOver()) {
      if (state.mode === "copa") {
        const lastTrophy = state.trophies[state.trophies.length - 1];
        if (state.champion) {
          fixtureInfo.textContent = `🏆 Campeão da ${state.competitionName}!`;
        } else if (lastTrophy && lastTrophy.runnerUp) {
          fixtureInfo.textContent = `🥈 Vice-campeão da ${state.competitionName} — perdeu na final.`;
        } else {
          fixtureInfo.textContent = `Eliminado(a) na ${lastTrophy?.stage || "competição"}.`;
        }
        playRoundBtn.textContent = "Nova Edição";
      } else {
        fixtureInfo.textContent = "Temporada encerrada!";
        playRoundBtn.textContent = "Iniciar Nova Temporada";
      }
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

    leagueView.hidden = state.mode !== "liga";
    groupsView.hidden = !(state.mode === "copa" && state.stage === "grupos");
    bracketView.hidden = !(state.mode === "copa" && state.stage === "mata-mata");
    historyCol.hidden = state.mode !== "liga";

    if (state.mode === "liga") {
      renderStandings();
      renderHistory();
    } else if (state.stage === "grupos") {
      renderGroups();
    } else {
      renderBracket();
    }
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

  function renderGroups() {
    const state = game.career.state;
    groupsEl.innerHTML = state.groups
      .map((g, gi) => {
        const rows = game.career
          .getGroupStandings(gi)
          .map((row, i) => {
            const club = game.database.getClub(row.clubId);
            const isUser = row.clubId === state.userClubId;
            const qualifying = i < 2 ? "is-qualifying" : "";
            return `<tr class="${isUser ? "is-user" : ""} ${qualifying}">
              <td>${i + 1}</td>
              <td>${club ? club.name : "?"}</td>
              <td>${row.j}</td>
              <td>${row.v}</td>
              <td>${row.e}</td>
              <td>${row.d}</td>
              <td>${row.gp - row.gc}</td>
              <td><strong>${row.pts}</strong></td>
            </tr>`;
          })
          .join("");
        return `<div class="career-group">
          <h4>${g.name}</h4>
          <div class="table-scroll">
            <table class="standings-table standings-table-compact">
              <thead><tr><th>#</th><th>Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>Pts</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderBracket() {
    const state = game.career.state;
    bracketTitleEl.textContent = `${state.competitionName} — ${game.career.currentRoundLabel}`;
    bracketEl.innerHTML = state.bracket
      .map((round, ri) => {
        const ties = round
          .map((tie) => {
            const home = tie.homeId != null ? game.database.getClub(tie.homeId) : null;
            const away = tie.awayId != null ? game.database.getClub(tie.awayId) : null;
            const isUserTie = tie.homeId === state.userClubId || tie.awayId === state.userClubId;
            const score = tie.played
              ? tie.bye
                ? "de bye"
                : `${tie.homeGoals} x ${tie.awayGoals}${tie.penalties ? " (pên.)" : ""}`
              : "a definir";
            return `<div class="bracket-tie ${isUserTie ? "is-user" : ""}">
              <span class="${tie.winnerId === tie.homeId ? "is-winner" : ""}">${home ? home.name : "—"}</span>
              <span class="bracket-score">${score}</span>
              <span class="${tie.winnerId === tie.awayId ? "is-winner" : ""}">${away ? away.name : "—"}</span>
            </div>`;
          })
          .join("");
        return `<div class="bracket-round"><h4>${state.roundNames[ri]}</h4>${ties}</div>`;
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
      .map((t) => {
        if (t.champion) {
          return `<div class="trophy-row">🏆 Temporada ${t.season} — ${t.competition}: Campeão!</div>`;
        }
        if (t.runnerUp) {
          return `<div class="trophy-row">🥈 Temporada ${t.season} — ${t.competition}: Vice-campeão</div>`;
        }
        if (t.eliminated) {
          return `<div class="trophy-row">❌ Temporada ${t.season} — ${t.competition}: eliminado(a) na ${t.stage}</div>`;
        }
        return `<div class="trophy-row">🎖️ Temporada ${t.season} — ${t.competition}: ${t.position}º lugar</div>`;
      })
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
    const competitionName = competitionSelect.value || undefined;
    game.career.startNewCareer(clubId, managerName, competitionName);
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
