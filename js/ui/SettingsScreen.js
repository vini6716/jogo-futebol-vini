const DIFFICULTIES = ["Iniciante", "Amador", "Semiprofissional", "Profissional", "Lenda"];

export function initSettings(router, game) {
  const el = document.getElementById("screen-settings");
  const musicInput = el.querySelector("#set-music");
  const sfxInput = el.querySelector("#set-sfx");
  const musicLabel = el.querySelector("#set-music-label");
  const sfxLabel = el.querySelector("#set-sfx-label");
  const difficultyLadder = el.querySelector("#set-difficulty-ladder");
  const backBtn = el.querySelector("#set-back");
  const resetBtn = el.querySelector("#set-reset");

  function renderDifficulty() {
    difficultyLadder.innerHTML = DIFFICULTIES.map(
      (d) =>
        `<button type="button" class="difficulty-choice ${d === game.settings.difficulty ? "selected" : ""}" data-d="${d}">${d}</button>`
    ).join("");
    difficultyLadder.querySelectorAll(".difficulty-choice").forEach((btn) => {
      btn.addEventListener("click", () => {
        game.settings.difficulty = btn.dataset.d;
        game.saveSettings();
        renderDifficulty();
        game.audio.click();
      });
    });
  }

  function syncSliders() {
    musicInput.value = game.settings.musicVolume;
    sfxInput.value = game.settings.sfxVolume;
    musicLabel.textContent = `${game.settings.musicVolume}%`;
    sfxLabel.textContent = `${game.settings.sfxVolume}%`;
  }

  musicInput.addEventListener("input", () => {
    game.settings.musicVolume = Number(musicInput.value);
    musicLabel.textContent = `${game.settings.musicVolume}%`;
    game.saveSettings();
  });

  sfxInput.addEventListener("input", () => {
    game.settings.sfxVolume = Number(sfxInput.value);
    sfxLabel.textContent = `${game.settings.sfxVolume}%`;
    game.saveSettings();
    game.audio.click();
  });

  resetBtn.addEventListener("click", () => {
    if (!confirm("Isso apaga carreira, clubes criados e preferências salvas neste navegador. Continuar?")) return;
    localStorage.clear();
    location.reload();
  });

  backBtn.addEventListener("click", () => {
    game.audio.click();
    router.show("main-menu");
  });

  router.onChange((screen) => {
    if (screen === "settings") {
      syncSliders();
      renderDifficulty();
    }
  });
}
