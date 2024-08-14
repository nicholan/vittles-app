import { Log, LogLevel, Miniflare } from "miniflare";

// Local develoment server
const mf = new Miniflare({
	modules: true,
	scriptPath: "./src/worker.ts",
	log: new Log(LogLevel.DEBUG),
});

await mf.dispose();
