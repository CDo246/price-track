import { publicProcedure, router } from "../trpc";
import {
  fetchAllItems,
  fetchItemData,
  createNewItem,
} from "../worker/database_functions";
import { z } from "zod";
import { createHTTPServer } from '@trpc/server/adapters/standalone';

const appRouter = router({
  fetchAllItems: publicProcedure.query(async () => {
    return fetchAllItems();
  }),

  fetchItemData: publicProcedure
    .input(z.object({ itemId: z.number() }))
    .query(async ({ input }) => {
      const itemId = input.itemId;
      return fetchItemData(itemId);
    }),

  createNewItem: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input }) => {
      const url = input.url;
      return createNewItem(url);
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  router: appRouter,
});
 
server.listen(3000);