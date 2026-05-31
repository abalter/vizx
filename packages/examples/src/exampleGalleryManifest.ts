import type {
  VizxExample,
  VizxExampleCompromise,
  VizxExampleHelperFamily,
  VizxExampleReproductionLevel,
} from "./types";

export type ExampleGalleryPrefix = "aspirational-" | "technical-";

export interface ExampleGalleryManifestEntry {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly sourcePath?: string;
  readonly reproductionLevel?: VizxExampleReproductionLevel;
  readonly helperFamilies: readonly VizxExampleHelperFamily[];
  readonly compromises: readonly VizxExampleCompromise[];
}

export interface ExampleGalleryManifest {
  readonly version: 1;
  readonly generatedFrom: "packages/examples/src/index.ts";
  readonly includedPrefixes: readonly ExampleGalleryPrefix[];
  readonly examples: readonly ExampleGalleryManifestEntry[];
}

export interface CreateExampleGalleryManifestOptions {
  readonly includedPrefixes?: readonly ExampleGalleryPrefix[];
}

const DEFAULT_PREFIXES: readonly ExampleGalleryPrefix[] = ["aspirational-", "technical-"];

function hasIncludedPrefix(id: string, includedPrefixes: readonly ExampleGalleryPrefix[]): boolean {
  return includedPrefixes.some((prefix) => id.startsWith(prefix));
}

function assertMetadata(example: VizxExample): asserts example is VizxExample & {
  helperFamilies: readonly VizxExampleHelperFamily[];
  compromises: readonly VizxExampleCompromise[];
} {
  if (!example.helperFamilies || example.helperFamilies.length === 0) {
    throw new Error(`Missing helperFamilies for gallery example \"${example.id}\"`);
  }
  if (!example.compromises || example.compromises.length === 0) {
    throw new Error(`Missing compromises for gallery example \"${example.id}\"`);
  }
}

export function createExampleGalleryManifest(
  examples: readonly VizxExample[],
  options?: CreateExampleGalleryManifestOptions,
): ExampleGalleryManifest {
  const includedPrefixes = options?.includedPrefixes ?? DEFAULT_PREFIXES;

  const filtered = [...examples]
    .filter((example) => hasIncludedPrefix(example.id, includedPrefixes))
    .sort((a, b) => a.id.localeCompare(b.id));

  const entries: ExampleGalleryManifestEntry[] = filtered.map((example) => {
    assertMetadata(example);

    return {
      id: example.id,
      title: example.title,
      description: example.description,
      sourcePath: example.sourcePath,
      reproductionLevel: example.reproductionLevel,
      helperFamilies: example.helperFamilies,
      compromises: example.compromises,
    };
  });

  return {
    version: 1,
    generatedFrom: "packages/examples/src/index.ts",
    includedPrefixes,
    examples: entries,
  };
}