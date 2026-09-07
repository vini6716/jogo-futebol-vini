/**
 * Sintetizador simples via WebAudio. Não existem arquivos de música/efeitos
 * (Assets/Music, Assets/Sounds na versão Unity), então os efeitos do jogo
 * são gerados na hora com osciladores — leve e não depende de assets.
 */
export class AudioManager {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
  }

  _ensureCtx() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  _tone(freq, duration, type, volumeScale) {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    const vol = (this.settings.sfxVolume / 100) * volumeScale;
    if (vol <= 0) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  click() {
    this._tone(520, 0.08, "square", 0.25);
  }

  whistle() {
    this._tone(1400, 0.3, "sine", 0.35);
  }

  goal() {
    const ctx = this._ensureCtx();
    if (!ctx) return;
    [660, 880, 1100, 1320].forEach((f, i) => {
      setTimeout(() => this._tone(f, 0.25, "triangle", 0.4), i * 90);
    });
  }

  card() {
    this._tone(220, 0.4, "sawtooth", 0.3);
  }
}
