import { describe, expect, it } from "vitest";
import {
  absolute,
  alignY,
  arc,
  angleMarkPath,
  anchor,
  arrowEnd,
  circle,
  circleToCircleArrow,
  circleToCircleLine,
  closePath,
  connector,
  cubicCurveTo,
  line,
  lineTo,
  moveTo,
  path,
  crossedBeltPath,
  openBeltPath,
  rect,
  rightOf,
  rotate,
  scale,
  sceneOf,
  segmentTickMarkPath,
  segmentTickMarks,
  rightAngleMarkPath,
  text,
  trimmedLine,
  translate,
  xAxis,
  yAxis,
} from "./builder";

function expectPointClose(actual: { x: number; y: number }, expected: { x: number; y: number }): void {
  expect(actual.x).toBeCloseTo(expected.x, 8);
  expect(actual.y).toBeCloseTo(expected.y, 8);
}

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
          arc({ x: 40, y: 40 }, 20, -90, 0),
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
              kind: "arc",
              center: { x: 40, y: 40 },
              radius: 20,
              startAngleDegrees: -90,
              endAngleDegrees: 0,
            },
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

  it("creates a plain path object for an angle mark", () => {
    const mark = angleMarkPath("angle.mark", {
      vertex: { x: 10, y: 20 },
      fromPoint: { x: 50, y: 20 },
      toPoint: { x: 30, y: 0 },
      radius: 12,
      clockwise: true,
      style: { stroke: "#0f766e", strokeWidth: 2, fill: "none" },
    });

    expect(mark).toEqual({
      kind: "path",
      id: "angle.mark",
      commands: [
        { kind: "moveTo", point: { x: 22, y: 20 } },
        {
          kind: "arc",
          center: { x: 10, y: 20 },
          radius: 12,
          startAngleDegrees: 0,
          endAngleDegrees: -45,
          clockwise: true,
        },
      ],
      style: { stroke: "#0f766e", strokeWidth: 2, fill: "none" },
    });
  });

  it("creates a plain path object for a right-angle mark", () => {
    const mark = rightAngleMarkPath("angle.right", {
      vertex: { x: 10, y: 20 },
      from: { x: 40, y: 20 },
      to: { x: 10, y: 50 },
      size: 8,
      style: { stroke: "#0f766e", strokeWidth: 2, fill: "none" },
    });

    expect(mark.kind).toBe("path");
    expect(mark.id).toBe("angle.right");
    expect(mark.style).toEqual({ stroke: "#0f766e", strokeWidth: 2, fill: "none" });
    expect(mark.commands).toEqual([
      { kind: "moveTo", point: { x: 18, y: 20 } },
      { kind: "lineTo", point: { x: 18, y: 28 } },
      { kind: "lineTo", point: { x: 10, y: 28 } },
    ]);
  });

  it("rejects degenerate rays for right-angle marks", () => {
    expect(() => rightAngleMarkPath("angle.bad", {
      vertex: { x: 10, y: 20 },
      from: { x: 10, y: 20 },
      to: { x: 10, y: 50 },
      size: 8,
    })).toThrow("from ray");
  });

  it("creates a plain path object for a segment tick mark", () => {
    const tick = segmentTickMarkPath("seg.tick", {
      a: { x: 0, y: 0 },
      b: { x: 10, y: 0 },
      t: 0.5,
      size: 6,
      style: { stroke: "#334155", strokeWidth: 1.4 },
    });

    expect(tick.kind).toBe("path");
    expect(tick.id).toBe("seg.tick");
    expect(tick.style).toEqual({ stroke: "#334155", strokeWidth: 1.4 });
    expect(tick.commands).toEqual([
      { kind: "moveTo", point: { x: 5, y: -3 } },
      { kind: "lineTo", point: { x: 5, y: 3 } },
    ]);
  });

  it("rejects degenerate segments for tick marks", () => {
    expect(() => segmentTickMarkPath("seg.bad", {
      a: { x: 2, y: 2 },
      b: { x: 2, y: 2 },
      t: 0.5,
      size: 6,
    })).toThrow("segment");
  });

  it("creates deterministic repeated segment tick marks", () => {
    const ticks = segmentTickMarks("seg.tick", {
      a: { x: 0, y: 0 },
      b: { x: 10, y: 0 },
      count: 3,
      size: 4,
      centerT: 0.5,
      spacingT: 0.1,
    });

    expect(ticks).toHaveLength(3);
    expect(ticks[0]?.id).toBe("seg.tick.0");
    expect(ticks[1]?.id).toBe("seg.tick.1");
    expect(ticks[2]?.id).toBe("seg.tick.2");
    expect(ticks.every((entry) => entry.kind === "path")).toBe(true);
  });

  it("creates a trimmed line object with preserved id and style", () => {
    const trimmed = trimmedLine("trimmed.main", {
      a: { x: 0, y: 0 },
      b: { x: 10, y: 0 },
      startDistance: 2,
      endDistance: 3,
      style: { stroke: "#0f766e", strokeWidth: 2.4, strokeLineCap: "round" },
    });

    expect(trimmed.kind).toBe("line");
    expect(trimmed.id).toBe("trimmed.main");
    expectPointClose(trimmed.start, { x: 2, y: 0 });
    expectPointClose(trimmed.end, { x: 7, y: 0 });
    expect(trimmed.style).toEqual({ stroke: "#0f766e", strokeWidth: 2.4, strokeLineCap: "round" });
  });

  it("applies markerStart and markerEnd through style merge in trimmedLine", () => {
    const trimmed = trimmedLine("trimmed.arrow", {
      a: { x: 0, y: 0 },
      b: { x: 10, y: 0 },
      markerStart: "arrow",
      markerEnd: "arrow",
      style: { stroke: "#0f172a", strokeWidth: 1.6 },
    });

    expect(trimmed.style).toEqual({
      stroke: "#0f172a",
      strokeWidth: 1.6,
      markerStart: "arrow",
      markerEnd: "arrow",
    });
  });

  it("throws for invalid trimmedLine distances and degenerate segments", () => {
    expect(() => trimmedLine("trimmed.bad.negative", {
      a: { x: 0, y: 0 },
      b: { x: 10, y: 0 },
      startDistance: -1,
    })).toThrow("startDistance");

    expect(() => trimmedLine("trimmed.bad.over", {
      a: { x: 0, y: 0 },
      b: { x: 10, y: 0 },
      startDistance: 6,
      endDistance: 5,
    })).toThrow("trim distance");

    expect(() => trimmedLine("trimmed.bad.degenerate", {
      a: { x: 2, y: 2 },
      b: { x: 2, y: 2 },
    })).toThrow("segment");
  });

  it("creates a circle-to-circle trimmed line with preserved id and style", () => {
    const trimmed = circleToCircleLine("c2c.main", {
      centerA: { x: 0, y: 0 },
      radiusA: 10,
      centerB: { x: 40, y: 0 },
      radiusB: 6,
      style: { stroke: "#0f766e", strokeWidth: 2.4, strokeLineCap: "round" },
    });

    expect(trimmed.kind).toBe("line");
    expect(trimmed.id).toBe("c2c.main");
    expectPointClose(trimmed.start, { x: 10, y: 0 });
    expectPointClose(trimmed.end, { x: 34, y: 0 });
    expect(trimmed.style).toEqual({ stroke: "#0f766e", strokeWidth: 2.4, strokeLineCap: "round" });
  });

  it("creates a diagonal circle-to-circle trimmed line with endpoints on both circles", () => {
    const options = {
      centerA: { x: 10, y: 20 },
      radiusA: 5,
      centerB: { x: 34, y: 52 },
      radiusB: 8,
    };
    const trimmed = circleToCircleLine("c2c.diagonal", options);

    const startDistance = Math.hypot(
      trimmed.start.x - options.centerA.x,
      trimmed.start.y - options.centerA.y,
    );
    const endDistance = Math.hypot(
      trimmed.end.x - options.centerB.x,
      trimmed.end.y - options.centerB.y,
    );

    expect(startDistance).toBeCloseTo(options.radiusA, 8);
    expect(endDistance).toBeCloseTo(options.radiusB, 8);
  });

  it("applies markerStart and markerEnd through style merge in circleToCircleLine", () => {
    const trimmed = circleToCircleLine("c2c.arrow", {
      centerA: { x: 0, y: 0 },
      radiusA: 8,
      centerB: { x: 40, y: 0 },
      radiusB: 8,
      markerStart: "arrow",
      markerEnd: "arrow",
      style: { stroke: "#0f172a", strokeWidth: 1.6 },
    });

    expect(trimmed.style).toEqual({
      stroke: "#0f172a",
      strokeWidth: 1.6,
      markerStart: "arrow",
      markerEnd: "arrow",
    });
  });

  it("throws for invalid circleToCircleLine inputs", () => {
    expect(() => circleToCircleLine("c2c.bad.coincident", {
      centerA: { x: 10, y: 20 },
      radiusA: 8,
      centerB: { x: 10, y: 20 },
      radiusB: 6,
    })).toThrow("distinct circle centers");

    expect(() => circleToCircleLine("c2c.bad.radius", {
      centerA: { x: 0, y: 0 },
      radiusA: 0,
      centerB: { x: 20, y: 0 },
      radiusB: 6,
    })).toThrow("radiusA");

    expect(() => circleToCircleLine("c2c.bad.overlap", {
      centerA: { x: 0, y: 0 },
      radiusA: 8,
      centerB: { x: 12, y: 0 },
      radiusB: 6,
    })).toThrow("separated circles");

    expect(() => circleToCircleLine("c2c.bad.tangent", {
      centerA: { x: 0, y: 0 },
      radiusA: 8,
      centerB: { x: 14, y: 0 },
      radiusB: 6,
    })).toThrow("separated circles");

    expect(() => circleToCircleLine("c2c.bad.nonfinite", {
      centerA: { x: 0, y: 0 },
      radiusA: Number.POSITIVE_INFINITY,
      centerB: { x: 40, y: 0 },
      radiusB: 6,
    })).toThrow("radiusA");
  });

  it("creates a circle-to-circle arrow line with default markerEnd", () => {
    const trimmed = circleToCircleArrow("c2ca.main", {
      centerA: { x: 0, y: 0 },
      radiusA: 10,
      centerB: { x: 40, y: 0 },
      radiusB: 6,
      style: { stroke: "#0f766e", strokeWidth: 2.4, strokeLineCap: "round" },
    });

    expect(trimmed.kind).toBe("line");
    expect(trimmed.id).toBe("c2ca.main");
    expectPointClose(trimmed.start, { x: 10, y: 0 });
    expectPointClose(trimmed.end, { x: 34, y: 0 });
    expect(trimmed.style).toEqual({
      stroke: "#0f766e",
      strokeWidth: 2.4,
      strokeLineCap: "round",
      markerEnd: "arrow",
    });
  });

  it("allows explicit markerEnd override in circleToCircleArrow", () => {
    const trimmed = circleToCircleArrow("c2ca.override", {
      centerA: { x: 0, y: 0 },
      radiusA: 8,
      centerB: { x: 40, y: 0 },
      radiusB: 8,
      markerEnd: undefined,
      style: { stroke: "#0f172a", strokeWidth: 1.6 },
    });

    expect(trimmed.style).toEqual({
      stroke: "#0f172a",
      strokeWidth: 1.6,
      markerEnd: "arrow",
    });
  });

  it("preserves markerStart and explicit markerEnd in circleToCircleArrow", () => {
    const trimmed = circleToCircleArrow("c2ca.markers", {
      centerA: { x: 0, y: 0 },
      radiusA: 8,
      centerB: { x: 40, y: 0 },
      radiusB: 8,
      markerStart: "arrow",
      markerEnd: "arrow",
      style: { stroke: "#0f172a", strokeWidth: 1.6 },
    });

    expect(trimmed.style).toEqual({
      stroke: "#0f172a",
      strokeWidth: 1.6,
      markerStart: "arrow",
      markerEnd: "arrow",
    });
  });

  it("propagates circleToCircleLine validation in circleToCircleArrow", () => {
    expect(() => circleToCircleArrow("c2ca.bad.coincident", {
      centerA: { x: 10, y: 20 },
      radiusA: 8,
      centerB: { x: 10, y: 20 },
      radiusB: 6,
    })).toThrow("distinct circle centers");

    expect(() => circleToCircleArrow("c2ca.bad.overlap", {
      centerA: { x: 0, y: 0 },
      radiusA: 8,
      centerB: { x: 12, y: 0 },
      radiusB: 6,
    })).toThrow("separated circles");
  });

  it("creates x-axis and y-axis helper output as plain line/text objects", () => {
    const frame = {
      xDomain: [0, 10] as const,
      yDomain: [0, 100] as const,
      xRange: [60, 300] as const,
      yRange: [220, 80] as const,
    };
    const xObjects = xAxis("plot.x", frame, {
      axisValue: 0,
      tickValues: [0, 5, 10],
      gridLines: true,
    });
    const yObjects = yAxis("plot.y", frame, {
      axisValue: 0,
      tickValues: [0, 50, 100],
      gridLines: true,
    });

    expect(xObjects.find((object) => object.id === "plot.x.axis" && object.kind === "line")).toBeDefined();
    expect(xObjects.some((object) => object.id === "plot.x.tick.0" && object.kind === "line")).toBe(true);
    expect(xObjects.some((object) => object.id === "plot.x.label.0" && object.kind === "text")).toBe(true);
    expect(xObjects.some((object) => object.id === "plot.x.grid.1" && object.kind === "line")).toBe(true);

    expect(yObjects.find((object) => object.id === "plot.y.axis" && object.kind === "line")).toBeDefined();
    expect(yObjects.some((object) => object.id === "plot.y.tick.2" && object.kind === "line")).toBe(true);
    expect(yObjects.some((object) => object.id === "plot.y.label.1" && object.kind === "text")).toBe(true);
    expect(yObjects.some((object) => object.id === "plot.y.grid.0" && object.kind === "line")).toBe(true);
  });

  it("does not mutate frame inputs passed to axis helpers", () => {
    const frame = {
      xDomain: [0, 10] as const,
      yDomain: [0, 100] as const,
      xRange: [60, 300] as const,
      yRange: [220, 80] as const,
    };
    const before = JSON.parse(JSON.stringify(frame));

    xAxis("plot.x", frame, { axisValue: 0, tickValues: [0, 10] });
    yAxis("plot.y", frame, { axisValue: 0, tickValues: [0, 100] });

    expect(frame).toEqual(before);
  });

  it("creates a plain path object for an open belt around two circles", () => {
    const belt = openBeltPath("belt.path", {
      centerA: { x: 100, y: 140 },
      radiusA: 30,
      centerB: { x: 220, y: 140 },
      radiusB: 20,
      style: { stroke: "#0f172a", strokeWidth: 2, fill: "none", strokeLineCap: "round" },
    });

    expect(belt.kind).toBe("path");
    expect(belt.id).toBe("belt.path");
    expect(belt.style).toEqual({ stroke: "#0f172a", strokeWidth: 2, fill: "none", strokeLineCap: "round" });

    const commandKinds = belt.commands.map((command) => command.kind);
    expect(commandKinds).toEqual(["moveTo", "lineTo", "arc", "lineTo", "arc", "closePath"]);
    expect(belt.commands.filter((command) => command.kind === "arc")).toHaveLength(2);
  });

  it("is deterministic for a simple open belt pair", () => {
    const first = openBeltPath("belt.path", {
      centerA: { x: 100, y: 140 },
      radiusA: 30,
      centerB: { x: 220, y: 140 },
      radiusB: 20,
    });
    const second = openBeltPath("belt.path", {
      centerA: { x: 100, y: 140 },
      radiusA: 30,
      centerB: { x: 220, y: 140 },
      radiusB: 20,
    });

    expect(first).toEqual(second);
  });

  it("rejects open belt path cases with insufficient external tangents", () => {
    expect(() => openBeltPath("belt.bad.overlap", {
      centerA: { x: 100, y: 100 },
      radiusA: 40,
      centerB: { x: 130, y: 100 },
      radiusB: 40,
    })).toThrow("open belt");

    expect(() => openBeltPath("belt.bad.contained", {
      centerA: { x: 100, y: 100 },
      radiusA: 40,
      centerB: { x: 110, y: 100 },
      radiusB: 10,
    })).toThrow("open belt");

    expect(() => openBeltPath("belt.bad.coincident", {
      centerA: { x: 100, y: 100 },
      radiusA: 40,
      centerB: { x: 100, y: 100 },
      radiusB: 20,
    })).toThrow("open belt");
  });

  it("creates a plain path object for a crossed belt around two circles", () => {
    const belt = crossedBeltPath("belt.crossed", {
      centerA: { x: 100, y: 140 },
      radiusA: 30,
      centerB: { x: 220, y: 140 },
      radiusB: 20,
      style: { stroke: "#7c3aed", strokeWidth: 2, fill: "none", strokeLineCap: "round" },
    });

    expect(belt.kind).toBe("path");
    expect(belt.id).toBe("belt.crossed");
    expect(belt.style).toEqual({ stroke: "#7c3aed", strokeWidth: 2, fill: "none", strokeLineCap: "round" });

    const commandKinds = belt.commands.map((command) => command.kind);
    expect(commandKinds).toEqual(["moveTo", "lineTo", "arc", "lineTo", "arc", "closePath"]);
    expect(belt.commands.filter((command) => command.kind === "arc")).toHaveLength(2);
  });

  it("is deterministic for a simple crossed belt pair", () => {
    const first = crossedBeltPath("belt.crossed", {
      centerA: { x: 100, y: 140 },
      radiusA: 30,
      centerB: { x: 220, y: 140 },
      radiusB: 20,
    });
    const second = crossedBeltPath("belt.crossed", {
      centerA: { x: 100, y: 140 },
      radiusA: 30,
      centerB: { x: 220, y: 140 },
      radiusB: 20,
    });

    expect(first).toEqual(second);
  });

  it("rejects crossed belt path cases with insufficient internal tangents", () => {
    expect(() => crossedBeltPath("belt.crossed.bad.overlap", {
      centerA: { x: 100, y: 100 },
      radiusA: 40,
      centerB: { x: 130, y: 100 },
      radiusB: 40,
    })).toThrow("crossed belt");

    expect(() => crossedBeltPath("belt.crossed.bad.contained", {
      centerA: { x: 100, y: 100 },
      radiusA: 40,
      centerB: { x: 110, y: 100 },
      radiusB: 10,
    })).toThrow("crossed belt");

    expect(() => crossedBeltPath("belt.crossed.bad.coincident", {
      centerA: { x: 100, y: 100 },
      radiusA: 40,
      centerB: { x: 100, y: 100 },
      radiusB: 20,
    })).toThrow("crossed belt");
  });

  it("differs from openBeltPath for the same pulley pair", () => {
    const openBelt = openBeltPath("belt.open", {
      centerA: { x: 100, y: 140 },
      radiusA: 30,
      centerB: { x: 220, y: 140 },
      radiusB: 20,
    });
    const crossedBelt = crossedBeltPath("belt.crossed", {
      centerA: { x: 100, y: 140 },
      radiusA: 30,
      centerB: { x: 220, y: 140 },
      radiusB: 20,
    });

    expect(crossedBelt.commands).not.toEqual(openBelt.commands);
    expect(crossedBelt.commands.filter((command) => command.kind === "lineTo")).toHaveLength(2);
  });
});
