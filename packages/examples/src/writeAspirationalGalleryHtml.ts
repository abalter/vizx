import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  createAspirationalGalleryManifest,
  type AspirationalGalleryManifest,
  type AspirationalGalleryManifestEntry,
} from "./aspirationalGalleryManifest";
import { createAspirationalGalleryHtml, type AspirationalGalleryHtmlPreviewInfo } from "./aspirationalGalleryHtml";
import { vizxExamples } from "./index";

const manifestPath = resolve("examples/aspirational-gallery-manifest.json");
const galleryPath = resolve("examples/aspirational-gallery.html");

function isManifestEntry(value: unknown): value is AspirationalGalleryManifestEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return typeof entry.id === "string"
    && typeof entry.title === "string"
    && typeof entry.description === "string"
    && typeof entry.sourcePath === "string"
    && typeof entry.reproductionLevel === "string"
    && Array.isArray(entry.helperFamilies)
    && Array.isArray(entry.compromises);
}

function isManifest(value: unknown): value is AspirationalGalleryManifest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const manifest = value as Record<string, unknown>;

  return manifest.version === 1
    && manifest.generatedFrom === "packages/examples/src/index.ts"
    && Array.isArray(manifest.examples)
    && manifest.examples.every((entry) => isManifestEntry(entry));
}

function readOrCreateManifest(): AspirationalGalleryManifest {
  if (existsSync(manifestPath)) {
    const parsed = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;

    if (isManifest(parsed)) {
      return {
        version: parsed.version,
        generatedFrom: parsed.generatedFrom,
        examples: [...parsed.examples].sort((a, b) => a.id.localeCompare(b.id)),
      };
    }
  }

  const created = createAspirationalGalleryManifest(vizxExamples);
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify(created, null, 2)}\n`, "utf8");

  return created;
}

function createPreviewMap(manifest: AspirationalGalleryManifest): Record<string, AspirationalGalleryHtmlPreviewInfo> {
  const previews: Record<string, AspirationalGalleryHtmlPreviewInfo> = {};

  for (const example of manifest.examples) {
    const svgPath = `./${example.id}.svg`;
    const debugSvgPath = `./${example.id}.debug.svg`;

    previews[example.id] = {
      svgPath,
      debugSvgPath,
      hasSvg: existsSync(resolve("examples", `${example.id}.svg`)),
      hasDebugSvg: existsSync(resolve("examples", `${example.id}.debug.svg`)),
    };
  }

  return previews;
}

const manifest = readOrCreateManifest();
const previewsById = createPreviewMap(manifest);
const html = createAspirationalGalleryHtml(manifest, {
  generatedAtIso: new Date().toISOString(),
  previewsById,
});

mkdirSync(dirname(galleryPath), { recursive: true });
writeFileSync(galleryPath, html, "utf8");

console.log(`Wrote ${galleryPath}`);
