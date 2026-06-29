import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const authRouter = router({
  /** Get current session info */
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
});
