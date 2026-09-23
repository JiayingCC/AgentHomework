// Optional metadata keeps version-1 artwork and older saved drawings compatible.
export const DEDICATION_LIMITS = {recipient:40, sender:40, message:160};
export function validateDedication(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('This dedication could not be read.');
  for (const [field, limit] of Object.entries(DEDICATION_LIMITS)) {
    if (value[field] !== undefined && (typeof value[field] !== 'string' || value[field].length > limit)) throw new Error(`Keep your ${field} within ${limit} characters.`);
  }
  return value;
}
export function dedicationText(value = {}) {
  validateDedication(value);
  return Object.fromEntries(Object.keys(DEDICATION_LIMITS).map(key => [key, (value[key] || '').trim()]));
}
export const KEEP_STATES = ['ready', 'sealed', 'opened'];
export function nextEnvelopeState(state, action) {
  if (!KEEP_STATES.includes(state)) throw new Error('Unknown envelope state.');
  if (action === 'edit') return 'ready';
  if (action === 'seal' && state === 'ready') return 'sealed';
  if (action === 'open' && state === 'sealed') return 'opened';
  if (action === 'replay' && state === 'opened') return 'sealed';
  return state;
}
export function recordAnswer(results, index, correct) {
  const next = results.map(result => ({...result}));
  const previous = next[index] || {attempts:0, firstCorrect:false, correct:false};
  if (previous.correct) return next;
  next[index] = {attempts:previous.attempts + 1, firstCorrect:previous.attempts === 0 ? correct : previous.firstCorrect, correct};
  return next;
}
