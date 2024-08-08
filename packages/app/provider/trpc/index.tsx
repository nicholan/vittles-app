import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@vittles/api/src/router";
import { supabase } from "@vittles/app/utils/supabase/client";
import { replaceLocalhost } from "@vittles/app/utils/trpc/localhost";
import { useState } from "react";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getApiUrl = () => {
	const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}`;
	return replaceLocalhost(apiUrl);
};

export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [queryClient] = useState(() => new QueryClient());
	const [trpcClient] = useState(() =>
		trpc.createClient({
			transformer: superjson,
			links: [
				httpBatchLink({
					async headers() {
						const { data } = await supabase.auth.getSession();
						const token = data?.session?.access_token;

						return {
							Authorization: token ? `Bearer ${token}` : undefined,
						};
					},
					url: `${getApiUrl()}/trpc`,
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
