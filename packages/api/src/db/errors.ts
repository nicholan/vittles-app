import { TRPCError } from "@trpc/server";

type ErrorType = "NOT_FOUND" | "CONFLICT" | "BAD_REQUEST" | "FORBIDDEN" | "UNAUTHORIZED";

export function throwTRPCErrorOnCondition(
	condition: boolean,
	errorType: ErrorType,
	name: string,
	customMessage?: string,
) {
	if (condition) {
		const defaultMessage = errorMessages[errorType](name);

		throw new TRPCError({
			code: errorType,
			message: customMessage || defaultMessage,
		});
	}
}

const errorMessages: Record<ErrorType, (name: string) => string> = {
	NOT_FOUND: (name) => `${name} not found or does not exist.`,
	CONFLICT: (name) => `${name} already exists.`,
	BAD_REQUEST: (name) => `Bad request for ${name}.`,
	FORBIDDEN: (name) => `You do not have permission to access ${name}.`,
	UNAUTHORIZED: (name) => `You are not authorized to access ${name}.`,
};
