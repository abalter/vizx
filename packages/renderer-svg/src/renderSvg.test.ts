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

  it("serializes primitive style attributes", () => {
    const scene: RenderScene = {
      kind: "scene",
      viewBox: { minX: 0, minY: 0, width: 200, height: 120 },
      children: [
        {
          kind: "line",
          x1: 10,
          y1: 20,
          x2: 80,
          y2: 20,
          style: { stroke: "#ef4444", strokeWidth: 2, opacity: 0.7, fill: "none" },
        },
        {
          kind: "polyline",
          points: [{ x: 20, y: 40 }, { x: 40, y: 60 }, { x: 70, y: 44 }],
          style: { stroke: "#f97316", strokeWidth: 2, fill: "none" },
        },
        {
          kind: "ellipse",
          cx: 120,
          cy: 48,
          rx: 24,
          ry: 14,
          style: { stroke: "#0ea5e9", strokeWidth: 3, fill: "none" },
        },
        {
          kind: "polygon",
          points: [{ x: 128, y: 88 }, { x: 154, y: 64 }, { x: 186, y: 90 }, { x: 142, y: 106 }],
          style: { stroke: "#0f766e", strokeWidth: 2, fill: "none" },
        },
      ],
    };

    const svg = renderSvg(scene, { pretty: true });

    expect(svg).toContain('stroke="#ef4444"');
    expect(svg).toContain('stroke-width="2"');
    expect(svg).toContain('opacity="0.7"');
    expect(svg).toContain('stroke="#f97316"');
    expect(svg).toContain('stroke="#0ea5e9"');
    expect(svg).toContain('stroke="#0f766e"');
  });
});