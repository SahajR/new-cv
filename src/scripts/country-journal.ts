import { setupTravelScroll } from './travel-scroll';

let cleanup: (() => void) | undefined;
export function mountCountryJournal() {
  cleanup?.();
  const journal = document.querySelector<HTMLElement>('[data-travel-journal]');
  cleanup = journal ? setupTravelScroll(journal) : undefined;
  // The map reserves its dock after hydration. Resolve Bite fragments once
  // that space exists, including on countries which do not have a map yet.
  requestAnimationFrame(() => {
    const target = document.getElementById(location.hash.slice(1));
    if (!target?.matches('.country-bites, .bite-card')) return;
    target.scrollIntoView({ block: 'start', behavior: 'instant' });
    target.focus({ preventScroll: true });
  });
}

export async function prepareCountryJournal(country: string, signal: AbortSignal) {
  const current = document.querySelector<HTMLElement>('[data-country-journal]');
  if (!current || current.dataset.countryJournal === country) return undefined;
  const response = await fetch(`/travel/${country}/`, { signal });
  if (!response.ok) throw new Error(`Unable to load country: ${country}`);
  const page = new DOMParser().parseFromString(await response.text(), 'text/html');
  const region = page.querySelector<HTMLElement>('[data-country-journal]');
  if (!region || region.dataset.countryJournal !== country) throw new Error('Country content does not match the destination');
  return document.importNode(region,true);
}

export function replaceCountryJournal(region: HTMLElement | undefined) {
  if (!region) return;
  cleanup?.();
  cleanup = undefined;
  document.querySelector('[data-country-journal]')?.replaceWith(region);
  mountCountryJournal();
}
