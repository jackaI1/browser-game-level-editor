import { validateLevel, type Level } from '../game/level';
import firstSteps from './01-first-steps.json';
import spikes from './02-spikes.json';
import tallClimb from './03-tall-climb.json';

export interface BundledLevel {
  label: string;
  level: Level;
}

// Levels that ship with the game. Each one is checked by the test suite.
export const BUNDLED_LEVELS: BundledLevel[] = [
  { label: '1. First steps', level: requireValid(firstSteps, 'first steps') },
  { label: '2. Watch the spikes', level: requireValid(spikes, 'spikes') },
  { label: '3. Tall climb', level: requireValid(tallClimb, 'tall climb') },
];

function requireValid(data: unknown, name: string): Level {
  const result = validateLevel(data);
  if (!result.ok) throw new Error(`Bundled level "${name}" is invalid: ${result.errors.join(' ')}`);
  return result.level;
}
