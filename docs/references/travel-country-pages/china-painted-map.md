# China painted map

Created with the built-in imagegen tool. The base and eleven independent transparent landmark sprites extend the painted map treatment used for Japan, Egypt and Jordan.

## Implementation

- Final assets: `public/images/travel/china-map/`.
- Each landmark uses the corresponding travel photograph as its subject reference. Zhujiajiao is the water town previously confirmed by Sahaj.
- The geography guide is rasterized from the existing public-domain Natural Earth outline. Its projection and placement stay fixed; generation adds the handmade paint treatment.
- `PaintedTravelMap.astro` supplies marker links, red active outlines, a full-country desktop view, and centered 2× mobile follow after the map docks.
- Beijing markers retain small readability offsets. Shanghai now uses the city cluster described below, with geographic positions in the close view.
- Sharp only resizes and encodes the generated RGBA artwork into WebP (quality 86, alphaQuality 100). Transparency and paint texture are preserved without background removal or redrawing.
- The base is 1200×1200; each marker is fitted without distortion into a transparent 256×256 canvas. Alpha-content bounds in `src/data/china-map-art.json` compensate for differing margins and proportions.
- The generated base's painted extent is aligned to the existing geographic bounds (`x=108–628`, `y=92–360`). Its SVG placement is `[90.86, -45.36, 551.21, 526.76]`, and marker scale is `0.23`.
- The twelve exported assets total 313,154 bytes. The wide palace cutout preserves clean alpha; a glow visible in the initial generation preview is absent from the exported asset.

## Validation

- All twelve exported assets retain alpha transparency (52–78% fully transparent pixels).
- The eleven marker hit targets do not overlap.
- Desktop shows the full painted map directly on the book paper. Phone checks at 390px and 320px verified the docked map, red active outline and centered 2× follow. Scrolling from the Shanghai skyline to the zoo changes the selected landmark and camera position.
- Browser console: no errors during the final check.
- `node --test tests/*.test.mjs`: all 51 tests pass.
- `astro check`: no errors or warnings; one existing unused-prop hint in `JourneyPart.astro`.
- `npm run build`: 52 pages built successfully.

## Shanghai city cluster

- The overview shows one skyline icon with six gently separated dots. Selecting the city, or scrolling into its stories, expands the cluster on desktop and mobile once the map has docked.
- Five sights use GPS from the imported photographs. Zhujiajiao uses the center of the town confirmed by Sahaj (its photograph has no GPS). The detail projection is identical to the country projection; no spacing offsets are applied in the city view.
- At country scale, the Bund and Yuyuan are less than 0.08 SVG units apart. A 1100× geographic camera view separates them, while inverse scaling keeps artwork at roughly 40px or larger and retains the thin red selection outline.
- Camera movement takes 760ms, retargets interrupted motion, and resolves immediately for reduced motion. As the country artwork fades, a local vector layer supplies rivers and major streets. Icons appear toward the end of the approach. Leaving Shanghai or choosing “China” restores the overview; reading the next Shanghai stop reopens the detail.
- Offscreen and collapsed landmark links are removed from keyboard navigation. Only visible landmarks are interactive. Ordinary card links remain available throughout.
- Configuration lives in `src/data/china.ts`; shared cluster rendering lives in `TravelMapFrame.astro` and `travel-map-clusters.ts`. Another city can use the same optional cluster configuration without changing the other country maps.

### Geographic detail data

