/** Explicit values override the development default, including local false. */
export function fullVersionAvailable(value: string | undefined, development = false): boolean {
  if (value === undefined || value === '') return development;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error('FULL_VERSION_AVAILABLE must be "true" or "false".');
}
