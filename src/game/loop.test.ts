import { describe, expect, it } from 'vitest';
import { createStepper, MAX_FRAME_SECONDS, STEP_SECONDS } from './loop';

describe('createStepper', () => {
  it('runs exactly one update per 1/60 second over a full second', () => {
    const stepper = createStepper();
    let calls = 0;
    for (let frame = 0; frame < 60; frame++) {
      stepper.advance(1 / 60, () => calls++);
    }
    expect(calls).toBe(60);
  });

  it('gives the same number of steps for a slow and a fast screen', () => {
    const slow = createStepper();
    const fast = createStepper();
    let slowSteps = 0;
    let fastSteps = 0;
    for (let i = 0; i < 10; i++) slowSteps += slow.advance(0.1, () => {});
    for (let i = 0; i < 100; i++) fastSteps += fast.advance(0.01, () => {});
    expect(slowSteps).toBe(60);
    expect(fastSteps).toBe(60);
  });

  it('keeps leftover time for the next frame', () => {
    const stepper = createStepper();
    expect(stepper.advance(STEP_SECONDS * 1.5, () => {})).toBe(1);
    expect(stepper.advance(STEP_SECONDS * 0.5, () => {})).toBe(1);
  });

  it('caps very long pauses so the game does not run hundreds of steps at once', () => {
    const stepper = createStepper();
    const steps = stepper.advance(10, () => {});
    expect(steps).toBeLessThanOrEqual(Math.ceil(MAX_FRAME_SECONDS / STEP_SECONDS));
  });

  it('passes the fixed step size to update', () => {
    const stepper = createStepper();
    const seen: number[] = [];
    stepper.advance(0.05, (dt) => seen.push(dt));
    expect(seen.every((dt) => dt === STEP_SECONDS)).toBe(true);
  });
});
