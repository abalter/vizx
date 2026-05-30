# Style Expansion Model Plan

This document proposes a docs-only Milestone 4 style expansion plan for VizX.

Scope:

- docs-only design note
- no runtime behavior changes in this pass
- no parser/JSON Core IR/AST implementation changes in this pass
- no dependency additions

## 1. Purpose And Scope

Milestone 4 exists to improve visual resemblance for technical illustration reproductions without changing VizX's core identity as a semantic object-model + resolver pipeline.

Near-term objective:

- add a small, high-value style surface that materially improves recognizability of aspirational examples

Guardrails:

- preserve current object kinds and path command model
- preserve resolver-owned layout, anchor, and bbox semantics
- avoid a helper API explosion in the builder layer
- keep parser/JSON Core IR parity work explicitly deferred

## 2. Baseline Today

Current style model in core:

- stroke
- fill
- strokeWidth
- fontFamily
- fontSize
- textAnchor
- dominantBaseline
- opacity
- markerStart
- markerEnd

Current behavior in resolver and renderer:

- shape defaults are merged in resolver via defaultBoxStyle/defaultLineStyle/defaultConnectorStyle
- text style defaults are resolved explicitly (font family/size, fill, text anchor, baseline)
- SVG serializer currently maps primitive style attributes including stroke/fill/stroke-width/opacity and marker references

Current examples demonstrating style baseline:

- styled primitives
- arrowheads and connector marker usage
- aspirational examples using stroke/fill/opacity and markers

## 3. Current Limitations

Style gaps blocking higher-fidelity reproductions:

- no dashed stroke model
- no explicit stroke cap control
- no explicit stroke join control
- no fill-rule control
- single shared opacity only (no independent stroke/fill opacity)

Practical impact:

- examples that rely on dashed construction lines or stylistic emphasis cannot be represented cleanly
- shape corners and segment ends cannot match source style intent
- self-intersecting fills cannot reliably match source winding behavior
- some soft visual layering effects are awkward when only global opacity is available

## 4. Recommended V0 Additions

Recommended first style expansion slice:

- strokeDasharray: number[]
- strokeLineCap: "butt" | "round" | "square"
- strokeLineJoin: "miter" | "round" | "bevel"
- fillRule: "nonzero" | "evenodd"

Optional but reasonable in the same branch if low risk:

- strokeOpacity: number
- fillOpacity: number

Rationale:

- dash + cap + join + fillRule produce the largest visual gain for the smallest model increase
- split opacities are common in source material and align directly to SVG semantics
- all proposed fields map cleanly to standard SVG attributes with no new geometry logic

## 5. Proposed Style Type Shape

Proposed additive style shape:

```ts
export interface Style {
  readonly stroke?: string;
  readonly fill?: string;
  readonly strokeWidth?: number;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly textAnchor?: "start" | "middle" | "end";
  readonly dominantBaseline?: string;
  readonly opacity?: number;
  readonly markerStart?: string;
  readonly markerEnd?: string;

  // Milestone 4 v0 additions.
  readonly strokeDasharray?: readonly number[];
  readonly strokeLineCap?: "butt" | "round" | "square";
  readonly strokeLineJoin?: "miter" | "round" | "bevel";
  readonly fillRule?: "nonzero" | "evenodd";

  // Optional split opacity extension.
  readonly strokeOpacity?: number;
  readonly fillOpacity?: number;
}
```

Compatibility notes:

- all fields are optional and additive
- existing examples and tests should remain valid without source changes
- default style objects can remain minimal unless a new default is explicitly needed

## 6. Resolver Behavior Contract

Resolver behavior should remain intentionally simple:

- preserve and merge style in existing resolver locations as today
- do not let new style fields affect bbox, anchors, placement, alignment, distribution, or connector endpoint solving
- do not introduce geometry-side calculations for style semantics

Validation posture for v0:

- prefer pass-through of enumerated style fields
- optionally add narrow diagnostics for obviously invalid numeric style values only if consistency with existing diagnostics is maintained
- do not block scene resolution for style fields that can be serialized safely

## 7. Renderer-SVG Mapping Contract

Renderer should extend style attribute serialization with direct SVG mappings:

- strokeDasharray -> stroke-dasharray
- strokeLineCap -> stroke-linecap
- strokeLineJoin -> stroke-linejoin
- fillRule -> fill-rule
- strokeOpacity -> stroke-opacity (if adopted)
- fillOpacity -> fill-opacity (if adopted)

