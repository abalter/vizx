import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createExampleGalleryManifest } from "./exampleGalleryManifest";
import { vizxExamples } from "./index";

const manifest = createExampleGalleryManifest(vizxExamples);
const outputPath = resolve(process.cwd(), "examples", "example-gallery-manifest.json");

writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Wrote ${outputPath}`);