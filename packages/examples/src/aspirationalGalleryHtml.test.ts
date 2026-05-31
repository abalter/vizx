import { describe, expect, it } from "vitest";
import { createAspirationalGalleryHtml } from "./aspirationalGalleryHtml";
import type { AspirationalGalleryManifest } from "./aspirationalGalleryManifest";

const manifestFixture: AspirationalGalleryManifest = {
  version: 1,
  generatedFrom: "packages/examples/src/index.ts",
  examples: [
    {
      id: "aspirational-zeta",
      title: "Zeta Example",
      description: "Zeta description",
      sourcePath: "examples/aspirational_gallery/zeta",
      reproductionLevel: "Level 2",
      helperFamilies: ["primitives", "style fields"],
      compromises: ["no source translation", "no solver"],
    },
    {
      id: "non-aspirational-example",
      title: "Should be filtered",
      description: "Not part of aspirational gallery.",
      sourcePath: "examples/non",
      reproductionLevel: "Level 1",
      helperFamilies: ["primitives"],
      compromises: ["no source translation"],
    },
    {
      id: "aspirational-alpha",
      title: "Alpha Example",
      description: "Alpha description",
      sourcePath: "examples/aspirational_gallery/alpha",
      reproductionLevel: "Level 1-2",
      helperFamilies: ["intersections"],
      compromises: ["manual coordinates"],
    },
  ],
};

describe("aspirational gallery html", () => {
  it("renders aspirational ids, titles, source paths, helper families, and compromises", () => {
    const html = createAspirationalGalleryHtml(manifestFixture, {
      generatedAtIso: "2026-05-30T00:00:00.000Z",
      previewsById: {
        "aspirational-alpha": {
          svgPath: "./aspirational-alpha.svg",
          debugSvgPath: "./aspirational-alpha.debug.svg",
          hasSvg: true,
          hasDebugSvg: true,
        },
        "aspirational-zeta": {
          svgPath: "./aspirational-zeta.svg",
          debugSvgPath: "./aspirational-zeta.debug.svg",
          hasSvg: false,
          hasDebugSvg: false,
        },
      },
    });

    expect(html).toContain("aspirational-alpha");
    expect(html).toContain("aspirational-zeta");
    expect(html).toContain("Alpha Example");
    expect(html).toContain("Zeta Example");
    expect(html).toContain("examples/aspirational_gallery/alpha");
    expect(html).toContain("examples/aspirational_gallery/zeta");
    expect(html).toContain("intersections");
    expect(html).toContain("manual coordinates");
    expect(html).toContain("./aspirational-alpha.svg");
    expect(html).toContain("./aspirational-alpha.debug.svg");
    expect(html).toContain("./aspirational-zeta.svg");
    expect(html).toContain("Preview missing. Run npm run examples to refresh SVG outputs.");
  });

  it("filters non-aspirational ids and sorts cards by id", () => {
    const html = createAspirationalGalleryHtml(manifestFixture, {
      generatedAtIso: "2026-05-30T00:00:00.000Z",
    });

    expect(html).not.toContain("non-aspirational-example");

    const alphaIndex = html.indexOf("aspirational-alpha");
    const zetaIndex = html.indexOf("aspirational-zeta");

    expect(alphaIndex).toBeGreaterThan(-1);
    expect(zetaIndex).toBeGreaterThan(-1);
    expect(alphaIndex).toBeLessThan(zetaIndex);
  });

  it("is deterministic for the same manifest and options", () => {
    const options = { generatedAtIso: "2026-05-30T00:00:00.000Z" };

    const htmlA = createAspirationalGalleryHtml(manifestFixture, options);
    const htmlB = createAspirationalGalleryHtml(manifestFixture, options);

    expect(htmlA).toBe(htmlB);
  });
});