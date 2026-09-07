/**
 * Controles: teclado (WASD/setas + espaço) para desktop, e joystick
 * virtual + botão de chute (pointer events) para toque — funciona tanto
 * com o dedo no celular quanto com o mouse.
 */
export function attachKeyboard(game) {
  const keys = new Set();

  function updateFromKeys() {
    let x = 0;
    let y = 0;
    if (keys.has("arrowleft") || keys.has("a")) x -= 1;
    if (keys.has("arrowright") || keys.has("d")) x += 1;
    if (keys.has("arrowup") || keys.has("w")) y -= 1;
    if (keys.has("arrowdown") || keys.has("s")) y += 1;
    game.setInput(x, y);
  }

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d", " "].includes(k)) {
      e.preventDefault();
    }
    if (k === " ") {
      game.startKick();
      return;
    }
    keys.add(k);
    updateFromKeys();
  });

  window.addEventListener("keyup", (e) => {
    const k = e.key.toLowerCase();
    if (k === " ") {
      game.releaseKick();
      return;
    }
    keys.delete(k);
    updateFromKeys();
  });
}

export function attachJoystick(game, baseEl, knobEl) {
  const state = { active: false, pointerId: null };
  const radius = 44;

  function reset() {
    knobEl.style.transform = "translate(-50%, -50%)";
    game.setInput(0, 0);
  }

  function handleMove(clientX, clientY) {
    const rect = baseEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const d = Math.hypot(dx, dy);
    if (d > radius) {
      dx = (dx / d) * radius;
      dy = (dy / d) * radius;
    }
    knobEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    game.setInput(dx / radius, dy / radius);
  }

  baseEl.addEventListener("pointerdown", (e) => {
    state.active = true;
    state.pointerId = e.pointerId;
    baseEl.setPointerCapture(e.pointerId);
    handleMove(e.clientX, e.clientY);
  });
  baseEl.addEventListener("pointermove", (e) => {
    if (!state.active || e.pointerId !== state.pointerId) return;
    handleMove(e.clientX, e.clientY);
  });
  function end(e) {
    if (e.pointerId !== state.pointerId) return;
    state.active = false;
    reset();
  }
  baseEl.addEventListener("pointerup", end);
  baseEl.addEventListener("pointercancel", end);
}

export function attachKickButton(game, buttonEl) {
  buttonEl.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    buttonEl.classList.add("pressed");
    game.startKick();
  });
  function release() {
    buttonEl.classList.remove("pressed");
    game.releaseKick();
  }
  buttonEl.addEventListener("pointerup", release);
  buttonEl.addEventListener("pointercancel", release);
  buttonEl.addEventListener("pointerleave", release);
}
