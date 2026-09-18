import type { MapCameraTransform } from './travel-map-camera';

const clamp = (value: number) => Math.max(0, Math.min(1, value));

// City transition storyboard (760ms, retargetable):
// 1. Fade the country paint into geographic river/street lines as we approach.
// 2. Near street scale, reveal cutouts from 65% to their readable screen size.
// 3. Pan to each next stop; reverse the same layers on the way out.
// Reduced motion uses the same final frame immediately, with no CSS delay.
export function cityMapPresentation(zoom: number, cityZoom = 1100) {
  const geography = clamp(Math.log(Math.max(1, zoom) / 3) / Math.log(10));
  // Reveal relative to the city's chosen zoom: a compact Agra scene needs
  // less magnification than Shanghai, but its landmarks must still finish.
  const landmarks = clamp((zoom / cityZoom * 1100 - 250) / 600);
  return { geography, landmarks, symbolScale: 2 * (.65 + .35 * landmarks) / zoom };
}

export function createMapClusters(map: HTMLElement, canvas: SVGSVGElement) {
  const cities = [...map.querySelectorAll<SVGAElement>('[data-map-city]')];
  const markers = [...map.querySelectorAll<SVGAElement>('[data-map-stop]')];
  const details = [...map.querySelectorAll<SVGImageElement>('[data-map-detail]')];
  const overviews = [...map.querySelectorAll<SVGGElement>('[data-map-cluster-overview]')];
  const symbols = [...map.querySelectorAll<SVGGElement>('[data-cluster-symbol]')];
  const base = map.querySelector<SVGGElement>('.painted-map-base');
  const back = map.querySelector<HTMLButtonElement>('[data-map-city-back]');
  const credit = map.querySelector<HTMLAnchorElement>('[data-map-city-credit]');
  let active = '';
  let scene = '';
  let readableScale = 2;
  let visibleView = { x: 0, y: 0, width: 0, height: 0 };

  function setCluster(id: string) {
    if (!cities.length) return;
    // At least 40px of artwork / 48px of hit area in a narrow dock.
    const rect = canvas.getBoundingClientRect();
    const view = canvas.viewBox.baseVal;
    const unit = Math.max(.1, Math.min(rect.width / view.width, rect.height / view.height));
    readableScale = Math.max(2, 40 / ((Number(map.dataset.mapMarkerWidth) || 25.3) * Math.max(.1, unit)));
    // SVG's meet alignment exposes extra map area in a wide desktop dock.
    visibleView = { x: view.x + (view.width - rect.width / unit) / 2, y: view.y + (view.height - rect.height / unit) / 2, width: rect.width / unit, height: rect.height / unit };
    if (active === id) return;
    active = id;
    if (id) {
      scene = id;
      const image = details.find(image => image.dataset.mapDetail === id);
      // The book contains every country: fetch city geometry only on entry.
      if (image?.dataset.detailSrc && !image.hasAttribute('href')) image.setAttribute('href', image.dataset.detailSrc);
    }
    map.dataset.activeCluster = id;
    if (back) back.hidden = !id;
    if (credit) credit.hidden = !id;
    for (const marker of markers) {
      const hidden = marker.dataset.stopCluster ? marker.dataset.stopCluster !== id : Boolean(id);
      marker.setAttribute('aria-hidden', String(hidden));
      marker.setAttribute('tabindex', hidden ? '-1' : '0');
      marker.toggleAttribute('data-map-concealed', !marker.dataset.stopCluster && hidden);
    }
    for (const city of cities) {
      city.setAttribute('aria-hidden', String(Boolean(id)));
      city.setAttribute('tabindex', id ? '-1' : '0');
    }
  }

  return {
    setCluster,
    zoomFor(id: string) { return Number(cities.find(city => city.dataset.mapCity === id)?.dataset.cityZoom) || 2; },
    render({ scale, x, y }: MapCameraTransform) {
      if (!cities.length) return;
      if (!active && scale <= 2) scene = '';
      const cityZoom = Number(cities.find(city => city.dataset.mapCity === scene)?.dataset.cityZoom) || 1100;
      const { geography, landmarks, symbolScale } = cityMapPresentation(scale, cityZoom);
      const detail = scene ? geography : 0;
      if (base) base.style.opacity = String(1 - detail);
      for (const image of details) image.style.opacity = image.dataset.mapDetail === scene ? String(detail) : '0';
      for (const overview of overviews) {
        overview.style.opacity = String(1 - detail);
        overview.style.visibility = detail === 1 ? 'hidden' : 'visible';
      }
      for (const symbol of symbols) {
        symbol.setAttribute('transform', `scale(${symbolScale * readableScale / 2})`);
        const marker = symbol.closest<SVGAElement>('[data-map-stop]')!;
        const opacity = marker.dataset.stopCluster === scene ? landmarks : 0;
        marker.style.opacity = String(opacity);
        marker.style.visibility = opacity > 0 ? 'visible' : 'hidden';
        // Offscreen sights remain available in the story list; don't leave
        // invisible keyboard targets far outside the clipped city viewport.
        const view = visibleView;
        const px = Number(marker.dataset.mapX) * scale + x;
        const py = Number(marker.dataset.mapY) * scale + y;
        const interactive = active === marker.dataset.stopCluster && opacity > .95 && px >= view.x && px <= view.x + view.width && py >= view.y && py <= view.y + view.height;
        marker.setAttribute('aria-hidden', String(!interactive));
        marker.setAttribute('tabindex', interactive ? '0' : '-1');
      }
    },
    cleanup() {
      setCluster('');
      delete map.dataset.activeCluster;
      for (const item of [...details, ...overviews, ...markers, ...(base ? [base] : [])]) item.removeAttribute('style');
      for (const symbol of symbols) symbol.removeAttribute('transform');
    },
  };
}
