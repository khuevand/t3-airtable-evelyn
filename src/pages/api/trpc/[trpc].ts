import type { NextApiRequest, NextApiResponse } from "next";
import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

// Build the tRPC handler once
const trpcHandler = createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
        }
      : undefined,
});

// Export a concrete Pages API function so Next 15's validator sees (req,res)=>...
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return trpcHandler(req, res);
}
