import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const { VITE_CONVEX_URL } = import.meta.env;
  const convexClient = new ConvexReactClient(VITE_CONVEX_URL);
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: {},
    Wrap: ({ children }) => (
      <ConvexProvider client={convexClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ConvexProvider>
    ),
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
