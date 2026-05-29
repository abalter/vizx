import { alignmentFamilyExample } from "./alignmentFamily";
import { alignmentReferenceExample } from "./alignmentReference";
import { arrowheadsExample } from "./arrowheads";
import { anchorsExample } from "./anchors";
import { basicExample } from "./basic";
import { connectorsExample } from "./connectors";
import { distributeXExample } from "./distributeX";
import { distributeYExample } from "./distributeY";
import { ellipsePrimitiveExample } from "./ellipsePrimitive";
import { mixedNestedPlacementExample } from "./mixedNestedPlacement";
import { nestedGroupsExample } from "./nestedGroups";
import { pathPrimitiveExample } from "./pathPrimitive";
import { polygonPrimitiveExample } from "./polygonPrimitive";
import { polylinePrimitiveExample } from "./polylinePrimitive";
import { linePrimitiveExample } from "./linePrimitive";
import { relativePlacementExample } from "./relativePlacement";
import { styledPrimitivesExample } from "./styledPrimitives";
import type { VizxExample } from "./types";

export * from "./types";

export const vizxExamples: readonly VizxExample[] = [
  alignmentFamilyExample,
  alignmentReferenceExample,
  arrowheadsExample,
  basicExample,
  distributeXExample,
  distributeYExample,
  anchorsExample,
  nestedGroupsExample,
  connectorsExample,
  linePrimitiveExample,
  polylinePrimitiveExample,
  pathPrimitiveExample,
  ellipsePrimitiveExample,
  polygonPrimitiveExample,
  styledPrimitivesExample,
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