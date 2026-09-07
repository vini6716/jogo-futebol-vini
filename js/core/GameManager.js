import { SaveManager } from "./SaveManager.js";
import { AudioManager } from "./AudioManager.js";
import { DatabaseManager } from "../database/DatabaseManager.js";
import { CareerManager } from "../career/CareerManager.js";
import { ClubCreator } from "../clubs/ClubCreator.js";
import { Router } from "../ui/Router.js";

/**
 * GameManager - equivalente ao singleton `GameManager.Instance` do projeto
 * Unity. Aqui não existe DontDestroyOnLoad, então é só um objeto único
 * (`window.Game`) criado uma vez quando a página carrega, guardando todos
 * os outros managers.
 */
class GameManagerClass {
  constructor() {
    this.save = new SaveManager();
    this.settings = this.save.loadSettings();
    this.audio = new AudioManager(this.settings);
    this.database = new DatabaseManager(this.save);
    this.career = new CareerManager(this.database, this.save);
    this.clubCreator = new ClubCreator(this.database);
    this.router = new Router();
  }

  async boot() {
    await this.database.loadAll();
  }

  saveSettings() {
    this.save.saveSettings(this.settings);
  }
}

export const GameManager = new GameManagerClass();
window.Game = GameManager;
