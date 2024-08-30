import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getFetch, httpBatchLink, loggerLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { supabase } from "../../auth/supabase/client";
import { replaceLocalhost } from "../../utils/trpc/localhost";
import { trpc } from "../../utils/trpc/trpc";

const getApiUrl = () => {
	const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}`;
	return replaceLocalhost(apiUrl);
};

export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
						cacheTime: 10 * 60 * 1000, // Unused data stays in cache for 10 minutes
						refetchOnWindowFocus: false, // Avoids unnecessary refetching when window regains focus
						retry: 2, // Retry failed requests twice before giving up
						retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff for retries
					},
					mutations: {
						retry: 0, // Do not retry mutations
					},
				},
			}),
	);

	const [trpcClient] = useState(() =>
		trpc.createClient({
			transformer: superjson,
			links: [
				loggerLink({
					enabled: () => true,
				}),
				httpBatchLink({
					async headers() {
						const { data } = await supabase.auth.getSession();
						const token = data?.session?.access_token;

						return {
							Authorization: token ? `Bearer ${token}` : undefined,
						};
					},
					url: `${getApiUrl()}/trpc`,
					fetch: async (input, init?) => {
						const fetch = getFetch();
						return fetch(input, {
							...init,
							credentials: "include",
						});
					},
				}),
			],
		}),
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
};
