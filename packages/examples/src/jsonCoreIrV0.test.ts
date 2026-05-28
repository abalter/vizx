import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020";
import { convertJsonCoreIrV0ToObjectScene } from "@vizx/object-model";
import { inspectScene, resolveScene } from "@vizx/resolver";
import { requireVizxExample } from "./index";

function loadJsonCoreIrSchema(): unknown {
  const schemaUrl = new URL("../../../schemas/json-core-ir-v0.schema.json", import.meta.url);
  const schemaText = readFileSync(schemaUrl, "utf8");
  return JSON.parse(schemaText) as unknown;
}

function loadJsonCoreIrFixture(name: "basic" | "relative-placement" | "alignment-family" | "distribute-x" | "distribute-y"): unknown {
  const fixtureUrl = new URL(`../fixtures/json-core-ir-v0/${name}.json`, import.meta.url);
  const fixtureText = readFileSync(fixtureUrl, "utf8");
  return JSON.parse(fixtureText) as unknown;
}

function createJsonCoreIrSchemaValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const schema = loadJsonCoreIrSchema() as object;
  return ajv.compile(schema);
}

function formatAjvErrors(errors: readonly { instancePath?: string; message?: string }[] | null | undefined): string {
  if (!errors || errors.length === 0) {
    return "unknown validation error";
  }

  return errors
    .map((error) => `${error.instancePath || "/"} ${error.message || "validation error"}`)
    .join("\n");
}

