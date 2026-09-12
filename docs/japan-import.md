# Japan photo journal

The first country map is implemented at `/travel/japan/`, with eight photo groups and MDX starter pages. Source material is the user's selected Japan photos in `travel_data/Photos-1-001` and the photo-bounded portion of `travel_data/timeline_from_2024.json`.

## Import evidence

- 95 JPEGs, 94 with GPS; five video files are retained in the source folder but are not imported in this first photo pass.
- The photographs run from 30 May through 6 June 2025, normalized to Japan time. The first photo retains a +08:00 camera offset: converting the instant to Japan time, rather than treating the clock value as already Japanese, avoids a one-hour error.
- The importer bounds Timeline to the first/last photo plus one hour, then matches a visit only when it is within 15 minutes of the photograph and its candidate position is within 1 km of the photo's GPS. 56 photographs have such a match. GPS and visual inspection provide evidence for the remaining mapped places; Timeline is corroboration, not the only location source.
- One photograph has no GPS and is not used for a map position. No visits from outside the photo window are imported.
- Contact sheets were inspected to choose 27 photographs and factual captions. Street food and the Expo 2025 photographs are grouped under Osaka. Expo ’70 Park in Suita is a separate stop; these are different sites.
- The book's existing memory about visiting five cities in a day is not treated as an itinerary for this photo set. The imported photographs show Hiroshima/Miyajima on 2 June and Kyoto on 3 June. Existing personal memories in the book are retained.

Eight map groups: Osaka, Kōyasan, Expo Park, Hiroshima, Miyajima, Kyoto, Tokyo, Kamakura. A group can cover multiple nearby sights: the map illustration represents the place, and the article contains its selected photos. In particular Kyoto includes Fushimi Inari, Higashiyama, and Arashiyama; Tokyo includes Skytree and Shibuya. The current data model has one article per group; distinct repeat-visit articles remain future work.

The starter prose describes the supplied photographs and their sequence. It does not supply invented personal reactions. Edit the MDX files in `src/content/travel/japan/` to replace it with personal writeups. One to four paragraphs all render naturally; additional paragraphs are supported.

## Rebuilding photographs

Run `node scripts/import-japan.mjs` from the project root. It requires the existing ExifTool command and the project's Sharp dependency. `scripts/japan-photo-selection.json` contains the selected filenames and image descriptions. The command generates stripped WebP derivatives and `src/data/japan-photos.json`; it never edits the MDX files.

The private matching report is written to `travel_data/japan-import/matched-report.json`. Raw photographs, original GPS and Timeline candidates remain under the existing ignored `travel_data/` path. The public JSON contains only selected image URLs, dimensions, descriptions, and capture times. The web photographs do not retain EXIF/GPS metadata.

## Artwork

The original SVG landmark symbols represent Osaka Castle, a Kōyasan temple, Tower of the Sun, the Atomic Bomb Dome, Itsukushima's torii, a Kyoto pagoda, Tokyo Skytree, and the Great Buddha. Visual source: the user's photographs and the three references saved with the [country page plan](travel-country-pages-plan.md).

The stepped land silhouette is derived from the Japan feature in [Natural Earth's 1:50m country boundaries](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson), snapped to a five-unit illustration grid. Natural Earth is [public domain](https://www.naturalearthdata.com/about/terms-of-use/). The full view covers the main islands; outlying southern islands are omitted from this composition. The country outline is a geographic aid, not a border reference. Paths through the illustrated terrain are scenery, not the user's recorded route.

Landmark artwork is spaced away from dense geographic clusters with small leader lines. Mobile initially frames the journey more closely; “Whole Japan” shows the larger illustration. The text index retains access to every destination at both scales.

Official naming references: [Tower of the Sun](https://www.expo70-park.jp/cause/expo/tower-of-sun/), [Kōtoku-in](https://www.kotoku-in.jp/en/), [Kōyasan](https://www.koyasan.or.jp/en/sitemap/).

## Behavior and maintenance

- The Japan map lives on the book's right page. As the book stage scrolls past the top, the same SVG lifts out of the 3D page, expands toward its reserved journal position, and docks there. Scrolling upward reverses the handoff. There is one live map, so highlights and keyboard focus persist. With reduced motion, it switches directly between the page and dock.
- The dock sticks within the journal until the cards end. Scrolling chooses one visible card below its lower edge. The compact book map also has an “Explore the map” link to the first card.
- Explicit map/index jumps set a card fragment and focus that card; passive scroll leaves focus and history alone.
- MDX pages return to their card. Published filtering is shared by map destinations, cards, article routes, and neighbor links. Missing/duplicate landmark references fail validation.
- Country changes fetch the destination's static journal region and replace it while retaining the book. Latest-request checks prevent stale content; fetch failure falls back to document navigation. Article pages use ordinary navigation.
- A small observer/controller is mounted when the Japan journal is inserted and disposed when it is removed. Its styles are loaded by every country route, including when arriving from a country with no map.

The broader plan still covers future country artwork, more granular/repeated stories, additional photo figures, and richer authored prose. This implementation adds the first real photo-backed country journal.

## Validation

- 46 Node tests pass (`node --experimental-strip-types --test tests/*.test.mjs`), including selection below the sticky map, several visible compact cards, scrolling upward, empty gaps, the last card, reversible map handoff, deep-link docking, and reduced motion.
- Astro check: zero errors and warnings; one existing unused-variable hint in `JourneyPart.astro`.
- Production build: 16 pages, including the Japan index and eight MDX articles. All Japan article/image targets resolve in the generated output.
- Browser checks: desktop, 390px and 320px widths; no horizontal overflow; map jumps and keyboard activation; article return to Kyoto with 24px clearance below the sticky map; passive scroll highlights; full-map toggle; Japan → Egypt → Japan; browser Back/Forward. No browser console errors were observed.
- The book handoff was checked separately at desktop, 390px, and 320px: right-page placement, intermediate expansion, sticky docking, reverse scroll, jumps from the book, and country navigation retaining exactly one map.
- Eight lazy-loaded card thumbnails total about 396 KiB. Full-sized photos load on article pages. EXIF inspection confirms no retained EXIF/GPS in the web derivatives.
