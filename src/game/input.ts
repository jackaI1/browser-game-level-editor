import type { Controls } from './world';

const ACTIONS: Record<string, 'left' | 'right' | 'jump' | 'restart'> = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'jump',
  KeyW: 'jump',
  Space: 'jump',
  KeyR: 'restart',
};

// Keeps track of which keys are held. Uses key codes (KeyA) so it works on any keyboard layout.
export class Keyboard {
  private held = new Set<string>();
  private restartQueued = false;

  constructor(target: Window) {
    target.addEventListener('keydown', (e) => {
      const action = ACTIONS[e.code];
      if (!action) return;
      e.preventDefault();
      if (action === 'restart') {
        if (!e.repeat) this.restartQueued = true;
        return;
      }
      this.held.add(e.code);
    });
    target.addEventListener('keyup', (e) => {
      this.held.delete(e.code);
    });
    // If the window loses focus, keyup never arrives, so forget everything that was held.
    target.addEventListener('blur', () => this.held.clear());
  }

  controls(): Controls {
    const active = (action: string) => [...this.held].some((code) => ACTIONS[code] === action);
    return { left: active('left'), right: active('right'), jump: active('jump') };
  }

  // Returns true once per press of R.
  consumeRestart(): boolean {
    const queued = this.restartQueued;
    this.restartQueued = false;
    return queued;
  }
}
