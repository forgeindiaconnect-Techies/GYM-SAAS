/**
 * Checks if a media URL is safe to load in a web browser.
 * Rejects local mobile device protocols (file://, content://) which browsers block with
 * "Not allowed to load local resource".
 */
export const isSafeMediaUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('file:') || trimmed.startsWith('content:')) {
    return false;
  }
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  );
};
