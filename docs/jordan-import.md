# Jordan photo journal

Jordan is populated at `/travel/jordan/` with Amman, Petra, Wadi Rum, Aqaba, and the Dead Sea. Each area has a compact card, a two-paragraph MDX starter, and a photo gallery. The map starts on the book's right page and lifts into the sticky journal position. Landmark illustrations use the requested 0.6 scale; the map has no visible country heading or date range.

## Source and selection

The five source folders are `travel_data/amman`, `travel_data/jordan` (Petra), `travel_data/wadi_rum`, `travel_data/aqaba`, and `travel_data/dead_sea`. They contain 35 still images and one cinematic MP4. Contact sheets were inspected for every still image.

The selected photographs run from 12 February to 12 March 2023. The supplied Timeline starts in 2024, so it was not read for this import. Folder groupings, image content, and photo metadata supply the location evidence. Area markers represent sights or public places, not accommodation addresses.

| Area | Selected photos | Dates represented by the supplied photos |
| --- | ---: | --- |
| Amman | 8 | 12 February – 5 March 2023 |
| Petra | 3 | 26 February 2023 |
| Wadi Rum | 5 | 9–10 March 2023 |
| Aqaba | 4 | 9–10 March 2023 |
| Dead Sea | 4 | 11–12 March 2023 |

The `jordan` folder also contains a Citadel photograph from Amman (`DSC08098~2.jpg`), whose capture timestamp has missing seconds, and an undated screenshot (`5-1.png`). Neither is published in this selection. The cinematic clip is retained in the source folder for a future video pass. Similar views and the Dead Sea instruction sign were omitted from the first gallery selection.

Selected JPEG capture times have complete timestamps and explicit offsets. The camera photograph used for the Amman cover has no GPS and a stored −05:00 offset; the importer preserves that instant rather than substituting a timezone. Its location is supported by the folder and the photographed Citadel. Card timestamps are authored calendar dates, so browser timezones cannot shift them to another day.

The text describes the photographs. The Petra walk of more than 25 km and floating in the Dead Sea were already present in the user's book notes. No additional personal experiences or reactions have been invented.

## Editing and rebuilding

- Edit personal prose and frontmatter in `src/content/travel/jordan/*.mdx`.
- Edit photo selection and descriptions in `scripts/jordan-photo-selection.json`.
- Run `node scripts/import-jordan.mjs` to regenerate the WebPs and `src/data/jordan-photos.json`. It requires ExifTool and Sharp, and does not change MDX or source files.
- Raw metadata is saved only under ignored `travel_data/jordan-import/metadata.json`. The 24 gallery images and five cover thumbnails contain no EXIF or GPS metadata. Together they are approximately 4.5 MiB; the five card thumbnails total approximately 169 KiB.

## Shared country components

`travel-journals.ts` describes each supported country. `CountryJournal.astro`, `TravelMapFrame.astro`, and `travel-scroll.ts` share the cards, map interactions, and scroll handoff. Country-specific SVG terrain and landmark definitions remain in `JordanMap.astro` and `JapanMap.astro`. Their SVG IDs are namespaced so both can live in the book without collisions.

The active controller selects its country's map explicitly and returns it to the correct book page on cleanup. Published stories are validated against their own country's landmarks and must have photographs plus a cover thumbnail. Article routes and neighbor links are generated separately for each country.

## Artwork sources

The original blocky SVG illustrations depict the Citadel columns, Petra's Treasury, a Wadi Rum dome camp, Aqaba's waterfront, and floating in the Dead Sea. They draw on the supplied photographs. The country silhouette uses the Jordan feature from [Natural Earth's country boundaries](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson), snapped to a four-unit grid. Natural Earth is [public domain](https://www.naturalearthdata.com/about/terms-of-use/). This is a stylized travel illustration; the leader lines locate sights and do not claim to reconstruct a route.

Landmark naming was checked against the Jordan Tourism Board's [Amman](https://international.visitjordan.com/wheretogo/amman/) and [Petra](https://international.visitjordan.com/wheretogo/petra/) pages.

## Validation

- 46 existing Node tests pass, including sticky selection, reversible handoff, deep-link docking, reduced motion, and book navigation.
- Astro check reports zero errors and warnings, with one existing unused-variable hint in `JourneyPart.astro`.
- The production build contains 21 pages, including five Jordan and eight Japan articles. A generated-output check verified 233 local link/image references and no duplicate HTML/SVG IDs across both countries' pages.
- Browser checks cover the right-page map, sticky docking, country changes in both directions, Japan's preserved map, MDX rendering, previous/next article links, and article return with 24px of clearance. Jordan was checked at desktop, 390px, and 320px with no horizontal overflow or console errors in the successful preview.
