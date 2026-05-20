/**
 * Safely normalizes and handles relative or external links.
 * Prepends https:// if a protocol is missing and it's not a relative path.
 */
export function getSafeUrl(url?: string): string {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';

    // If it already has a valid protocol or is a relative path
    if (
        trimmed.startsWith('/') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('mailto:') ||
        trimmed.startsWith('tel:')
    ) {
        return trimmed;
    }

    // Default to secure http protocol
    return `https://${trimmed}`;
}
