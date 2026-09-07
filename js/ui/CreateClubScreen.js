import { emblemSvg } from "./emblem.js";
import { ClubCreator } from "../clubs/ClubCreator.js";

export function initCreateClub(router, game) {
  const el = document.getElementById("screen-create-club");
  const form = el.querySelector("#create-club-form");
  const nameInput = el.querySelector("#cc-name");
  const cityInput = el.querySelector("#cc-city");
  const countrySelect = el.querySelector("#cc-country");
  const stadiumInput = el.querySelector("#cc-stadium");
  const primaryInput = el.querySelector("#cc-primary");
  const secondaryInput = el.querySelector("#cc-secondary");
  const strengthInput = el.querySelector("#cc-strength");
  const strengthLabel = el.querySelector("#cc-strength-label");
  const emblemPicker = el.querySelector("#cc-emblem-picker");
  const previewEl = el.querySelector("#cc-preview");
  const listEl = el.querySelector("#cc-list");
  const backBtn = el.querySelector("#cc-back");

  let selectedEmblem = ClubCreator.emblems[0];

  function updatePreview() {
    const fakeClub = {
      name: nameInput.value || "Novo Clube",
      emblem: selectedEmblem,
      colors: { primary: primaryInput.value, secondary: secondaryInput.value },
    };
    previewEl.innerHTML = emblemSvg(fakeClub, 110);
  }

  function populateEmblemPicker() {
    emblemPicker.innerHTML = ClubCreator.emblems
      .map(
        (shape) => `
        <button type="button" class="emblem-choice ${shape === selectedEmblem ? "selected" : ""}" data-shape="${shape}">
          ${emblemSvg({ name: "PV", emblem: shape, colors: { primary: "#2e7d32", secondary: "#fff" } }, 40)}
        </button>`
      )
      .join("");
    emblemPicker.querySelectorAll(".emblem-choice").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedEmblem = btn.dataset.shape;
        emblemPicker.querySelectorAll(".emblem-choice").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        updatePreview();
      });
    });
  }

  function populateCountries() {
    countrySelect.innerHTML = game.database
      .getCountries()
      .map((c) => `<option value="${c.name}">${c.name}</option>`)
      .join("");
    countrySelect.value = "Brasil";
  }

  function renderList() {
    const customClubs = game.database.getClubs().filter((c) => c.custom);
    if (!customClubs.length) {
      listEl.innerHTML = `<p class="muted">Você ainda não criou nenhum clube.</p>`;
      return;
    }
    listEl.innerHTML = customClubs
      .map(
        (c) => `
        <div class="club-row" data-id="${c.id}">
          <span class="club-row-emblem">${emblemSvg(c, 40)}</span>
          <div class="club-row-info">
            <strong>${c.name}</strong>
            <span>${c.city}, ${c.country} · Força ${c.overallBase}</span>
          </div>
          <button type="button" class="btn-small danger" data-action="delete" data-id="${c.id}">Excluir</button>
        </div>`
      )
      .join("");

    listEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        if (confirm("Excluir este clube criado?")) {
          game.database.removeCustomClub(id);
          renderList();
        }
      });
    });
  }

  strengthInput.addEventListener("input", () => {
    strengthLabel.textContent = strengthInput.value;
  });

  [nameInput, primaryInput, secondaryInput].forEach((input) =>
    input.addEventListener("input", updatePreview)
  );

  form.addEventListener("submit", (evt) => {
    evt.preventDefault();
    if (!nameInput.value.trim()) return;
    game.audio.click();

    game.clubCreator.createClub({
      name: nameInput.value.trim(),
      city: cityInput.value.trim() || "Cidade Nova",
      country: countrySelect.value,
      stadiumName: stadiumInput.value.trim() || `Estádio ${nameInput.value.trim()}`,
      primary: primaryInput.value,
      secondary: secondaryInput.value,
      emblem: selectedEmblem,
      overallBase: Number(strengthInput.value),
    });

    form.reset();
    strengthInput.value = 70;
    strengthLabel.textContent = "70";
    populateCountries();
    updatePreview();
    renderList();
    alert("Clube criado! Ele já aparece no Jogo Rápido e na Carreira.");
  });

  backBtn.addEventListener("click", () => {
    game.audio.click();
    router.show("main-menu");
  });

  router.onChange((screen) => {
    if (screen === "create-club") {
      populateCountries();
      populateEmblemPicker();
      updatePreview();
      renderList();
    }
  });
}
