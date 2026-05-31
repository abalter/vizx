import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createExampleGalleryHtml } from "./exampleGalleryHtml";
import type { ExampleGalleryManifest, ExampleGalleryManifestEntry } from "./exampleGalleryManifest";

interface PreviewPaths {
  readonly svgPath: string;
  readonly debugSvgPath: string;
  readonly hasSvg: boolean;
  readonly hasDebugSvg: boolean;
}

function isManifestEntry(value: unknown): value is ExampleGalleryManifestEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<ExampleGalleryManifestEntry>;
  return (
    typeof candidate.id === "string"
    && typeof candidate.title === "string"
    && typeof candidate.description === "string"
    && Array.isArray(candidate.helperFamilies)
    && Array.isArray(candidate.compromises)
  );
}

function isManifest(value: unknown): value is ExampleGalleryManifest {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<ExampleGalleryManifest>;

  return (
    candidate.version === 1
    && candidate.generatedFrom === "packages/examples/src/index.ts"
    && Array.isArray(candidate.includedPrefixes)
    && Array.isArray(candidate.examples)
    && candidate.examples.every((entry) => isManifestEntry(entry))
  );
}

const manifestPath = resolve(process.cwd(), "examples", "example-gallery-manifest.json");
const htmlPath = resolve(process.cwd(), "examples", "example-gallery.html");
const generatedAtIso = new Date().toISOString();

const raw = readFileSync(manifestPath, "utf8");
const parsed = JSON.parse(raw) as unknown;

if (!isManifest(parsed)) {
  throw new Error(`Invalid generalized example gallery manifest at ${manifestPath}`);
}

const previewsById: Record<string, PreviewPaths> = {};

for (const entry of parsed.examples) {
  const svgPath = `./${entry.id}.svg`;
  const debugSvgPath = `./${entry.id}.debug.svg`;
  const absoluteSvgPath = resolve(process.cwd(), "examples", `${entry.id}.svg`);
  const absoluteDebugSvgPath = resolve(process.cwd(), "examples", `${entry.id}.debug.svg`);

  previewsById[entry.id] = {
    svgPath,
    debugSvgPath,
    hasSvg: existsSync(absoluteSvgPath),
    hasDebugSvg: existsSync(absoluteDebugSvgPath),
  };
}

const html = createExampleGalleryHtml(parsed, { generatedAtIso, previewsById });
writeFileSync(htmlPath, html, "utf8");

console.log(`Wrote ${htmlPath}`);