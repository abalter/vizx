import { describe, expect, it } from "vitest";
import {
  addPointVector,
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
  distance,
  angleOf,
  angleDeltaDegrees,
  identityTransform,
  isAngleWithinSweep,
  midpoint,
  normalizeAngleDegrees,
  offsetPoint,
  point,
  polar,
  bboxFromCircularArc,
  regularPolygonPoints,
  rotatePoint,
  scalePoint,
  subtractPoints,
  transformPoint,
  transformPoints,
  vector,
} from "./geometry";

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

  it("computes polar and circle points", () => {
    const polarPoint = polar(point(10, 20), 5, 0);
    const circle = circlePoint(point(10, 20), 5, 90);

    expect(polarPoint.x).toBeCloseTo(15, 8);
    expect(polarPoint.y).toBeCloseTo(20, 8);
    expect(circle.x).toBeCloseTo(10, 8);
    expect(circle.y).toBeCloseTo(25, 8);
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
});