import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { documentRouter } from "./routers/document";
import { aiRouter } from "./routers/ai";

export const appRouter = router({
  auth: authRouter,
  document: documentRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
