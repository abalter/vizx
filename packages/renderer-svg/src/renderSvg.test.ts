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
});