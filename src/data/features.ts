import { fullVersionAvailable } from '../lib/feature-flags';

// Resolved while rendering/building; unfinished sections never reach the HTML.
export const FULL_VERSION_AVAILABLE = fullVersionAvailable(
  import.meta.env.FULL_VERSION_AVAILABLE,
  import.meta.env.DEV,
);
