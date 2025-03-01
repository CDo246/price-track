"use client";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@server/routes";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const trpc = createTRPCReact<AppRouter>();

const url = import.meta.env.DEV ? "http://localhost:3030/trpc" : "/trpc";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url,
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
