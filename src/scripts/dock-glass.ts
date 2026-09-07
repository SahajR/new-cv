/** A cached, rounded lens for the footer's real backdrop pixels. */
export function prepareDockGlass() {
  const dock = document.querySelector<HTMLElement>('.ff-links');
  const filter = document.querySelector<SVGFilterElement>('#footer-refraction');
  const map = filter?.querySelector<SVGFEImageElement>('[data-glass-map]');
  if (!dock || !filter || !map) return;

  // Parsing url() isn't a rendering capability test: Safari and Firefox may
  // accept the syntax without rendering SVG backdrop displacement. Keep the
  // transparent CSS fallback unless this is a Chromium-based browser.
  if (!/(?:Chrome|Chromium|Edg)\//.test(navigator.userAgent)
    || !CSS.supports('backdrop-filter', 'url("#footer-refraction")')) return;

  const reduced = matchMedia('(prefers-reduced-transparency: reduce)');
  let size = '';
  let generation = 0;
  let ready = false;
  const update = () => {
    if (reduced.matches) {
      delete dock.dataset.glass;
      return;
    }
    const width = dock.clientWidth;
    const height = dock.clientHeight;
    if (!width || !height) return;
    const key = `${width}:${height}`;
    if (key === size) {
      if (ready) dock.dataset.glass = 'refraction';
      return;
    }
    size = key;
    ready = false;
    const version = ++generation;
    const radius = Math.min(height / 2, parseFloat(getComputedStyle(dock).borderTopLeftRadius) - 1);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixels = ctx.createImageData(width, height);
    const halfX = width / 2;
    const halfY = height / 2;
    const bevel = 10;
    const scale = 16;

    // Signed distance to the rounded rectangle, plus its outward normal.
    // Only the bevel refracts; the centre stays optically clear.
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const px = x + 0.5 - halfX;
        const py = y + 0.5 - halfY;
        const qx = Math.abs(px) - (halfX - radius);
        const qy = Math.abs(py) - (halfY - radius);
        const ox = Math.max(qx, 0);
        const oy = Math.max(qy, 0);
        const length = Math.hypot(ox, oy);
        const distance = radius - length - Math.min(Math.max(qx, qy), 0);
        const nx = length > 0 ? Math.sign(px) * ox / length : qx > qy ? Math.sign(px) : 0;
        const ny = length > 0 ? Math.sign(py) * oy / length : qy >= qx ? Math.sign(py) : 0;
        const bend = distance > 0 && distance < bevel ? Math.sin(Math.PI * distance / bevel) * 7 : 0;
        const i = (y * width + x) * 4;
        pixels.data[i] = Math.round(127.5 - nx * bend / scale * 255);
        pixels.data[i + 1] = Math.round(127.5 - ny * bend / scale * 255);
        pixels.data[i + 2] = 128;
        pixels.data[i + 3] = 255;
      }
    }
    ctx.putImageData(pixels, 0, 0);
    // Inline the tiny texture: feImage has inconsistent external-image loading
    // when its definition lives in a zero-size SVG.
    const texture = canvas.toDataURL();
    const image = new Image();
    image.onload = () => {
      if (version !== generation) return;
      filter.setAttribute('width', String(width));
      filter.setAttribute('height', String(height));
      map.setAttribute('width', String(width));
      map.setAttribute('height', String(height));
      map.setAttribute('href', texture);
      ready = true;
      if (!reduced.matches) dock.dataset.glass = 'refraction';
    };
    image.src = texture;
  };

  // There is no scroll/pointer handler or render loop. Rebuild only when the
  // dock's dimensions change; browser compositing handles scrolling behind it.
  new ResizeObserver(update).observe(dock);
  reduced.addEventListener('change', update);
  update();
}
