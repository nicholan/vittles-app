import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator";
import type { Config } from "unique-names-generator";

const customConfig: Config = {
	dictionaries: [colors, adjectives, animals],
	separator: "",
	length: 3,
	style: "capital",
};

export function generateRandomName(config: Config = customConfig) {
	const uniqueName = uniqueNamesGenerator(config);
	const fourDigits = Math.floor(Math.random() * 10000)
		.toString()
		.padStart(4, "0");

	const name = `${uniqueName}-${fourDigits}`;
	return name;
}
