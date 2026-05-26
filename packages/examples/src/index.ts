import { anchorsExample } from "./anchors";
import { basicExample } from "./basic";
import { connectorsExample } from "./connectors";
import { nestedGroupsExample } from "./nestedGroups";
import { relativePlacementExample } from "./relativePlacement";
import type { VizxExample } from "./types";

export * from "./types";

export const vizxExamples: readonly VizxExample[] = [
  basicExample,
  anchorsExample,
  nestedGroupsExample,
  connectorsExample,
  relativePlacementExample,
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