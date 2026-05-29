import { describe, expect, it } from "vitest";
import {
  absolute,
  alignY,
  anchor,
  arrowEnd,
  circle,
  closePath,
  connector,
  cubicCurveTo,
  line,
  lineTo,
  moveTo,
  path,
  rect,
  rightOf,
  rotate,
  scale,
  sceneOf,
  text,
  translate,
} from "./builder";

describe("object-model builder helpers", () => {
  it("creates plain object scene data", () => {
    const scene = sceneOf([
      rect("box", {
        center: { x: 80, y: 60 },
        width: 100,
        height: 40,
      }),
      text("label", {
        center: { x: 80, y: 60 },
        text: "Hello",
      }),
      line("edge", {
        start: { x: 120, y: 60 },
        end: { x: 200, y: 60 },
      }),
      circle("dot", {
        center: { x: 200, y: 60 },
        radius: 6,
      }),
      path("curve", {
        commands: [
          moveTo({ x: 10, y: 20 }),
          lineTo({ x: 40, y: 20 }),
          cubicCurveTo({ x: 60, y: 40 }, { x: 80, y: 0 }, { x: 100, y: 20 }),
          closePath(),
        ],
      }),
    ]);

    expect(scene).toEqual({
      objects: [
        {
          kind: "rect",
          id: "box",
          center: { x: 80, y: 60 },
          width: 100,
          height: 40,
        },
        {
          kind: "text",
          id: "label",
          center: { x: 80, y: 60 },
          text: "Hello",
        },
        {
          kind: "line",
          id: "edge",
          start: { x: 120, y: 60 },
          end: { x: 200, y: 60 },
        },
        {
          kind: "circle",
          id: "dot",
          center: { x: 200, y: 60 },
          radius: 6,
        },
        {
          kind: "path",
          id: "curve",
          commands: [
            { kind: "moveTo", point: { x: 10, y: 20 } },
            { kind: "lineTo", point: { x: 40, y: 20 } },
            {
              kind: "cubicCurveTo",
              control1: { x: 60, y: 40 },
              control2: { x: 80, y: 0 },
              point: { x: 100, y: 20 },
            },
            { kind: "closePath" },
          ],
        },
      ],
    });
  });

  it("creates relation, connector, and transform helpers", () => {
    const scene = sceneOf(
      [
        rect("A", {
          center: { x: 80, y: 60 },
          width: 90,
          height: 36,
        }),
        rect("B", {
          center: { x: 0, y: 0 },
          width: 90,
          height: 36,
          placement: rightOf("A", "east", 48),
          align: alignY("A"),
          transform: [translate(5, -2), rotate(10), scale(1.1)],
        }),
      ],
      {
        connectors: [
          connector("A->B", anchor("A", "east"), anchor("B", "west"), {
            style: arrowEnd({ stroke: "#0f766e" }),
          }),
        ],
      }
    );

    expect(scene.connectors).toEqual([
      {
        kind: "connector",
        id: "A->B",
        from: { objectId: "A", anchor: "east" },
        to: { objectId: "B", anchor: "west" },
        style: { stroke: "#0f766e", markerEnd: "arrow" },
      },
    ]);

    const objectB = scene.objects.find((object) => object.id === "B");
    expect(objectB?.placement).toEqual({
      kind: "rightOf",
      reference: { objectId: "A", anchor: "east" },
      gap: 48,
    });
    expect(objectB?.align).toEqual({ relation: "alignY", reference: { objectId: "A", anchor: "center" } });
    expect(objectB?.transform).toEqual([
      { kind: "translate", x: 5, y: -2 },
      { kind: "rotate", angleDegrees: 10 },
      { kind: "scale", sx: 1.1 },
    ]);
  });

  it("supports scene helper composition with absolute placement", () => {
    const scene = sceneOf([
      rect("source", {
        center: { x: 80, y: 80 },
        width: 96,
        height: 40,
        placement: absolute({ x: 80, y: 80 }),
      }),
    ]);

    expect(scene.objects[0]?.placement).toEqual({ kind: "absolute", position: { x: 80, y: 80 } });
  });
});
