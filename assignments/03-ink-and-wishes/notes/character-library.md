# Iteration: beyond one character

September 22, 2026.

## Feedback and working interpretation

The student wrote, “only one character ‘福’.” The agent interpreted this as a limitation of the current prototype and asked which set to add. No answer had arrived when implementation proceeded, so the agent used its stated working choice: 山、水、永、安、春、福. This selection is an implementation assumption, not a recorded student preference.

The set provides a range from three to thirteen strokes, with nature, basic practice, and auspicious meanings. It preserves the existing 福 lesson and saved artwork.

## What changed

- A visible six-character picker changes the tracing guide, pronunciation, story, reference sequence, and game together.
- Each lesson uses one local stroke model throughout. Quiz choices come from strokes that have not yet been written. 山 has two questions; the other lessons have three. A question can have two or three choices, avoiding a trivial final-stroke question with one possible answer.
- Switching characters retains that character's draft, brush settings, and undo/redo history for the current session. The page warns about unsaved drafts before leaving. A reload requires an explicitly saved work to restore the drawing.
- Saved work includes its lesson ID. Opening it returns to the correct character. Older saved work without this field still opens as 福.
- A failed glyph load leaves the current drawing intact. A request token prevents a slower earlier selection from replacing a later one.

The UI remains minimal, with neutral glass controls, the textured ink brush, and the light landscape background.

## Sources and verification

The five added models are unmodified assets from Hanzi Writer Data 2.0.1. The bundled manifest records the counts and SHA-256 hashes; the existing Arphic license covers these assets. Dictionary links support pronunciation and meaning. 永 uses the selected five-stroke model; the lesson does not confuse the eight named brush techniques with eight written strokes.

The full suite reports **20 passed, 0 failed**. New checks validate all six assets and captions, quiz choice rules, malformed data rejection, and saved-work compatibility.

Observed in the browser: all six selections changed the corresponding reference and guide; 山 playback stopped at 3/3; a deliberately wrong quiz answer followed by a retry produced 1 of 2 on the first try; switching 山 → 水 → 山 preserved the drawing and redo history. A saved 山 work survived reload and reopened on the correct lesson. The picker fit a 390 × 844 viewport without horizontal overflow.

These are agent-run software checks. Human calligraphy review, physical pen/touch testing, and learner feedback remain pending. No classroom study or learning outcome is claimed.
