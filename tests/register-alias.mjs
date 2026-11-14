import { registerHooks } from "node:module";
import path from "node:path";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

const srcRoot = path.resolve(import.meta.dirname, "..", "src");

function resolveCandidate(basePath) {
  for (const candidate of [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    path.join(basePath, "index.ts"),
  ]) {
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/headers") {
      return {
        shortCircuit: true,
        url: "data:text/javascript,export async function cookies() { return { get() { return undefined; } }; }",
      };
    }
    if (specifier.startsWith("@/")) {
      const resolved = resolveCandidate(path.join(srcRoot, specifier.slice(2)));
      if (resolved) return { shortCircuit: true, url: resolved };
    }
    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      context.parentURL?.startsWith("file:")
    ) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname);
      const resolved = resolveCandidate(path.resolve(parentDir, specifier));
      if (resolved) return { shortCircuit: true, url: resolved };
    }
    return nextResolve(specifier, context);
  },
});
