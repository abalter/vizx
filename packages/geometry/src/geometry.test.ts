import { describe, expect, it } from "vitest";
import {
  addPointVector,
  bboxFromRect,
  bboxFromLine,
  bboxTranslate,
  bboxUnion,
  distance,
  identityTransform,
  midpoint,
  point,
  subtractPoints,
  transformPoint,
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

  it("translates bounding boxes and points", () => {
    expect(bboxTranslate(bboxFromRect(1, 2, 3, 4), vector(5, 6))).toEqual(
      bboxFromRect(6, 8, 3, 4),
    );

    expect(transformPoint(point(4, 7), identityTransform)).toEqual(point(4, 7));
    expect(transformPoint(point(4, 7), { translateX: 3, translateY: -2 })).toEqual(point(7, 5));
  });
});