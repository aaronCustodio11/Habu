/**
 * Local-first IDs.
 *
 * Everything is created on-device with a locally-unique id; the sync engine
 * pushes those ids to the cloud rather than round-tripping through a server.
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}${timestamp}${random}`;
}
