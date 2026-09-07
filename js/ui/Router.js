/**
 * Troca simples de telas (equivalente ao SceneManager.LoadScene do Unity,
 * só que trocando qual <section class="screen"> fica visível).
 */
export class Router {
  constructor() {
    this.screens = new Map();
    this.current = null;
    this.listeners = [];
  }

  register(name, element) {
    this.screens.set(name, element);
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  show(name) {
    if (!this.screens.has(name)) {
      console.warn("Tela desconhecida:", name);
      return;
    }
    for (const [key, el] of this.screens) {
      el.classList.toggle("active", key === name);
    }
    this.current = name;
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    this.listeners.forEach((fn) => fn(name));
  }
}
