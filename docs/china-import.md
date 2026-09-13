# China photo import

## Source and selection

`travel_data/china` contains 48 JPEG photographs, four HEIC photographs, and one MP4. All 52 still images were visually reviewed. Photo GPS, capture dates, visual landmarks, the existing Disneyland note, and the user's confirmation of Zhujiajiao support the groupings. The large Timeline was not read.

The 35 selected photographs span 23–30 September 2023. Every selected source has a complete capture timestamp and an explicit +08:00 offset. All four HEIC images are included after conversion. Their locations were assigned from visual evidence rather than assuming they follow the Pixel camera's itinerary: West Lake's pavilion, the Oriental Pearl Tower, Yuyuan Garden's pavilion and covered pond walkway, and the user-confirmed canal scene in Zhujiajiao.

| Region | Section | Photos | Dates |
| --- | --- | ---: | --- |
| Beijing | Forbidden City & Jingshan | 6 | 23–24 September |
| Beijing | Mutianyu Great Wall | 5 | 25 September |
| Beijing | Bird's Nest | 1 | 25 September |
| Hangzhou | Olympic Sports Centre | 3 | 26 September |
| Hangzhou | West Lake | 2 | 26 September |
| Shanghai | The Bund & Lujiazui | 4 | 27–28 September |
| Shanghai | Shanghai Zoo | 4 | 28 September |
| Shanghai | Yuyuan Garden & Bazaar | 3 | 28–29 September |
| Shanghai | Shanghai Disneyland | 5 | 29 September |
| Shanghai | Shanghai Maglev | 1 | 30 September |
| Shanghai | Zhujiajiao | 1 | 30 September |

Similar views, meal photographs, a ticket/passport photograph, the zoo ticket, incidental indoor scenes, and the MP4 are left in the source folder. The first pass focuses on identifiable sights. Starter prose describes the photographs; it does not invent conversations, reactions, event attendance, train speeds, or a boat ride.

## Editing and rebuilding

- Each writeup is independently editable in `src/content/travel/china/*.mdx`.
- `scripts/china-photo-selection.json` controls gallery order and alt text. Each group's first photograph is its card and article cover.
- Run `node scripts/import-china.mjs` to regenerate `src/data/china-photos.json` and the optimized WebPs. It preserves source media and authored MDX.
- ExifTool and Sharp are required. On macOS, the importer uses `sips` for iPhone HEIC files and caches validated JPEG intermediates in ignored `travel_data/china-import/converted`. Cache filenames include a source-content hash, so changing an original cannot reuse an older conversion. ImageIO access is required for the initial conversion; a restricted sandbox can produce an incomplete JPEG despite a successful `sips` exit code, which the importer detects before publishing.
- Raw metadata stays under ignored `travel_data/china-import/metadata.json`. All 46 public WebPs—35 gallery images and 11 card covers—contain no EXIF or GPS tags. They total approximately 7.86 MiB; card covers total approximately 483 KiB.

## Country map

`src/data/china.ts` defines the eleven stops and their Beijing, Hangzhou, and Shanghai groups. `ChinaMap.astro` adds original SVG illustrations for the palace, Great Wall, Bird's Nest, Little Lotus, a lakeside pavilion, the Pudong skyline, a tortoise, Yuyuan rooflines, the Disneyland castle, a Maglev train, and a canal boat beneath a bridge. Sprites use the existing 0.6 scale. The shared components supply the right-page placement, reversible handoff into the sticky map, card highlighting, and MDX article routes.

The silhouette is the China feature from [Natural Earth's country boundaries](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson), snapped to a four-unit grid. Natural Earth is [public domain](https://www.naturalearthdata.com/about/terms-of-use/). Terrain and rivers are simplified. Illustrations are spread out for readability, with leaders pointing to public sights rather than accommodation or private locations. The leaders do not reconstruct a travel route.

## Identification references

- [Mutianyu's official illustrated guide](https://en.mutianyugreatwall.com/pdf/guide).
- The Asian Games organizer's [Little Lotus venue description](https://www.hangzhou2022.cn/En/presscenter/spotnews/latestnews/202105/t20210513_11887.shtml).
- Shanghai's official [Yuyuan Bazaar guide](https://english.shanghai.gov.cn/en-PlanANightOut/20231206/04f4626499ef46cab5a5862e577e3c68.html). The HEIC garden scene was matched to photographs of the distinctive covered pond corridor in [Yu Garden](https://www.routard.com/fr/guide/asie/chine/shanghai/vieille-ville-chinoise/jardin-yu-yu-yuan).
- Disney's [Enchanted Storybook Castle](https://sites.disney.com/waltdisneyimagineering/enchanted-storybook-castle/) and [Shanghai park guide](https://disneyparksblog.com/shdl/ultimate-guide-to-shanghai-disney-resort/).
- The user identified `IMG_5707.HEIC` as Zhujiajiao; Shanghai's [historical block guide](https://english.shanghai.gov.cn/en-HeritageZones/20240827/66903de4b44047a5aeb1284a2148fc09.html) supplies the architectural context for its illustration.

## Validation

- The 46 existing Node tests pass. Astro check reports zero errors and warnings, with the existing unused-variable hint in `JourneyPart.astro`.
- The production build generates 41 pages, including all eleven China articles. A generated-output check verified 1,510 local links, fragment targets, and image references across 39 travel pages, with no missing targets or duplicate HTML/SVG IDs.
- ExifTool confirms all 46 exported WebPs contain no EXIF or GPS metadata.
- Browser checks cover the right-page map, sticky docking and return, manual scroll highlighting, marker clicks, HEIC cover orientation, rendered MDX, article return, and page turns through India and back to China. No console errors were reported in the checked preview.
- Desktop, 390px, and 320px layouts have no horizontal overflow. All eleven label centers resolve to their own marker hit targets, and labels fit their backgrounds. Returning from the West Lake article leaves 24px of clearance below the sticky map.