Serialization details:

- strokeDasharray arrays should serialize to a comma-separated or space-separated numeric list consistently
- undefined fields should be omitted
- existing marker behavior should remain unchanged

Non-goals for this slice:

- no new defs-based styling mechanisms
- no filters, masks, gradients, or clipping in this branch

## 8. Builder API Stance

Builder policy for this milestone:

- keep style authoring as plain style objects
- do not add many style-specific helper functions
- avoid creating a second style DSL

Recommended ergonomics:

- continue using ordinary object literals at call sites
- if any helper is introduced, keep it narrowly optional and compositional rather than required

## 9. Example Targets

Primary aspirational targets called out for Milestone 4:

- TikZ Coffee cup
- TikZ Totoro sitting in the snow
- MetaPost dominos.mp
- MetaPost paintball.mp
- Asymptote fig0040.asy

Near-term non-aspirational proving targets:

- extend styled-primitives with dashed and cap/join/fillRule coverage
- add or extend a focused style fixture example to exercise each new field in isolation

Acceptance intent:

- examples should become more visually recognizable without changing scene semantics
- tests should assert attribute presence/propagation, not brittle full-SVG snapshots

## 10. First Implementation Slice Recommendation

Recommended first code slice after this docs pass:

1. core style model additions
2. resolver pass-through/merge confirmation for new fields
3. renderer-svg style attribute mapping additions
4. targeted unit tests in resolver/renderer
5. small example updates proving dash/cap/join/fillRule usage

Suggested constraints for that first slice:

- include dash/cap/join/fillRule only
- keep strokeOpacity/fillOpacity as a documented optional follow-up if scope pressure appears
- avoid touching parser/JSON Core IR/AST in the same implementation branch

## 11. Future Style Slices

Reasonable follow-up branches after v0 style expansion:

- split opacity (if deferred)
- clipping and masking model plan
- gradient model plan
- pattern fills and hatch-style semantics
- richer marker styling and scaling controls
- typography controls beyond current minimal text style

Each branch should remain additive and independently testable.

## 12. Relationship To SVG Landscape Note

This plan intentionally aligns with the SVG affordance direction described in the JS library landscape note:

- adopt practical SVG-expressive fields where mapping is direct and low-risk
- keep raw SVG as renderer output concerns, not as VizX's primary object model
- maintain model-first semantics while broadening style expressivity in controlled increments

## 13. Out Of Scope

Explicitly out of scope for this milestone plan and first implementation slice:

- parser syntax additions for new style fields
- JSON Core IR schema expansion and parser lowering parity
- clipping, masking, gradients, filters, and blending model design
- path geometry changes (arc behavior, tight Bezier bounds, intersections, path length)
- chart/plot coordinate systems
- 3D/projection features
- source-language translation features

## 14. Cross-References

- [ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./ASPIRATIONAL_REPRODUCTION_ROADMAP.md)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
- [ARC_AND_ANGLE_MARK_CHECKPOINT.md](./ARC_AND_ANGLE_MARK_CHECKPOINT.md)
- [STYLE_EXPANSION_CHECKPOINT.md](./STYLE_EXPANSION_CHECKPOINT.md)
- [JS_GRAPHICS_LIBRARY_LANDSCAPE.md](./JS_GRAPHICS_LIBRARY_LANDSCAPE.md)

## 15. Implementation Status (Current)

Implemented in the first Milestone 4 code slice:

- `strokeDasharray`
- `strokeLineCap`
- `strokeLineJoin`
- `fillRule`

Implemented behavior:

- shared `Style` type accepts all four fields
- resolver style propagation preserves these fields through existing style merge/pass-through paths
- SVG renderer serializes `stroke-dasharray`, `stroke-linecap`, `stroke-linejoin`, and `fill-rule`
- `aspirational-labeled-polygon` applies style fields in practice (`strokeDasharray`, `strokeLineCap`, `strokeLineJoin`) for technical-geometry visual distinction
- no bbox/anchor/layout/distribution/connector geometry behavior changed

Still deferred in style expansion:

- `strokeOpacity`
- `fillOpacity`
- style presets/inheritance/themes/CSS-class systems
- clipping, gradients, masks, blend modes, and pattern fills
- parser syntax, JSON Core IR support, and parser AST support for these style fields
