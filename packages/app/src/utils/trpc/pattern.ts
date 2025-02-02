import { P } from "ts-pattern";

export const error = {
	failureReason: P.not(null),
};

export const loading = {
	isLoading: P.when((isLoading) => isLoading === true),
};

export const fetching = {
	isFetching: P.when((isFetching) => isFetching === true),
};

export const empty = {
	data: P.when(
		(data: [] | null | undefined): data is [] | null | undefined =>
			data === null || data === undefined || data.length === 0,
	),
};

export const success = {
	isLoading: P.when((isLoading) => isLoading === false),
	failureReason: P.when((status) => status === null),
};

export const idle = {
	isIdle: P.when((isIdle) => isIdle === true),
};

export const pending = {
	isPending: P.when((status) => status === "loading"),
};
