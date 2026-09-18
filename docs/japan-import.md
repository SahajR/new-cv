# Japan photo journal

Japan is implemented at `/travel/japan/`, with 15 photo groups, 48 selected photographs, and editable MDX starter pages. Source material is the user's Japan photos in `travel_data/og japan` and `travel_data/more japan`. Normal imports read only these photo folders.

## Import evidence

- The original folder contains 95 JPEGs, 94 with GPS; its five videos remain in the source folder. The additional folder contains 20 JPEGs, all with GPS and a +09:00 camera offset.
- The complete photographs run from 30 May through 7 June 2025, normalized to Japan time. The first original photo retains a +08:00 camera offset: converting the instant to Japan time avoids a one-hour error.
- The original import found 56 corroborating Timeline matches within 15 minutes and 1 km of a photo. The current import uses photo metadata and visual inspection; it does not read Timeline or update that historic matching report.
- All 27 previously selected photographs remain. Contact sheets of the new files were inspected to select 18 more: two seaside-station photos, seven from Enoshima, three from Lake Kawaguchiko, one Lawson view, one Oshino Hakkai view, three from Chureito, and one café photograph added to Kamakura. A menu-board photo and a similar Lawson selfie were omitted.
- Expo 2025 is a separate stop on Yumeshima with four photographs from 1 June (18:03–19:22 JST). Photo GPS identifies these four among the 115 indexed Japan images; the 1 June contact sheet distinguishes them from Expo ’70 Park, later dinner in Osaka, and the next morning’s train. The mascot photo moved out of Osaka; the other three are newly published. Expo ’70 Park in Suita remains its own stop.
- The book's memory about visiting five cities in a day is not treated as an itinerary for this photo set. The photographs show Hiroshima/Miyajima on 2 June and Kyoto on 3 June. Existing personal memories are retained.

| Group | Photos | Photo dates in Japan |
| --- | ---: | --- |
| Osaka | 4 | 30–31 May |
| Kōyasan | 4 | 31 May |
| Expo Park | 2 | 1 June |
| Expo 2025 | 4 | 1 June |
| Hiroshima | 3 | 2 June |
| Miyajima | 4 | 2 June |
| Kyoto | 4 | 3 June |
| Tokyo | 4 | 4–5 June |
| Kamakura | 2 | 6 June |
| Kamakurakōkōmae station | 2 | 6 June |
| Enoshima | 7 | 6 June |
| Lake Kawaguchiko | 3 | 7 June |
| Lawson & Mount Fuji | 1 | 7 June |
| Oshino Hakkai | 1 | 7 June |
| Chureito Pagoda | 3 | 7 June |

The last seven groups are organized beneath “Kamakura & Enoshima” and “Around Mount Fuji” headings. The seaside station is separate from the Great Buddha in Kamakura. GPS distinguishes the Lawson near Fujikawaguchiko Town Hall from the other photographed Fuji-view branch near Kawaguchiko Station. The Oshino photo is assigned to the village without guessing an individual pond name. A file's folder is only a starting hint: the Oshino photo was supplied inside `pagoda`, but its coordinates and scenery identify a different stop.

Kyoto still groups Fushimi Inari, Higashiyama, and Arashiyama; Tokyo groups Skytree and Shibuya. There is one article per map group; distinct repeat-visit articles remain future work.

The starter prose describes the supplied photographs and their sequence. It does not supply invented personal reactions. Edit the MDX files in `src/content/travel/japan/` to replace it with personal writeups. One to four paragraphs all render naturally; additional paragraphs are supported.

## Rebuilding photographs

Run `node scripts/import-japan.mjs` from the project root. It requires the existing ExifTool command and the project's Sharp dependency. `scripts/japan-photo-selection.json` contains the selected filenames and image descriptions. Original entries use bare filenames in `og japan` (with a fallback to the former `Photos-1-001` folder); added entries use paths relative to `travel_data/` to avoid collisions between folders. Two original photographs are now named `bite_1_hachiko.jpg` and `bite2_serene_kyoto.jpg`; the selection records those current filenames. The command generates stripped WebP derivatives and `src/data/japan-photos.json`; it never edits the MDX files.

A private photo index is written to `travel_data/japan-import/photo-index.json`. Optional `node scripts/import-japan.mjs --match-timeline` also regenerates `matched-report.json`, bounding visits to the first/last photo plus one hour and matching each photo within 15 minutes and 1 km. That option was not used for the added photographs. Raw photographs, original GPS and Timeline candidates remain under the existing ignored `travel_data/` path. The public JSON contains only selected image URLs, dimensions, descriptions, and capture times. The web photographs do not retain EXIF/GPS metadata.

## Artwork

The original SVG landmark symbols represent Osaka Castle, a Kōyasan temple, Tower of the Sun, the Atomic Bomb Dome, Itsukushima's torii, a Kyoto pagoda, Tokyo Skytree, and the Great Buddha. Six more symbols represent the coastal train crossing, an island shrine, Fuji above a lake, Fuji above a blue-and-white shop, a thatched house beside a pond, and Chureito Pagoda with Fuji. These extend the existing SVG style and retain the requested 0.6-scale illustrations. Visual source: the user's photographs and the three references saved with the [country page plan](travel-country-pages-plan.md).

