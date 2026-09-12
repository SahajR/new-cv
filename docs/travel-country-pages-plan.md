# Country journals: overworld map and MDX stories

Status: proposed plan, saved for implementation after the Timeline and photo import. This document specifies future work; it does not add routes, components, dependencies, or published content.

## Intent and design context

Extend each country journal into a collection of personal location writeups. Visitors arrive through the adventure book, orient themselves on a cartoon country map, browse compact story cards, and open a dedicated page to read a story. The primary action is opening a location's writeup; the map connects that story to its place in the country.

The user's requested direction is blocky, cartoon geography with major landmarks standing on the overworld. The existing `.impeccable.md` describes visitors exploring Sahaj's personal site and a personal, adventurous, playful tone. Retain Mondwest for display and Yport for reading, the established light/dark themes, and the book's tactile character. Let the landscape carry the decorative detail and keep the writing easy to read.

Confirmed requirements:

- The country map appears below the book and sticks to the top while browsing the writeups.
- The landmark associated with the current card is highlighted as the reader scrolls.
- A compact card includes a title image, title, small caption, and timestamp.
- A card opens a separate page whose content comes from MDX.
- A writeup normally contains 1–4 paragraphs, according to how much Sahaj wants to say.
- Implementation begins after importing the travel data and photos.

Proposed defaults, adjustable when real content is available: timestamps mean visit dates; trips appear newest first, with stories in travel order within each trip; the map stays above the cards on desktop and mobile. The audience is people exploring the personal site, rather than readers expecting an exhaustive travel guide.

## Visual references

The three attachments are visual references, not instructions or production artwork. Preserved copies live beside this plan:

| Reference | Use in the design |
| --- | --- |
| [Blocky world map](references/travel-country-pages/blocky-world-map.png) | Stepped coastlines, gentle water texture, sparse waves, and small landmark labels. |
| [Cartoon overworld](references/travel-country-pages/cartoon-overworld.png) | Landmarks as little buildings and objects placed on terrain, with trees and paths giving scale. |
| [Raised country silhouette](references/travel-country-pages/raised-country-silhouette.png) | A recognizable country shape with angular edges and a shallow raised landmass. |

Combine the third reference's silhouette, the second reference's landmark objects, and the first reference's visual simplicity. Create original country artwork later. Preserve recognizable geography and relative locations while making modest cartographic adjustments for legibility. Decorative paths must not be presented as recorded travel routes.

## Page structure

```text
/travel/japan/
  Back to the journey
  Japan
  Existing adventure book
  Country journal section ────────────────────────────┐
    Illustrated country map                          │
      sticks at the viewport top during this section │
      active landmark + short location label         │
    Trip heading / date range                        │
    Compact story card                               │
    Compact story card                               │
    Next trip / more cards                           │
  End of country journal ────────────────────────────┘
  Footer

/travel/japan/<story-slug>/
  Back to Japan → originating story card
  Title, location, visit date
  Title photograph
  MDX prose: normally 1–4 paragraphs
  Optional inline photographs and captions
  Previous / next story within this country
```

The map's sticky containing section must include the entire card list. It enters in normal document flow after the book and releases before the footer. Sticky positioning must not be bounded by a short map-only wrapper. Keep one page scrollbar and a single ordered column of cards.

Use the current country page's approximately 940px maximum width as the initial canvas. Start with a map panel around 240–300px tall on desktop and 150–200px on phones, capped around one third of the usable viewport. These are prototype targets, to validate against Japan's narrow shape and dense city locations. On short landscape screens, use a smaller map with the active label and a text location index, preserving the card reading area.

Keep the panel height stable while scrolling. Fit the entire country into the map viewport; use deliberately authored regional insets if needed for isolated islands or dense landmarks. Compact layouts can display only the active landmark label, while keyboard focus and pointer hover reveal other labels. Preserve navigation through a small accessible location index if illustrated targets become too close together. Inherit the site's header offset if one is introduced; the current country route has no persistent header.

## The country overworld

