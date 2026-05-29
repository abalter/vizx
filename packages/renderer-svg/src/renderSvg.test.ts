import { describe, expect, it } from "vitest";
import type { RenderScene } from "./scene";
import { renderSvg } from "./renderSvg";

describe("renderSvg", () => {
  it("serializes a simple scene with a rectangle and text", () => {
    const scene: RenderScene = {
      kind: "scene",
      viewBox: { minX: 0, minY: 0, width: 160, height: 80 },
      children: [
        {
          kind: "group",
          id: "box",
          transform: { kind: "translate", x: 10, y: 12 },
          children: [
            {
              kind: "rect",
              x: 0,
              y: 0,
              width: 120,
              height: 32,
              style: { stroke: "black", fill: "white", strokeWidth: 1 },
            },
            {
              kind: "text",
              x: 60,
              y: 20,
              text: "Hello",
              style: { fill: "black", fontSize: 14, textAnchor: "middle" },
            },
          ],
        },
      ],
    };

    const svg = renderSvg(scene, { pretty: true });

    expect(svg).toContain('viewBox="0 0 160 80"');
    expect(svg).toContain('<g id="box" transform="translate(10 12)">');
    expect(svg).toContain("<rect");
    expect(svg).toContain(">Hello</text>");
  });

  it("serializes a line node", () => {
    const scene: RenderScene = {
      kind: "scene",
      viewBox: { minX: 0, minY: 0, width: 100, height: 100 },
      children: [
        {
          kind: "line",
          x1: 10,
          y1: 20,
          x2: 80,
          y2: 70,
          style: { stroke: "black", fill: "none", strokeWidth: 1 },
        },
      ],
    };

    const svg = renderSvg(scene, { pretty: true });

    expect(svg).toContain("<line");
    expect(svg).toContain('x1="10"');
    expect(svg).toContain('y2="70"');
  });

  it("serializes a polyline node", () => {
    const scene: RenderScene = {
      kind: "scene",
      viewBox: { minX: 0, minY: 0, width: 120, height: 80 },
      children: [
        {
          kind: "polyline",
          points: [
            { x: 10, y: 20 },
            { x: 30, y: 10 },
            { x: 50, y: 40 },
            { x: 70, y: 15 },
          ],
          style: { stroke: "black", fill: "none", strokeWidth: 1 },
        },
      ],
    };

    const svg = renderSvg(scene, { pretty: true });

    expect(svg).toContain("<polyline");
    expect(svg).toContain('points="10,20 30,10 50,40 70,15"');
  });

  it("serializes an ellipse node", () => {
    const scene: RenderScene = {
      kind: "scene",
      viewBox: { minX: 0, minY: 0, width: 140, height: 80 },
      children: [
        {
          kind: "ellipse",
          cx: 60,
          cy: 40,
          rx: 30,
          ry: 18,
          style: { stroke: "black", fill: "none", strokeWidth: 1 },
        },
      ],
    };

    const svg = renderSvg(scene, { pretty: true });

    expect(svg).toContain("<ellipse");
    expect(svg).toContain('cx="60"');
    expect(svg).toContain('ry="18"');
  });

  it("serializes a polygon node", () => {
    const scene: RenderScene = {
      kind: "scene",
      viewBox: { minX: 0, minY: 0, width: 160, height: 120 },
      children: [
        {
          kind: "polygon",
          points: [
            { x: 20, y: 80 },
            { x: 60, y: 20 },
            { x: 120, y: 40 },
            { x: 132, y: 92 },
            { x: 48, y: 104 },
          ],
          style: { stroke: "black", fill: "none", strokeWidth: 1 },
        },
      ],
    };

    const svg = renderSvg(scene, { pretty: true });

    expect(svg).toContain("<polygon");
    expect(svg).toContain('points="20,80 60,20 120,40 132,92 48,104"');
  });
});