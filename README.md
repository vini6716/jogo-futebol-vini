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
- **Modo Carreira** — escolha um clube e o campeonato:
  - **Liga** — turno e returno contra os demais clubes da mesma liga do
    clube escolhido (ou, pra clubes sem liga — como os criados em "Crie seu
    Clube" — a liguinha **Mundo Livre**), com tabela de classificação.
  - **Copas** (mata-mata, com chaveamento e "byes" quando o número de times
    não é potência de 2): **Copa do Brasil** (clubes das 4 divisões),
    **Copa Libertadores** (clubes do Brasileirão Série A), **Mundial de
    Clubes** (clubes das principais ligas do mundo) e **Mundo Livre**
    (qualquer clube, inclusive os criados por você).
  - **Copa do Mundo FIFA** — fase de grupos (4 grupos de 6 seleções) +
    mata-mata com os 2 primeiros de cada grupo, jogada com as 24 seleções
    nacionais.

  Acompanhe a tabela/grupos, o chaveamento, o histórico de rodadas e as
  taças conquistadas (campeão, vice ou fase em que foi eliminado). Progresso
  salvo automaticamente.
- **Configurações** — volume de música/efeitos e dificuldade (Iniciante,
  Amador, Semiprofissional, Profissional, Lenda), que ajusta o quanto o
  motor de partida favorece o seu time.
- **Banco de dados real** — clubes e seleções de verdade: as principais
  ligas do mundo (Premier League, La Liga, Serie A, Bundesliga, Ligue 1,
  Brasileirão Séries A/B/C/D, Liga Portugal, Eredivisie — 208 clubes no
  total) mais 24 seleções nacionais, com estádios reais e ~600 jogadores
  reais conhecidos (astros e titulares) espalhados pelos elencos. O restante de
  cada elenco (até completar 16-17 jogadores por time) é preenchido com
  reservas gerados com nomes plausíveis pra nacionalidade do clube, pra
  ninguém ficar sem escalação. Tudo em `/database/*.json`, gerado por
  `tools/generate-database.js` a partir de `tools/real-world-data.js`
  (reprodutível, com seed fixa). Os escudos continuam sendo desenhados em
  SVG genérico — não usamos logos oficiais.

  > ⚠️ Elencos de futebol mudam a cada janela de transferência: isso é uma
  > fotografia best-effort de conhecimento público, não um dado oficial ou
  > licenciado. Pra atualizar nomes/times, edite `tools/real-world-data.js`
  > e rode `node tools/generate-database.js` de novo.
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
tools/         real-world-data.js — dados reais (ligas/clubes/seleções/jogadores conhecidos)
               db-core.js — países, pools de nomes e cálculo de atributos
               generate-database.js — script que gera os JSONs acima a partir dos dois arquivos anteriores
```

Não existem assets de imagem/áudio (as pastas `Assets/Logos`,
`Assets/Music` etc. do projeto original não tinham arquivos reais): os
escudos dos clubes são desenhados em SVG na hora e os efeitos sonoros são
sintetizados via Web Audio API.
