# Travel scrapbook

The Travel intro window contains an HTML/CSS flip book, animated with the existing Motion dependency. No canvas, WebGL engine, or new package is required. The journal index lives at `/travel/`; country pages at `/travel/[country]/` are statically generated.

## Page model

`src/data/travel.ts` defines stable positions: Jordan 1, Japan 2, Egypt 3, India 4, China 5. Each position is a two-page country spread; turning one physical leaf advances one position. Position 0 is the closed cover. The back of each leaf contains the following country's left-hand notes, and its front contains the previous country's right-hand illustration. Japan to China turns three leaves forward; China to Japan turns three backward.

On a fresh entry, CSS keyframes fade and drop the closed book from a small height, add two uneven rebounds with a sparse dust puff at impact, then rotate it gently into place. The landing takes 1.4 seconds after a 180ms lead-in; its animationend releases the page-turn controller. The entrance pauses offscreen, is skipped for restored books, and is disabled for reduced motion. In the timeline, the cover then opens and turns to Japan (spread 2); previous/next buttons preview spreads there. The “Explore the travel journal” link opens `/travel/`.

The index has a closed book and a country table of contents underneath. Direct loads and refreshes play the drop but leave it closed. A handoff from the timeline or a country preserves the incoming spread, then folds the complete stack shut in one 650ms spring turn after the shared transition. There are no intermediate page turns or repeated drops. Every left-hand leaf and its edges move with the closing stack; there is no separate stationary page block to linger underneath. The cover itself has no open control on the index; choosing a country navigates to that route and opens to its exact position.

Opening a closed country journal lifts the cover and all preceding leaves together in one spring turn. India (position 4) turns leaves 0–3 as one stack; the India notes are its back face and the India postcard is underneath. Each real leaf permanently has a front, back, and top, bottom and fore-edge surfaces; the cover also keeps its board overhang. Thickness scales with the number of leaves and the book width. The leaves temporarily share a CSS 3D parent whose endpoint preserves their exact resting depths, so removing the parent never adds or repositions visible layers. Stationary leaves and the back board rise or sink by the transferred thickness during each turn. Motion’s native `animate` with its spring generator releases control to responsive CSS without a deferred transform write. No duplicate accessible content is created. Country-to-country navigation still turns individual leaves in the correct direction. Reduced motion settles directly without creating the moving stack, and heading focus waits for the selected spread.

Country pages contain the book without a duplicate heading, dialog frame or panel background. Country links and arrows update the URL, title and metadata as the book turns. Back/Forward uses the same controller. Rapid selections finish the active leaf, then follow the latest destination. Offscreen and background books pause. Reduced motion settles immediately. Text and links remain available when JavaScript is disabled.

## Transitions and persistence

Native cross-document View Transitions carry the named book stage between the timeline, index and country pages. The country pages also use the same-document browser API before turning pages. This deliberately leaves Astro's existing document navigation and header lifecycle intact; React's DOM wrapper is unnecessary for this Astro component. Unsupported browsers navigate normally and still get page turns.

The current spread is a per-tab session bookmark. A short-lived, destination-specific handoff restores the source position before the destination's first paint, including position zero. Reload navigation ignores and consumes pending handoffs so the index always gets a fresh drop. Back/Forward cache restoration consumes the incoming handoff before settling the destination. Direct country URLs open from the cover. The base reveal does not replay when scrolling out and back. The existing header visit guard is unchanged.

Only the currently exposed paper faces are accessible; other faces are inert and hidden from assistive technology. On country routes, the title inside each spread is an `h1` with `tabindex="0"`. Focus moves to the destination title after its leaf settles, including same-document and Back/Forward navigation. The book’s notes and captions are semantic HTML, and its navigation remains available on mobile. Current illustrations are the existing pixel artwork; no travel photos or unprovided personal stories have been invented.

## Cover asset

Saved asset: `public/images/travel/scrapbook-cover.webp` (1200px wide, WebP quality 78, 320 KiB).

