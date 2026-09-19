# UAE travel album

The sixth country in the scrapbook lives at `/travel/uae/`. It contains 14 published starter pages: four in Abu Dhabi, eight in Dubai, and two on the Fujairah coast. Names follow the owner's confirmation: **Abu Dhabi Mall** by Beach Rotana/VOX, **Dalma Mall**, and **Sharm Rock**.

## Editing stories and adding photographs

- Edit the individual files in `src/content/travel/uae/`. They use the same MDX layer and story route as the other countries.
- Visit dates are intentionally absent. Add `visited: YYYY-MM-DD` to a page's frontmatter when known; optionally add `dateLabel`. Pages without a visit date render no timestamp.
- All 14 stops currently reference **one** generated photo, `public/images/travel/uae/placeholder.webp` (1200 × 800). It is clearly described as a placeholder and is not presented as a photograph of a visit. The book's four Polaroids also share this image.
- `src/data/uae.ts` defines `uaePhotos`. Replace a stop's photo array with real `src`, `thumbnail`, `width`, `height`, `alt`, and optional `capturedAt` metadata. Remove `placeholder: true` for real photographs. For example, spread the existing `Object.fromEntries(...)` result into an object and add a `'burj-khalifa': [...]` entry to override that stop.
- The footer quote is original starter copy, editable in `src/data/travel-endings.ts`.

No imported travel timeline, invented visit date, or fabricated personal memory was used.

## Map and marker behavior

`src/data/uae.ts` is the source of stops, city clusters, and public landmark coordinates. `src/data/uae-map-projection.ts` projects both the geographic detail and markers in the same equirectangular coordinate space.

The overview displays three city/area illustrations with 4 / 8 / 2 small dots. Dots alone are spread out for readability. On selection or scrolling, the existing map camera reveals each area's markers at their geographic anchors and outlines the active one in red. The map starts inside the right book page and uses the existing sticky dock, mobile camera, delayed paper background, and final-stop scroll behavior.

The Dubai group includes the outlying Desert Campus and Al Marmoom stop, so the camera pans beyond central Dubai when those cards become active. The **Al Marmoom pin is an approximate reserve-area anchor**, not a confirmed bike rental or riding location. Karama is a neighbourhood anchor. Old Deira uses the Old Souk abra terminal as a representative point. Replace those area anchors with photo GPS later if desired.

| Stop | Latitude, longitude | Coordinate source / interpretation |
| --- | --- | --- |
| Ferrari World | 24.483673, 54.606857 | [Ferrari World](https://fr.wikipedia.org/wiki/Ferrari_World_Abu_Dhabi) |
| SeaWorld Abu Dhabi | 24.48560, 54.61928 | [OSM building](https://www.openstreetmap.org/way/1022397246), via [Mapcarta](https://mapcarta.com/W1022397246) |
| Abu Dhabi Mall | 24.4959, 54.3832 | [Mall directory](https://www.malls.com/malls/abu-dhabi-mall/) |
| Dalma Mall | 24.33306, 54.52382 | [OSM building](https://www.openstreetmap.org/way/102820609), via [Mapcarta](https://mapcarta.com/W102820609) |
| Museum of the Future | 25.21912, 55.2821 | [Museum location](https://en.wikipedia.org/wiki/Museum_of_the_Future) |
| Burj Khalifa | 25.1972, 55.2742 | [Building location](https://en.wikipedia.org/wiki/Burj_Khalifa) |
| Old Deira | 25.26714, 55.29799 | [Old Souk terminal](https://www.openstreetmap.org/node/2941645659), via [Mapcarta](https://mapcarta.com/N2941645659) |
| Karama | 25.24, 55.3011 | [Neighbourhood anchor](https://mapcarta.com/25727860) |
| Dubai Frame | 25.2355, 55.3004 | [Landmark reference point](https://www.coordmap.com/attractions/dubai-frame) |
| Skydive Dubai Desert Campus | 24.88523, 55.54801 | [Dropzone list](https://wingsuit.world/dropzones/); Margham campus confirmed by [Skydive Dubai](https://www.skydivedubai.ae/contact-us) |
| Deep Dive Dubai | 25.12768, 55.295127 | Map embedded on [official contact page](https://www.deepdivedubai.com/contact-us) |
| Desert Bike — Al Marmoom | 24.83, 55.38 | Rounded representative reserve anchor; [reserve location](https://en.wikipedia.org/wiki/Al_Marmoom_Desert_Conservation_Reserve), [Dubai Municipality](https://www.dm.gov.ae/dubai-protected-areas/wildlife/) |
| Dibba Rock | 25.60343, 56.35024 | [OSM dive site](https://www.openstreetmap.org/node/9865803545), via [Mapcarta](https://mapcarta.com/N9865803545) |
| Sharm Rock | 25.481944, 56.365861 | Converted from the DMS point in [Shark Divers' dive-site guide](https://www.sharkdiversuae.com/scuba-diving-blog/locations-of-best-scuba-diving) |

## Geographic layers

The country outline is Natural Earth's public-domain 1:10m geometry, clipped around the illustration. It is a simplified travel map, not a boundary survey. `scripts/build-uae-outline.mjs` accepts [Natural Earth's countries GeoJSON](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_countries.geojson) and writes the outline plus `docs/references/travel-country-pages/uae-outline-guide.svg`.

Regional detail is derived from [OpenStreetMap](https://www.openstreetmap.org/copyright), ODbL, retrieved 18 September 2026. The existing map UI shows attribution in city view. Abu Dhabi and Dubai include major roads and coastlines; Fujairah is a coastal detail layer. The SVGs are lazy-loaded when entering their cluster.

Rebuild with `node scripts/build-uae-details.mjs /path/to/prefix`, supplying `prefix-abu-dhabi-osm.json`, `prefix-dubai-osm.json`, and `prefix-fujairah-osm.json` Overpass exports. Query bounds are in `uaeDetailExtents`; request `way[highway~"^(motorway|trunk|primary|secondary)$"]` and `way[natural=coastline]` within those bounds, then `out geom`. Fujairah only needs the coastline query. Raw downloads remain outside the repository.

## Artwork

All assets were created with the **built-in image_gen tool**, using separate calls per asset. The existing Taj Mahal and Shanghai skyline cutouts supplied marker style references; the Jordan base supplied the map/footer style. The UAE outline guide supplied geographic composition. Alpha was retained when encoding the map, 14 individual marker cutouts, and footer to WebP.

- Map and markers: `public/images/travel/uae-map/` (`base.webp` plus one cutout per stop ID).
- Shared photograph: `public/images/travel/uae/placeholder.webp`.
- Footer: `public/images/travel/endings/uae.webp`.
- Marker alpha bounds: `src/data/uae-map-art.json`.
- Exact marker prompt set: [uae-art-prompts.json](references/travel-country-pages/uae-art-prompts.json).
- Exact map, photo and footer prompts: [uae-scenes-prompts.json](references/travel-country-pages/uae-scenes-prompts.json).

These are simplified illustrative symbols, not architectural surveys. No generated asset is referenced from a machine-specific cache path.
