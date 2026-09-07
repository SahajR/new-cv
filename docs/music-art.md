# Music artwork

The Music intro uses the user's `public/images/ev.gif` on black. `public/images/music/ev-still.png` is its first frame, exported for reduced motion, pausing, and the faint background emblem.

`public/images/music/moonlit-door.png` was generated with the built-in imagegen tool and exported to a 160×80 pixel PNG with a 12-color palette and nearest-neighbor sampling. It preserves approximately the same on-screen pixel density as the Travel artwork. The generation original remains outside the repository.

Visual reference: [Evanescence official store](https://evanescencestore.com/pages/shop). The scene is an original gothic illustration, not official album artwork. The background arch glyph is a decorative SVG.

## Doorway generation prompt

Use case: stylized-concept.
Asset type: original 2:1 landscape pixel-art banner for the Music section of a personal website, inspired by the gothic, sinister atmosphere of Evanescence.
Subject: a ruined gothic stone archway standing in a moonlit flooded courtyard, an open dark doorway at its center, one long black feather drifting over the water, stark bare branches at the edges, pale light through the doorway reflected as a broken path in the water. A small crescent moon in the distance. A sense of haunting beauty, absence, and a door into another world.
Style: extremely chunky, intentional low-resolution pixel art on a strict 160 by 80 logical pixel grid. Big square pixels, simple stepped architectural silhouettes, very limited 8–12 color palette, flat shapes with sparse ordered checkerboard dithering. Match coarse 1980s computer-game art, not detailed modern pixel illustration. Every edge aligned to the pixel grid.
Palette: near-black green #071315, dark turquoise #176f73, muted oxidized teal #3b7779, fog gray #a7bebb, ivory #dce6df, restrained deep wine shadows #302029. Mostly dark, with clearly legible pale arch edges and moon. No bright neon.
Composition: wide 2:1, archway occupies the middle third with generous dark woods/water across both sides; edge-to-edge finished artwork, no mat or frame. An original visual homage, not a copy of an album cover.
Avoid: text, letters, logos, typography, watermark, UI, gradients, smooth curves, anti-aliasing, tiny details, realistic rendering, photographic texture.

## Raven and branch

`public/images/music/raven-branch.png` is a transparent 160×100 pixel, 16-color export generated with the built-in imagegen tool. It sits to the left of the retained doorway. On narrow screens the perch moves above the doorway, aligned left, with space reserved below the paragraph.

The sprite's head is isolated with SVG clipping and masking, then tilted independently with a scroll-driven Motion spring. Two crimson pixel accents keep the eyes red after palette reduction; a small, static glow follows the head. Reduced motion uses a fixed forward-facing pose. No idle loops run.

### Raven generation prompt

Use case: stylized-concept.
Asset type: transparent pixel-art sprite for an animated gothic raven perched on an eerie tree branch in a personal website's dark Music section.
Primary request: a single black raven perched on a long, crooked, bare branch entering from the LEFT edge and extending toward the right. The raven's BODY is a three-quarter side view, but its HEAD faces directly OUTWARD toward the viewer, with TWO clearly visible DARK RED glowing eyes. A watchful, sinister raven, elegant and recognizably a raven, not an owl. Strong heavy beak pointing slightly downward toward the viewer, black throat feathers, broad shoulder, folded wing and long tail. Restrained dark crimson eyes, not bright pink and not laser beams.
Composition: wide transparent canvas aspect ratio 8:5. Use a strict 160 by 100 logical-pixel composition. Main thick branch runs from left x=0 around y=78, rises to y=67 under the bird, then thins toward right x=153 y=66. A few jagged bare twigs fork above and below the branch, mainly on the left half. Raven's feet stand around x=108,y=67. Raven body from approximately x=93 to 122, y=35 to 67; front-facing raven HEAD centered at x=108, from y=17 to y=36, separated by a clear neck so its head can be animated independently. Keep all branches and twigs clear of the head. Leave transparent air around the raven and above the branch. Raven is large enough to read at small size.
Style: very chunky low-resolution pixel art, large square blocks, deliberate staircase outlines, flat palette of 8–12 colors, sparse checkerboard shadow pixels. EXACTLY the visual density of a 160x100 retro computer-game sprite enlarged with nearest-neighbor scaling. No tiny high-resolution detail.
Colors: raven blue-black #081013, shadow #030709, muted petrol and slate-teal highlights #22494c and #41666a, branch weathered dark gray green #273438 with a few pale gray-teal rim pixels. Dark crimson #7c1021 eyes with a small red #b22535 center. No other colored glow.
Background: genuine transparent alpha, no black background, no scenery, no fog sheet, no moon, no border, no ground or rectangle. Branch and raven only, clean cutout silhouette. No text, no typography, no logo, no watermark, no photorealism, no gradients or smooth vector curves.
