import { GameManager } from "./core/GameManager.js";
import { initSplash } from "./ui/SplashScreen.js";
import { initMainMenu } from "./ui/MainMenu.js";
import { initQuickMatch } from "./ui/QuickMatchScreen.js";
import { initCreateClub } from "./ui/CreateClubScreen.js";
import { initCareer } from "./ui/CareerScreen.js";
import { initSettings } from "./ui/SettingsScreen.js";

async function boot() {
  const game = GameManager;
  const router = game.router;

  document.querySelectorAll(".screen").forEach((el) => {
    const name = el.id.replace("screen-", "");
    router.register(name, el);
  });

  try {
    await game.boot();
  } catch (err) {
    console.error("Falha ao carregar o banco de dados do jogo:", err);
    document.body.innerHTML = `
      <div style="padding:2rem;font-family:sans-serif;color:#eee;background:#111;min-height:100vh;">
        <h1>Não foi possível carregar o Futebol Land</h1>
        <p>Este site precisa ser aberto por um servidor local (não direto do arquivo), porque ele carrega
        o banco de dados de <code>/database/*.json</code> via <code>fetch</code>.</p>
        <p>Rode algo como <code>python3 -m http.server</code> na pasta do projeto e abra
        <code>http://localhost:8000</code>, ou publique a pasta no GitHub Pages / Netlify / Vercel.</p>
        <p style="color:#f88">Detalhe técnico: ${err.message}</p>
      </div>`;
    return;
  }

  const startSplash = initSplash(router, game);
  initMainMenu(router, game);
  initQuickMatch(router, game);
  initCreateClub(router, game);
  initCareer(router, game);
  initSettings(router, game);

  document.querySelectorAll(".back-to-menu").forEach((btn) => {
    btn.addEventListener("click", () => {
      game.audio.click();
      router.show("main-menu");
    });
  });

  router.show("splash");
  startSplash();
}

document.addEventListener("DOMContentLoaded", boot);
