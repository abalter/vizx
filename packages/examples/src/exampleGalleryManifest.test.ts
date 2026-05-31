import { describe, expect, it } from "vitest";
import { createExampleGalleryManifest } from "./exampleGalleryManifest";
import type { VizxExample } from "./types";

const baseExample: Omit<VizxExample, "id" | "title" | "description" | "createScene" | "expectedCapabilities"> = {
  sourcePath: "internal technical example",
  reproductionLevel: "Technical",
  helperFamilies: ["primitives"],
  compromises: ["no solver"],
};

function stubExample(id: string): VizxExample {
  return {
    id,
    title: `${id} title`,
    description: `${id} description`,
    expectedCapabilities: ["inspect output"],
    createScene: () => ({ objects: [] }),
    ...baseExample,
  };
}

describe("example gallery manifest", () => {
  it("includes aspirational and technical prefixes by default and sorts by id", () => {
    const manifest = createExampleGalleryManifest([
      stubExample("technical-zeta"),
      stubExample("basic"),
      stubExample("aspirational-alpha"),
    ]);

    expect(manifest.includedPrefixes).toEqual(["aspirational-", "technical-"]);
    expect(manifest.examples.map((entry) => entry.id)).toEqual([
      "aspirational-alpha",
      "technical-zeta",
    ]);
  });

  it("supports prefix filtering for technical-only manifests", () => {
    const manifest = createExampleGalleryManifest(
      [stubExample("technical-zeta"), stubExample("aspirational-alpha")],
      { includedPrefixes: ["technical-"] },
    );

    expect(manifest.includedPrefixes).toEqual(["technical-"]);
    expect(manifest.examples.map((entry) => entry.id)).toEqual(["technical-zeta"]);
  });

  it("fails when included examples are missing helperFamilies or compromises", () => {
    const missingMetadata: VizxExample = {
      id: "technical-missing",
      title: "Technical Missing",
      description: "missing metadata",
      expectedCapabilities: ["inspect output"],
      createScene: () => ({ objects: [] }),
    };

    expect(() => createExampleGalleryManifest([missingMetadata])).toThrowError(
      /Missing helperFamilies for gallery example "technical-missing"/,
    );
  });
});