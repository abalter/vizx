import type {
  VizxExample,
  VizxExampleCompromise,
  VizxExampleHelperFamily,
  VizxExampleReproductionLevel,
} from "./types";

export interface AspirationalGalleryManifestEntry {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly sourcePath: string;
  readonly reproductionLevel: VizxExampleReproductionLevel;
  readonly helperFamilies: readonly VizxExampleHelperFamily[];
  readonly compromises: readonly VizxExampleCompromise[];
}

export interface AspirationalGalleryManifest {
  readonly version: 1;
  readonly generatedFrom: "packages/examples/src/index.ts";
  readonly examples: readonly AspirationalGalleryManifestEntry[];
}

function assertMetadata(example: VizxExample): asserts example is VizxExample & {
  readonly sourcePath: string;
  readonly reproductionLevel: VizxExampleReproductionLevel;
  readonly helperFamilies: readonly VizxExampleHelperFamily[];
  readonly compromises: readonly VizxExampleCompromise[];
} {
  if (!example.sourcePath) {
    throw new Error(`Aspirational example ${example.id} is missing sourcePath`);
  }

  if (!example.reproductionLevel) {
    throw new Error(`Aspirational example ${example.id} is missing reproductionLevel`);
  }

  if (!example.helperFamilies || example.helperFamilies.length === 0) {
    throw new Error(`Aspirational example ${example.id} is missing helperFamilies`);
  }

  if (!example.compromises || example.compromises.length === 0) {
    throw new Error(`Aspirational example ${example.id} is missing compromises`);
  }
}

export function createAspirationalGalleryManifest(examples: readonly VizxExample[]): AspirationalGalleryManifest {
  const aspirationalExamples = examples
    .filter((example) => example.id.startsWith("aspirational-"))
    .sort((a, b) => a.id.localeCompare(b.id));

  const manifestEntries: AspirationalGalleryManifestEntry[] = [];

  for (const example of aspirationalExamples) {
    assertMetadata(example);

    manifestEntries.push({
      id: example.id,
      title: example.title,
      description: example.description,
      sourcePath: example.sourcePath,
      reproductionLevel: example.reproductionLevel,
      helperFamilies: [...example.helperFamilies],
      compromises: [...example.compromises],
    });
  }

  return {
    version: 1,
    generatedFrom: "packages/examples/src/index.ts",
    examples: manifestEntries,
  };
}