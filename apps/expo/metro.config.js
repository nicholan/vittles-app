const path = require("node:path");

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(__dirname, "../..");

const defaultCfg = getDefaultConfig(projectRoot);
const config = withNativeWind(defaultCfg, { input: "./src/global.css" });

const monorepoPackages = {
	"@vittles/api": path.resolve(monorepoRoot, "packages/api"),
	"@vittles/app": path.resolve(monorepoRoot, "packages/app"),
	"@vittles/ui": path.resolve(monorepoRoot, "packages/ui"),
};

// 1. Watch the local app directory, and only the shared packages
config.watchFolders = [projectRoot, ...Object.values(monorepoPackages)];
config.resolver.extraNodeModules = monorepoPackages;

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;
