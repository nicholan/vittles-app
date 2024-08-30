import { Buffer } from "node:buffer";

export async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
	const reader = stream.getReader();
	const chunks = [];
	let done = false;
	while (!done) {
		const { done: readerDone, value } = await reader.read();
		if (readerDone) {
			done = true;
		} else {
			chunks.push(value);
		}
	}
	return Buffer.concat(chunks);
}
