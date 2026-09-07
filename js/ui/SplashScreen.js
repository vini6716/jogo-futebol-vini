/**
 * Sequência de abertura descrita no design original:
 * LOGO -> torcida cantando -> estádio iluminado -> jogadores entrando em
 * campo -> Menu Principal. Como não há vídeo/assets, cada etapa é um
 * quadro de texto/animação em CSS.
 */
export function initSplash(router, game) {
  const el = document.getElementById("screen-splash");
  const stageEl = el.querySelector(".splash-stage");
  const skipBtn = el.querySelector("#splash-skip");

  const stages = [
    { text: "FUTEBOL LAND", cls: "stage-logo" },
    { text: "🎺 A torcida canta o hino do clube...", cls: "stage-crowd" },
    { text: "💡 O estádio se ilumina para a partida...", cls: "stage-stadium" },
    { text: "🏃 Os jogadores entram em campo!", cls: "stage-players" },
  ];

  let index = 0;
  let timer = null;

  function renderStage() {
    const s = stages[index];
    stageEl.textContent = s.text;
    stageEl.className = `splash-stage ${s.cls}`;
  }

  function next() {
    index += 1;
    if (index >= stages.length) {
      finish();
      return;
    }
    renderStage();
    timer = setTimeout(next, 1400);
  }

  function finish() {
    clearTimeout(timer);
    router.show("main-menu");
  }

  skipBtn.addEventListener("click", finish);

  return function start() {
    index = 0;
    renderStage();
    timer = setTimeout(next, 1400);
  };
}
