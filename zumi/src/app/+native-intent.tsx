/**
 * The Share Extension opens the app with `zumi://dataUrl=zumiShareKey...`.
 * That is not a real route — send it home; ShareWatcher in _layout picks up the payload.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  if (path.includes('dataUrl=')) return '/';
  return path;
}
