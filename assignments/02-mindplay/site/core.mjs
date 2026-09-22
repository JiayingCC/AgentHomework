export const GAME_IDS = ['stroop', 'memory', 'bias'];
export const COLORS = [
  {name: 'Red', value: '#b52a42', key: 'r'},
  {name: 'Blue', value: '#2158bd', key: 'b'},
  {name: 'Green', value: '#177447', key: 'g'},
  {name: 'Purple', value: '#783db1', key: 'p'},
];
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function createTrials(random = Math.random) {
  const trials = Array.from({length: 12}, (_, i) => {
    // Use the same six-color distribution in both conditions.
    const ink = (i % 6) % COLORS.length;
    const congruent = i < 6;
    const word = congruent ? ink : (ink + 1 + Math.floor(random() * 3)) % 4;
    return {ink, word, congruent};
  });
  return shuffle(trials, random);
}
export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
export function summarizeTrials(responses) {
  const valid = responses.filter(r => r.correct && Number.isFinite(r.ms) && r.ms >= 0);
  const match = valid.filter(r => r.congruent).map(r => r.ms);
  const clash = valid.filter(r => !r.congruent).map(r => r.ms);
  return {correct: responses.filter(r => r.correct).length, total: responses.length,
    match: median(match), clash: median(clash), matchN: match.length, clashN: clash.length};
}
const WORDS = ['Lantern', 'Meadow', 'Ribbon', 'Pebble', 'Cloud', 'Lemon', 'Window', 'Feather', 'River', 'Button', 'Candle', 'Shell', 'Clover', 'Basket', 'Velvet', 'Garden', 'Marble', 'Pocket', 'Willow', 'Pillow', 'Ladder', 'Silver', 'Turtle', 'Anchor'];
export function createMemoryRound(random = Math.random) {
  const pool = shuffle(WORDS, random).slice(0, 12);
  const targets = pool.slice(0, 6);
  return {targets, choices: shuffle(pool, random)};
}
export function scoreMemory(targets, selected) {
  if (!Array.isArray(selected) || selected.some(word => typeof word !== 'string' || !word.trim())) {
    throw new Error('Choose exactly six word selections.');
  }
  const unique = [...new Set(selected)];
  if (unique.length !== 6) throw new Error('Choose exactly six words.');
  const hits = unique.filter(word => targets.includes(word)).length;
  return {hits, falseAlarms: unique.length - hits, missed: targets.filter(word => !unique.includes(word))};
}
export function normalizeProgress(input) {
  const value = input && typeof input === 'object' ? input : {};
  const completed = [...new Set(Array.isArray(value.completed) ? value.completed.filter(id => GAME_IDS.includes(id)) : [])];
  return {version: 1, completed, xp: completed.length * 50, solid: value.solid === true};
}
export function completeGame(progress, id) {
  return normalizeProgress({...progress, completed: [...progress.completed, id]});
}
export function createPrompt(goal, focus) {
  const brief = goal.trim();
  if (!brief) throw new Error('Add a goal first.');
  return `You are helping me improve Mindplay, a psychology learning website.\n\nGOAL\n${brief}\n\nFOCUS\n${focus}\n\nCONTEXT\nThe site uses short educational games and evidence-based explanations. It is a static website with no live AI calls.\n\nWORKFLOW\n1. Research: find primary or reputable academic sources; distinguish evidence from assumptions.\n2. Plan: propose the smallest useful change and testable acceptance criteria.\n3. Build: implement the agreed change with keyboard access and mobile support.\n4. Review: check scientific claims, behavior, and accessibility; report concrete findings.\n5. Iterate: fix the most important finding and rerun the relevant checks.\n\nHANDOFF\nReturn what changed, sources, checks actually run, limitations, and one next experiment. Do not present a classroom game as a psychological assessment.`;
}
