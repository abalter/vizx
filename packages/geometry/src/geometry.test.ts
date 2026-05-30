import { describe, expect, it } from "vitest";
import {
  addPointVector,
  angleBetweenPoints,
  bboxFromTransformedCorners,
  bboxFromRect,
  bboxFromLine,
  bboxFromEllipse,
  bboxFromPathCommands,
  bboxFromPoints,
  bboxFromPolygon,
  bboxTranslate,
  bboxUnion,
  circlePoint,
  circleCircleTangents,
  distance,
  angleOf,
  angleDeltaDegrees,
  angleLabelPoint,
  circleCircleIntersections,
  identityTransform,
  isAngleWithinSweep,
  lineCircleIntersections,
  lineLineIntersection,
  labelAlongSegment,
  linearScale,
  mapDataPoint,
  midpoint,
  normalizeAngleDegrees,
  offsetPoint,
  point,
  pointOnRay,
  pointOnSegment,
  polar,
  rayCircleIntersections,
  bboxFromCircularArc,
  regularPolygonPoints,
  rotatePoint,
  scalePoint,
  segmentCircleIntersections,
  segmentSegmentIntersection,
  subtractPoints,
  tangentLineAtCirclePoint,
  tangentPointsFromPointToCircle,
  transformPoint,
  transformPoints,
  vector,
} from "./geometry";

function expectPointClose(actual: { x: number; y: number }, expected: { x: number; y: number }): void {
  expect(actual.x).toBeCloseTo(expected.x, 8);
  expect(actual.y).toBeCloseTo(expected.y, 8);
}

function expectContainsPoint(points: readonly { x: number; y: number }[], expected: { x: number; y: number }): void {
  expect(
    points.some((entry) => Math.abs(entry.x - expected.x) <= 1e-8 && Math.abs(entry.y - expected.y) <= 1e-8),
  ).toBe(true);
}

function expectCircleCircleTangentGeometry(
  tangent: { pointA: { x: number; y: number }; pointB: { x: number; y: number } },
  centerA: { x: number; y: number },
  radiusA: number,
  centerB: { x: number; y: number },
  radiusB: number,
): void {
  expect(distance(centerA, tangent.pointA)).toBeCloseTo(radiusA, 8);
  expect(distance(centerB, tangent.pointB)).toBeCloseTo(radiusB, 8);

  const radiusVectorA = subtractPoints(tangent.pointA, centerA);
  const radiusVectorB = subtractPoints(tangent.pointB, centerB);
  const tangentVector = subtractPoints(tangent.pointB, tangent.pointA);

  expect(radiusVectorA.dx * tangentVector.dx + radiusVectorA.dy * tangentVector.dy).toBeCloseTo(0, 8);
  expect(radiusVectorB.dx * tangentVector.dx + radiusVectorB.dy * tangentVector.dy).toBeCloseTo(0, 8);
}

