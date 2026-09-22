import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLORS, GAME_IDS, shuffle, createTrials, median, summarizeTrials,
  createMemoryRound, scoreMemory, normalizeProgress, completeGame, createPrompt,
} from '../site/core.mjs';

// A repeatable pseudorandom source makes a failed generated round reproducible.
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

test('shuffle preserves its input and all items, including repeated values', () => {
  const input = Object.freeze(['a', 'b', 'a', 'c']);
  const shuffled = shuffle(input, seededRandom(21));
  assert.notEqual(shuffled, input);
  assert.deepEqual([...shuffled].sort(), [...input].sort());
  assert.deepEqual(input, ['a', 'b', 'a', 'c']);
  assert.deepEqual(shuffle([], seededRandom(21)), []);
});

test('100 seeded Stroop rounds contain 12 valid trials with matched ink distributions across conditions', () => {
  const orders = new Set();
  for (let seed = 1; seed <= 100; seed++) {
    const trials = createTrials(seededRandom(seed));
    assert.equal(trials.length, 12, `seed ${seed}: trial count`);
    assert.equal(trials.filter(t => t.congruent).length, 6, `seed ${seed}: matching count`);
    assert.equal(trials.filter(t => !t.congruent).length, 6, `seed ${seed}: mismatching count`);
    for (const trial of trials) {
      assert.ok(Number.isInteger(trial.ink) && trial.ink >= 0 && trial.ink < COLORS.length);
      assert.ok(Number.isInteger(trial.word) && trial.word >= 0 && trial.word < COLORS.length);
      assert.equal(typeof trial.congruent, 'boolean');
      assert.equal(trial.ink === trial.word, trial.congruent, `seed ${seed}: condition agrees with stimulus`);
    }
    const matchingInks = COLORS.map((_, ink) => trials.filter(t => t.congruent && t.ink === ink).length);
    const mismatchingInks = COLORS.map((_, ink) => trials.filter(t => !t.congruent && t.ink === ink).length);
    assert.deepEqual(matchingInks, mismatchingInks, `seed ${seed}: conditions have identical ink histograms`);
    assert.ok(matchingInks.every(count => count > 0), `seed ${seed}: all four ink colors occur in both conditions`);
    for (const condition of [true, false]) {
      const counts = COLORS.map((_, ink) => trials.filter(t => t.congruent === condition && t.ink === ink).length);
      assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, `seed ${seed}: inks balanced within condition`);
    }
    orders.add(JSON.stringify(trials));
    assert.deepEqual(trials, createTrials(seededRandom(seed)), `seed ${seed}: reproducible round`);
  }
  assert.ok(orders.size > 90, 'different random seeds should produce varied stimulus orders');
});

test('median handles empty, odd, even, and unsorted values without mutating them', () => {
  assert.equal(median([]), null);
  assert.equal(median([420]), 420);
  assert.equal(median([400, 100, 200]), 200);
  const input = Object.freeze([800, 100, 400, 200]);
  assert.equal(median(input), 300);
  assert.deepEqual(input, [800, 100, 400, 200]);
  assert.equal(median([0, 0]), 0);
});

test('Stroop summary uses only valid correct-response times for condition medians', () => {
  const responses = [
    {correct: true, congruent: true, ms: 100},
    {correct: true, congruent: true, ms: 900},
    {correct: true, congruent: true, ms: 300},
    {correct: false, congruent: true, ms: 1},
    {correct: true, congruent: false, ms: 400},
    {correct: true, congruent: false, ms: 800},
    {correct: false, congruent: false, ms: 10000},
  ];
  assert.deepEqual(summarizeTrials(responses), {
    correct: 5, total: 7, match: 300, clash: 600, matchN: 3, clashN: 2,
  });
});

test('Stroop summary keeps no-data conditions unavailable and counts errors in the total', () => {
  assert.deepEqual(summarizeTrials([]), {
    correct: 0, total: 0, match: null, clash: null, matchN: 0, clashN: 0,
  });
  assert.deepEqual(summarizeTrials([
    {correct: false, congruent: true, ms: 300},
    {correct: false, congruent: false, ms: 400},
  ]), {
    correct: 0, total: 2, match: null, clash: null, matchN: 0, clashN: 0,
  });
  assert.deepEqual(summarizeTrials([{correct: true, congruent: false, ms: 0}]), {
    correct: 1, total: 1, match: null, clash: 0, matchN: 0, clashN: 1,
  });
});

test('invalid timestamps never affect medians or the number of timed observations', () => {
  const invalid = [NaN, Infinity, -Infinity, -1, undefined, null, '200'];
  const responses = invalid.map(ms => ({correct: true, congruent: true, ms}));
  responses.push({correct: true, congruent: true, ms: 250});
  const result = summarizeTrials(responses);
  assert.equal(result.match, 250);
  assert.equal(result.matchN, 1);
  assert.equal(result.clash, null);
  assert.equal(result.correct, 8, 'accuracy counts answers independently of valid timing');
  assert.equal(result.total, 8);
});

