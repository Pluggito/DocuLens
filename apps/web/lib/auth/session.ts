import { getDb, users, eq } from "@repo/db";
import {
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
} from "./cookies";
import { verifyAccessToken } from "./tokens";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  image: string | null;
  createdAt: string;
}

export interface SessionResult {
  userId: string;
  user: SessionUser;
}

/**
 * Get the current session from cookies (for server components and API routes)
 * Verifies the access token and returns the user data.
 */
export async function getSession(): Promise<SessionResult | null> {
  try {
    // Try access token
    const accessToken = await getAccessTokenFromCookies();
    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);
      if (payload) {
        const db = getDb();
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            fullName: users.fullName,
            phoneNumber: users.phoneNumber,
            image: users.image,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(eq(users.id, payload.userId))
          .limit(1);

        if (user) {
          return {
            userId: user.id,
            user: {
              ...user,
              createdAt: user.createdAt.toISOString(),
            },
          };
        }
      }
    }

    // TODO: Add refresh token flow if needed
    // For now, if access token is invalid, user must re-login

    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Require a valid session, throw if not authenticated
 */
export async function requireSession(): Promise<SessionResult> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Get just the user ID from session (lightweight check)
 */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId || null;
}
