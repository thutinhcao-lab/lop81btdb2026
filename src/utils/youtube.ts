/**
 * Utility functions for parsing and embedding YouTube videos
 */

/**
 * Extracts the 11-character video ID from various YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - Direct 11-character ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // If input is directly an 11-char ID (letters, numbers, hyphen, underscore)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex for standard YouTube URLs
  const regexPatterns = [
    // Standard watch or share: youtube.com/watch?v=ID or youtu.be/ID
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    // Direct ID fallback pattern
    /^[a-zA-Z0-9_-]{11}$/,
  ];

  for (const regex of regexPatterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fallback using URL parser
  try {
    const fullUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
      ? trimmed 
      : `https://${trimmed}`;
    const parsed = new URL(fullUrl);

    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v && v.length === 11) return v;

      const pathSegments = parsed.pathname.split('/').filter(Boolean);
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (['embed', 'shorts', 'v', 'live'].includes(pathSegments[0]) && lastSegment?.length === 11) {
        return lastSegment;
      }
    } else if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      if (id && id.length === 11) return id;
    }
  } catch {
    // Ignore URL parse error
  }

  return null;
}

/**
 * Returns a secure, responsive-ready YouTube embed URL
 */
export function getYouTubeEmbedUrl(urlOrId: string, autoplay: boolean = true): string | null {
  const videoId = extractYouTubeId(urlOrId);
  if (!videoId) return null;
  const autoPlayParam = autoplay ? '1' : '0';
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlayParam}&rel=0&modestbranding=1`;
}
