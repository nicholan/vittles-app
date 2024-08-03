import Constants from "expo-constants";

let cachedLocalhost: string | undefined;
const DEFAULT_PROTOCOL = "http:";
const LOCALHOST_REGEX = /https?:\/\/localhost:/g;

export function getLocalhost() {
	if (cachedLocalhost !== undefined) {
		return cachedLocalhost;
	}

	const debuggerHost = Constants.expoConfig?.hostUri;
	cachedLocalhost = debuggerHost?.split(":")[0] ?? "localhost";

	return cachedLocalhost;
}

export function replaceLocalhost(address: string, protocol: string = DEFAULT_PROTOCOL): string {
	const localhost = getLocalhost();
	return address.replace(LOCALHOST_REGEX, `${protocol}//${localhost}:`);
}
