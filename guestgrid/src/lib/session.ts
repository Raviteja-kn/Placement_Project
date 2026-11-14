import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { SessionUser } from "@/lib/types";

/**
 * Retrieve the current authenticated session on the server side.
 * Returns the full session object or null if not authenticated.
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Retrieve the current authenticated user from the session.
 * Returns the user object or null if not authenticated.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  return session.user as SessionUser;
}

/**
 * Require authentication — throws if the user is not signed in.
 * Use in API routes or server components that need a guaranteed user.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

/**
 * Require a specific role — throws if the user doesn't have the role.
 */
export async function requireRole(
  role: "admin" | "organizer"
): Promise<SessionUser> {
  const user = await requireAuth();

  if (user.role !== role && user.role !== "admin") {
    throw new Error("Insufficient permissions");
  }

  return user;
}
