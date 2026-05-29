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
  distance,
  identityTransform,
  midpoint,
  point,
  rotatePoint,
  subtractPoints,
  transformPoint,
  transformPoints,
  vector,
} from "./geometry";

describe("geometry kernel", () => {
  it("adds a vector to a point", () => {
    expect(addPointVector(point(10, 20), vector(5, -2))).toEqual(point(15, 18));
  });

  it("subtracts points into a vector", () => {
    expect(subtractPoints(point(10, 20), point(3, 5))).toEqual(vector(7, 15));
  });

  it("computes midpoint and distance", () => {
    expect(midpoint(point(0, 0), point(10, 20))).toEqual(point(5, 10));
    expect(distance(point(0, 0), point(3, 4))).toBe(5);
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