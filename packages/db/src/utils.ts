/**
 * Generate a prefixed CUID-like unique identifier.
 * Uses crypto.randomUUID for uniqueness with a timestamp prefix for sortability.
 */
export function createId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `${timestamp}${randomPart}`;
}
