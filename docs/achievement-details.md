# Achievement details windows

Completed entries in `src/data/one-off-achievements.ts` receive an info button automatically. Their optional `details` array accepts ordered text and image blocks; all text is escaped by Astro, and each image requires alt text.

```ts
details: [
  { type: 'text', text: 'Completed in Petra.' },
  {
    type: 'image',
    src: '/images/achievements/my-photo.jpg',
    alt: 'Describe the moment shown in the photo.',
    width: 1200,
    height: 800,
    caption: 'Optional caption.',
  },
]
```

The example image path is illustrative; add the actual image to `public` before referencing it. Use just a text block for text-only windows, just an image block for image-only windows, or combine them in any order. Set `pixelArt: true` for a compact pixel illustration. Without custom details, the popup shows the badge illustration and its note, if present.

`AchievementDetails.astro` uses a native modal dialog with the shared `DialogWindow.astro` frame, a working title-bar close button, Escape and backdrop dismissal, keyboard focus containment, and native focus restoration. The page cannot scroll while a popup is open.

Percentage measurements in `src/data/achievements.ts` use `measurement: 'percentage'`: the meter shows the current measurement on a 0–100 scale, with a separate goal marker. It does not infer completion progress without a starting measurement.
