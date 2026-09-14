# India photo journal

India's journal at `/travel/india/` includes Agra and Rajgad Fort: three landmark cards, nine photographs, and three editable MDX writeups. The existing book memory about visiting eight states is retained. These photographs do not imply an itinerary for those other states or a continuous trip between September and October.

## Source and selection

All five JPEGs in `travel_data/Agra/` were inspected visually and through their capture metadata. They were photographed on 17 September 2023. The two Fort-area images are from 11:45 and 12:54 local time; the Taj Mahal images are from 16:04 through 16:46. All five have GPS metadata. Timeline was not read.

The five JPEGs in `travel_data/RajgadFort/` were also inspected. Four show Rajgad Fort on 28 October 2023, from 14:03 through 16:32 local time, with complete capture times, `+05:30` offsets, and GPS coordinates. `PXL_20230925_034012626.jpg` is excluded: its Great Wall signs and coordinates in China identify it as an unrelated photograph from 25 September. The original files remain untouched.

| Place | Photographs | Cover |
| --- | ---: | --- |
| Taj Mahal | 3 | Marble façade, dome, and minarets beneath a cloudy sky |
| Agra Fort | 2 | Red sandstone façade and projecting towers |
| Rajgad Fort | 4 | Stone gateway above the valley and rough hillside steps |

The Taj Mahal gallery includes an upward architectural detail and a wider garden view. The Fort gallery includes the equestrian statue photographed nearby. The starter prose describes the photographs without inventing personal reactions. The Taj Mahal is listed first as the country's featured sight; both pages retain the same visit date.

Rajgad appears under Maharashtra, after the two Agra cards. Its gallery continues from the gateway to the fortified ridge, stone steps and ramparts, and a path toward the rocky summit. The article retains its separate October visit date.

One edited export, `PXL_20230917_104346476-EFFECTS.jpg`, lost its timezone offset. Its selection explicitly supplies `+05:30`, corroborated by the other four images and by the filename's UTC time (10:43:46) versus the retained local capture time (16:13:46). The original file is untouched.

## Rebuilding and adding places

Run `node scripts/import-india.mjs`. It requires the project's Sharp dependency and ExifTool, following the other country importers. `scripts/india-photo-selection.json` supplies source paths relative to `travel_data/`, descriptions, and the one explicit timezone fallback. The first photo in each group becomes the cover. Only selected source files are inspected.

The importer writes:

- `public/images/travel/india/`: nine WebP photographs and three cover thumbnails, with EXIF/GPS stripped.
- `src/data/india-photos.json`: public URLs, dimensions, descriptions, and capture times.
- `travel_data/india-import/metadata.json`: the private original metadata under the ignored source folder.

MDX files are never overwritten by the importer. Edit the starters at `src/content/travel/india/taj-mahal.mdx`, `src/content/travel/india/agra-fort.mdx`, and `src/content/travel/india/rajgad-fort.mdx`.

To add another Indian location, add a selection group, a stop in `src/data/india.ts`, its illustration in `src/components/IndiaMap.astro`, and an MDX file with the matching `place`. The shared country configuration discovers the cards and article routes. The separate [Bites layer](travel-bites.md) also works for India whenever a Bite is added.

## Map artwork

The original SVG illustrations depict the Taj Mahal's dome, four minarets, small pavilions, and garden pool; Agra Fort's red sandstone towers and arched entrance; and Rajgad's rocky hill, stepped ramparts, and stone gateway. They use the same 0.6 illustration scale as the other countries. The Agra leaders point to the two sights in the city; Rajgad's leader points to its photographed location in Maharashtra. The drawings are spaced apart so their labels remain selectable at country scale.

The stepped outline comes from the India feature in [Natural Earth's 1:50m country boundaries](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson), which are [public domain](https://www.naturalearthdata.com/about/terms-of-use/). Projected coordinates are `x = 340 + (longitude - 68) × 10`, `y = 328 - (latitude - 7) × 10.5`, snapped to a four-unit grid. Tiny polygons that collapse at this scale are omitted; the mainland and visible island groups remain. This is an illustrative country outline, not a boundary reference. Terrain and waterways are scenery, not a recorded route.

The map lives on the book's right page, lifts into the shared sticky dock, highlights each active card, and returns to the book when scrolling upward. The narrow-screen journey frame includes all three markers and their labels; “Whole India” expands the country view.

## Validation

- All 46 existing Node tests pass.
- Astro check reports no errors or warnings; the existing unused-variable hint in `JourneyPart.astro` remains.
- Production build generates 52 pages, including all three India articles. All generated travel links, image targets, and fragments resolve; no duplicate IDs.
- All 12 India WebP derivatives are free of EXIF/GPS. They total approximately 1,769 KiB, including 111 KiB for the three card thumbnails. The seven existing Agra exports are byte-for-byte unchanged after adding Rajgad.
- Browser verification at desktop, 390px, and 320px confirms Rajgad's map jump, active marker, and article return link. All three map labels remain selectable with no horizontal overflow. Both map views include Rajgad, and scrolling upward returns the single India map to the book.
- The Rajgad article loads all four photographs and retains the 28 October 2023 date. The Maharashtra heading correctly shows “1 place.”
