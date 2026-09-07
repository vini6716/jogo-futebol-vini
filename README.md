# Futebol Land — versão site

Site jogável (HTML/CSS/JS puro, sem frameworks nem build) adaptado da
estrutura original do projeto **FutebolLand** em Unity (pastas
`Assets/`, `Scripts/`, `Scenes/`, `Database/` e os scripts C# de
`MainMenu`, `MatchManager`, `CareerManager`, `ClubCreator`,
`DatabaseManager`, `GameManager` etc.). A arquitetura foi portada para
JavaScript mantendo os mesmos nomes e responsabilidades sempre que
fazia sentido, trocando cenas do Unity por telas de uma SPA.

## Como rodar localmente

O site carrega o banco de dados de `/database/*.json` via `fetch`, então
precisa ser servido por um servidor HTTP (abrir o `index.html` direto
como `file://` não funciona por causa do CORS do navegador).

```bash
python3 -m http.server 8000
# ou: npx serve .
```

Depois acesse `http://localhost:8000`. Para publicar, basta subir a pasta
inteira em qualquer hospedagem estática (GitHub Pages, Netlify, Vercel).

## O que tem implementado

- **Splash + Menu Principal** — sequência de abertura (torcida, estádio,
  jogadores em campo) e todos os botões do menu original.
- **Jogo Rápido** — escolha dois clubes e assista a partida sendo
  simulada minuto a minuto, com narração, gols, cartões e placar ao vivo.
- **Crie seu Clube** — monte um clube (nome, cidade, país, estádio, cores,
  escudo e força do elenco); o jogo gera automaticamente um elenco de 16
  jogadores. Fica salvo no navegador e passa a aparecer no Jogo Rápido e
  na Carreira.
- **Modo Carreira** — escolha um clube, jogue uma temporada completa
  (turno e returno contra os demais clubes), acompanhe a tabela de
  classificação, o histórico de rodadas e as taças conquistadas.
  Progresso salvo automaticamente.
- **Configurações** — volume de música/efeitos e dificuldade (Iniciante,
  Amador, Semiprofissional, Profissional, Lenda), que ajusta o quanto o
  motor de partida favorece o seu time.
- **Banco de dados** — 8 clubes fictícios, ~130 jogadores, estádios,
  país/liga/competições em `/database/*.json`, gerados por
  `tools/generate-database.js` (reprodutível, com seed fixa).
- **Online / Torneios / Treino** — telas de aviso explicando que dependem
  de um servidor multiplayer / ainda não foram implementadas, mantendo a
  estrutura prevista no design original.

## Estrutura

```
index.html
css/style.css
js/
  core/        GameManager, SaveManager (localStorage), AudioManager (efeitos via WebAudio)
  database/    DatabaseManager (carrega e mescla os JSONs + clubes criados pelo jogador)
  match/       MatchManager (motor de simulação de partida)
  career/      CareerManager (temporada, calendário, tabela)
  clubs/       ClubCreator (geração de clube e elenco customizados)
  ui/          Router + telas (splash, menu, jogo rápido, criar clube, carreira, configurações)
database/      countries, leagues, clubs, players, stadiums, competitions, referees (JSON)
tools/         generate-database.js — script que gerou os JSONs acima
```

Não existem assets de imagem/áudio (as pastas `Assets/Logos`,
`Assets/Music` etc. do projeto original não tinham arquivos reais): os
escudos dos clubes são desenhados em SVG na hora e os efeitos sonoros são
sintetizados via Web Audio API.
