# Iteration: brush character and ink-wash atmosphere

The student's feedback after trying the first website:

> 但我想要有毛笔笔刷感觉的笔刷来写字，要有一点点水墨画背景

## What changed

The default is now **Ink brush / 毛笔**. Its marks have a wider belly, finer fast movement, tapered entry and lift, subtly soft edges, and irregular bristle gaps. Ink load ranges from 15% to 100%: a lower setting reveals more paper between the bristles. A live sample in the settings dialog uses the same renderer as the drawing canvas and PNG export.

Mouse and touch use movement speed. Compatible pen input also supplies pressure when the browser reports it. This is a brush-like simulation; it does not model real fluid diffusion or tilt. Physical pressure-enabled hardware has not been tested in this session.

Each stroke stores its ink amount and a stable texture seed. Repainting, undo/redo, reopening, and exporting do not randomize the grain. Texture uses translucent ink rather than white eraser marks, so it also works over red paper and previous strokes. Completed strokes are cached while the active stroke is drawn, avoiding replaying the entire drawing on every pointer movement.

The original Steady and Flow marks keep their original rendering. Existing version-1 saved drawings remain supported. The earlier default-brush decision in the first proposal is superseded by this explicit student request; it was not changed because of a completed A/B study.

## Background asset

Mode: **built-in image_gen**, through the imagegen skill. No CLI or API key was used.

Saved website asset: `site/assets/ink-landscape.png` (1536 × 1024). The final downloadable copy is in `outputs/Ink-and-Wishes/site/assets/ink-landscape.png`. This is a generated illustration, not a historical artwork or a museum scan.

The mountains sit at the outer edges at low opacity. The white writing paper remains clear, and the landscape is not added to the visitor's artwork exports.

Final generation prompt:

> Use case: stylized-concept. Asset type: subtle background painting for a minimalist Chinese calligraphy website. Primary request: a very restrained traditional Chinese ink-wash landscape on clean white rice paper. Wide landscape composition 1536x1024. Very pale misty mountain ridges only near the far left and far right lower edges; 75 percent of the central and upper picture is pure quiet white negative space for a writing canvas and interface. Soft layered gray ink blooms, a few delicate dry-brush rock textures. Elegant authentic shuimo sensibility, sparse and atmospheric. Grayscale only, no beige or pastel color. Low contrast overall, small darker accents only at the outer bottom edges. No text, calligraphy, seal, people, buildings, interface, frame, or watermark.

## Actual checks

All **16 Node.js tests passed**, including six new brush checks: speed/pressure width bounds, tapered geometry, consistent save/load, short marks, and legacy compatibility.

In the browser, drew wet and dry marks, undid/redid a stroke, saved the three-stroke envelope, reloaded, reopened it, and downloaded a PNG. Brush settings reopened at the saved size 60 and ink load 15%. The final exported image was inspected for ink texture and red-paper rendering. The earlier classmate worksheet remains blank; these are agent-operated software checks.

The first dry-brush preview looked too evenly patterned. The renderer was adjusted to use longer, irregular bristle gaps, then inspected again. This is a concrete example of visual evaluation and iteration.
