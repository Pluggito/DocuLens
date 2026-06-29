import { publicProcedure, router } from "../trpc";

export const aiRouter = router({
  /** Health check for AI pipeline */
  health: publicProcedure.query(() => {
    return { status: "ok", message: "AI pipeline ready" };
  }),

  // TODO: classify — standalone classification endpoint
  // TODO: extract — standalone extraction with custom schema
});
