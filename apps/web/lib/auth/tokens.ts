import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "doculens-dev-secret-change-in-production"
);
const ACCESS_TOKEN_EXPIRY = "7d"; // 7 days (increased from 15m to prevent frequent 401s during dev)
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

/**
 * Generate a short-lived access token (JWT) — Edge compatible
 */
export async function generateAccessToken(userId: string): Promise<string> {
  return new SignJWT({ userId, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode an access token — Edge compatible
 */
export async function verifyAccessToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== "access") {
      return null;
    }
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

/**
 * Generate a cryptographically secure refresh token — Edge compatible
 * Uses Web Crypto API
 */
export function generateRefreshToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hash a refresh token for secure storage — Edge compatible
 * Uses Web Crypto API (SubtleCrypto)
 */
export async function hashRefreshToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Get refresh token expiry date
 */
export function getRefreshTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
  return expiry;
}

/**
 * Check if access token is close to expiry (within 2 minutes)
 * Used for proactive refresh — Edge compatible
 */
export async function isTokenExpiringSoon(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.exp) return true;
    const expiryTime = payload.exp * 1000;
    const twoMinutes = 2 * 60 * 1000;
    return Date.now() > expiryTime - twoMinutes;
  } catch {
    return true;
  }
}