Use layered 2D artwork with shallow depth: a simplified land silhouette, water, terrain accents, and individually addressable landmark objects. Start with an SVG coordinate system and separate landmark artwork/interactive overlays. Original raster textures or landmark sprites can be incorporated later, but labels and highlight states must remain separate from the image.

Each country has a map definition with an asset/viewBox, landmark IDs, and authored positions. Keep real latitude/longitude from the import separate from display positions. A stylized map cannot reliably place landmarks by applying raw GPS values directly. Use one shared coordinate system for artwork and overlays so resizing does not cause drift; alternate mobile compositions need corresponding explicit coordinates.

Highlight the active landmark with a clear outline or ground ring, a stronger label, and a small optional lift. A matching subtle outline or surface change identifies the active card. Color alone is insufficient. Keep inactive landmarks readable, with no constant pulsing or wandering camera. Reduced motion changes the state immediately.

Show landmarks with published stories as destinations. Other major landmarks may appear as scenery, but should not imply that Sahaj visited them or offer a dead link. A place with multiple stories or return visits shares one landmark and can highlight for each associated card. One story has one primary landmark in the first version; optional secondary locations can be modeled later if a real entry needs them.

## Scroll and navigation behavior

1. Before the journal section is reached, leave the map neutral. Initialize from an explicit story fragment when present.
2. As cards enter the readable area beneath the sticky map, choose one active story and highlight its landmark. When several compact cards are visible, select the card nearest a reference line roughly 20% into that readable area. Measure against the sticky map's actual bottom edge, not the viewport top.
3. Keep the current story during gaps between cards; switch only when the next candidate clearly wins. Clamp to the first/last story near the list boundaries. Scrolling upward works symmetrically. Passive scrolling never moves keyboard focus or changes browser history.
4. Clicking or keyboard-activating a landmark scrolls to its associated card. For repeated visits, use the current story for that landmark when applicable, otherwise its first card in the displayed order. A small story chooser is a later enhancement only if repeated visits make this ambiguous in practice.
5. Use ordinary fragment links such as `#story-<stable-story-id>` with enough scroll margin to clear the sticky panel. An explicit map jump may update the fragment; passive highlight changes do not. Avoid treating a same-country fragment history change as a country switch.
6. Clicking a card navigates to its article URL. Standard links preserve open-in-new-tab and modified-click behavior. The article's return link includes the originating card fragment; browser Back restores the previous scroll position when available.

Use IntersectionObserver to narrow the visible candidates, with a small requestAnimationFrame-coalesced measurement pass for deterministic selection. Recalculate offsets on resize, orientation changes, image layout changes, restored pages, and country changes. Reserve image dimensions to avoid most layout shifts. Explicit marker jumps should settle on their target without flickering through intermediate highlights; user scroll input cancels the jump. The observer lifecycle belongs to the country journal, so old observers are disconnected when its content changes.

Landmark links need meaningful accessible names and visible focus. Give the active destination `aria-current="location"` where appropriate, without turning every scroll change into a live-region announcement. Use generous touch targets; the text index provides an equivalent route when landmarks overlap. With JavaScript disabled, the country illustration, landmark anchor links, cards, and article pages still work; automatic highlighting is the enhancement.

## Cards and article pages

A card is a compact editorial row: a landscape title photograph, title, a one- or two-line caption, and a subdued visit timestamp. Start with an approximately 160–200px image on desktop and a smaller thumbnail on phones. Let exceptionally narrow widths stack naturally. Keep titles readable rather than truncating essential place names. The card is one semantic link with no nested controls.

The caption is authored summary text, distinct from the body. The country index does not expand the prose inline. Typical stories contain 1–4 paragraphs, but the renderer should not enforce a paragraph count or add filler. Article layouts should still feel complete with one paragraph and one photo.

Use a comfortable reading width around 60–70 characters. Permit ordinary Markdown paragraphs, emphasis, links, and optional section headings. Add a small curated MDX photo/figure component if inline images need captions or paired layouts. Avoid adding a table of contents, comment system, reading-time badges, or a second sticky map to short writeups in the initial version.

