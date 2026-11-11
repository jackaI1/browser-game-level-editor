// A fixed-timestep loop: game logic always advances in the same small steps,
// no matter how fast the screen redraws. This keeps jumps and falls the same on every computer.
export const STEP_SECONDS = 1 / 60;
export const MAX_FRAME_SECONDS = 0.25; // stops a long pause (tab hidden, debugger) from running hundreds of steps

const EPSILON = 1e-9;

export function createStepper(step = STEP_SECONDS, maxFrame = MAX_FRAME_SECONDS) {
  let accumulator = 0;
  return {
    // Adds the time that passed since the last frame and runs update() once per full step. Returns the number of steps run.
    advance(frameSeconds: number, update: (dt: number) => void): number {
      accumulator += Math.min(Math.max(frameSeconds, 0), maxFrame);
      let steps = 0;
      while (accumulator + EPSILON >= step) {
        update(step);
        accumulator -= step;
        steps++;
      }
      return steps;
    },
  };
}

// Runs update() at the fixed step and render() once per animation frame. Returns a function that stops the loop.
export function startLoop(update: () => void, render: () => void): () => void {
  const stepper = createStepper();
  let last = performance.now();
  let frameId = 0;
  let running = true;

  const frame = (now: number) => {
    if (!running) return;
    stepper.advance((now - last) / 1000, () => update());
    last = now;
    render();
    frameId = requestAnimationFrame(frame);
  };
  frameId = requestAnimationFrame(frame);

  return () => {
    running = false;
    cancelAnimationFrame(frameId);
  };
}