test('100 seeded memory rounds contain six unique targets and six distinct new words', () => {
  const rounds = new Set();
  for (let seed = 1; seed <= 100; seed++) {
    const round = createMemoryRound(seededRandom(seed));
    assert.equal(round.targets.length, 6, `seed ${seed}: targets`);
    assert.equal(round.choices.length, 12, `seed ${seed}: choices`);
    assert.equal(new Set(round.targets).size, 6);
    assert.equal(new Set(round.choices).size, 12);
    assert.ok(round.choices.every(word => typeof word === 'string' && word.trim().length > 0));
    assert.ok(round.targets.every(word => round.choices.includes(word)));
    assert.equal(round.choices.filter(word => !round.targets.includes(word)).length, 6);
    assert.deepEqual(round, createMemoryRound(seededRandom(seed)));
    rounds.add(JSON.stringify(round));
  }
  assert.ok(rounds.size > 90, 'different seeds should produce varied memory rounds');
});

test('memory scoring distinguishes hits, false alarms, and missed studied words', () => {
  const {targets, choices} = createMemoryRound(seededRandom(42));
  const lures = choices.filter(word => !targets.includes(word));
  assert.deepEqual(scoreMemory(targets, targets), {hits: 6, falseAlarms: 0, missed: []});
  assert.deepEqual(scoreMemory(targets, lures), {hits: 0, falseAlarms: 6, missed: targets});
  const selected = [...targets.slice(0, 4), ...lures.slice(0, 2)];
  assert.deepEqual(scoreMemory(targets, selected), {hits: 4, falseAlarms: 2, missed: targets.slice(4)});
  assert.deepEqual(selected, [...targets.slice(0, 4), ...lures.slice(0, 2)], 'scoring must not mutate selections');
});

test('memory scoring rejects fewer or more than six distinct selections', () => {
  const {targets, choices} = createMemoryRound(seededRandom(42));
  for (const selected of [[], targets.slice(0, 5), choices.slice(0, 7), [...targets.slice(0, 5), targets[0]]]) {
    assert.throws(() => scoreMemory(targets, selected), /six/i);
  }
});

test('memory scoring rejects malformed selections rather than treating them as word choices', () => {
  const {targets} = createMemoryRound(seededRandom(42));
  for (const selected of [null, undefined, 'abcdef', [null, false, 0, {}, [], undefined], ['', ' ', '\n', 3, false, null]]) {
    assert.throws(() => scoreMemory(targets, selected), `malformed selection ${String(selected)} must be rejected`);
  }
});

test('completion earns points once per game and replay is idempotent', () => {
  let progress = normalizeProgress(null);
  for (let i = 0; i < GAME_IDS.length; i++) {
    const id = GAME_IDS[i];
    const before = {...progress, completed: [...progress.completed]};
    const completed = completeGame(progress, id);
    assert.deepEqual(progress, before, 'completion must not mutate prior progress');
    assert.equal(completed.xp, (i + 1) * 50);
    assert.equal(completed.completed.length, i + 1);
    assert.deepEqual(completeGame(completed, id), completed, 'replay does not award duplicate points');
    progress = completed;
  }
  assert.equal(progress.xp, 150);
  assert.deepEqual(completeGame(progress, 'unknown-game'), progress);
});

test('progress normalization discards corrupt data and derives points from real completed games', () => {
  const empty = {version: 1, completed: [], xp: 0, solid: false};
  for (const input of [undefined, null, '', 'bad JSON', 100, false, [], {completed: 'stroop', xp: 999}]) {
    assert.deepEqual(normalizeProgress(input), empty);
  }
  const corrupt = {
    version: 9000,
    completed: ['stroop', 'stroop', 'fake', null, 'memory', 42, {}, 'bias'],
    xp: 999999,
    solid: 'true',
    unexpected: 'discard me',
  };
  assert.deepEqual(normalizeProgress(corrupt), {version: 1, completed: GAME_IDS, xp: 150, solid: false});
  const normalized = normalizeProgress({...corrupt, solid: true});
  assert.equal(normalized.solid, true);
  assert.deepEqual(normalizeProgress(normalized), normalized, 'normalization is idempotent');
  assert.equal(corrupt.completed.length, 8, 'normalization does not edit stored input');
});

test('prompt creation rejects empty goals and trims surrounding whitespace', () => {
  for (const goal of ['', '  ', '\n\t', '\u2003']) {
    assert.throws(() => createPrompt(goal, 'Accessibility'), /goal/i);
  }
  const prompt = createPrompt('  Add a keyboard tutorial.  ', 'Accessibility');
  assert.ok(prompt.includes('GOAL\nAdd a keyboard tutorial.\n\nFOCUS\nAccessibility'));
  for (const section of ['CONTEXT', 'WORKFLOW', 'HANDOFF']) assert.ok(prompt.includes(section));
  assert.ok(prompt.includes('no live AI calls'));
  assert.ok(prompt.includes('checks actually run'));
});

test('prompt content remains inert plain text, including markup-like user input', () => {
  const goal = '<img src=x onerror="alert(1)"> & explain <b>attention</b>\nKeep this second line.';
  const focus = 'Evidence <script>throw new Error("not executable")</script>';
  const prompt = createPrompt(goal, focus);
  assert.equal(typeof prompt, 'string');
  assert.ok(prompt.includes(`GOAL\n${goal}\n\nFOCUS\n${focus}\n\nCONTEXT`));
  assert.ok(prompt.includes('Do not present a classroom game as a psychological assessment.'));
  // Rendering this string with textContent (rather than innerHTML) remains the UI's responsibility.
});