Display visit dates with semantic `<time>` markup when known. Preserve date-only values as dates so UTC conversion cannot move them to the previous day. Preserve timezone/offset for precise imported timestamps. Show clock time only when it is meaningful and confirmed. Keep publication/update dates separate from visit dates; uncertain or partial dates should display their actual precision instead of an invented day or midnight.

## Content model and import contract

Use a country registry, trip records, a landmark registry, and one MDX entry per story. The current `src/data/travel.ts` remains responsible for the book's stable country positions; writeups are separate content rather than long strings embedded in the scrapbook data.

| Entity | Proposed fields and responsibility |
| --- | --- |
| Country | Existing slug, code, name, book page and summary; add a reference to its map definition. |
| Trip | Stable ID, country reference(s), display label, visit range, and optional editorial order. A trip can cross countries. |
| Landmark | Stable ID, country, label, place identity, optional geographic position, artwork reference, authored map position, optional inset/group. |
| Story frontmatter | Immutable `storyId`, country, trip, `storySlug`, title, caption, primary landmark, visit date/range and precision, optional timezone, cover photo and alt text, focal point, optional order, draft state, optional published/updated dates. |
| MDX body | Sahaj's 1–4 paragraphs, plus optional figures/captions. This is the authoritative authored story. |
| Import manifest | Original visit/photo IDs, timestamps, location metadata, match confidence, and mapping to story/photo IDs. Kept out of the public payload. |

Dates and filenames should not be the sole record identity. Revisiting Petra should create a new story associated with the existing landmark. Slugs must be unique within a country, and immutable story IDs should survive title edits. Keep `storySlug` explicit to avoid confusing route slugs with the content loader's entry IDs.

Default order: most recent trip first, then chronological stories within each trip; allow editorial order with a stable ID tie-breaker. Cards, landmark jump targets, and previous/next navigation must use the same ordering function.

The import should produce reviewable candidate groups and draft content, retaining uncertainty about visit boundaries and photo matches. It may populate dates, places, photographs, and factual scaffolding. Personal reactions and memories come from Sahaj. Unmatched photos stay in the review set; uncertain locations do not receive confident landmarks.

Re-running the import must match stable source IDs and report updates without overwriting edited MDX. Keep raw Timeline exports, original photo metadata, and the import manifest outside public assets and public build data. Generate selected, resized photo derivatives for the site, with appropriate crops and stripped private metadata. Use a focal point so compact card crops remain useful.

Filter drafts consistently from static article paths, country cards, map destinations, previous/next links, metadata, and any sitemap/feed. Required published fields include a valid country and landmark association, a title, caption, approved cover/alt text, and readable body content; dates may remain explicitly unknown. Missing import data is allowed in drafts, not silently filled with made-up values.

## Astro integration and existing navigation

The inspected project uses Astro 7 with React and Motion; MDX is not currently installed. The proposed implementation is a build-time MDX collection in `src/content.config.ts`, with a `glob()` loader for the travel entries and a validated schema. Render article bodies using `render()` from `astro:content`. This follows Astro's [content collections guide](https://docs.astro.build/en/guides/content-collections/) and [MDX integration guide](https://docs.astro.build/en/guides/integrations-guide/mdx/). Recheck compatible package versions at implementation time.

