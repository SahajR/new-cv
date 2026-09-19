# Hobbies scrapbook

The index is `/hobbies/`. Each entry in `src/content/hobbies/` creates its own `/hobbies/<filename>/` page. These pages are available with either value of `FULL_VERSION_AVAILABLE`.

## Editing stories

Edit the Markdown below the frontmatter in:

- `src/content/hobbies/scuba-diving.md`
- `src/content/hobbies/skydiving.md`
- `src/content/hobbies/equestrianism.md`
- `src/content/hobbies/motocross.md`

The text starts with the short descriptions carried over from `is-me`; no extra personal memories were invented. Markdown headings, paragraphs, links, lists and images render below the album. MDX is supported too.

`title` labels the list and page. `order` controls list and previous/next navigation. `description` is page metadata. `album` selects an entry in `src/data/hobby-photos.json`. `illustration` and `illustrationAlt` choose the artwork on the right-hand page; dimensions default to 1000 × 667 and can be overridden with `illustrationWidth` / `illustrationHeight`.

## Photographs

`src/data/hobby-photos.json` holds ordered photo records (`src`, `thumbnail`, `width`, `height`, `alt`). The first four appear as taped prints in the book; every photo belongs to the one album beneath it. Thumbnails in the contents list use the existing shuffling card component. Full photos are capped at 1600px and thumbnails at 360px.

The initial migration includes all 8 scuba, 7 skydiving, and 5 equestrian photos from the legacy Interests list, plus its motocross image and the additional motocross photo already in this site's source album. Assets are copied into `public/images/hobbies/`; builds do not need the legacy repository.

`node scripts/import-hobbies.mjs` can repeat the migration from `../is-me/public` (or a path passed as its first argument). This rewrites the photo manifest, not the Markdown stories.

## Adding a hobby

1. Put its optimized photos under `public/images/hobbies/<slug>/` and add an album to the photo manifest.
2. Add `src/content/hobbies/<slug>.md` using an existing entry's frontmatter.
3. Add its transparent illustration and reference it in that frontmatter.

The list, album, scrapbook and previous/next links follow the collection automatically. Artwork prompts and saved paths are in [hobby-artwork.md](hobby-artwork.md).
