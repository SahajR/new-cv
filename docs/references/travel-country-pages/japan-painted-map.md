# Japan painted map

Implemented with the built-in image-generation tool (one base and fourteen separately generated landmark assets). Source style: [paper study](japan-paper-study-v1.png). Final transparent WebP assets: `public/images/travel/japan-map/`.

## Implementation

- The coastline is independent of the interactive landmarks. It contains no baked-in buildings or labels.
- `JapanMap.astro` supplies painted images to `TravelMapFrame` with `markersOnly` enabled. Japan uses a 0.32 marker scale (about half the previous 0.6 scale) and keeps keyboard targets, accessible place names, current-stop state and the book-to-sticky handoff.
- Japan has no visible labels, numbers, connector lines, anchor dots or map footer. Small markers sit near their illustrated locations with modest offsets around crowded regions. Hovered, keyboard-focused and current markers receive a red silhouette outline from an SVG filter. Other countries retain the labelled frame.
- `src/data/japan-map-art.json` records each sprite's painted bounds as an SVG viewBox. This normalizes transparent padding without altering the generated artwork.
- Book placement has no background or border; floating/sticky placement uses the existing scrapbook paper for legibility above scrolling content.
- At mobile widths (600px and below), the docked Japan map centers the active marker at 2× scale. A 420ms ease-out pan follows story highlights, retargeting from the current frame during fast scrolling. The book and desktop retain the wide view; reduced-motion preferences use the same framing without animation. Camera settings live in `src/scripts/travel-map-camera.ts`.
- The coastline is an illustrative rendering. Anchor positions follow its recognizable regions; this is not a navigation chart.
- Export: Sharp resize and WebP encoding, quality 86, alphaQuality 100; 1600px base and 256px markers. Original alpha is preserved. No background removal or illustration drawing was done with code.

## Base prompt

Use case: style-transfer. Asset: transparent Japan coastline base layer for an interactive scrapbook map.
Image 1 is the approved artwork STYLE reference only: delicate hand-painted acrylic shapes, muted moss green, dry brush paper grain inside the paint, fine irregular handmade edges. Image 2 is the EXACT GEOGRAPHY AND COMPOSITION GUIDE to restyle.
Redraw only the island shapes in image 2, keeping their positions, overall relative proportions, southwest-to-northeast placement and all major coastal peninsulas. Match the landscape 1780:850 canvas ratio and the same positions relative to the canvas edges. Smooth the pixel-staircase corners organically into hand-painted coasts, but keep the overall island shape and placement of the guide. Mainland Honshu, Hokkaido, Shikoku and Kyushu must remain separate islands.
Use restrained moss-green flat acrylic paint with subtle dry-brush grain and softly uneven paint coverage just like image 1. Keep roughly uniform green with slight natural pigment variations, no gradients or 3D. A few small delicate forest-green pen strokes can define coastline but no dark outline enclosing everything.
CRITICAL: genuinely transparent RGBA background everywhere outside the islands and in the sea straits. No white or off-white paper rectangle, no ocean fill, no fake checkerboard. The scrapbook supplies the paper, so paper grain should exist ONLY within painted land. No landmark objects, buildings, mountains, trees, waves, markers, labels, text, compass or borders. This is just the unlabelled base; all landmarks will be separate interactive assets. Unlike image 1 this is NOT a bottom-half book cover: use the FULL CANVAS composition of image 2. Preserve the guide's ample margins used for separate labels.

Base references: the approved style study and a raster of the existing `japanCoastline` path with its current projection, without landmarks.

## Shared landmark prompt

Every marker prompt is the following prefix plus its subject below. Image 1 is the approved style study; image 2 is the listed photograph under `public/images/travel/japan/`.

Use case: stylized-concept / style-transfer. Create ONE isolated illustrated landmark sprite for an interactive travel scrapbook map.
Image 1 is the approved STYLE reference: miniature hand-painted editorial cover art in restrained moss/forest green, slate blue-grey, oxide red and warm ivory. Image 2 is the user's SUBJECT reference photograph: preserve the landmark's essential silhouette and proportions.
Style: highly simplified recognizable silhouette, delicate slightly imperfect hand-drawn lines, a few bold clearly defined acrylic flat paint shapes, tiny dry-brush gaps and fine paper grain ONLY INSIDE the paint. Organic handmade edges. Minimal interior detail that survives at 60px tall. NOT photorealistic, not a vector icon, not 3D, no gradients, no dense scene.
Composition: one complete landmark centered, upright, filling roughly 80% of a SQUARE canvas; entire silhouette visible with modest transparent padding. No bottom-half cover composition. No separate background, rectangular landscape or paper sheet. No labels, text, numbers, logos, watermarks, frames, drop shadows or UI.
CRITICAL: output genuine RGBA transparency around and through the object, with clean natural antialiased edges and no white rectangle, green-screen fringe or checkerboard pixels. Warm ivory paint is allowed only INSIDE architectural surfaces. Use at most FOUR restrained pigments. Omit people, vehicles, foreground obstructions and photographic background unless explicitly included in the subject instruction.
Subject: 

## Landmark subjects

### castle.webp

Reference: `osaka-01-small.webp`.

Osaka Castle, a broad white-walled Japanese castle with five distinct stacked tiers, deep forest-green curved roofs, two small triangular white gables and a short stone base. White walls and green roofs are the key relationship. Simplify to flat ivory walls, forest-green roofs/ink and slate-grey base. One tiny moss-green brush at its foot only.

### temple.webp

Reference: `koyasan-01-small.webp`.

Kōyasan's quiet Okunoin cemetery: one recognizable Japanese gorinto five-element stone memorial with square plinth, rounded sphere and little curved cap, one narrow rectangular memorial alongside it, and two spare tall cedar silhouettes behind. Slate-grey stones and moss-green cedars. Just 3 objects and a short moss ground stroke; omit inscriptions.