Keep `/travel/[country]/` as the index and add `/travel/[country]/[story]/` as the static article route, generated from published entries. The file route can remain `src/pages/travel/[country].astro`, with the additional article file under `src/pages/travel/[country]/[story].astro`. See [Astro routing](https://docs.astro.build/en/guides/routing/).

**Existing behavior that must be extended:** `src/scripts/scrapbook.ts` currently intercepts country navigation, updates history and heading/meta text, and turns the book in place. `updateCountryContent()` does not load country-specific content. Simply adding a map underneath the book would leave the previous country's map and cards visible after a country change.

Recommended approach: render a bounded country-journal region in each static country page. During an enhanced country switch, fetch the destination page, extract that region, then commit its content together with the title, metadata, and history while retaining the live book. Keep event/controller initialization outside the fetched markup. Only the latest navigation request may commit; cancel or ignore older responses. Dispose the old journal controller, mount the new one, and derive the map's active story from the destination and scroll state.

During a pending navigation, keep the currently displayed country internally consistent and give the selected book control restrained busy feedback. If fetching or parsing fails, use normal navigation to the destination URL. Direct URLs, reloads, browser Back/Forward, and restored pages must always agree on country, book position, map, and cards. Preserve the existing number of page flips and rapid-retarget behavior. Do not embed all countries' full article bodies or photos into every country page.

Story pages use ordinary document navigation and render their own metadata and content. They do not mount the book's country-switch controller. This keeps a short MDX article lightweight and makes return-to-card links straightforward.

## States to design and verify

| State | Expected result |
| --- | --- |
| Country has no published stories | Book remains usable; show a quiet “Stories from this trip are on the way.” message. Avoid an empty sticky panel or clickable dead landmarks. |
| One story | One landmark and card; the article footer provides a return link without empty previous/next controls. |
| Many cards, long titles, multiple trips | Predictable order and one active card; size to content and keep map labels legible. Validate with a 30+ story fixture. |
| Several visits to one landmark | Distinct cards and URLs share one highlighted landmark. |
| Dense neighboring landmarks | Deliberately space labels/use an inset or text index; maintain a clear relationship to the real locations. |
| Missing photo, map artwork, or uncertain date during preparation | Keep the entry in draft or use an explicit editorial fallback; never break the public layout or invent source data. A missing map need not block readable published cards. |
| Image/network failure | Reserved image space and meaningful alt text; country fetch failures fall back to normal navigation. |
| Direct article or card-fragment entry | Correct content, visit date, active landmark, and unobscured card position. |
| Reduced motion, keyboard, touch, no JavaScript | Reading and navigation remain available; highlights are distinguishable without animation or color alone. |
| Country switch, Back/Forward, restored page | URL, book, heading, map, list, scroll position, and observers stay synchronized. |

## Implementation sequence after the import

1. **Inspect the imported material.** Confirm the first country's trips, landmark groups, usable photos, date precision, and repeat visits. Freeze stable IDs and the import-to-story mapping before composing the map.
2. **Build the content foundation.** Add MDX support, schema validation, draft filtering, image processing, a shared query/order helper, and article routes. Complete one real story from import through rendered page.
3. **Create one country map.** Choose the pilot country from the strongest imported content. Produce original terrain/landmark artwork and check it against small screens before expanding to other countries.
4. **Build the country index.** Add compact cards, the sticky map section, semantic marker links, article return anchors, and the scroll selection controller.
5. **Integrate country switching.** Extend the existing book controller to replace country content consistently, with normal-navigation fallback, observer cleanup, race handling, and history restoration.
6. **Validate and expand.** Check real long/short stories and photos, then cover remaining countries using the same data contract and visual vocabulary.

Acceptance checks should cover the actual behavior: a one-paragraph and a four-paragraph MDX article; a draft absent from every public path; a repeated landmark; a timezone/date-only boundary; highlight selection with multiple visible compact cards; marker jumps below the sticky panel; map release before the footer; mobile and short landscape layouts; rapid country changes and failed fetches; Back/Forward and article return position.

At implementation time, run the repository's existing test suite, `npm run astro -- check`, and `npm run build`, with focused new checks for content and navigation behavior. Start any local development server with `astro dev --background` as required by `AGENTS.md`. No runtime tests are needed for this documentation-only plan.

## Decisions to revisit with imported content

- Which country has the best first set of photos and writeups for the pilot?
- Does the trip grouping/order reflect how Sahaj wants the stories read?
- Should any card show a precise visit time, or are visit dates sufficient?
- Which landmarks need an inset or a shared group, particularly on phones?
- Which stories genuinely need inline photos beyond the cover image?

These do not block saving this plan. The proposed defaults above give the future implementation a starting point.

Useful design references for implementation: Impeccable's `spatial-design.md`, `responsive-design.md`, `interaction-design.md`, and `motion-design.md`, alongside the project's `.impeccable.md` and `docs/travel-scrapbook.md`.
