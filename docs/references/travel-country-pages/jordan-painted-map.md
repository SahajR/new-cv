# Jordan painted map

Created with the built-in imagegen tool. The map base and five independently generated transparent landmark sprites use the same handmade acrylic treatment as Japan and Egypt.

## Implementation

- Final assets: `public/images/travel/jordan-map/`.
- Separate markers: Amman (citadel), Petra (treasury), Wadi Rum (camp), Aqaba (waterfront), Dead Sea (sea).
- Geography guide is rasterized from the existing public-domain Natural Earth country outline. It fixes projection and placement while generation adds the painted texture.
- All paint textures are confined to the illustration; surrounding pixels remain transparent so the scrapbook paper shows through.
- Shared `PaintedTravelMap.astro` supplies the compact symbols, red active outline and mobile camera. Desktop shows the full country; mobile centers the current stop at 2× zoom once docked.
- Sharp only resizes and encodes the generated RGBA assets to WebP (quality 86, alphaQuality 100). No background removal or illustration drawing in postprocessing.
- The 1200×1200 base occupies map coordinates `[330, 10, 350, 350]`; each marker is a 256×256 cutout displayed at scale `0.23`. Alpha-content bounds are recorded in `src/data/jordan-map-art.json` so differing source margins do not shrink individual landmarks.
- The six exported files total 267,720 bytes. Marker positions use small offsets from the original geographic anchors to keep their hit targets separate.

## Validation

- All six assets have real alpha transparency (31–69% fully transparent pixels).
- All five marker hit targets are separate; no pair overlaps.
- Desktop book placement is transparent and shows the full map. At 390px mobile width, landmark navigation and scrolling activate the red outline, dock the map and center the chosen marker at exactly 2× scale.
- `node --test tests/*.test.mjs`: 51 passing tests.
- `astro check`: no errors or warnings; one existing unused-prop hint in `JourneyPart.astro`.
- `npm run build`: 52 pages built successfully.

## Prompt set

### base.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `docs/references/travel-country-pages/jordan-geography-guide.png`

Use case: style-transfer. Asset: ONE transparent painted Jordan map BASE for an interactive travel scrapbook. Image 1 is STYLE only: handmade acrylic paint, fine grain, restrained pigment, irregular organic edges. Image 2 is the EXACT GEOGRAPHY AND POSITION GUIDE.
Restyle Jordan's country silhouette from image 2, retaining its north-up proportions, full extent, placement and margins on the square canvas: the long narrow western edge, projecting northeastern arm and southeastern inward angle. Smooth the pixel stair-steps into a hand-drawn boundary WITHOUT changing the country's overall shape or relative positions. Keep the tiny Dead Sea shape on the western edge and the small Gulf of Aqaba stroke at the bottom-left in the same positions.
A single restrained sandy ochre land shape with a narrow subdued olive western strip and soft-edged muted rose sandstone region in the southwest. Two tiny slate-teal water shapes. At most four muted main colors. Fine grain, dry brush texture and subtle paint gaps INSIDE colored land only. Use the full square composition and guide margins.
CRITICAL: genuine RGBA transparency everywhere outside Jordan and the two small painted water shapes. No background sheet, white rectangle, checkerboard, ocean background fill, neighboring countries or shadows. No buildings, landmarks, monuments, trees, mountains, arrows, routes, labels, text, numbers, compass or border decoration. Only the country land and its two small water details; landmark markers will be added independently.

### citadel.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/egypt-map/terraces.webp`
- `public/images/travel/jordan/amman-05.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Jordan's interactive travel scrapbook, matching the handmade Japan and Egypt maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished Egypt cutout showing the desired handmade texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, a maximum of 4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Palette extracted from the subject: warm sandy ochre, muted rose sandstone, subdued olive or slate teal as needed, dark warm umber for spare linework. Keep the palette harmonious, no excessive color variation. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: Amman's Temple of Hercules at the Citadel: two tall pale sandstone columns joined by one short horizontal lintel, with one shorter broken column beside them. A very small irregular stone plinth at their foot. Preserve the slender twin upright proportions and open space between them; just a few umber strokes suggest weathered capitals. Omit the foreground cypress tree, city, visitors, rails and lights.

### treasury.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/egypt-map/terraces.webp`
- `public/images/travel/jordan/petra-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Jordan's interactive travel scrapbook, matching the handmade Japan and Egypt maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished Egypt cutout showing the desired handmade texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, a maximum of 4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Palette extracted from the subject: warm sandy ochre, muted rose sandstone, subdued olive or slate teal as needed, dark warm umber for spare linework. Keep the palette harmonious, no excessive color variation. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: Petra's Treasury carved from rose sandstone: preserve its tall two-level facade, six lower columns around a central dark doorway, triangular lower pediment, and a central round upper tholos with a tiny urn, flanked by broken pediments. Simplify into a few rose and sand flat paint shapes, with umber openings; very spare irregular linework. A narrow rugged sandstone edge around the facade is enough to imply the cliff. No expansive cliff background, visitors, camels, plaza or sky.

### camp.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/egypt-map/terraces.webp`
- `public/images/travel/jordan/wadi-rum-03.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Jordan's interactive travel scrapbook, matching the handmade Japan and Egypt maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished Egypt cutout showing the desired handmade texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, a maximum of 4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Palette extracted from the subject: warm sandy ochre, muted rose sandstone, subdued olive or slate teal as needed, dark warm umber for spare linework. Keep the palette harmonious, no excessive color variation. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: Wadi Rum desert camp: one small pale ivory geodesic dome tent with a dark doorway in front of two broad distinctive rose sandstone rock formations. Preserve the relationship of the low rounded tent and taller irregular desert rocks. Only 3–4 thin lines suggest the dome seams. A tiny rose-sand grounding brushstroke. No other tents, buildings, fencing, people, camels, horizon or sky.

### waterfront.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/egypt-map/terraces.webp`
- `public/images/travel/jordan/aqaba-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Jordan's interactive travel scrapbook, matching the handmade Japan and Egypt maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished Egypt cutout showing the desired handmade texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, a maximum of 4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Palette extracted from the subject: warm sandy ochre, muted rose sandstone, subdued olive or slate teal as needed, dark warm umber for spare linework. Keep the palette harmonious, no excessive color variation. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: Aqaba's Red Sea waterfront: one tall date palm on a tiny sandy quay next to a small simple cream flat-roof waterfront building, with two restrained slate-teal sea brushstrokes at the foot. Preserve the recognizable palm silhouette, simple square building and relationship to the sea. One low sandy mountain contour behind may be suggested with a single brush mark. Omit roads, railings, fencing, cars, flag, distant city and sky.

### sea.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/egypt-map/terraces.webp`
- `public/images/travel/jordan/dead-sea-04.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Jordan's interactive travel scrapbook, matching the handmade Japan and Egypt maps.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished Egypt cutout showing the desired handmade texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, a maximum of 4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Palette extracted from the subject: warm sandy ochre, muted rose sandstone, subdued olive or slate teal as needed, dark warm umber for spare linework. Keep the palette harmonious, no excessive color variation. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: The Dead Sea shoreline: one simple straw sun parasol on a slender pole, a narrow irregular sandy shore and a calm slate-teal patch of water beside it. Two pale broken dry-brush lines suggest the salt edge and quiet ripples. Preserve the recognizable broad conical parasol and serene shoreline relationship. Make a compact isolated vignette, no full landscape rectangle. No people, lounge chairs, boats, palm trees, distant mountains or sky.
