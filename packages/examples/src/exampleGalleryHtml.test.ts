import { describe, expect, it } from "vitest";
import { createExampleGalleryHtml } from "./exampleGalleryHtml";
import type { ExampleGalleryManifest } from "./exampleGalleryManifest";

const manifestFixture: ExampleGalleryManifest = {
  version: 1,
  generatedFrom: "packages/examples/src/index.ts",
  includedPrefixes: ["aspirational-", "technical-"],
  examples: [
    {
      id: "technical-zeta",
      title: "Technical Zeta",
      description: "Technical test entry",
      sourcePath: "internal technical example",
      reproductionLevel: "Technical",
      helperFamilies: ["primitives", "style fields"],
      compromises: ["no solver", "no source translation"],
    },
    {
      id: "aspirational-alpha",
      title: "Aspirational Alpha",
      description: "Aspirational test entry",
      sourcePath: "examples/aspirational_gallery/alpha",
      reproductionLevel: "Level 1-2",
      helperFamilies: ["intersections"],
      compromises: ["manual coordinates"],
    },
  ],
};

describe("example gallery html", () => {
  it("renders both aspirational and technical entries with badges and previews", () => {
    const html = createExampleGalleryHtml(manifestFixture, {
      generatedAtIso: "2026-05-30T00:00:00.000Z",
      previewsById: {
        "aspirational-alpha": {
          svgPath: "./aspirational-alpha.svg",
          debugSvgPath: "./aspirational-alpha.debug.svg",
          hasSvg: true,
          hasDebugSvg: true,
        },
        "technical-zeta": {
          svgPath: "./technical-zeta.svg",
          debugSvgPath: "./technical-zeta.debug.svg",
          hasSvg: false,
          hasDebugSvg: false,
        },
      },
    });

    expect(html).toContain("Aspirational Alpha");
    expect(html).toContain("Technical Zeta");
    expect(html).toContain("badge aspirational");
    expect(html).toContain("badge technical");
    expect(html).toContain("./aspirational-alpha.svg");
    expect(html).toContain("Preview missing. Run npm run examples to refresh SVG outputs.");
    expect(html).toContain("Debug preview missing. Run npm run examples to refresh SVG outputs.");
    expect(html).toContain("Included prefixes: aspirational-, technical-");
  });

  it("sorts output cards by id", () => {
    const html = createExampleGalleryHtml(manifestFixture, {
      generatedAtIso: "2026-05-30T00:00:00.000Z",
    });

    const aspirationalIndex = html.indexOf("aspirational-alpha");
    const technicalIndex = html.indexOf("technical-zeta");

    expect(aspirationalIndex).toBeGreaterThan(-1);
    expect(technicalIndex).toBeGreaterThan(-1);
    expect(aspirationalIndex).toBeLessThan(technicalIndex);
  });
});