describe("convertJsonCoreIrV0ToObjectScene", () => {
  it("loads the draft schema file as JSON and exposes the expected top-level metadata", () => {
    const schema = loadJsonCoreIrSchema() as {
      $schema?: unknown;
      $id?: unknown;
      title?: unknown;
      type?: unknown;
      $defs?: Record<string, unknown>;
    };

    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(schema.$id).toBe("./json-core-ir-v0.schema.json");
    expect(schema.title).toBe("VizX JSON Core IR v0 (draft review artifact)");
    expect(schema.type).toBe("object");
    expect(schema.$defs).toBeDefined();
  });

  it("includes the expected supported enums at a shallow structural level", () => {
    const schema = loadJsonCoreIrSchema() as {
      $defs?: {
        groupObject?: { properties?: { kind?: { const?: unknown } } };
        textObject?: { properties?: { kind?: { const?: unknown } } };
        rectObject?: { properties?: { kind?: { const?: unknown } } };
        alignment?: { properties?: { relation?: { enum?: unknown } } };
        relativePlacement?: { properties?: { kind?: { enum?: unknown } } };
        distributionOperation?: { properties?: { relation?: { enum?: unknown } } };
      };
    };

    expect(schema.$defs?.groupObject?.properties?.kind?.const).toBe("group");
    expect(schema.$defs?.textObject?.properties?.kind?.const).toBe("text");
    expect(schema.$defs?.rectObject?.properties?.kind?.const).toBe("rect");
    expect(schema.$defs?.distributionOperation?.properties?.relation?.enum).toEqual([
      "distributeX",
      "distributeY",
    ]);
    expect(schema.$defs?.alignment?.properties?.relation?.enum).toEqual([
      "alignX",
      "alignY",
      "alignLeft",
      "alignRight",
      "alignTop",
      "alignBottom",
    ]);
    expect(schema.$defs?.relativePlacement?.properties?.kind?.enum).toEqual([
      "rightOf",
      "leftOf",
      "above",
      "below",
    ]);
  });

  it("validates committed JSON Core IR fixtures against the draft schema", () => {
    const validate = createJsonCoreIrSchemaValidator();
    const fixtureNames = [
      "basic",
      "relative-placement",
      "alignment-family",
      "distribute-x",
      "distribute-y",
    ] as const;

    for (const fixtureName of fixtureNames) {
      const fixture = loadJsonCoreIrFixture(fixtureName);
      const isValid = validate(fixture);

      expect(
        isValid,
        `Fixture ${fixtureName} failed schema validation:\n${formatAjvErrors(validate.errors)}`,
      ).toBe(true);
    }
  });

  it("loads the basic JSON fixture and converts it to an ObjectScene", () => {
    const fixture = loadJsonCoreIrFixture("basic");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);

    expect(result.diagnostics).toEqual([]);
    expect(result.scene).toBeDefined();
    expect(result.scene?.objects.map((object) => object.id)).toEqual(["A", "B", "C"]);
    expect(result.scene?.connectors?.map((connector) => connector.id)).toEqual(["edge-1", "edge-2"]);
  });

  it("fixture-converted scene matches the TypeScript basic example semantically", () => {
    const fixture = loadJsonCoreIrFixture("basic");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);

    const convertedInspection = inspectScene(result.scene!);
    const convertedResolved = resolveScene(result.scene!);
    const exampleScene = requireVizxExample("basic").createScene();
    const exampleInspection = inspectScene(exampleScene);
    const exampleResolved = resolveScene(exampleScene);

    expect(result.diagnostics).toEqual([]);
    expect(convertedResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(exampleResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(convertedInspection.objects.map((object) => object.id)).toEqual(exampleInspection.objects.map((object) => object.id));
    expect(convertedInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    }))).toEqual(exampleInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    })));
  });

  it("loads the relative-placement JSON fixture and converts it to an ObjectScene", () => {
    const fixture = loadJsonCoreIrFixture("relative-placement");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);

    expect(result.diagnostics).toEqual([]);
    expect(result.scene).toBeDefined();
    expect(result.scene?.objects.map((object) => object.id)).toEqual(["Center", "Right", "Left", "Above", "Below"]);
    expect(result.scene?.connectors?.map((connector) => connector.id)).toEqual([
      "center-right",
      "center-left",
      "center-above",
      "center-below",
    ]);
  });

  it("fixture-converted relative-placement scene matches TypeScript example semantics", () => {
    const fixture = loadJsonCoreIrFixture("relative-placement");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);
    const convertedScene = result.scene!;

    const convertedInspection = inspectScene(convertedScene);
    const convertedResolved = resolveScene(convertedScene);
    const exampleScene = requireVizxExample("relative-placement").createScene();
    const exampleInspection = inspectScene(exampleScene);
    const exampleResolved = resolveScene(exampleScene);

    expect(result.diagnostics).toEqual([]);
    expect(convertedResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(exampleResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);

    expect(convertedScene.objects.map((object) => ({
      id: object.id,
      placementKind: object.placement?.kind,
    }))).toEqual(exampleScene.objects.map((object) => ({
      id: object.id,
      placementKind: object.placement?.kind,
    })));

    expect(convertedInspection.objects.map((object) => object.id)).toEqual(exampleInspection.objects.map((object) => object.id));
    expect(convertedInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    }))).toEqual(exampleInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    })));

    const convertedById = new Map(convertedInspection.objects.map((object) => [object.id, object]));
    const center = convertedById.get("Center");
    const right = convertedById.get("Right");
    const left = convertedById.get("Left");
    const above = convertedById.get("Above");
    const below = convertedById.get("Below");

    expect(center).toBeDefined();
    expect(right).toBeDefined();
    expect(left).toBeDefined();
    expect(above).toBeDefined();
    expect(below).toBeDefined();

    if (!center || !right || !left || !above || !below) {
      throw new Error("Expected relative-placement objects to be present in inspection output.");
    }

    const centerAnchor = center.anchors.center;
    const rightAnchor = right.anchors.center;
    const leftAnchor = left.anchors.center;
    const aboveAnchor = above.anchors.center;
    const belowAnchor = below.anchors.center;

    if (!centerAnchor || !rightAnchor || !leftAnchor || !aboveAnchor || !belowAnchor) {
      throw new Error("Expected relative-placement objects to expose center anchors.");
    }

    expect(rightAnchor.x).toBeGreaterThan(centerAnchor.x);
    expect(leftAnchor.x).toBeLessThan(centerAnchor.x);
    expect(aboveAnchor.y).toBeLessThan(centerAnchor.y);
    expect(belowAnchor.y).toBeGreaterThan(centerAnchor.y);
  });

  it("loads the alignment-family JSON fixture and converts it to an ObjectScene", () => {
    const fixture = loadJsonCoreIrFixture("alignment-family");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);

    expect(result.diagnostics).toEqual([]);
    expect(result.scene).toBeDefined();
    expect(result.scene?.objects.map((object) => object.id)).toEqual([
      "Reference",
      "AxisX",
      "AxisY",
      "EdgeLeft",
      "EdgeRight",
      "EdgeTop",
      "EdgeBottom",
    ]);
    expect(result.scene?.connectors?.map((connector) => connector.id)).toEqual([
      "reference-axis-x",
      "reference-axis-y",
      "reference-edge-left",
      "reference-edge-right",
      "reference-edge-top",
      "reference-edge-bottom",
    ]);
  });

  it("fixture-converted alignment-family scene matches TypeScript example semantics", () => {
    const fixture = loadJsonCoreIrFixture("alignment-family");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);
    const convertedScene = result.scene!;

    const convertedInspection = inspectScene(convertedScene);
    const convertedResolved = resolveScene(convertedScene);
    const exampleScene = requireVizxExample("alignment-family").createScene();
    const exampleInspection = inspectScene(exampleScene);
    const exampleResolved = resolveScene(exampleScene);

    expect(result.diagnostics).toEqual([]);
    expect(convertedResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(exampleResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);

    expect(convertedScene.objects.map((object) => ({
      id: object.id,
      placementKind: object.placement?.kind,
      alignRelation: object.align?.relation,
      alignReference: object.align ? {
        objectId: object.align.reference.objectId,
        anchor: object.align.reference.anchor,
      } : undefined,
    }))).toEqual(exampleScene.objects.map((object) => ({
      id: object.id,
      placementKind: object.placement?.kind,
      alignRelation: object.align?.relation,
      alignReference: object.align ? {
        objectId: object.align.reference.objectId,
        anchor: object.align.reference.anchor,
      } : undefined,
    })));

    expect(convertedInspection.objects.map((object) => object.id)).toEqual(exampleInspection.objects.map((object) => object.id));
    expect(convertedInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    }))).toEqual(exampleInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    })));

    const convertedById = new Map(convertedInspection.objects.map((object) => [object.id, object]));
    const reference = convertedById.get("Reference");
    const axisX = convertedById.get("AxisX");
    const axisY = convertedById.get("AxisY");
    const edgeLeft = convertedById.get("EdgeLeft");
    const edgeRight = convertedById.get("EdgeRight");
    const edgeTop = convertedById.get("EdgeTop");
    const edgeBottom = convertedById.get("EdgeBottom");

    expect(reference).toBeDefined();
    expect(axisX).toBeDefined();
    expect(axisY).toBeDefined();
    expect(edgeLeft).toBeDefined();
    expect(edgeRight).toBeDefined();
    expect(edgeTop).toBeDefined();
    expect(edgeBottom).toBeDefined();

    if (!reference || !axisX || !axisY || !edgeLeft || !edgeRight || !edgeTop || !edgeBottom) {
      throw new Error("Expected alignment-family objects to be present in inspection output.");
    }

    const referenceCenter = reference.anchors.center;
    const axisXCenter = axisX.anchors.center;
    const axisYCenter = axisY.anchors.center;
    const referenceWest = reference.anchors.west;
    const edgeLeftWest = edgeLeft.anchors.west;
    const referenceEast = reference.anchors.east;
    const edgeRightEast = edgeRight.anchors.east;
    const referenceNorth = reference.anchors.north;
    const edgeTopNorth = edgeTop.anchors.north;
    const referenceSouth = reference.anchors.south;
    const edgeBottomSouth = edgeBottom.anchors.south;

    if (!referenceCenter || !axisXCenter || !axisYCenter || !referenceWest || !edgeLeftWest || !referenceEast || !edgeRightEast || !referenceNorth || !edgeTopNorth || !referenceSouth || !edgeBottomSouth) {
      throw new Error("Expected alignment-family objects to expose required anchors.");
    }

    expect(axisXCenter.x).toBe(referenceCenter.x);
    expect(axisYCenter.y).toBe(referenceCenter.y);
    expect(edgeLeftWest.x).toBe(referenceWest.x);
    expect(edgeRightEast.x).toBe(referenceEast.x);
    expect(edgeTopNorth.y).toBe(referenceNorth.y);
    expect(edgeBottomSouth.y).toBe(referenceSouth.y);
  });

  it("loads the distribute-x JSON fixture and converts it to an ObjectScene", () => {
    const fixture = loadJsonCoreIrFixture("distribute-x");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);

    expect(result.diagnostics).toEqual([]);
    expect(result.scene).toBeDefined();
    expect(result.scene?.objects.map((object) => object.id)).toEqual(["A", "B", "C"]);
    expect(result.scene?.distribution).toEqual([{ relation: "distributeX", objectIds: ["A", "B", "C"] }]);
    expect(result.scene?.connectors?.map((connector) => connector.id)).toEqual(["a-b", "b-c"]);
  });

  it("fixture-converted distribute-x scene matches TypeScript example semantics", () => {
    const fixture = loadJsonCoreIrFixture("distribute-x");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);
    const convertedScene = result.scene!;

    const convertedInspection = inspectScene(convertedScene);
    const convertedResolved = resolveScene(convertedScene);
    const exampleScene = requireVizxExample("distribute-x").createScene();
    const exampleInspection = inspectScene(exampleScene);
    const exampleResolved = resolveScene(exampleScene);

    expect(result.diagnostics).toEqual([]);
    expect(convertedResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(exampleResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(convertedScene.distribution).toEqual(exampleScene.distribution);
    expect(convertedInspection.objects.map((object) => object.id)).toEqual(exampleInspection.objects.map((object) => object.id));
    expect(convertedInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    }))).toEqual(exampleInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    })));

    const convertedById = new Map(convertedInspection.objects.map((object) => [object.id, object]));
    const exampleById = new Map(exampleInspection.objects.map((object) => [object.id, object]));
    const a = convertedById.get("A");
    const b = convertedById.get("B");
    const c = convertedById.get("C");
    const exampleB = exampleById.get("B");

    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(c).toBeDefined();
    expect(exampleB).toBeDefined();

    if (!a || !b || !c || !exampleB) {
      throw new Error("Expected distribute-x objects to be present in inspection output.");
    }

    const aCenter = a.anchors.center;
    const bCenter = b.anchors.center;
    const cCenter = c.anchors.center;
    const exampleBCenter = exampleB.anchors.center;

    if (!aCenter || !bCenter || !cCenter || !exampleBCenter) {
      throw new Error("Expected distribute-x objects to expose center anchors.");
    }

    expect((bCenter.x - aCenter.x) * 2).toBeCloseTo(cCenter.x - aCenter.x, 8);
    expect(bCenter.y).toBeCloseTo(exampleBCenter.y, 8);
  });

  it("loads the distribute-y JSON fixture and converts it to an ObjectScene", () => {
    const fixture = loadJsonCoreIrFixture("distribute-y");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);

    expect(result.diagnostics).toEqual([]);
    expect(result.scene).toBeDefined();
    expect(result.scene?.objects.map((object) => object.id)).toEqual(["Top", "Middle", "Bottom"]);
    expect(result.scene?.distribution).toEqual([{ relation: "distributeY", objectIds: ["Top", "Middle", "Bottom"] }]);
    expect(result.scene?.connectors?.map((connector) => connector.id)).toEqual(["top-middle", "middle-bottom"]);
  });

  it("fixture-converted distribute-y scene matches TypeScript example semantics", () => {
    const fixture = loadJsonCoreIrFixture("distribute-y");
    const result = convertJsonCoreIrV0ToObjectScene(fixture);
    const convertedScene = result.scene!;

    const convertedInspection = inspectScene(convertedScene);
    const convertedResolved = resolveScene(convertedScene);
    const exampleScene = requireVizxExample("distribute-y").createScene();
    const exampleInspection = inspectScene(exampleScene);
    const exampleResolved = resolveScene(exampleScene);

    expect(result.diagnostics).toEqual([]);
    expect(convertedResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(exampleResolved.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toEqual([]);
    expect(convertedScene.distribution).toEqual(exampleScene.distribution);
    expect(convertedInspection.objects.map((object) => object.id)).toEqual(exampleInspection.objects.map((object) => object.id));
    expect(convertedInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    }))).toEqual(exampleInspection.connectors.map((connector) => ({
      id: connector.id,
      from: { objectId: connector.from.objectId, anchor: connector.from.anchor },
      to: { objectId: connector.to.objectId, anchor: connector.to.anchor },
    })));

    const convertedById = new Map(convertedInspection.objects.map((object) => [object.id, object]));
    const exampleById = new Map(exampleInspection.objects.map((object) => [object.id, object]));
    const top = convertedById.get("Top");
    const middle = convertedById.get("Middle");
    const bottom = convertedById.get("Bottom");
    const exampleMiddle = exampleById.get("Middle");

    expect(top).toBeDefined();
    expect(middle).toBeDefined();
    expect(bottom).toBeDefined();
    expect(exampleMiddle).toBeDefined();

    if (!top || !middle || !bottom || !exampleMiddle) {
      throw new Error("Expected distribute-y objects to be present in inspection output.");
    }

    const topCenter = top.anchors.center;
    const middleCenter = middle.anchors.center;
    const bottomCenter = bottom.anchors.center;
    const exampleMiddleCenter = exampleMiddle.anchors.center;

    if (!topCenter || !middleCenter || !bottomCenter || !exampleMiddleCenter) {
      throw new Error("Expected distribute-y objects to expose center anchors.");
    }

    expect((middleCenter.y - topCenter.y) * 2).toBeCloseTo(bottomCenter.y - topCenter.y, 8);
    expect(middleCenter.x).toBeCloseTo(exampleMiddleCenter.x, 8);
  });

  it("returns diagnostics and no scene for malformed input", () => {
    const result = convertJsonCoreIrV0ToObjectScene(42);

    expect(result.scene).toBeUndefined();
    expect(result.diagnostics.length).toBeGreaterThan(0);
  });

  it("returns diagnostics for an unknown object kind", () => {
    const result = convertJsonCoreIrV0ToObjectScene({
      objects: [
        {
          id: "A",
          kind: "circle",
          center: { x: 0, y: 0 },
          radius: 10,
        },
      ],
      connectors: [],
    });

    expect(result.scene).toBeUndefined();
    expect(result.diagnostics.some((message) => message.includes("kind must be one of group, text, or rect"))).toBe(true);
  });

  it("returns diagnostics for an unsupported placement relation", () => {
    const result = convertJsonCoreIrV0ToObjectScene({
      objects: [
        {
          id: "A",
          kind: "group",
          placement: { kind: "diagonalOf", reference: { objectId: "B", anchor: "south" }, gap: 40 },
          children: [
            { id: "A.label", kind: "text", center: { x: 0, y: 0 }, text: "Raw data" },
            { id: "A.frame", kind: "rect", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [],
    });

    expect(result.scene).toBeUndefined();
    expect(result.diagnostics.some((message) => message.includes("placement.kind must be absolute, rightOf, leftOf, above, or below"))).toBe(true);
  });

  it("returns diagnostics for an unsupported alignment relation", () => {
    const result = convertJsonCoreIrV0ToObjectScene({
      objects: [
        {
          id: "A",
          kind: "group",
          placement: { kind: "absolute", position: { x: 80, y: 60 } },
          align: { relation: "alignDiagonal", reference: { objectId: "B", anchor: "center" } },
          children: [
            { id: "A.label", kind: "text", center: { x: 0, y: 0 }, text: "Raw data" },
            { id: "A.frame", kind: "rect", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [],
    });

    expect(result.scene).toBeUndefined();
    expect(result.diagnostics.some((message) => message.includes("align.relation must be alignX, alignY, alignLeft, alignRight, alignTop, or alignBottom"))).toBe(true);
  });

  it("returns diagnostics for an unsupported distribution relation", () => {
    const result = convertJsonCoreIrV0ToObjectScene({
      objects: [
        {
          id: "A",
          kind: "group",
          placement: { kind: "absolute", position: { x: 80, y: 60 } },
          children: [
            { id: "A.label", kind: "text", center: { x: 0, y: 0 }, text: "Raw data" },
            { id: "A.frame", kind: "rect", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [],
      distribution: [
        { relation: "distributeDiagonal", objectIds: ["A"] },
      ],
    });

    expect(result.scene).toBeUndefined();
    expect(result.diagnostics.some((message) => message.includes("distribution[0].relation must be distributeX or distributeY"))).toBe(true);
  });

  it("returns diagnostics for malformed connector endpoints", () => {
    const result = convertJsonCoreIrV0ToObjectScene({
      objects: [
        {
          id: "A",
          kind: "group",
          placement: { kind: "absolute", position: { x: 80, y: 60 } },
          children: [
            { id: "A.label", kind: "text", center: { x: 0, y: 0 }, text: "Raw data" },
            { id: "A.frame", kind: "rect", fitToText: { textId: "A.label", paddingX: 12, paddingY: 10 }, rx: 6, ry: 6 },
          ],
        },
      ],
      connectors: [
        {
          kind: "connector",
          id: "edge-1",
          from: { objectId: "A" },
          to: { objectId: "A", anchor: "west" },
        },
      ],
    });

    expect(result.scene).toBeUndefined();
    expect(result.diagnostics.some((message) => message.includes("connectors[0].from.anchor"))).toBe(true);
  });
});