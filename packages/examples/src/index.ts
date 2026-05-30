import { alignmentFamilyExample } from "./alignmentFamily";
import { alignmentReferenceExample } from "./alignmentReference";
import { aspirationalAndroidLifecycleExample } from "./aspirationalAndroidLifecycle";
import { aspirationalArrowLabelExample } from "./aspirationalArrowLabel";
import { aspirationalGeometry1LiteExample } from "./aspirationalGeometry1Lite";
import { aspirationalLabeledPolygonExample } from "./aspirationalLabeledPolygon";
import { aspirationalPendagonLiteExample } from "./aspirationalPendagonLite";
import { aspirationalProjectileMotionLiteExample } from "./aspirationalProjectileMotionLite";
import { arrowheadsExample } from "./arrowheads";
import { anchorsExample } from "./anchors";
import { basicExample } from "./basic";
import { bezierPathExample } from "./bezierPath";
import { builderBezierPathExample } from "./builderBezierPath";
import { builderBasicExample } from "./builderBasic";
import { builderRelativePlacementExample } from "./builderRelativePlacement";
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
import { rotatedPrimitivesExample } from "./rotatedPrimitives";
import { styledPrimitivesExample } from "./styledPrimitives";
import { technicalAngleArcExample } from "./technicalAngleArc";
import { technicalBeltPulleyExample } from "./technicalBeltPulley";
import { technicalCommonTangentsExample } from "./technicalCommonTangents";
import { technicalLinearPlotExample } from "./technicalLinearPlot";
import { technicalTangentsExample } from "./technicalTangents";
import type { VizxExample } from "./types";

export * from "./types";

export const vizxExamples: readonly VizxExample[] = [
  alignmentFamilyExample,
  alignmentReferenceExample,
  aspirationalAndroidLifecycleExample,
  aspirationalArrowLabelExample,
  aspirationalGeometry1LiteExample,
  aspirationalLabeledPolygonExample,
  aspirationalPendagonLiteExample,
  aspirationalProjectileMotionLiteExample,
  arrowheadsExample,
  basicExample,
  bezierPathExample,
  builderBezierPathExample,
  builderBasicExample,
  builderRelativePlacementExample,
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
  rotatedPrimitivesExample,
  styledPrimitivesExample,
  technicalAngleArcExample,
  technicalBeltPulleyExample,
  technicalCommonTangentsExample,
  technicalLinearPlotExample,
  technicalTangentsExample,
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