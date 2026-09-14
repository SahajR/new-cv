# India photo journal

India's journal starts with Agra at `/travel/india/`: two landmark cards, five photographs, and two editable MDX writeups. The existing book memory about visiting eight states is retained. The Agra photographs do not imply an itinerary for those other states.

## Source and selection

All five JPEGs in `travel_data/Agra/` were inspected visually and through their capture metadata. They were photographed on 17 September 2023. The two Fort-area images are from 11:45 and 12:54 local time; the Taj Mahal images are from 16:04 through 16:46. All five have GPS metadata. Timeline was not read.

| Place | Photographs | Cover |
| --- | ---: | --- |
| Taj Mahal | 3 | Marble façade, dome, and minarets beneath a cloudy sky |
| Agra Fort | 2 | Red sandstone façade and projecting towers |

The Taj Mahal gallery includes an upward architectural detail and a wider garden view. The Fort gallery includes the equestrian statue photographed nearby. The starter prose describes the photographs without inventing personal reactions. The Taj Mahal is listed first as the country's featured sight; both pages retain the same visit date.

One edited export, `PXL_20230917_104346476-EFFECTS.jpg`, lost its timezone offset. Its selection explicitly supplies `+05:30`, corroborated by the other four images and by the filename's UTC time (10:43:46) versus the retained local capture time (16:13:46). The original file is untouched.

## Rebuilding and adding places

Run `node scripts/import-india.mjs`. It requires the project's Sharp dependency and ExifTool, following the other country importers. `scripts/india-photo-selection.json` supplies source paths relative to `travel_data/`, descriptions, and the one explicit timezone fallback. The first photo in each group becomes the cover. Only selected source files are inspected.

The importer writes:

- `public/images/travel/india/`: five WebP photographs and two cover thumbnails, with EXIF/GPS stripped.
- `src/data/india-photos.json`: public URLs, dimensions, descriptions, and capture times.
- `travel_data/india-import/metadata.json`: the private original metadata under the ignored source folder.

MDX files are never overwritten by the importer. Edit the starters at `src/content/travel/india/taj-mahal.mdx` and `src/content/travel/india/agra-fort.mdx`.

To add another Indian location, add a selection group, a stop in `src/data/india.ts`, its illustration in `src/components/IndiaMap.astro`, and an MDX file with the matching `place`. The shared country configuration discovers the cards and article routes. The separate [Bites layer](travel-bites.md) also works for India whenever a Bite is added.

## Map artwork

The original SVG illustrations depict the Taj Mahal's dome, four minarets, small pavilions, and garden pool, and Agra Fort's red sandstone towers and arched entrance. They use the same 0.6 illustration scale as the other countries. Both leaders point to Agra; the drawings are spaced apart so their labels remain selectable at country scale.

The stepped outline comes from the India feature in [Natural Earth's 1:50m country boundaries](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson), which are [public domain](https://www.naturalearthdata.com/about/terms-of-use/). Projected coordinates are `x = 340 + (longitude - 68) × 10`, `y = 328 - (latitude - 7) × 10.5`, snapped to a four-unit grid. Tiny polygons that collapse at this scale are omitted; the mainland and visible island groups remain. This is an illustrative country outline, not a boundary reference. Terrain and waterways are scenery, not a recorded route.

The map lives on the book's right page, lifts into the shared sticky dock, highlights each active card, and returns to the book when scrolling upward. The narrow-screen journey view frames northern and central India; “Whole India” includes the southern tip and island groups.

## Validation

- All 46 existing Node tests pass.
- Astro check reports no errors or warnings; the existing unused-variable hint in `JourneyPart.astro` remains.
- Production build generates 51 pages, including both India articles. All generated travel links, image targets, and fragments resolve; no duplicate IDs.
- All seven India WebP derivatives are free of EXIF/GPS. They total approximately 935 KiB, including 69 KiB for the two card thumbnails.
- Desktop map jumps select the correct landmark and leave the Taj Mahal card 24px below the map. Both card covers load, with three photographs on the Taj Mahal page and two for Agra Fort.
