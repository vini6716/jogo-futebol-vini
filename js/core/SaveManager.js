const PREFIX = "futebolland:";

/**
 * Wrapper fino sobre localStorage. Equivale ao SaveManager/CloudSave da
 * versão Unity, mas gravando no navegador em vez de num arquivo local.
 */
export class SaveManager {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.warn("SaveManager.get falhou para", key, err);
      return fallback;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn("SaveManager.set falhou para", key, err);
      return false;
    }
  }

  remove(key) {
    localStorage.removeItem(PREFIX + key);
  }

  // --- atalhos usados pelo resto do jogo ---
  loadSettings() {
    return this.get("settings", {
      musicVolume: 70,
      sfxVolume: 80,
      difficulty: "Amador",
    });
  }

  saveSettings(settings) {
    return this.set("settings", settings);
  }

  loadCustomClubs() {
    return this.get("customClubs", []);
  }

  saveCustomClubs(clubs) {
    return this.set("customClubs", clubs);
  }

  loadCustomPlayers() {
    return this.get("customPlayers", []);
  }

  saveCustomPlayers(players) {
    return this.set("customPlayers", players);
  }

  loadCustomStadiums() {
    return this.get("customStadiums", []);
  }

  saveCustomStadiums(stadiums) {
    return this.set("customStadiums", stadiums);
  }

  loadCareer() {
    return this.get("career", null);
  }

  saveCareer(career) {
    return this.set("career", career);
  }

  clearCareer() {
    this.remove("career");
  }
}
