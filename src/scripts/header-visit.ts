export const HEADER_VISIT_KEY = 'hey.sr:header-seen:v1';

/** Remember the settled header for this tab's visit, including route changes. */
export function rememberHeaderVisit() {
  try {
    window.sessionStorage.setItem(HEADER_VISIT_KEY, '1');
  } catch {
    // Storage may be disabled; the current page still finishes normally.
  }
}
