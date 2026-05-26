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

  it("includes nested group children with ids, kinds, bbox, and anchors", () => {
    const inspection = inspectScene(createBasicDemoScene());
    const firstGroup = inspection.objects[0];
    const firstChild = firstGroup?.children?.[0];
    const secondChild = firstGroup?.children?.[1];

    expect(firstGroup?.children).toHaveLength(2);
    expect(firstChild?.id).toBe("A.label");
    expect(firstChild?.kind).toBe("text");
    expect(firstChild?.bbox).toBeDefined();
    expect(firstChild?.anchors.center).toBeDefined();
    expect(firstChild?.text).toBe("Raw data");
    expect(secondChild?.id).toBe("A.frame");
    expect(secondChild?.kind).toBe("rect");
    expect(secondChild?.bbox).toBeDefined();
    expect(secondChild?.anchors.east).toBeDefined();
  });

  it("reports geometry summaries in the same resolved scene coordinate space", () => {
    const inspection = inspectScene(createBasicDemoScene());
    const textChild = inspection.objects[0]?.children?.find((child) => child.id === "A.label");
    const rectChild = inspection.objects[0]?.children?.find((child) => child.id === "A.frame");

    expect(textChild).toBeDefined();
    expect(rectChild).toBeDefined();

    if (!textChild || !rectChild) {
      throw new Error("Expected demo inspection children to be present");
    }

    expect(rectChild.geometry).toBeDefined();
    expect(rectChild.geometry?.x).toBe(rectChild.bbox.x);
    expect(rectChild.geometry?.y).toBe(rectChild.bbox.y);
    expect(rectChild.geometry?.width).toBe(rectChild.bbox.width);
    expect(rectChild.geometry?.height).toBe(rectChild.bbox.height);
    expect(textChild.geometry?.x).toBeGreaterThan(textChild.bbox.x);
    expect(textChild.geometry?.y).toBeGreaterThan(textChild.bbox.y);
  });
});