describe("geometry kernel", () => {
  it("adds a vector to a point", () => {
    expect(addPointVector(point(10, 20), vector(5, -2))).toEqual(point(15, 18));
  });

  it("creates and offsets points", () => {
    expect(point(2, 3)).toEqual({ x: 2, y: 3 });
    expect(offsetPoint(point(2, 3), 4, -1)).toEqual(point(6, 2));
  });

  it("subtracts points into a vector", () => {
    expect(subtractPoints(point(10, 20), point(3, 5))).toEqual(vector(7, 15));
  });

  it("computes midpoint and distance", () => {
    expect(midpoint(point(0, 0), point(10, 20))).toEqual(point(5, 10));
    expect(distance(point(0, 0), point(3, 4))).toBe(5);
  });

  it("computes direction angles in degrees", () => {
    expect(angleOf(point(0, 0), point(1, 0))).toBeCloseTo(0, 8);
    expect(angleOf(point(0, 0), point(0, 1))).toBeCloseTo(90, 8);
    expect(angleOf(point(0, 0), point(-1, 0))).toBeCloseTo(180, 8);
    expect(angleOf(point(0, 0), point(0, -1))).toBeCloseTo(-90, 8);
  });

  it("computes label points along a segment without offset", () => {
    expectPointClose(
      labelAlongSegment(point(0, 0), point(10, 0), 0.5),
      point(5, 0),
    );

    expectPointClose(
      labelAlongSegment(point(0, 0), point(8, 4), 0.25),
      point(2, 1),
    );
  });

  it("computes label points with perpendicular offsets", () => {
    expectPointClose(
      labelAlongSegment(point(0, 0), point(10, 0), 0.5, 2),
      point(5, 2),
    );

    expectPointClose(
      labelAlongSegment(point(0, 0), point(0, 10), 0.5, 2),
      point(-2, 5),
    );
  });

  it("rejects invalid labelAlongSegment inputs", () => {
    expect(() => labelAlongSegment(point(1, 1), point(1, 1), 0.5, 1)).toThrow("segment");
    expect(() => labelAlongSegment(point(0, 0), point(1, 1), Number.NaN)).toThrow("t");
    expect(() => labelAlongSegment(point(0, 0), point(1, 1), 0.5, Number.POSITIVE_INFINITY)).toThrow("offset");
  });

  it("computes polar and circle points", () => {
    const polarPoint = polar(point(10, 20), 5, 0);
    const circle = circlePoint(point(10, 20), 5, 90);

    expect(polarPoint.x).toBeCloseTo(15, 8);
    expect(polarPoint.y).toBeCloseTo(20, 8);
    expect(circle.x).toBeCloseTo(10, 8);
    expect(circle.y).toBeCloseTo(25, 8);
  });

  it("derives directional angle metadata from three points", () => {
    expect(angleBetweenPoints(
      point(0, 0),
      point(1, 0),
      point(0, 1),
    )).toEqual({
      startAngleDegrees: 0,
      endAngleDegrees: 90,
      clockwise: false,
    });

    expect(angleBetweenPoints(
      point(0, 0),
      point(1, 0),
      point(0, 1),
      true,
    )).toEqual({
      startAngleDegrees: 0,
      endAngleDegrees: 90,
      clockwise: true,
    });
  });

  it("computes angle label points along the chosen sweep bisector", () => {
    const ccw = angleLabelPoint(
      point(0, 0),
      point(1, 0),
      point(0, 1),
      10,
    );

    expect(ccw.x).toBeCloseTo(7.0710678119, 8);
    expect(ccw.y).toBeCloseTo(7.0710678119, 8);

    const clockwise = angleLabelPoint(
      point(0, 0),
      point(1, 0),
      point(0, 1),
      10,
      { clockwise: true, offset: 4 },
    );

    expect(clockwise.x).toBeCloseTo(-9.8994949366, 8);
    expect(clockwise.y).toBeCloseTo(-9.8994949366, 8);
  });

  it("rejects degenerate angle helper inputs", () => {
    expect(() => angleBetweenPoints(point(0, 0), point(0, 0), point(1, 0))).toThrow("fromPoint");
    expect(() => angleBetweenPoints(point(0, 0), point(1, 0), point(0, 0))).toThrow("toPoint");
  });

  it("builds regular polygon points with the default upright rotation", () => {
    const points = regularPolygonPoints(point(100, 100), 20, 5);

    expect(points).toHaveLength(5);
    expect(points[0]?.x).toBeCloseTo(100, 8);
    expect(points[0]?.y).toBeCloseTo(80, 8);

    for (const vertex of points) {
      expect(distance(point(100, 100), vertex)).toBeCloseTo(20, 8);
    }
  });

  it("builds rotated regular polygon points", () => {
    const points = regularPolygonPoints(point(0, 0), 10, 4, 45);

    expect(points).toHaveLength(4);
    expect(points[0]?.x).toBeCloseTo(7.0710678119, 6);
    expect(points[0]?.y).toBeCloseTo(7.0710678119, 6);
  });

  it("normalizes angles to [0, 360)", () => {
    expect(normalizeAngleDegrees(0)).toBeCloseTo(0, 8);
    expect(normalizeAngleDegrees(360)).toBeCloseTo(0, 8);
    expect(normalizeAngleDegrees(450)).toBeCloseTo(90, 8);
    expect(normalizeAngleDegrees(-90)).toBeCloseTo(270, 8);
  });

  it("computes sweep deltas in the chosen direction", () => {
    expect(angleDeltaDegrees(0, 90, false)).toBeCloseTo(90, 8);
    expect(angleDeltaDegrees(0, 90, true)).toBeCloseTo(270, 8);
    expect(angleDeltaDegrees(350, 10, false)).toBeCloseTo(20, 8);
    expect(angleDeltaDegrees(10, 350, true)).toBeCloseTo(20, 8);
  });

  it("checks angle inclusion within a directional sweep", () => {
    expect(isAngleWithinSweep(45, 0, 90, false)).toBe(true);
    expect(isAngleWithinSweep(180, 0, 90, false)).toBe(false);
    expect(isAngleWithinSweep(315, 0, 90, true)).toBe(true);
    expect(isAngleWithinSweep(180, 0, 90, true)).toBe(true);
  });

  it("computes circular arc bbox with start/end and swept cardinals", () => {
    const shortArc = bboxFromCircularArc(point(0, 0), 10, 0, 45, false);
    expect(shortArc.x).toBeCloseTo(7.0710678119, 8);
    expect(shortArc.y).toBeCloseTo(0, 8);
    expect(shortArc.width).toBeCloseTo(2.9289321881, 8);
    expect(shortArc.height).toBeCloseTo(7.0710678119, 8);

    const throughNinety = bboxFromCircularArc(point(0, 0), 10, 0, 120, false);
    expect(throughNinety.x).toBeCloseTo(-5, 8);
    expect(throughNinety.y).toBeCloseTo(0, 8);
    expect(throughNinety.width).toBeCloseTo(15, 8);
    expect(throughNinety.height).toBeCloseTo(10, 8);

    const excludesCardinal = bboxFromCircularArc(point(0, 0), 10, 10, 80, false);
    expect(excludesCardinal.x).toBeCloseTo(1.7364817767, 8);
    expect(excludesCardinal.y).toBeCloseTo(1.7364817767, 8);
    expect(excludesCardinal.width).toBeCloseTo(8.1115957535, 8);
    expect(excludesCardinal.height).toBeCloseTo(8.1115957535, 8);
  });

  it("throws for invalid regular polygon side count", () => {
    expect(() => regularPolygonPoints(point(0, 0), 10, 2)).toThrow("sides >= 3");
    expect(() => regularPolygonPoints(point(0, 0), 10, 2.5)).toThrow("sides >= 3");
  });

  it("unions bounding boxes", () => {
    const union = bboxUnion(
      bboxFromRect(10, 10, 20, 10),
      bboxFromRect(0, 5, 10, 30),
    );

    expect(union).toEqual(bboxFromRect(0, 5, 30, 30));
  });

  it("computes a bounding box for a line segment", () => {
    expect(bboxFromLine(point(12, 20), point(42, 8))).toEqual(bboxFromRect(12, 8, 30, 12));
    expect(bboxFromLine(point(5, 7), point(5, 31))).toEqual(bboxFromRect(5, 7, 0, 24));
  });

  it("computes a bounding box from points", () => {
    expect(bboxFromPoints([point(10, 20), point(50, 10), point(25, 45)])).toEqual(bboxFromRect(10, 10, 40, 35));
    expect(bboxFromPoints([point(5, 5), point(5, 5)])).toEqual(bboxFromRect(5, 5, 0, 0));
  });

  it("computes a bounding box for a polyline path", () => {
    expect(bboxFromPoints([point(10, 20), point(5, 40), point(30, 15), point(20, 50)])).toEqual(bboxFromRect(5, 15, 25, 35));
  });

  it("computes a bounding box for an ellipse", () => {
    expect(bboxFromEllipse(point(100, 80), 30, 18)).toEqual(bboxFromRect(70, 62, 60, 36));
  });

  it("computes a bounding box for a polygon", () => {
    expect(bboxFromPolygon([point(30, 20), point(75, 10), point(90, 55), point(18, 44)])).toEqual(
      bboxFromRect(18, 10, 72, 45),
    );
  });

  it("computes a bounding box for path commands using explicit moveTo/lineTo points", () => {
    expect(bboxFromPathCommands([
      { kind: "moveTo", point: point(10, 20) },
      { kind: "lineTo", point: point(70, 15) },
      { kind: "lineTo", point: point(42, 68) },
    ])).toEqual(bboxFromRect(10, 15, 60, 53));
  });

  it("does not expand path bbox for closePath", () => {
    expect(bboxFromPathCommands([
      { kind: "moveTo", point: point(20, 30) },
      { kind: "lineTo", point: point(50, 10) },
      { kind: "lineTo", point: point(80, 46) },
      { kind: "closePath" },
    ])).toEqual(bboxFromRect(20, 10, 60, 36));
  });

  it("includes quadratic Bezier control and endpoint in conservative path bbox", () => {
    expect(bboxFromPathCommands([
      { kind: "moveTo", point: point(10, 20) },
      { kind: "quadraticCurveTo", control: point(50, 5), point: point(40, 60) },
    ])).toEqual(bboxFromRect(10, 5, 40, 55));
  });

  it("includes cubic Bezier controls and endpoint in conservative path bbox", () => {
    expect(bboxFromPathCommands([
      { kind: "moveTo", point: point(10, 20) },
      { kind: "cubicCurveTo", control1: point(30, 0), control2: point(70, 80), point: point(50, 40) },
    ])).toEqual(bboxFromRect(10, 0, 60, 80));
  });

  it("translates bounding boxes and points", () => {
    expect(bboxTranslate(bboxFromRect(1, 2, 3, 4), vector(5, 6))).toEqual(
      bboxFromRect(6, 8, 3, 4),
    );

    expect(transformPoint(point(4, 7), identityTransform)).toEqual(point(4, 7));
    expect(transformPoint(point(4, 7), { kind: "translate", x: 3, y: -2 })).toEqual(point(7, 5));
    expect(transformPoint(point(4, 7), { translateX: 3, translateY: -2 })).toEqual(point(7, 5));
  });

  it("rotates points around origin", () => {
    const rotated = rotatePoint(point(2, 1), 90, point(0, 0));

    expect(rotated.x).toBeCloseTo(-1, 8);
    expect(rotated.y).toBeCloseTo(2, 8);
  });

  it("rotates points around an explicit pivot", () => {
    const rotated = rotatePoint(point(7, 5), 90, point(5, 5));

    expect(rotated.x).toBeCloseTo(5, 8);
    expect(rotated.y).toBeCloseTo(7, 8);
  });

  it("scales points around origin and explicit pivot", () => {
    expect(scalePoint(point(3, 4), 2)).toEqual(point(6, 8));

    const scaledAroundPivot = scalePoint(point(7, 5), 2, 3, point(5, 5));
    expect(scaledAroundPivot.x).toBeCloseTo(9, 8);
    expect(scaledAroundPivot.y).toBeCloseTo(5, 8);
  });

  it("defaults sy to sx for uniform scale transforms", () => {
    const scaled = transformPoint(
      point(3, 4),
      { kind: "scale", sx: 2, around: point(1, 1) },
    );

    expect(scaled.x).toBeCloseTo(5, 8);
    expect(scaled.y).toBeCloseTo(7, 8);
  });

  it("applies ordered transform operations to point sequences", () => {
    const translatedThenRotated = transformPoints(
      [point(1, 0)],
      [
        { kind: "translate", x: 1, y: 0 },
        { kind: "rotate", angleDegrees: 90, around: point(0, 0) },
      ],
    );
    const rotatedThenTranslated = transformPoints(
      [point(1, 0)],
      [
        { kind: "rotate", angleDegrees: 90, around: point(0, 0) },
        { kind: "translate", x: 1, y: 0 },
      ],
    );

    expect(translatedThenRotated[0]?.x).toBeCloseTo(0, 8);
    expect(translatedThenRotated[0]?.y).toBeCloseTo(2, 8);
    expect(rotatedThenTranslated[0]?.x).toBeCloseTo(1, 8);
    expect(rotatedThenTranslated[0]?.y).toBeCloseTo(1, 8);
  });

  it("preserves ordered semantics across translate, rotate, and scale", () => {
    const ordered = transformPoint(
      point(2, 1),
      [
        { kind: "translate", x: 1, y: -1 },
        { kind: "rotate", angleDegrees: 90, around: point(0, 0) },
        { kind: "scale", sx: 2, sy: 0.5, around: point(0, 0) },
      ],
    );

    expect(ordered.x).toBeCloseTo(0, 8);
    expect(ordered.y).toBeCloseTo(1.5, 8);
  });

  it("computes axis-aligned bbox from transformed corners", () => {
    const bbox = bboxFromTransformedCorners(
      bboxFromRect(0, 0, 10, 20),
      [{ kind: "rotate", angleDegrees: 90, around: point(0, 0) }],
    );

    expect(bbox.x).toBeCloseTo(-20, 8);
    expect(bbox.y).toBeCloseTo(0, 8);
    expect(bbox.width).toBeCloseTo(20, 8);
    expect(bbox.height).toBeCloseTo(10, 8);
  });

  it("maps linear scale endpoints and midpoint", () => {
    const scale = linearScale([0, 10], [100, 300]);

    expect(scale.map(0)).toBeCloseTo(100, 8);
    expect(scale.map(10)).toBeCloseTo(300, 8);
    expect(scale.map(5)).toBeCloseTo(200, 8);
  });

  it("supports reversed linear ranges", () => {
    const scale = linearScale([0, 10], [300, 100]);

    expect(scale.map(0)).toBeCloseTo(300, 8);
    expect(scale.map(10)).toBeCloseTo(100, 8);
    expect(scale.map(2.5)).toBeCloseTo(250, 8);
  });

  it("rejects zero-width domains and non-finite inputs for linear scale", () => {
    expect(() => linearScale([4, 4], [0, 1])).toThrow("domain");
    expect(() => linearScale([0, Number.POSITIVE_INFINITY], [0, 1])).toThrow("domain");

    const scale = linearScale([0, 1], [0, 1]);
    expect(() => scale.map(Number.NaN)).toThrow("value");
  });

  it("maps data points through a plot frame with reversed y range", () => {
    const frame = {
      xDomain: [0, 10] as const,
      yDomain: [0, 100] as const,
      xRange: [50, 250] as const,
      yRange: [220, 80] as const,
    };

    const mapped = mapDataPoint(frame, { x: 2.5, y: 25 });

    expect(mapped.x).toBeCloseTo(100, 8);
    expect(mapped.y).toBeCloseTo(185, 8);
  });

  it("rejects invalid plot frame and data point inputs", () => {
    expect(() => mapDataPoint({
      xDomain: [0, 0],
      yDomain: [0, 1],
      xRange: [0, 100],
      yRange: [100, 0],
    }, { x: 0, y: 0 })).toThrow("xDomain");

    expect(() => mapDataPoint({
      xDomain: [0, 1],
      yDomain: [0, 1],
      xRange: [0, Number.NaN],
      yRange: [100, 0],
    }, { x: 0, y: 0 })).toThrow("xRange");

    expect(() => mapDataPoint({
      xDomain: [0, 1],
      yDomain: [0, 1],
      xRange: [0, 100],
      yRange: [100, 0],
    }, { x: Number.NaN, y: 0 })).toThrow("dataPoint.x");
  });

  it("computes line-line intersections for crossing infinite lines", () => {
    const intersection = lineLineIntersection(
      point(0, 0),
      point(4, 4),
      point(0, 4),
      point(4, 0),
    );

    expect(intersection).not.toBeNull();

    if (!intersection) {
      throw new Error("Expected crossing lines to intersect");
    }

    expectPointClose(intersection, point(2, 2));
  });

  it("returns null for parallel line-line intersections", () => {
    expect(lineLineIntersection(
      point(0, 0),
      point(4, 4),
      point(1, 0),
      point(5, 4),
    )).toBeNull();
  });

  it("returns null for coincident line-line intersections in v0", () => {
    expect(lineLineIntersection(
      point(0, 0),
      point(4, 4),
      point(2, 2),
      point(8, 8),
    )).toBeNull();
  });

  it("detects points on finite segments", () => {
    expect(pointOnSegment(point(2, 2), point(0, 0), point(4, 4))).toBe(true);
    expect(pointOnSegment(point(0, 0), point(0, 0), point(4, 4))).toBe(true);
    expect(pointOnSegment(point(5, 5), point(0, 0), point(4, 4))).toBe(false);
    expect(pointOnSegment(point(2, 3), point(0, 0), point(4, 4))).toBe(false);
  });

  it("handles zero-length segments for pointOnSegment", () => {
    expect(pointOnSegment(point(1, 1), point(1, 1), point(1, 1))).toBe(true);
    expect(pointOnSegment(point(1, 1.01), point(1, 1), point(1, 1))).toBe(false);
  });

  it("detects points on rays", () => {
    expect(pointOnRay(point(3, 3), point(0, 0), point(1, 1))).toBe(true);
    expect(pointOnRay(point(-1, -1), point(0, 0), point(1, 1))).toBe(false);
    expect(pointOnRay(point(2, 3), point(0, 0), point(1, 1))).toBe(false);
  });

  it("rejects zero-length rays for pointOnRay", () => {
    expect(() => pointOnRay(point(1, 1), point(0, 0), point(0, 0))).toThrow("ray");
  });

  it("computes finite segment-segment intersections", () => {
    const crossing = segmentSegmentIntersection(
      point(0, 0),
      point(4, 4),
      point(0, 4),
      point(4, 0),
    );

    expect(crossing).not.toBeNull();
    if (!crossing) {
      throw new Error("Expected crossing segments to intersect");
    }

    expectPointClose(crossing, point(2, 2));

    const touching = segmentSegmentIntersection(
      point(0, 0),
      point(4, 4),
      point(4, 4),
      point(8, 4),
    );

    expect(touching).not.toBeNull();
    if (!touching) {
      throw new Error("Expected endpoint-touching segments to intersect");
    }

    expectPointClose(touching, point(4, 4));
  });

  it("returns null for disjoint, parallel, and overlapping segment-segment cases in v0", () => {
    expect(segmentSegmentIntersection(
      point(0, 0),
      point(1, 1),
      point(2, 0),
      point(3, 1),
    )).toBeNull();

    expect(segmentSegmentIntersection(
      point(0, 0),
      point(4, 4),
      point(0, 1),
      point(4, 5),
    )).toBeNull();

    expect(segmentSegmentIntersection(
      point(0, 0),
      point(4, 0),
      point(2, 0),
      point(6, 0),
    )).toBeNull();
  });

  it("computes finite segment-circle intersections", () => {
    const secants = segmentCircleIntersections(
      point(-6, 0),
      point(6, 0),
      point(0, 0),
      5,
    );

    expect(secants).toHaveLength(2);
    expectContainsPoint(secants, point(-5, 0));
    expectContainsPoint(secants, point(5, 0));

    const tangent = segmentCircleIntersections(
      point(-5, 5),
      point(5, 5),
      point(0, 0),
      5,
    );

    expect(tangent).toHaveLength(1);
    expectPointClose(tangent[0]!, point(0, 5));

    const missesFiniteSegment = segmentCircleIntersections(
      point(6, 0),
      point(8, 0),
      point(0, 0),
      5,
    );

    expect(missesFiniteSegment).toEqual([]);

    const endpointHit = segmentCircleIntersections(
      point(5, 0),
      point(8, 0),
      point(0, 0),
      5,
    );

    expect(endpointHit).toHaveLength(1);
    expectPointClose(endpointHit[0]!, point(5, 0));
  });

  it("computes ray-circle intersections with forward filtering", () => {
    const forwardHits = rayCircleIntersections(
      point(-10, 0),
      point(-9, 0),
      point(0, 0),
      5,
    );

    expect(forwardHits).toHaveLength(2);
    expectContainsPoint(forwardHits, point(-5, 0));
    expectContainsPoint(forwardHits, point(5, 0));

    const awayFromCircle = rayCircleIntersections(
      point(-10, 0),
      point(-11, 0),
      point(0, 0),
      5,
    );

    expect(awayFromCircle).toEqual([]);

    const tangent = rayCircleIntersections(
      point(-5, 5),
      point(5, 5),
      point(0, 0),
      5,
    );

    expect(tangent).toHaveLength(1);
    expectPointClose(tangent[0]!, point(0, 5));

    const insideOrigin = rayCircleIntersections(
      point(1, 0),
      point(2, 0),
      point(0, 0),
      5,
    );

    expect(insideOrigin).toHaveLength(1);
    expectPointClose(insideOrigin[0]!, point(5, 0));
  });

  it("computes two line-circle secant intersections", () => {
    const intersections = lineCircleIntersections(
      point(-6, 0),
      point(6, 0),
      point(0, 0),
      5,
    );

    expect(intersections).toHaveLength(2);
    expectContainsPoint(intersections, point(-5, 0));
    expectContainsPoint(intersections, point(5, 0));
  });

  it("computes one line-circle tangent intersection", () => {
    const intersections = lineCircleIntersections(
      point(-5, 5),
      point(5, 5),
      point(0, 0),
      5,
    );

    expect(intersections).toHaveLength(1);
    expectPointClose(intersections[0]!, point(0, 5));
  });

  it("returns no line-circle intersections when disjoint", () => {
    expect(lineCircleIntersections(
      point(-5, 6),
      point(5, 6),
      point(0, 0),
      5,
    )).toEqual([]);
  });

  it("rejects invalid line-circle inputs", () => {
    expect(() => lineCircleIntersections(point(1, 1), point(1, 1), point(0, 0), 2)).toThrow("line");
    expect(() => lineCircleIntersections(point(0, 0), point(1, 1), point(0, 0), -1)).toThrow("radius");
  });

  it("computes two circle-circle intersections", () => {
    const intersections = circleCircleIntersections(
      point(0, 0),
      5,
      point(8, 0),
      5,
    );

    expect(intersections).toHaveLength(2);
    expectContainsPoint(intersections, point(4, 3));
    expectContainsPoint(intersections, point(4, -3));
  });

  it("computes one circle-circle tangent intersection", () => {
    const intersections = circleCircleIntersections(
      point(0, 0),
      5,
      point(10, 0),
      5,
    );

    expect(intersections).toHaveLength(1);
    expectPointClose(intersections[0]!, point(5, 0));
  });

  it("returns no circle-circle intersections when separated or contained", () => {
    expect(circleCircleIntersections(
      point(0, 0),
      2,
      point(8, 0),
      2,
    )).toEqual([]);

    expect(circleCircleIntersections(
      point(0, 0),
      6,
      point(1, 0),
      2,
    )).toEqual([]);
  });

  it("returns no intersections for coincident circles in v0", () => {
    expect(circleCircleIntersections(
      point(3, 4),
      5,
      point(3, 4),
      5,
    )).toEqual([]);
  });

  it("rejects negative radii for circle-circle intersections", () => {
    expect(() => circleCircleIntersections(point(0, 0), -1, point(4, 0), 2)).toThrow("radiusA");
    expect(() => circleCircleIntersections(point(0, 0), 1, point(4, 0), -2)).toThrow("radiusB");
  });

  it("builds tangent line direction at rightmost unit-circle point", () => {
    const tangent = tangentLineAtCirclePoint(point(0, 0), point(1, 0));

    expectPointClose(tangent.point, point(1, 0));
    expect(tangent.direction.dx).toBeCloseTo(0, 8);
    expect(tangent.direction.dy).toBeCloseTo(1, 8);
  });

  it("builds tangent line direction at top unit-circle point", () => {
    const tangent = tangentLineAtCirclePoint(point(0, 0), point(0, 1));

    expectPointClose(tangent.point, point(0, 1));
    expect(tangent.direction.dx).toBeCloseTo(-1, 8);
    expect(tangent.direction.dy).toBeCloseTo(0, 8);
  });

  it("rejects invalid tangent line point inputs", () => {
    expect(() => tangentLineAtCirclePoint(point(0, 0), point(0, 0))).toThrow("pointOnCircle");
  });

  it("computes two tangent points from an external point to a circle", () => {
    const externalPoint = point(13, 0);
    const center = point(0, 0);
    const radius = 5;
    const tangents = tangentPointsFromPointToCircle(externalPoint, center, radius);

    expect(tangents).toHaveLength(2);

    for (const tangentPoint of tangents) {
      expect(distance(center, tangentPoint)).toBeCloseTo(radius, 8);

      const radiusVector = subtractPoints(tangentPoint, center);
      const tangentSegmentVector = subtractPoints(externalPoint, tangentPoint);
      const dot = radiusVector.dx * tangentSegmentVector.dx + radiusVector.dy * tangentSegmentVector.dy;

      expect(dot).toBeCloseTo(0, 8);
    }
  });

  it("returns one tangent point when external point lies on the circle", () => {
    const tangents = tangentPointsFromPointToCircle(point(5, 0), point(0, 0), 5);

    expect(tangents).toHaveLength(1);
    expectPointClose(tangents[0]!, point(5, 0));
  });

  it("returns no tangent points when external point is inside the circle", () => {
    expect(tangentPointsFromPointToCircle(point(2, 1), point(0, 0), 5)).toEqual([]);
  });

  it("rejects invalid tangent-point radius values", () => {
    expect(() => tangentPointsFromPointToCircle(point(10, 0), point(0, 0), -1)).toThrow("radius");
    expect(() => tangentPointsFromPointToCircle(point(10, 0), point(0, 0), 0)).toThrow("radius");
  });

  it("computes four circle-circle tangents for separated equal-radius circles", () => {
    const centerA = point(0, 0);
    const centerB = point(14, 0);
    const radius = 3;
    const tangents = circleCircleTangents(centerA, radius, centerB, radius);

    expect(tangents).toHaveLength(4);
    expect(tangents[0]?.kind).toBe("external");
    expect(tangents[1]?.kind).toBe("external");
    expect(tangents[2]?.kind).toBe("internal");
    expect(tangents[3]?.kind).toBe("internal");

    for (const tangent of tangents) {
      expectCircleCircleTangentGeometry(tangent, centerA, radius, centerB, radius);
    }
  });

  it("returns no circle-circle tangents for contained circles", () => {
    expect(circleCircleTangents(
      point(0, 0),
      5,
      point(1, 0),
      2,
    )).toEqual([]);
  });

  it("returns no circle-circle tangents for coincident centers", () => {
    expect(circleCircleTangents(
      point(3, 4),
      5,
      point(3, 4),
      2,
    )).toEqual([]);
  });

  it("returns only external tangents for overlapping circles", () => {
    const centerA = point(0, 0);
    const centerB = point(6, 0);
    const tangents = circleCircleTangents(centerA, 5, centerB, 5);

    expect(tangents).toHaveLength(2);
    expect(tangents.every((entry) => entry.kind === "external")).toBe(true);

    for (const tangent of tangents) {
      expectCircleCircleTangentGeometry(tangent, centerA, 5, centerB, 5);
    }
  });

  it("dedupes degenerate internal tangents for externally tangent circles", () => {
    const tangents = circleCircleTangents(
      point(0, 0),
      5,
      point(10, 0),
      5,
    );

    expect(tangents).toHaveLength(3);
    expect(tangents[0]?.kind).toBe("external");
    expect(tangents[1]?.kind).toBe("external");
    expect(tangents[2]?.kind).toBe("internal");
  });

  it("rejects invalid circle-circle tangent radius values", () => {
    expect(() => circleCircleTangents(point(0, 0), -1, point(10, 0), 2)).toThrow("radiusA");
    expect(() => circleCircleTangents(point(0, 0), 1, point(10, 0), 0)).toThrow("radiusB");
  });
});