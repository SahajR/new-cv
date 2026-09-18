# Travel Bites

Bites are short, independent stories beneath a country's location journal. The grid has two cards per row, including on mobile. Cards contain a square photograph and a title. Each opens its own page with the same crop, a title, a description, and a Markdown body.

The first entry is [Hachikō](../src/content/bites/japan/hachiko.md), using the photograph supplied as `travel_data/og japan/bite_1_hachiko.jpg`. Its two paragraphs are editable starter copy. The background about waiting for his owner is supported by [Tokyo's official travel guide](https://www.gotokyo.org/en/spot/86/); no personal reaction has been invented.

The second entry, [Serene Kyoto](../src/content/bites/japan/serene-kyoto.md), uses `travel_data/og japan/bite2_serene_kyoto.jpg`, photographed on 3 June 2025. Its square crop favors the river valley and Sahaj at the railing. The starter describes the Arashiyama viewpoint visible in the photograph; the Markdown is ready for a personal story about the bamboo park visit. `order: 2` pairs it with Hachikō in the first row.

The next row pairs [Starbucks on Ninenzaka](../src/content/bites/japan/starbucks-kyoto.md) (`order: 3`) and [Under the bamboo](../src/content/bites/japan/arashiyama-bamboo.md) (`order: 4`), added on 18 September 2026. Both use 3 June photographs from `travel_data/og japan`: `PXL_20250603_031200090.MP.jpg` shows the Starbucks storefront, and `PXL_20250603_060106800.jpg` shows Sahaj in the bamboo grove. Bottom-aligned square crops keep the wooden sign and the person visible; the full portrait sources remain available to adjust later. Both were resized to 1084 × 1440 WebP with EXIF/GPS stripped.

The Starbucks starter also reflects the photographed coffee tray and tatami in `PXL_20250603_032002260.jpg`. The branch name and tatami seating are corroborated by [Starbucks Japan’s announcement](https://www.starbucks.co.jp/press_release/pr2017-2182.php). The new bamboo bite links to the existing river-view bite; the two describe different moments. All prose remains editable Markdown, with no invented personal reactions.

The third row pairs [Flower ice cream](../src/content/bites/japan/flower-ice-cream.md) (`order: 5`) and [Through the red gates](../src/content/bites/japan/fushimi-inari.md) (`order: 6`). The ice cream uses `travel_data/more japan/fuji/PXL_20250607_040431849.jpg`, photographed on 7 June 2025. The user identified the pale soft-serve cone in front of Oishi Park’s gardens and Mount Fuji. Its bottom-aligned square crop keeps the cone, blue flowers, and mountain together; the flavour is left unspecified in the editable starter.

The torii photograph is `travel_data/og japan/PXL_20250603_015623661.jpg`, photographed on 3 June 2025. The user confirmed Fushimi Inari as the intended location. Its bottom-aligned square crop emphasizes the torii corridor and wet path. Both WebPs are 1084 × 1440 with EXIF/GPS stripped.

## Add a Bite

1. Put a web-sized photo in `src/assets/bites/<country>/`. JPEG, PNG, and WebP work; Astro generates responsive WebP variants automatically. Keep originals in ignored `travel_data/` and strip private EXIF/GPS before adding a public asset, as with the existing country imports.
2. Create `src/content/bites/<country>/<story-name>.md` using the example below. `.mdx` works too if you later need components.
3. Set `draft: false` when it should appear. The grid and story route are discovered automatically. There is no map configuration or separate photo manifest to update.

Supported country folders are `jordan`, `japan`, `egypt`, `india`, and `china`, from `src/data/travel.ts`. Bites do not require location-map entries. Empty Bite sections are hidden.

```markdown
---
title: A moment to remember
description: A short introduction shown on the story page.
cover: ../../../assets/bites/japan/my-photo.webp
imageAlt: A clear description of the photograph.
order: 2
draft: false
---

Write the story here. One paragraph is enough, and you can add more whenever you like.

**Emphasis**, [links](https://example.com), lists, and headings are all supported.
```

The folder supplies the country; the filename supplies the URL. For example, `japan/hachiko.md` becomes `/travel/japan/bites/hachiko/`. Use lowercase filenames with hyphens. Titles can contain accents and punctuation. Lower `order` values appear first; equal values sort by filename. `order` defaults to zero and `draft` defaults to true.

Optional `coverPosition: 50% 40%` adjusts the square crop without altering the source photo. It applies to both the card and story image; the default is `50% 50%`. `imageAlt` is accessible alternative text, not another visible card caption. The `description` stays on the story page, while the Markdown body follows it.

## Implementation

- `src/content.config.ts`: separate `bites` collection with validated metadata and local image references.
- `src/lib/travel-bites.ts`: published filtering, country/path validation, ordering, URLs, and unique image-transition names.
- `src/components/CountryBites.astro` and `BiteImage.astro`: shared grid and responsive photograph.
- `src/pages/travel/[country]/bites/[bite].astro`: shared article route and Markdown rendering.
- `src/styles/travel-bites.css`: two-column cards, article layout, image transition, and text entrance.

Bites sit inside the region already fetched on book country changes, so navigating between countries updates them with the location journal. Their styles load on every country route. They are outside the map's sticky section and do not change map markers or location-card highlighting.

The image uses the existing native cross-document View Transitions setup. Matching names include country and filename, so adding Bites cannot duplicate image names. Supporting browsers move the square photo between the card and article while the new text appears. Other browsers use ordinary links and fully rendered pages. Reduced motion disables the animations. Return links target the original Bite card.

## Validation

- Astro check passes with no errors or warnings; the pre-existing `JourneyPart.astro` unused-variable hint remains.
- All 46 existing Node tests pass.
- Production build creates 51 pages, including Hachikō and Serene Kyoto; all generated travel links, images, and fragments resolve without duplicate IDs.
- The source photo was resized to 1084 × 1440 WebP with EXIF/GPS removed. Astro builds 360px, 640px, and 1084px responsive variants, shared by the card and article.
- Browser checks cover desktop, 390px, and 320px: two equal grid columns, square photographs, no horizontal overflow, keyboard opening, article return/focus, and Japan → Egypt → Japan restoring the Bite grid. The article image loads correctly; ordinary card/article navigation produced no console errors. Resizing the viewport during a native transition can skip that animation while navigation still succeeds.
