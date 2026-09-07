/**
 * Porta do MainMenu.cs: cada botão do menu leva a uma tela em vez de uma
 * cena Unity.
 */
export function initMainMenu(router, game) {
  const el = document.getElementById("screen-main-menu");

  const actions = {
    "menu-career": "career",
    "menu-create-club": "create-club",
    "menu-quick-match": "quick-match",
    "menu-online": "online",
    "menu-tournaments": "tournaments",
    "menu-training": "training",
    "menu-settings": "settings",
    "menu-credits": "credits",
  };

  Object.entries(actions).forEach(([id, screen]) => {
    const btn = el.querySelector(`#${id}`);
    if (!btn) return;
    btn.addEventListener("click", () => {
      game.audio.click();
      router.show(screen);
    });
  });

  const exitBtn = el.querySelector("#menu-exit");
  const exitNote = el.querySelector("#menu-exit-note");
  exitBtn.addEventListener("click", () => {
    game.audio.click();
    exitNote.hidden = false;
    setTimeout(() => {
      exitNote.hidden = true;
    }, 3500);
  });
}
