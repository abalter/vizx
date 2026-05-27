import { alignmentFamilyExample } from "./alignmentFamily";
import { alignmentReferenceExample } from "./alignmentReference";
import { anchorsExample } from "./anchors";
import { basicExample } from "./basic";
import { connectorsExample } from "./connectors";
import { mixedNestedPlacementExample } from "./mixedNestedPlacement";
import { nestedGroupsExample } from "./nestedGroups";
import { relativePlacementExample } from "./relativePlacement";
import type { VizxExample } from "./types";

export * from "./types";

export const vizxExamples: readonly VizxExample[] = [
  alignmentFamilyExample,
  alignmentReferenceExample,
  basicExample,
  anchorsExample,
  nestedGroupsExample,
  connectorsExample,
  relativePlacementExample,
  mixedNestedPlacementExample,
];

export function getVizxExample(id: string): VizxExample | undefined {
  return vizxExamples.find((example) => example.id === id);
}

export function requireVizxExample(id: string): VizxExample {
  const example = getVizxExample(id);

  if (!example) {
    throw new Error(`Unknown VizX example: ${id}`);
  }

  return example;
}