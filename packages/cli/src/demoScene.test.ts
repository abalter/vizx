import { describe, expect, it } from "vitest";
import { inspectScene } from "@vizx/resolver";
import { createBasicDemoScene } from "./demoScene";

describe("demo scene inspection", () => {
  it("includes expected object ids, anchors, connector points, and diagnostics", () => {
    const inspection = inspectScene(createBasicDemoScene());

    expect(inspection.objectCount).toBe(3);
    expect(inspection.objects.map((object) => object.id)).toEqual(["A", "B", "C"]);
    expect(inspection.objects[0]?.anchors.center).toBeDefined();
    expect(inspection.objects[0]?.anchors.east).toBeDefined();
    expect(inspection.connectors[0]?.from.point).toEqual(inspection.objects[0]?.anchors.east);
    expect(inspection.connectors[0]?.to.point).toEqual(inspection.objects[1]?.anchors.west);
    expect(inspection.diagnostics).toEqual([]);
  });
});