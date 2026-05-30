# Style Expansion Checkpoint

This document is a docs-only checkpoint after landing Milestone 4's first style-expansion implementation phase in VizX.

It summarizes what exists now, what this style surface enables, what remains deferred, and which roadmap branch should come next.

No runtime behavior changes are made in this pass.

## 1. Purpose

This checkpoint closes the first Milestone 4 implementation phase.

VizX now supports a narrow technical style layer that is sufficient for:

- dashed construction lines
- explicit line cap control
- explicit line join control
- fill-rule serialization

VizX does not now provide:

- a full SVG/CSS styling system
- theme/style-inheritance infrastructure
- parser/interchange parity for newer style fields

This is a practical technical-illustration style milestone, not a full styling-system completion milestone.

## 2. What Is Now Implemented

### 2.1 Current Style Surface

Current style fields in active use include:

- `stroke`
- `fill`
- `strokeWidth`
- `opacity`
- `markerStart`
- `markerEnd`
- `strokeDasharray`
- `strokeLineCap`
- `strokeLineJoin`
- `fillRule`

### 2.2 SVG Serialization Mapping

Current renderer mapping for Milestone 4 fields:

- `strokeDasharray` -> `stroke-dasharray`
- `strokeLineCap` -> `stroke-linecap`
- `strokeLineJoin` -> `stroke-linejoin`
- `fillRule` -> `fill-rule`

Current dash formatting choice:

- space-separated SVG dash list, for example `stroke-dasharray="4 2"`

### 2.3 Coverage And Verification

Current verification coverage includes:

- renderer tests for style-attribute serialization
- resolver tests verifying style propagation/pass-through for the new fields
- example registry tests asserting style attributes in rendered SVG
- focused style fixture coverage in `styled-primitives`
- aspirational example style assertions for `aspirational-labeled-polygon`

## 3. What Style Expansion Enables

Current VizX can now express:

- dashed construction lines
- visually distinct guide geometry
- rounded line caps for rays, arcs, and annotations
- line join control for polygon/path outlines
- fill-rule serialization for path/polygon-like shapes

Technical-illustration use cases improved by this slice include:

- geometry diagrams
- labeled polygon constructions
- angle/arc diagrams
- physics diagrams with construction lines
- simple schematic figures

## 4. Applied Aspirational Example

`aspirational-labeled-polygon` now benefits from both Milestone 3 and Milestone 4 work.

Milestone 3 contributions used there:

- real circular angle marks via `angleMarkPath(...)`
- helper-derived angle label placement via `angleLabelPoint(...)`

Milestone 4 contributions used there:

- dashed construction diagonals via `strokeDasharray`
- rounded cap styling via `strokeLineCap`
- polygon join styling via `strokeLineJoin`

Current status remains:

- Level 1 to Level 2 reproduction
- not Level 3 fidelity
- not source-language translation

Additional current-capability application:

- `aspirational-projectile-motion-lite` now applies existing style fields (`strokeDasharray`, `strokeLineCap`) together with existing Bezier-path, arc-angle-mark, arrow-marker, and text-label capabilities.
- this remains a manual Level 1-2 approximation and does not introduce a plot/data-coordinate model, physics simulation, or source translation.

## 5. Current Limitations

Still deferred in the style surface:

- `strokeOpacity`
- `fillOpacity`
- style presets
- style inheritance
- themes
- CSS class export strategy
- clipping
- gradients
- masks
- blend modes
- pattern fills
- advanced marker shapes
- text style expansion beyond current support
- parser syntax support for newer style fields
- JSON Core IR support for newer style fields
- parser AST support for newer style fields

## 6. Relationship To SVG/Library Landscape

This milestone continues the style direction described in the JavaScript graphics library landscape note.

Current stance:

- VizX borrows practical SVG styling concepts where mapping is direct and low-risk.
- VizX should not become a raw SVG wrapper.
- Style fields should remain typed and renderer-neutral where possible.
- SVG-specific escape hatches remain deferred.

The guiding principle remains model-first semantics with renderer-backed style affordances.

## 7. Next Branch Options

Reasonable next branches from here are:

1. Milestone 5 plot/data-coordinate model planning.
   - coordinate systems
   - axes
   - scales
   - ticks
   - data series marks
   - annotations

2. More aspirational examples using current capabilities.
   - `aspirational-projectile-motion-lite`
   - `aspirational-bernoulli-principle-lite`
   - `aspirational-pendagon-lite`
   - `aspirational-geometry-1-lite`

3. Style second slice.
   - `strokeOpacity`
   - `fillOpacity`
   - possible simple style presets

4. Interchange catch-up.
   - JSON Core IR support for newer primitive/path/arc/style fields
   - parser AST support for newer surfaces

5. Geometry precision follow-on.
   - arc/full-circle convenience
   - arc/path length
   - flattening
   - tight Bezier bounds

## 8. Recommendation

Default recommendation:

- start Milestone 5 with a docs-only plot/data-coordinate model plan

Rationale:

- Milestones 1 to 4 now have initial implementation and at least one aspirational application.
- Many remaining aspirational examples are blocked by coordinate systems, axes, scales, plots, timelines, and data-series semantics more than by baseline geometry or stroke styling.
- Plot/data planning should happen before adding ad hoc plot-like examples.

Smaller alternative:

- if the next goal is another visible example before Milestone 5 planning, add `aspirational-projectile-motion-lite` using existing arcs, style fields, and builder helpers.

## 9. Out Of Scope In This Pass

Explicitly not done in this checkpoint pass:

- runtime implementation changes
- parser syntax changes
- JSON Core IR changes
- parser AST changes
- dependency additions
- new renderer features
- new example implementations

This pass is documentation-only checkpointing for Milestone 4.

## Related Documents

- [STYLE_EXPANSION_MODEL_PLAN.md](./STYLE_EXPANSION_MODEL_PLAN.md)
- [ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./ASPIRATIONAL_REPRODUCTION_ROADMAP.md)
- [ARC_AND_ANGLE_MARK_CHECKPOINT.md](./ARC_AND_ANGLE_MARK_CHECKPOINT.md)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md)
- [JS_GRAPHICS_LIBRARY_LANDSCAPE.md](./JS_GRAPHICS_LIBRARY_LANDSCAPE.md)
