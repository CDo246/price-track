import { publicProcedure, router } from "../trpc";
import {
  fetchAllItemsWithData,
  fetchItemData,
  createNewItem,
  deleteItem
} from "../worker/database_functions";
import { z } from "zod";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export const appRouter = router({
  fetchAllItemsWithData: publicProcedure.query(async () => {
    return fetchAllItemsWithData();
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

  deleteItem: publicProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input }) => {
      const itemId = input.itemId;
      return deleteItem(itemId);
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
