# Egypt painted map

Generated with the built-in image-generation tool, matching the approved Japan paper-map study. Final transparent WebP assets: `public/images/travel/egypt-map/`.

## Implementation

- A separate ochre country silhouette includes the Nile valley and delta. All nine landmarks are independent interactive cutouts derived from the imported photographs.
- `PaintedTravelMap.astro` is shared with Japan: no visible labels, numbers, connector lines or map footer, and red silhouette outlines for the selected, hovered or keyboard-focused landmark. Egypt uses a 0.23 marker scale with proportionate hit areas to match Japan's on-screen illustration sizes within its taller geography.
- `src/data/egypt-map-art.json` frames each sprite's painted bounds without altering its transparent pixels. The map base uses the existing geographic projection at `335 5 330 330`.
- Compact Cairo/Giza and Luxor groups use small offsets to separate nearby sights. These are illustrative positions, not a navigation chart. Original geographic anchors remain in `src/data/egypt.ts`.
- The Grand Egyptian Museum marker depicts the photographed animal-shaped ceremonial bed; the tomb marker depicts the burial display instead of inventing a gold mask.
- The full map lives on the book's right page and retains the existing scroll handoff. On mobile, the docked map follows the active stop at 2× zoom with a 420ms pan; reduced motion uses instant framing.
- Asset export uses Sharp for resizing and WebP encoding (quality 86, alphaQuality 100). Generated transparency and handmade paint texture are preserved; artwork is not recreated or background-removed in code.

## Prompt set

### base.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `docs/references/travel-country-pages/egypt-geography-guide.png`

Use case: style-transfer. Asset: ONE transparent painted Egypt map BASE for an interactive travel scrapbook. Image 1 is STYLE only: handmade acrylic paint, fine grain, restrained pigment, irregular edges. Image 2 is the EXACT GEOGRAPHY AND POSITION GUIDE.
Restyle the Egypt country silhouette from image 2: keep its north-up proportions and placement on a square canvas, its straight western and southern borders, organic northern Mediterranean coastline, the triangular Sinai peninsula and separate Red Sea gulf cutouts. Smooth the pixel stair-steps into a natural coast without changing the silhouette's overall position. Keep the Nile river and its green valley and delta in the same positions, but draw them as restrained narrow hand-painted strokes with natural curves. Desert should be one warm muted sandy-ochre paint shape, Nile valley moss green and river slate teal. At most four muted colors. Fine grain, dry brush texture and subtle paint gaps INSIDE colored land only. Use the full square composition and guide margins. CRITICAL: real RGBA transparency everywhere outside Egypt and in sea/gulf cutouts; no background sheet, white rectangle, checkerboard, ocean fill or neighboring countries. No buildings, monuments, trees, mountains, arrows, labels, text, numbers, compass, border decoration or shadow. Only land, Nile and its green valley; markers will be added independently.

### columns.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/egypt/karnak-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Egypt's interactive travel scrapbook, matching the handmade Japan map.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing desired texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, 3–4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Use sandy ochre, warm ivory, muted umber, with slate teal only if needed. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight architectural vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: Karnak's Great Hypostyle Hall: a tight cluster of three enormous sandstone columns, two tall columns with broad papyrus-bell capitals and one slightly shorter column beside them. Preserve their massive vertical proportions and a tiny stone plinth. Suggest carved bands with just 3–4 irregular umber dashes per column, no detailed hieroglyphs. Omit the person.

### pylon.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/egypt/luxor-temple-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Egypt's interactive travel scrapbook, matching the handmade Japan map.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing desired texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, 3–4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Use sandy ochre, warm ivory, muted umber, with slate teal only if needed. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight architectural vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: Luxor Temple from this photo: two seated sandstone pharaoh colossi flanking a pair of tall columns. The broad seated figures, tall headdresses, straight arms resting on knees and vertical temple columns are essential. Render just two simplified statues and two columns behind, compact symmetrical grouping. No extra obelisk or wall. Omit the visitor.

### tomb.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/egypt/tutankhamun-tomb-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Egypt's interactive travel scrapbook, matching the handmade Japan map.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing desired texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, 3–4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Use sandy ochre, warm ivory, muted umber, with slate teal only if needed. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight architectural vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: Tutankhamun's tomb: simplify the low rectangular burial display in this photo into a small ivory stone burial chamber fragment with a dark horizontal mummy-shaped form resting in a shallow ochre coffin, a spare thin slate-teal rectangular outline suggesting its glass case, and a low irregular sandstone wall behind. Respectful abstract shape, no detailed remains. The horizontal case inside warm stone chamber is the key relationship. Omit visitors, faces, modern lights and labels.