### sun.webp

Reference: `expo-park-01-small.webp`.

Tower of the Sun at Expo Park, by itself: a tall tapered warm-ivory sculptural body with two long outward-upward pointed arms, a circular muted ochre/gold face atop its thin neck, a round grey face in the centre of the torso, and one oxide-red zigzag on each side of the body. Keep the very unusual silhouette and the two faces distinct with only minimal tiny facial strokes. Entire sculpture; no person, hat or pole. Four pigments ivory, slate-grey, oxide red, muted ochre.

### dome.webp

Reference: `hiroshima-01-small.webp`.

Hiroshima Atomic Bomb Dome, an asymmetrical low ruined slate-grey building with central taller cylindrical tower, topped by its distinctive thin open metal dome ribs. Essential broken wall silhouette, just a few dark open window strokes, three to five dome ribs, tiny moss base stroke. No fence or trees obscuring it.

### torii.webp

Reference: `miyajima-01-small.webp`.

Miyajima's great red torii gate standing in the sea: two broad oxide-red pillars, two slender supporting pillars, a single gently upcurved dark green upper crossbeam and one red lower crossbeam. Just two broken slate-blue water strokes at the foot. Show the complete gate, front view, essential silhouette only. No stone lantern, hills or trees.

### pagoda.webp

Reference: `kyoto-01-small.webp`.

Kyoto's Yasaka Pagoda: exactly five wide dark forest-green Japanese roof tiers with upturned corners, each smaller than the one beneath, a very slender stacked finial at the top and minimal slate-grey timber walls between the eaves. Preserve the five-tier silhouette. Omit street, people, trees and surrounding buildings. Very simple, no intricate window or roof tile detail.

### tower.webp

Reference: `tokyo-01-small.webp`.

Tokyo Skytree, the white lattice broadcasting tower where the user's city-view photo was taken. This reference photo is taken FROM the tower, do not draw the view or windows; draw its recognizable exterior silhouette. A very slender gently tapering warm-ivory/slate-grey column, a wider softly rounded observation deck roughly two-thirds up, a much smaller deck above it and a long thin needle antenna. Minimal slate-grey lattice strokes. Not the red Tokyo Tower, not Eiffel Tower. Just one isolated upright Skytree with a little base stroke.

### buddha.webp

Reference: `kamakura-01-small.webp`.

The Great Buddha of Kamakura: the serene patinated moss-green bronze statue seated cross-legged, upright head with curled hair and elongated ears, hands joined in its lap, rounded shoulders draped with a robe. Keep the iconic seated silhouette and bowed calm face, just three delicate robe folds, tiny flat slate-grey pedestal. Omit foreground people, hats, umbrellas and trees.

### seaside-station.webp

Reference: `kamakurakokomae-02.webp`.

The seaside railway crossing at Kamakurakōkōmae: one ochre-and-dark-forest-green striped crossing pole with a small X crossbuck and two round signals, a few thin parallel railway tracks at the foot, and two slate-blue sea brushstrokes just behind. The relationship between rail and sea is essential. No invented train, people, cars, sky or full landscape rectangle. Make it extremely spare and instantly legible as a seaside crossing.

### island-shrine.webp

Reference: `enoshima-03.webp`.

Enoshima's stone torii gate beneath trees: pale slate-grey broad upright stone pillars and a gently curved stone upper beam, a sagging thick sacred rope between the pillars with three simplified tassels, two minimal moss-green foliage strokes beside it. Flat frontal silhouette. Distinct from the red Miyajima gate. Omit all wires, people and inscriptions.

### fuji-lake.webp

Reference: `lake-kawaguchiko-02.webp`.

Snow-capped Mount Fuji seen across Lake Kawaguchiko, with tiny blue flowers on the near bank. One simple broad triangular slate-blue mountain with small jagged warm-ivory snowcap, two low blue lake strokes immediately below, and five tiny flower dots with minimal moss-green foliage at the foot. The mountain-lake-flowers relationship is essential. No rectangular landscape, horizon extending to canvas edge or sky.

### fuji-shop.webp

Reference: `fuji-lawson-01-small.webp`.

The little Lawson shop beneath Mount Fuji: one low flat-roofed warm-ivory convenience store with a single slate-blue sign band and three minimal dark window/door rectangles, a snow-topped slate-blue Fuji mountain clearly visible directly behind the shop roof. Keep the mountain above and shop below, iconic stacked silhouette. Omit all lettering, people, cars, wires and parking lot. Four pigments ivory, slate-blue, forest-green ink and muted grey.

### pond-village.webp

Reference: `oshino-hakkai-01-small.webp`.

Oshino Hakkai: a small traditional Japanese thatched-roof village house behind a clear spring pond. One broad simple grey-green sloped thatched roof with a short ridge, two dark timber wall strokes, one flat slate-blue oval pond below, and a single small moss-green shrub at one side. A tiny oxide-red foliage dab may suggest the photo's red maple. Extremely simple compact vignette, no full landscape, no horizon, no rectangle.

### fuji-pagoda.webp

Reference: `chureito-pagoda-01-small.webp`.

Chureito Pagoda and Mount Fuji together: the five-tier oxide-red pagoda with dark forest-green curved eaves and a thin finial at RIGHT; a broad slate-blue Mount Fuji with warm-ivory snowcap at LEFT behind it. Keep the recognizable juxtaposition and proportions. Pagoda slightly taller in frame than Fuji. A tiny moss-green base stroke connects them. No fence, people, buildings, sky or landscape rectangle. Exactly five roof tiers, only essential flat shapes.
