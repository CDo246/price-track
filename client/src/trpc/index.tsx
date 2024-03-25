"use client";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@server/src/routes";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { inferTransformedProcedureOutput } from "@trpc/server";

export const trpc = createTRPCReact<AppRouter>();

export type AllProcedures = keyof AppRouter["_def"]["procedures"];
export type ProcedureOutput<T extends AllProcedures> =
  inferTransformedProcedureOutput<
    AppRouter,
    AppRouter["_def"]["procedures"][T]
  >;

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:3030",
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
