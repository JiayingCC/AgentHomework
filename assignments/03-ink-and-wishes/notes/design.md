# Design decision — Ink & Wishes

Latest direction: minimal, fluid glass, no pastel palette. Audience: beginners. Main job: understand 福 and turn handwritten marks into a saved red-envelope design.

Tokens: paper #ffffff, atmosphere #f1f2f3, ink #202323, secondary #747778, edge #dddfdf, envelope #962d32. Display: Georgia used with restraint, body: Avenir Next / Helvetica Neue / system sans, utility: system monospace. Chinese display uses the licensed glyph paths, not a remote font.

Layout explored:
A. Landing hero → feature cards → drawing modal. Rejected: hides the actual experience and resembles a generic product page.
B. A working writing desk: quiet top navigation, one introductory line, a paper canvas between a narrow lesson column and a sequence reference, floating glass tools at the paper edge. Chosen: the user's writing is the centerpiece immediately.

Signature: a glass tool tray floats just off the paper. Nested highlights and soft refraction-like shadows create a fluid glass appearance without noisy colored gradients. Glass is confined to controls; the artwork stays high-contrast. Reduced motion and a solid-controls setting are provided.

The initial 福 on the paper is a labeled optional tracing guide, never mistaken for the visitor's saved artwork. Save and envelope actions require actual drawn strokes. A sequence reference and quiz use the same bundled 13-stroke model.

## Brush and atmosphere iteration

The student requested a more convincing brush-calligraphy feel and a little ink-wash background. Keep the existing neutral tokens, typography, paper-centered layout, and fluid glass. Make the material character come from the ink: a full brush belly, tapered entry and lift, and fine irregular longitudinal gaps when the ink load is low. The background is a sparse grayscale mountain wash at the outer lower edges, shown at low opacity. Keep it out of the writing surface and artwork export.

Considered a decorative brush cursor with the old marker rendering; rejected because it would change the appearance of a tool without changing the marks. Chosen approach changes the actual stored and exported strokes. The earlier Steady and Flow modes and saved work remain supported.
