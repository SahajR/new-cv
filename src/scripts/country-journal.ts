import { setupJapanScroll } from './japan-scroll';

let cleanup: (() => void) | undefined;
export function mountCountryJournal() {
  cleanup?.();
  const japan = document.querySelector<HTMLElement>('[data-japan-journal]');
  cleanup = japan ? setupJapanScroll(japan) : undefined;
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
