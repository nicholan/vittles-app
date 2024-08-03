const path = require("node:path");

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, "../..");

const defaultCfg = getDefaultConfig(projectRoot);
const config = withNativeWind(defaultCfg, { input: "./src/global.css" });

// Monorepo modules paths
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