### terraces.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/egypt/hatshepsut-temple-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Egypt's interactive travel scrapbook, matching the handmade Japan map.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing desired texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, 3–4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Use sandy ochre, warm ivory, muted umber, with slate teal only if needed. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight architectural vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: Hatshepsut's temple at Deir el-Bahari: the very wide symmetrical three-level terraced temple, a central ascending ramp, and spare dark vertical colonnade strokes. A single low irregular sandstone cliff silhouette behind it. Keep its stepped horizontal proportions and central ramp. No foreground people, plaza or sky.

### pyramids.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/egypt/giza-plateau-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Egypt's interactive travel scrapbook, matching the handmade Japan map.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing desired texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, 3–4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Use sandy ochre, warm ivory, muted umber, with slate teal only if needed. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight architectural vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: Giza plateau: three simple sandy ochre pyramids at slightly different sizes and depths, the central pyramid largest, a small third pyramid at the left. Crisp triangular silhouettes with slightly imperfect brush edges, one muted umber triangular face on each, a single spare sand brush at the foot. No masonry detail, person, camel, wall, horizon or sky.

### pyramid-interior.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/egypt/great-pyramid-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Egypt's interactive travel scrapbook, matching the handmade Japan map.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing desired texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, 3–4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Use sandy ochre, warm ivory, muted umber, with slate teal only if needed. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight architectural vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: Inside the Great Pyramid: make a simple sandstone pyramid silhouette with one triangular cutaway revealing a dark tiny rectangular King's Chamber, an ochre sarcophagus block and a thin rising passage. The photograph gives the warm block-stone chamber colors and spare sarcophagus form. Clear symbolic exterior cutaway is needed to distinguish this from the three-pyramid Giza marker. Highly minimal, only 3–4 masonry strokes, no visitors, lights or bins.

### sphinx.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/egypt/great-sphinx-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Egypt's interactive travel scrapbook, matching the handmade Japan map.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing desired texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, 3–4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Use sandy ochre, warm ivory, muted umber, with slate teal only if needed. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight architectural vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: The Great Sphinx of Giza: isolated human-headed reclining lion with broad striped nemes headdress, nose-worn calm face, long forepaws and low elongated lion body. View slightly from front and side so the long reclining silhouette is legible. Sandstone ochre and ivory with only a few umber facial/fold marks. No pyramid behind, person, fence, trees or foreground wall.

### church.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/egypt/coptic-cairo-01-small.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Egypt's interactive travel scrapbook, matching the handmade Japan map.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing desired texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, 3–4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Use sandy ochre, warm ivory, muted umber, with slate teal only if needed. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight architectural vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: The Hanging Church in Coptic Cairo: the white twin bell towers with tiny crosses, triangular central gable and round window, a simplified dark carved wooden entrance porch and a few broad steps at the base. Match the photographed pale cream facade, symmetrical towers and wood below. No neighboring buildings, visitors, flowers or detailed railings.

### museum.webp

References:

- `docs/references/travel-country-pages/japan-paper-study-v1.png`
- `public/images/travel/japan-map/castle.webp`
- `public/images/travel/egypt/grand-egyptian-museum-03.webp`

Use case: stylized-concept / style-transfer. Create ONE separate transparent landmark sprite for Egypt's interactive travel scrapbook, matching the handmade Japan map.
Reference roles: Image 1 is the approved Japan artwork STYLE only; Image 2 is a finished cutout showing desired texture and transparency; Image 3 is the user's SUBJECT photograph.
Highly simplify to the essential recognizable silhouette and relationships. Delicate imperfect hand-drawn lines, 3–4 restrained flat acrylic pigments, visible dry brush and fine paper grain ONLY INSIDE the paint, organic edges. Use sandy ochre, warm ivory, muted umber, with slate teal only if needed. Distinct bold shapes readable at 30px tall. No gradients, photorealism, 3D rendering or polished vector edges.
One complete upright object or tight architectural vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not bottom-half. CRITICAL: genuine RGBA transparent background around and through the subject, no paper sheet, white rectangle, checkerboard or shadow. No labels, text, number, frame, watermark, people, photo background, sky or scenery unless specified below. Preserve only a tiny grounding brushstroke.
Subject: A recognizable exhibit from the Grand Egyptian Museum: the golden animal-shaped ceremonial bed in this photo. Preserve the long low golden bed, graceful animal head rising at its left/front end, slender animal legs and high curled tail at right. Simplify into a single muted ochre form with fine umber details, a tiny dark museum plinth underneath. Only this one object, not the other couches behind. No glass enclosure, walls, visitors, signage or lighting.
