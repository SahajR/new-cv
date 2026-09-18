# India painted map

Created with the built-in imagegen tool. Final generated artwork is saved in `public/images/travel/india-map/`: `base.webp`, `taj.webp`, `fort.webp`, and `hill-fort.webp`.

## Geography

The contour is derived from the current [Survey of India outline dataset](https://surveyofindia.gov.in/pages/outline-maps-of-india), downloaded on 17 September 2026. The source ZIP's metadata dates the boundary data to 13 February 2026. This follows the Survey of India depiction, consistent with the requested reference. The illustration has no internal administrative boundaries or labels.

`scripts/build-india-outline.py` reads the public polygon shapefile from `https://surveyofindia.gov.in/documents/Outline_of_India.zip`, simplifies it in its native Lambert conformal conic WGS84 projection, and writes the contour, projection metadata, and SVG geography guide. The guide is rasterized to PNG for image generation. The mainland, northeastern connection, Lakshadweep, and Andaman/Nicobar islands are retained. There is no four-unit grid snapping.

The painted base is aligned to the guide's geographic bounds. The generated texture is clipped to the source contour in the SVG, with a muted olive underlay keeping small islands and boundary slivers intact. This makes the displayed boundary independent of small image-generation deviations.

`india-map-projection.ts` uses the source's ellipsoidal LCC parameters: WGS84, central meridian 80°, latitude of origin 24°, standard parallels 12.472944° / 35.172806°, false easting and northing 4,000,000m. One map unit is 10,000m. Country and journey viewBox: `0 0 360 360`.

## Marker behavior

- Agra shows a Taj Mahal city icon and two separated overview dots. The Taj Mahal and Agra Fort share the Agra cluster.
- Entering either Agra story docks and zooms to the photo's original GPS position at 600× geographic scale. The two independent cutouts appear near the end of the approach, use a thin red active outline, and remain readable through inverse scaling.
- Rajgad is a standalone marker at its original photo GPS. On mobile it follows the active story at 2× zoom.
- Country overview, keyboard visibility, retargetable camera transitions, and reduced-motion behavior use the existing shared map logic.
- The country album uses the same three painted landmark assets.
- Vite prebundles `motion/react` at startup so visibility-hydrated albums do not trigger dependency optimization after the page loads.
- Journal book wrappers pass pointer events through to the visible page so the 3D tilt cannot intercept landmark taps before docking.
- Sharp only resizes and encodes generated RGBA artwork to WebP (quality 86, alphaQuality 100). No raster background removal or redrawing. Marker alpha bounds are recorded in `src/data/india-map-art.json`.

## Agra detail

The local SVG city detail contains map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), under the [ODbL](https://opendatacommons.org/licenses/odbl/1-0/). Attribution is visible while the city view is open. It loads only on city entry; the deployed page requires no map API, API key or external map request.

Build from the downloaded Overpass JSON with `node scripts/build-agra-detail.mjs /path/to/agra-osm.json`. The script applies the same projection as the country contour. Downloaded from `https://overpass-api.de/api/interpreter` on 17 September 2026 with an identifying `sahajcv-map-build/1.0` user agent. The request uses a general Agra rectangle, not any photo GPS coordinates:

```overpass
[out:json][timeout:45];
(
  way(27.10,77.98,27.23,78.10)[waterway~"^(river|canal)$"];
  way(27.10,77.98,27.23,78.10)[natural=water];
  way(27.10,77.98,27.23,78.10)[highway~"^(primary|secondary|trunk|motorway)$"];
);
out geom;
```

## Validation

- All 56 existing and extended tests pass, including city reveal at Agra's smaller zoom, camera retargeting, reduced-motion snapping, and accessible marker visibility.
- Astro check: no errors or warnings; one pre-existing unused `index` hint in `JourneyPart.astro`.
- Production build: 52 pages. All generated artwork and the Agra SVG are included.
- Desktop and 390px mobile: painted book map, landmark tap navigation, red active outline, 600× Agra detail, and 2× Rajgad following verified. Returning to overview hides the individual Agra controls. The album consumes all three new cutouts.

## Prompts

### base.webp

References: `japan-paper-study-v1.png`, `public/images/travel/jordan-map/base.webp`, and `india-geography-guide.png`.

Use case: style-transfer. Asset: ONE transparent painted India country-map BASE for an interactive travel scrapbook. Image 1 is the approved Japan STYLE only; Image 2 is another finished painted-map STYLE and transparency reference; Image 3 is the EXACT GEOGRAPHY, OUTLINE AND POSITION GUIDE from the current 2026 Survey of India boundary dataset. Preserve image 3's complete country silhouette, north-up orientation, proportions, position and margins on this SQUARE canvas exactly, including its broad northern crown, narrow northeastern connection, northeastern states, full southern peninsula, tiny Lakshadweep islands to the southwest and Andaman/Nicobar islands to the southeast. DO NOT invent a different border or remove the islands. Retain the guide's exact negative spaces at Nepal, Bhutan and Bangladesh. Use the whole square composition. Render only this country shape in a restrained handmade acrylic style: muted pale olive as the main land color, pale sandy ochre in the northwest and dry interior, a soft subtly darker olive band down the western peninsula, pale warm stone over the far northern mountain region. Maximum four muted main pigments. Organic edges, visible delicate dry-brush texture and paper grain within colored paint only. Very low visual noise; no separate trees, mountains or scenic symbols. CRITICAL: genuine transparent RGBA background everywhere outside India's land and islands. No ocean fill, paper background, white rectangle, checkerboard, labels, titles, internal state borders, cities, monuments, landmarks, arrows, paths, compass, text, frame, shadow or neighboring countries. Landmark cutouts will be added independently by the app.

### taj.webp

References: `japan-paper-study-v1.png`, `public/images/travel/egypt-map/pyramids.webp`, and `public/images/travel/india/taj-mahal-01-small.webp`.

Use case: stylized-concept / style-transfer. Asset: ONE separate transparent landmark sprite for India's interactive travel scrapbook. Image 1 is STYLE reference only; Image 2 is a finished sprite showing the intended handmade paint and real transparency; Image 3 is the user's SUBJECT photograph. Highly simplify to essential recognizable silhouette and proportions, delicate imperfect lines and at most four restrained flat acrylic pigments extracted from the subject. Dry brush paper grain ONLY INSIDE paint, organic rough edges, spare dark umber linework. Match the approved Japan/Egypt/Jordan style. One complete subject or tight vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not lower half. CRITICAL: genuine transparent RGBA background around and through subject; NO paper sheet, white background, checkerboard, shadow, text, labels, numbers, watermark, people, sky or expansive scenery. Readable at 30px tall; no photorealism, gradients, 3D or polished vector edges. Tiny grounding brushstroke only.
Subject: Taj Mahal in Agra. Ivory marble mausoleum, large central onion dome with tiny finial, four slender minarets, smaller side domes and dark central arched opening. Preserve symmetric proportions. Four pigments: warm ivory, muted sandstone, slate grey-green and dark umber. Omit crowds, garden and sky.

### fort.webp

References: `japan-paper-study-v1.png`, `public/images/travel/egypt-map/pyramids.webp`, and `public/images/travel/india/agra-fort-01-small.webp`.

Use case: stylized-concept / style-transfer. Asset: ONE separate transparent landmark sprite for India's interactive travel scrapbook. Image 1 is STYLE reference only; Image 2 is a finished sprite showing the intended handmade paint and real transparency; Image 3 is the user's SUBJECT photograph. Highly simplify to essential recognizable silhouette and proportions, delicate imperfect lines and at most four restrained flat acrylic pigments extracted from the subject. Dry brush paper grain ONLY INSIDE paint, organic rough edges, spare dark umber linework. Match the approved Japan/Egypt/Jordan style. One complete subject or tight vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not lower half. CRITICAL: genuine transparent RGBA background around and through subject; NO paper sheet, white background, checkerboard, shadow, text, labels, numbers, watermark, people, sky or expansive scenery. Readable at 30px tall; no photorealism, gradients, 3D or polished vector edges. Tiny grounding brushstroke only.
Subject: Agra Fort red sandstone entrance facade, a pair of rounded projecting sandstone towers flanking the central gateway, battlement parapets and a few dark arched openings. Muted terracotta rose sandstone, pale sandy ochre accents, subdued olive and dark warm umber. Retain the recognizable red fort silhouette, radically simplify decorative carving. No palm trees.

### hill-fort.webp

References: `japan-paper-study-v1.png`, `public/images/travel/egypt-map/pyramids.webp`, and `public/images/travel/india/rajgad-fort-01-small.webp`.

Use case: stylized-concept / style-transfer. Asset: ONE separate transparent landmark sprite for India's interactive travel scrapbook. Image 1 is STYLE reference only; Image 2 is a finished sprite showing the intended handmade paint and real transparency; Image 3 is the user's SUBJECT photograph. Highly simplify to essential recognizable silhouette and proportions, delicate imperfect lines and at most four restrained flat acrylic pigments extracted from the subject. Dry brush paper grain ONLY INSIDE paint, organic rough edges, spare dark umber linework. Match the approved Japan/Egypt/Jordan style. One complete subject or tight vignette, centered filling 80–85% of a SQUARE canvas. Full composition, not lower half. CRITICAL: genuine transparent RGBA background around and through subject; NO paper sheet, white background, checkerboard, shadow, text, labels, numbers, watermark, people, sky or expansive scenery. Readable at 30px tall; no photorealism, gradients, 3D or polished vector edges. Tiny grounding brushstroke only.
Subject: Rajgad Fort in Maharashtra. A small rough dark stone arched hilltop gateway on a steep olive green and dry ochre rocky ridge, with a short angular stone stairway climbing into its opening and a low fort wall continuing uphill. The relationship of doorway, rugged hill and climbing steps is essential. Muted olive, dry ochre, charcoal umber, pale warm stone. Isolated compact hill cutout, no panoramic background, mountains or sky.
