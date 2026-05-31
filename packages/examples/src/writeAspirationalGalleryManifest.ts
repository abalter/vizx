import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createAspirationalGalleryManifest } from "./aspirationalGalleryManifest";
import { vizxExamples } from "./index";

const outputPath = resolve("examples/aspirational-gallery-manifest.json");
const outputDirectory = dirname(outputPath);
const manifest = createAspirationalGalleryManifest(vizxExamples);

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Wrote ${outputPath}`);