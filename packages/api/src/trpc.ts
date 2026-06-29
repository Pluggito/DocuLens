import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { type Database } from "@repo/db";

/**
 * tRPC Context — available to all procedures.
 * The web app creates this context per-request with session info.
 */
export interface TRPCContext {
  db: Database;
  session: {
    user: {
      id: string;
      email: string;
      name: string;
    };
  } | null;
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/**
 * Protected procedure — requires authenticated user.
 * Throws UNAUTHORIZED if no session.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to access this resource.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