Built-in image generation tool, edit mode. Input: the user's `codex-clipboard-91f85b45-656d-4bb2-a387-77c50565d9c6.png`. Generated master: `/Users/sahajr/.codex/generated_images/01a07901-3da6-70f3-ab91-2f4ad64a2872/exec-86d9fe3e-e24c-49e6-90e4-9748193bcaea.png`.

Final prompt:

> Edit target: the supplied photograph of the adventure scrapbook. Prepare a production web texture of its front cover. Preserve the brown worn leather appearance, the exact handmade multicolor lettering 'OUR ADVENTURE BOOK', the fine gold rectangular border and circular rules, the little map sticker at the bottom, and the reddish cloth binding strip on the left. Straighten the photographed cover into a perfectly front-facing flat rectangle with parallel edges, no perspective. Remove the external white background, all hanging cords/rope (we will draw separate cords in the website), all external shadows, and any visible page thickness. The flat cover must fill the ENTIRE canvas edge-to-edge with no padding or margins. Landscape aspect ratio about 1.54:1. Keep the red cloth binding strip about 16% of the width at the left, brown cover the rest. Maintain natural detailed leather grain and the original reference's colors, not cartoon/pixel style. Do not add words, symbols, objects, or embellishments. Output only the rectified front cover texture, no mockup, no scene.

The binding cord is a separate SVG plane visible only on the closed cover; it fades out when opening starts. The open spread has a narrow CSS shadow along the gutter to suggest a crease. Thickness, shadows and tape are CSS. Pages behave like stiff scrapbook leaves; realistic soft paper curling is outside this implementation.

## Paper texture

Saved asset: `public/images/travel/scrapbook-paper.webp` (960px wide, WebP quality 70), shared by every page. Organic fibers and warm mottled edges fade into a light center; CSS adds the inner crease and a gentle vignette. The texture is static, with no animated filters.

Created with the built-in image-generation tool in generate mode, guided by the user's paper reference. Generated master: `/Users/sahajr/.codex/generated_images/01a07901-3da6-70f3-ab91-2f4ad64a2872/exec-9da5e1f0-e559-4d39-85c8-ca817a54eb57.png`.

Final prompt:

> Use case: photorealistic-natural. Asset type: a reusable background texture for the inside pages of a website's adventure scrapbook. Generate a single BLANK sheet of aged scrapbook paper, straight-on flat top-down with parallel edges, landscape 4:3 aspect ratio, filling the ENTIRE image edge-to-edge. Soft warm cream ivory center with fine organic paper fibers and delicate irregular speckling, fading gradually into honey ochre and light warm sepia mottling around all four edges and corners. Gentle irregular vignette, naturally aged and tactile, nostalgic handmade memory album paper. The central 65% must remain very light, low contrast and spacious so dark text is easy to read. Subtle wispy fibers, faint cloudy uneven patches; no regular dot grid, no repeated geometric patterns. Keep the edge patina restrained and golden, not dark brown or burnt. Flat uniform lighting: no cast shadow, no perspective, no page curl, no book binding, no seam, no tabletop, no external background. Absolutely NO text, handwriting, people, illustrations, butterflies, decorations, photos, logos, or watermarks. Only blank textured paper.

## Page sounds

Three distinct paper-flick recordings play at the start of actual leaf turns, with no immediate repeats and slight playback-rate variation. A fourth recording accompanies the cover opening. Source: [Kenney RPG Audio](https://kenney.nl/assets/rpg-audio), CC0; source filenames, conversion details and the license are in `public/audio/scrapbook/`.

The small MP3 files preload when the book enters the viewport. Web Audio is only created/resumed inside a trusted click or key event, so automatic opening remains silent until the browser permits audio. Sound never delays page turns; samples that are unavailable, late, muted or offscreen are skipped. A keyboard-accessible “Page sounds” toggle persists the sound preference. Reduced-motion page jumps make no sound.

## Validation

Run `node --experimental-strip-types --test tests/*.test.mjs`, `npm run astro -- check`, and `npm run build`. Browser verification covers direct entry, exactly three flips in both directions, rapid retargeting, URL/history, the home transition, keyboard controls, and narrow layout.
