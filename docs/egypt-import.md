# Egypt photo import

## Source and selection

`travel_data/egypt` contains 39 JPEG photographs and one MP4. Every still image was reviewed on contact sheets; closer views resolved the site and subject where necessary. The selected photographs cover 29–30 May 2026. Photo GPS, capture times, visual details, and the existing book notes support the groupings. The large Timeline was not read.

| Region | Page | Photos | Date |
| --- | --- | ---: | --- |
| Luxor | Karnak | 4 | 29 May 2026 |
| Luxor | Luxor Temple | 2 | 29 May 2026 |
| Luxor | Tutankhamun’s tomb | 1 | 29 May 2026 |
| Luxor | Hatshepsut’s temple | 4 | 29 May 2026 |
| Cairo & Giza | Giza plateau | 4 | 30 May 2026 |
| Cairo & Giza | Inside the Great Pyramid | 2 | 30 May 2026 |
| Cairo & Giza | Great Sphinx | 2 | 30 May 2026 |
| Cairo & Giza | Coptic Cairo | 4 | 30 May 2026 |
| Cairo & Giza | Grand Egyptian Museum | 4 | 30 May 2026 |

The 27 selected photographs have complete capture timestamps and explicit +03:00 offsets. Travel, airport, signage, and similar photographs are omitted from this first selection. The DJI still has zero GPS coordinates and no timezone offset, so it is not selected. The MP4 remains in the source folder for a future video pass.

Starter prose describes visible details. The first-person visit to Tutankhamun is supported by the user's existing book note and the photograph. Personal reactions, conversations, and additional itinerary details have not been invented.

## Editing and rebuilding

- Edit each page independently in `src/content/travel/egypt/*.mdx`.
- Edit the photo order and alt text in `scripts/egypt-photo-selection.json`. The first photograph is the card and article cover.
- Run `node scripts/import-egypt.mjs` to regenerate the WebPs and `src/data/egypt-photos.json`. ExifTool and Sharp are required. Authored MDX and source files are preserved.
- Raw metadata stays in ignored `travel_data/egypt-import/metadata.json`. The 27 gallery images and nine smaller card covers contain no EXIF or GPS metadata. Their combined size is about 6.17 MiB; the card covers total 339 KiB.

## Map and location granularity

`src/data/egypt.ts` defines nine independent stops, grouped under Luxor and Cairo & Giza in the card list. Optional `region` and `mapLabel` fields let the shared journal render region headings and shorter map labels while retaining full site names for cards and accessible links.

`EgyptMap.astro` contains original blocky SVG illustrations of Karnak's columns, Luxor Temple's pylon and obelisk, a tomb, Hatshepsut's terraces, pyramids, a pyramid cutaway, the Sphinx, a church, and the museum. The tomb illustration is symbolic rather than a depiction of objects displayed inside KV62. Landmark sprites retain the requested 0.6 scale.

The silhouette comes from the Egypt feature in [Natural Earth's country boundaries](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson), snapped to a four-unit grid. Natural Earth is [public domain](https://www.naturalearthdata.com/about/terms-of-use/). The Nile and terrain are simplified illustrations. Leader lines connect the spread-out illustrations to their public sites; they do not represent travel routes. Nearby sights share almost the same position at country scale, so each retains a separate illustration and selectable label.

The map uses the shared right-page book placement, reversible scroll handoff, sticky dock, and active-card highlighting. All book-map links include their country path so opening a marker in another tab still reaches the correct country after a page turn.

## Naming references

Site identification was checked against the Egyptian Ministry's pages for [Karnak](https://egymonuments.gov.eg/en/archaeological-sites/karnak/), [Luxor Temple](https://egymonuments.gov.eg/monuments/luxor-temple), [Tutankhamun's tomb](https://egymonuments.gov.eg/monuments/tomb-of-tutankhamun/), [Deir al-Bahari](https://egymonuments.gov.eg/archaeological-sites/deir-al-bahari/), [the Great Sphinx](https://egymonuments.gov.eg/monuments/the-great-sphinx/), and [Saints Sergius and Bacchus](https://egymonuments.gov.eg/monuments/church-of-saint-sergius-and-bacchus/). Museum context was checked against the [Grand Egyptian Museum](https://gem.eg/en/collection/tutankhamun-galleries/).

## Validation

- All 46 existing Node tests pass. Astro check reports zero errors and warnings, with the existing unused-variable hint in `JourneyPart.astro`.
- The production build generates 30 pages, including all nine Egypt articles. A generated-output check verified 1,082 local links, fragment targets, and image references across 28 travel pages, with no missing targets or duplicate HTML/SVG IDs.
- Browser checks cover the map inside the right book page, docking and returning on scroll, card highlighting on manual scroll, marker jumps, MDX rendering, article return, and page turns between Egypt and Japan.
- Egypt was checked at desktop, 390px, and 320px with no horizontal overflow. Article return leaves 24px between the sticky map and the selected card when there is sufficient remaining page height.
- ExifTool confirms all 36 exported WebPs contain no EXIF or GPS tags.