The stepped land silhouette is derived from the Japan feature in [Natural Earth's 1:50m country boundaries](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson), snapped to a five-unit illustration grid. Natural Earth is [public domain](https://www.naturalearthdata.com/about/terms-of-use/). The full view covers the main islands; outlying southern islands are omitted from this composition. The country outline is a geographic aid, not a border reference. Paths through the illustrated terrain are scenery, not the user's recorded route.

Landmark artwork is spaced into three rows away from dense geographic clusters, with leader lines back to the corresponding locations. The wider view keeps all 14 labels inside the map. The book retains its right-page map and the same sticky scroll behavior. Mobile initially frames the journey more closely; “Whole Japan” shows the larger illustration. The text index retains access to every destination at both scales.

Official naming references: [Tower of the Sun](https://www.expo70-park.jp/cause/expo/tower-of-sun/), [Kōtoku-in](https://www.kotoku-in.jp/en/), [Kōyasan](https://www.koyasan.or.jp/en/sitemap/), [Enoden coastal route](https://www.enoden.co.jp/en/tourism/access/), [Oishi Park](https://www.yamanashi-kankou.jp/english/explore-by-area/fujisan-fujigoko/flower-street-in-oishi-park.html), [Chureito Pagoda](https://fujiyoshida.net/en/see-and-do/12), and [Enoshima Shrine](https://discover-fujisawa.jp/en/whattosee/enoshima-shrine/).

## Behavior and maintenance

- The Japan map lives on the book's right page. As the book stage scrolls past the top, the same SVG lifts out of the 3D page, expands toward its reserved journal position, and docks there. Scrolling upward reverses the handoff. There is one live map, so highlights and keyboard focus persist. With reduced motion, it switches directly between the page and dock.
- The dock sticks within the journal until the cards end. Scrolling chooses one visible card below its lower edge. The compact book map also has an “Explore the map” link to the first card.
- Explicit map/index jumps set a card fragment and focus that card; passive scroll leaves focus and history alone.
- MDX pages return to their card. Published filtering is shared by map destinations, cards, article routes, and neighbor links. Missing/duplicate landmark references fail validation.
- Country changes fetch the destination's static journal region and replace it while retaining the book. Latest-request checks prevent stale content; fetch failure falls back to document navigation. Article pages use ordinary navigation.
- A shared observer/controller in `travel-scroll.ts` is mounted when a supported country journal is inserted and disposed when it is removed. It selects the current country's map explicitly. Styles are loaded by every country route, including when arriving from a country with no map. See the [Jordan import](jordan-import.md) for the shared components and current validation results.

The broader plan still covers future country artwork, more granular/repeated stories, additional photo figures, and richer authored prose. Japan uses the same journal components as Jordan, Egypt, and China.

## Validation

- 46 Node tests pass (`node --experimental-strip-types --test tests/*.test.mjs`), including selection below the sticky map, several visible compact cards, scrolling upward, empty gaps, the last card, reversible map handoff, deep-link docking, and reduced motion.
- Astro check: zero errors and warnings; one existing unused-variable hint in `JourneyPart.astro`.
- Production build: 47 pages, including the Japan index and 14 MDX articles. All travel links, image targets, and fragments resolve in the generated output; no duplicate IDs.
- Browser checks: desktop, 390px and 320px widths; no horizontal overflow; map jumps and keyboard activation; article return to Kyoto with 24px clearance below the sticky map; passive scroll highlights; full-map toggle; Japan → Egypt → Japan; browser Back/Forward. No browser console errors were observed.
- The additional stops were checked at desktop, 390px, and 320px: all 14 marker labels hit their own targets and fit inside their labels; new station and Chureito article photos load; Lake Kawaguchiko jumps leave 24px clearance below the map; no horizontal overflow.
- The book handoff was checked separately at desktop, 390px, and 320px: right-page placement, intermediate expansion, sticky docking, reverse scroll, jumps from the book, and country navigation retaining exactly one map.
- Fourteen lazy-loaded card thumbnails total about 712 KiB. Full-sized photos load on article pages. All 59 Japan WebP files total about 11.33 MiB and contain no retained EXIF/GPS. The 35 pre-existing WebP files remain byte-identical after importing the additional photos.

## Expo 2025 addition — 18 September 2026

The new editable article is `src/content/travel/japan/expo-2025.mdx`. The cover is MYAKU-MYAKU, followed by the Osaka Healthcare Pavilion, an Expo pavement emblem and a pavilion at sunset. The map marker uses the cover photo GPS within Kansai, with a fifth overview dot and a separately generated transparent mascot cutout; it also appears in the country’s marker album. Naming was checked against the official [MYAKU-MYAKU page](https://www.expo2025.or.jp/en/overview/Character/) and [Osaka Healthcare Pavilion page](https://www.expo2025.or.jp/en/dailylife/025/). The historical validation counts above describe earlier imports.