`public/images/travel/china-map/shanghai-detail.svg` contains simplified map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), licensed under the [Open Database License](https://opendatacommons.org/licenses/odbl/1-0/). Visible attribution is shown whenever the city detail is open. The extracted geometry is available directly in this SVG; its geographic projection is documented in `chinaMapPoint` and the build script.

The general metropolitan extent was downloaded from `https://overpass-api.de/api/interpreter` on 17 September 2026, using this public query (no photograph coordinates were transmitted):

```overpass
[out:json][timeout:60];
(
  way(31.0,121.1,31.4,121.8)[waterway~"^(river|canal)$"];
  way(31.0,121.1,31.4,121.8)[natural=water];
  way(31.0,121.1,31.4,121.8)[highway~"^(primary|secondary|trunk|motorway)$"];
);
out geom;
```

Rebuild from a downloaded JSON response with `python3 scripts/build-shanghai-detail.py /path/to/shanghai-osm.json`. The script trims and simplifies the geometry locally. The static SVG is about 493kB before HTTP compression, loads only on the first city entry, and requires no runtime map service, API key, or external request.

Validation: 55 tests pass, including deep zoom, interruption/return, reduced-motion snapping, and cluster keyboard visibility. Astro check has no errors or warnings (one pre-existing unused-prop hint). Desktop and 390px mobile checks confirm geographic placement, centered selection, scroll following, and the country overview control.

## Prompt set

### base.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `docs/references/travel-country-pages/china-geography-guide.png`

Use case: style-transfer. Asset: ONE transparent painted China map BASE for an interactive travel scrapbook. Reference image 1 is STYLE only: restrained flat handmade acrylic, visible dry brush, fine grain and organic edges. Image 2 is the EXACT SILHOUETTE, GEOGRAPHY AND POSITION GUIDE.
Restyle only the supplied land shape. Preserve its north-up silhouette, wide proportions, coastline, northeast projection, small southern island, and the exact size and placement inside the SQUARE canvas. In the guide the land spans roughly x=5–94% and y=24–71%; keep these margins exactly, do not enlarge it to fill the height. Smooth the coarse stair-step edges into slightly irregular natural hand-drawn edges without changing the overall outline. Preserve the guide's narrow river path, painted as one restrained flowing slate-teal line. Use a broad pale muted olive land shape, sandy-ochre northwest and a few slightly deeper sage patches toward the south. At most four muted main colors. Grain and tiny dry-brush paint gaps stay INSIDE land only.
CRITICAL: true RGBA transparent background everywhere outside the supplied land silhouette, including the large empty top and bottom areas and water around the small island. No paper sheet, white rectangle, checkerboard, ocean fill, neighboring geography, borders or shadows. No buildings, landmarks, markers, mountains, trees, arrows, routes, labels, text, numbers or compass. This is the base only; independent landmark sprites will be overlaid later.

### palace.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/china/forbidden-city-04.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for China's interactive travel scrapbook, matching the approved handmade Japan, Egypt and Jordan maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing the desired paint texture, simplicity and true transparency; Image 3 is the user's SUBJECT photograph.
Extract only the most recognizable silhouette and essential proportions. HIGHLY SIMPLIFY: delicate slightly imperfect hand-drawn lines, a few bold flat acrylic color shapes, fine paper grain and dry brush marks ONLY INSIDE the paint. At most FOUR restrained main colors extracted from the subject. No gradients, photorealism, 3D, neon glow or polished vector edges. Avoid tiny decorative detail; the result must read as a small 30px landmark.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Use the full composition, not the bottom half. CRITICAL: genuine RGBA transparent background around and through the subject. No paper sheet, white rectangle, checkerboard, cast shadow, frame, labels, writing, numbers, logo or watermark. Omit people and the photographic background, roads, fences and sky. Environment only where expressly requested below, using very few shapes.
Subject: The Forbidden City in Beijing: one broad imperial hall with a deep muted vermilion facade, two sweeping stacked golden-ochre hip roofs with upturned eaves, a sparse line of dark columns, and a small pale stone terrace with a central stair. Preserve the hall's wide horizontal proportions and iconic layered roof profile. Simplify ornament into at most three tiny roof-tip strokes. Four colors: oxide red, muted gold, dark forest-ink and pale ivory.

### wall.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/china/mutianyu-great-wall-02.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for China's interactive travel scrapbook, matching the approved handmade Japan, Egypt and Jordan maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing the desired paint texture, simplicity and true transparency; Image 3 is the user's SUBJECT photograph.
Extract only the most recognizable silhouette and essential proportions. HIGHLY SIMPLIFY: delicate slightly imperfect hand-drawn lines, a few bold flat acrylic color shapes, fine paper grain and dry brush marks ONLY INSIDE the paint. At most FOUR restrained main colors extracted from the subject. No gradients, photorealism, 3D, neon glow or polished vector edges. Avoid tiny decorative detail; the result must read as a small 30px landmark.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Use the full composition, not the bottom half. CRITICAL: genuine RGBA transparent background around and through the subject. No paper sheet, white rectangle, checkerboard, cast shadow, frame, labels, writing, numbers, logo or watermark. Omit people and the photographic background, roads, fences and sky. Environment only where expressly requested below, using very few shapes.
Subject: Mutianyu Great Wall: one short S-curving section of pale gray stone wall climbing a muted olive hill between two square crenellated watchtowers. Preserve the rising serpentine line, broad wall and battlements. Tiny sloped dark roof on the lower watchtower as in the photo, one open arch on each tower. Two hill paint shapes only, a few marks for battlements, no detailed masonry or individual trees. Palette: gray-stone, olive, pale ivory and charcoal.

### stadium.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/china/birds-nest-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for China's interactive travel scrapbook, matching the approved handmade Japan, Egypt and Jordan maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing the desired paint texture, simplicity and true transparency; Image 3 is the user's SUBJECT photograph.
Extract only the most recognizable silhouette and essential proportions. HIGHLY SIMPLIFY: delicate slightly imperfect hand-drawn lines, a few bold flat acrylic color shapes, fine paper grain and dry brush marks ONLY INSIDE the paint. At most FOUR restrained main colors extracted from the subject. No gradients, photorealism, 3D, neon glow or polished vector edges. Avoid tiny decorative detail; the result must read as a small 30px landmark.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Use the full composition, not the bottom half. CRITICAL: genuine RGBA transparent background around and through the subject. No paper sheet, white rectangle, checkerboard, cast shadow, frame, labels, writing, numbers, logo or watermark. Omit people and the photographic background, roads, fences and sky. Environment only where expressly requested below, using very few shapes.
Subject: Beijing's Bird's Nest stadium: a low broad oval bowl with warm muted orange and oxide red interior, wrapped in a small number of crisscrossing pale gray steel strokes. Preserve its distinctive open oval stadium silhouette and irregular nest lattice, simplified to 10–12 bold crossing strokes. Slightly elevated three-quarter view shows the dark opening and curved bowl. No plaza, trees, lights or night sky. Palette: warm ochre, oxide red, ivory-gray and charcoal.

### lotus.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/china/hangzhou-olympic-sports-centre-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for China's interactive travel scrapbook, matching the approved handmade Japan, Egypt and Jordan maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing the desired paint texture, simplicity and true transparency; Image 3 is the user's SUBJECT photograph.
Extract only the most recognizable silhouette and essential proportions. HIGHLY SIMPLIFY: delicate slightly imperfect hand-drawn lines, a few bold flat acrylic color shapes, fine paper grain and dry brush marks ONLY INSIDE the paint. At most FOUR restrained main colors extracted from the subject. No gradients, photorealism, 3D, neon glow or polished vector edges. Avoid tiny decorative detail; the result must read as a small 30px landmark.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Use the full composition, not the bottom half. CRITICAL: genuine RGBA transparent background around and through the subject. No paper sheet, white rectangle, checkerboard, cast shadow, frame, labels, writing, numbers, logo or watermark. Omit people and the photographic background, roads, fences and sky. Environment only where expressly requested below, using very few shapes.
Subject: The Hangzhou Olympic Sports Centre Tennis Centre, Little Lotus: one low circular stadium shaped from overlapping curved silver-ivory petals, their broad pointed tips tilting outward. Use 5–7 large flat petal shapes and very spare slate gray contour strokes to capture the photographed twisting petal facade. Small dark entrance and low oval base. Preserve the rounded stadium proportions; no tall flower stalk or literal plant. Palette: ivory, slate gray, muted sage and dark gray.

### pavilion.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/china/west-lake-02.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for China's interactive travel scrapbook, matching the approved handmade Japan, Egypt and Jordan maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing the desired paint texture, simplicity and true transparency; Image 3 is the user's SUBJECT photograph.
Extract only the most recognizable silhouette and essential proportions. HIGHLY SIMPLIFY: delicate slightly imperfect hand-drawn lines, a few bold flat acrylic color shapes, fine paper grain and dry brush marks ONLY INSIDE the paint. At most FOUR restrained main colors extracted from the subject. No gradients, photorealism, 3D, neon glow or polished vector edges. Avoid tiny decorative detail; the result must read as a small 30px landmark.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Use the full composition, not the bottom half. CRITICAL: genuine RGBA transparent background around and through the subject. No paper sheet, white rectangle, checkerboard, cast shadow, frame, labels, writing, numbers, logo or watermark. Omit people and the photographic background, roads, fences and sky. Environment only where expressly requested below, using very few shapes.
Subject: The double-roof lakeside pavilion at West Lake in Hangzhou: a small open four-post pavilion with two dark sweeping upturned roofs and a pointed finial, standing beside two muted slate-teal water strokes. Include only three broad olive lotus leaves low at one side. The transparent opening under the roofs, slender posts, roof shape and water are essential. No other buildings, willow canopy, people or expansive landscape. Palette: dark forest-ink, warm wood ochre, muted olive and slate teal.

### skyline.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/china/shanghai-waterfront-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for China's interactive travel scrapbook, matching the approved handmade Japan, Egypt and Jordan maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing the desired paint texture, simplicity and true transparency; Image 3 is the user's SUBJECT photograph.
Extract only the most recognizable silhouette and essential proportions. HIGHLY SIMPLIFY: delicate slightly imperfect hand-drawn lines, a few bold flat acrylic color shapes, fine paper grain and dry brush marks ONLY INSIDE the paint. At most FOUR restrained main colors extracted from the subject. No gradients, photorealism, 3D, neon glow or polished vector edges. Avoid tiny decorative detail; the result must read as a small 30px landmark.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Use the full composition, not the bottom half. CRITICAL: genuine RGBA transparent background around and through the subject. No paper sheet, white rectangle, checkerboard, cast shadow, frame, labels, writing, numbers, logo or watermark. Omit people and the photographic background, roads, fences and sky. Environment only where expressly requested below, using very few shapes.
Subject: Shanghai's Lujiazui skyline viewed from the Bund: a compact grouping of three recognizable towers — the slender Oriental Pearl Tower with two rose-red spheres and needle at left, the blue-gray World Financial Center with its trapezoid opening, and taller gently twisting Shanghai Tower at right. Two thin slate-teal river strokes at the foot. Simplify to essential building silhouettes, at most three window marks each. Four muted pigments: oxide rose, slate teal, pale ivory and charcoal. No night sky, cars, billboards, roads or extra skyline.

### tortoise.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/china/shanghai-zoo-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for China's interactive travel scrapbook, matching the approved handmade Japan, Egypt and Jordan maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing the desired paint texture, simplicity and true transparency; Image 3 is the user's SUBJECT photograph.
Extract only the most recognizable silhouette and essential proportions. HIGHLY SIMPLIFY: delicate slightly imperfect hand-drawn lines, a few bold flat acrylic color shapes, fine paper grain and dry brush marks ONLY INSIDE the paint. At most FOUR restrained main colors extracted from the subject. No gradients, photorealism, 3D, neon glow or polished vector edges. Avoid tiny decorative detail; the result must read as a small 30px landmark.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Use the full composition, not the bottom half. CRITICAL: genuine RGBA transparent background around and through the subject. No paper sheet, white rectangle, checkerboard, cast shadow, frame, labels, writing, numbers, logo or watermark. Omit people and the photographic background, roads, fences and sky. Environment only where expressly requested below, using very few shapes.
Subject: A single large land tortoise from Shanghai Zoo, shown in a low three-quarter side view facing right. Preserve the high rounded domed shell, broad low elephant-like legs and small extended head. Five or six irregular shell plate shapes and one tiny eye, no intricate scales. Tiny grounding brush only. Palette: subdued olive-gray, sandy ochre, warm ivory and dark gray. No enclosure, other animals or trees.

### bazaar.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/china/yuyuan-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for China's interactive travel scrapbook, matching the approved handmade Japan, Egypt and Jordan maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing the desired paint texture, simplicity and true transparency; Image 3 is the user's SUBJECT photograph.
Extract only the most recognizable silhouette and essential proportions. HIGHLY SIMPLIFY: delicate slightly imperfect hand-drawn lines, a few bold flat acrylic color shapes, fine paper grain and dry brush marks ONLY INSIDE the paint. At most FOUR restrained main colors extracted from the subject. No gradients, photorealism, 3D, neon glow or polished vector edges. Avoid tiny decorative detail; the result must read as a small 30px landmark.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Use the full composition, not the bottom half. CRITICAL: genuine RGBA transparent background around and through the subject. No paper sheet, white rectangle, checkerboard, cast shadow, frame, labels, writing, numbers, logo or watermark. Omit people and the photographic background, roads, fences and sky. Environment only where expressly requested below, using very few shapes.
Subject: One traditional multi-storey Yuyuan Bazaar building from the photo: a tall narrow red-brown timber facade with three pronounced sweeping upturned roof tiers, warm golden roof-edge strokes, ivory wall panels and dark window openings. Add just one small red hanging lantern at the eave. Preserve the vertical stack of roofs and warm night-photo colors but no glow effect or night background. Four pigments: oxide red, muted ochre gold, ivory and charcoal. No readable shop signs, neighboring buildings or visitors.

### castle.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/china/shanghai-disneyland-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for China's interactive travel scrapbook, matching the approved handmade Japan, Egypt and Jordan maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing the desired paint texture, simplicity and true transparency; Image 3 is the user's SUBJECT photograph.
Extract only the most recognizable silhouette and essential proportions. HIGHLY SIMPLIFY: delicate slightly imperfect hand-drawn lines, a few bold flat acrylic color shapes, fine paper grain and dry brush marks ONLY INSIDE the paint. At most FOUR restrained main colors extracted from the subject. No gradients, photorealism, 3D, neon glow or polished vector edges. Avoid tiny decorative detail; the result must read as a small 30px landmark.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Use the full composition, not the bottom half. CRITICAL: genuine RGBA transparent background around and through the subject. No paper sheet, white rectangle, checkerboard, cast shadow, frame, labels, writing, numbers, logo or watermark. Omit people and the photographic background, roads, fences and sky. Environment only where expressly requested below, using very few shapes.
Subject: Shanghai Disneyland's Enchanted Storybook Castle: a compact fairy-tale castle with pale dusty rose walls, blue-slate pointed spires at different heights, a large central arched opening and tiny gold finials. Preserve the central tall cluster of slender towers and lower round turrets, in a slight three-quarter view like the photograph. Highly simplify to only five principal towers and a few dark window dashes. Four pigments: dusty rose, blue-slate, warm ivory and muted gold. No flags with logos, gardens, guests, sky or fireworks.

### train.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/china/shanghai-maglev-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for China's interactive travel scrapbook, matching the approved handmade Japan, Egypt and Jordan maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing the desired paint texture, simplicity and true transparency; Image 3 is the user's SUBJECT photograph.
Extract only the most recognizable silhouette and essential proportions. HIGHLY SIMPLIFY: delicate slightly imperfect hand-drawn lines, a few bold flat acrylic color shapes, fine paper grain and dry brush marks ONLY INSIDE the paint. At most FOUR restrained main colors extracted from the subject. No gradients, photorealism, 3D, neon glow or polished vector edges. Avoid tiny decorative detail; the result must read as a small 30px landmark.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Use the full composition, not the bottom half. CRITICAL: genuine RGBA transparent background around and through the subject. No paper sheet, white rectangle, checkerboard, cast shadow, frame, labels, writing, numbers, logo or watermark. Omit people and the photographic background, roads, fences and sky. Environment only where expressly requested below, using very few shapes.
Subject: Shanghai's Maglev train: one short streamlined white train viewed from the front-left in three-quarter perspective, its sloping rounded nose, large black wraparound windscreen, thin blue-teal side stripe and tiny warm red headlight marks. Preserve the distinctive wedge-like nose and broad dark windshield from the photograph. A short section of parallel guideway underneath, no wheels, platform, people, roof or signs. Four pigments: ivory, charcoal, slate teal and muted red.

### canal.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/china/zhujiajiao-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for China's interactive travel scrapbook, matching the approved handmade Japan, Egypt and Jordan maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing the desired paint texture, simplicity and true transparency; Image 3 is the user's SUBJECT photograph.
Extract only the most recognizable silhouette and essential proportions. HIGHLY SIMPLIFY: delicate slightly imperfect hand-drawn lines, a few bold flat acrylic color shapes, fine paper grain and dry brush marks ONLY INSIDE the paint. At most FOUR restrained main colors extracted from the subject. No gradients, photorealism, 3D, neon glow or polished vector edges. Avoid tiny decorative detail; the result must read as a small 30px landmark.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Use the full composition, not the bottom half. CRITICAL: genuine RGBA transparent background around and through the subject. No paper sheet, white rectangle, checkerboard, cast shadow, frame, labels, writing, numbers, logo or watermark. Omit people and the photographic background, roads, fences and sky. Environment only where expressly requested below, using very few shapes.
Subject: Zhujiajiao water town: one narrow warm wooden sampan boat with a simple canopy on a tiny slate-teal canal patch, beside two whitewashed houses with dark gray tiled sloping roofs. A small pale stone arch bridge behind them, highly simplified. Preserve the boat-on-water and waterside-house relationship visible in the photo; only 2–3 line marks suggest ripples. Four pigments: ivory, warm wood ochre, dark olive-gray and slate teal. No full landscape rectangle, people, umbrellas, lantern strings or dense tree canopy.
