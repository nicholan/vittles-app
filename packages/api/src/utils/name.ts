import { names, colors, uniqueNamesGenerator, NumberDictionary } from "unique-names-generator";
import type { Config } from "unique-names-generator";

const numberDictionary = NumberDictionary.generate({ min: 100, max: 999 });

const customConfig: Config = {
	dictionaries: [colors, names, numberDictionary],
	separator: "",
	length: 3,
	style: "capital",
};

export function generateRandomName(config: Config = customConfig) {
	let name = uniqueNamesGenerator(config);

	do {
		name = uniqueNamesGenerator(config);
	} while (name.length > 15);

	return name;
}
