# JS TS Builder API Checkpoint

This checkpoint summarizes the current builder API state after adding builder parity examples.

Scope:

- docs-only checkpoint
- no runtime changes
- no dependency additions
- no parser/JSON Core IR/AST implementation changes

## 1. What Is Now Implemented

Builder module and output model:

- builder module exists in `packages/object-model/src/builder.ts`
- builder helpers return plain ObjectScene-compatible data
- ObjectScene and resolver remain canonical for semantics and diagnostics

Implemented helper categories:

- scene helpers
- object factories
- path command helpers
- placement/alignment/distribution helpers
- connector/anchor helpers
- transform helpers
- style/arrow helpers

Registry-backed builder examples:

- `builder-basic`
- `builder-relative-placement`
- `builder-bezier-path`
- `aspirational-android-lifecycle`
- `aspirational-labeled-polygon`
- `aspirational-arrow-label`

Parity tests now in the examples harness:

- `builder-relative-placement` vs `relative-placement`
- `builder-bezier-path` vs `bezier-path`

## 2. What The Parity Pass Showed

Results from the parity example pass:

- no helper gaps were found for the two parity examples
- the existing helper surface is sufficient for representative diagram and path scenes
- semantic parity is tested without brittle full-SVG snapshots

Results from the first aspirational mini-gallery slice:

- three manual Level 1-2 reproductions were added using existing builder helpers
- no new builder helpers were required
- no runtime, parser, or JSON Core IR features were added
- current builder surface was sufficient for lifecycle flow, labeled polygon, and arrow-label approximations

Parity checks focus on:

- object ids
- connector refs and placement relation semantics
- clean resolver diagnostics
- path command-kind sequence semantics
- non-brittle SVG command presence checks (`Q` / `C`)

## 3. Current Builder Identity

Current identity of the builder layer:

- ordinary JS/TS authoring layer
- not a fluent DSL
- not parser syntax
- not JSON Core IR
- not a DOM/SVG wrapper API
- not a D3 clone
- relies on host JS/TS for loops, helper functions, and data-driven generation

## 4. Current Limitations

Intentionally not implemented in the current builder slice:

- strongly typed object-id relation checking
- fluent chaining API
- builder-to-JSON Core IR bridge
- parser syntax bridge
- automatic graph layout/routing behavior
- separate runtime validation layer for builder inputs
- data joins as a framework feature
- dependency on D3 or other graphics libraries

## 5. Relationship To VizX Niche

The current VizX niche remains:

- semantic, inspectable, programmable technical illustration in TypeScript

The builder layer reinforces that niche:

- authoring becomes more ergonomic in host TS
- ObjectScene remains the canonical model boundary
- resolver diagnostics and inspect/debug behavior remain authoritative

## 6. Reasonable Next Branches

1. Builder polish.
- naming consistency, options-shape consistency, API docs refinements, and more builder examples.

2. JSON Core IR and parser AST catch-up.
- bring newer primitive/path/transform/marker features to interchange/lowering layers.

3. Arc path model.
- continue path geometry capability design.

4. Tight Bezier bounds and geometry precision.
- improve bbox correctness.

5. Plot/data-coordinate model.
- move toward richer math/data illustration workflows.

6. More technical-illustration examples.
- geometry diagrams, physics diagrams, and generated diagrams using builder helpers.
7. Technical geometry helper layer.
- docs-first plan for point and polygon helper ergonomics in Milestone 2 without changing ObjectScene boundaries.

## 7. Recommendation

Recommendation by immediate goal:

- authoring ergonomics goal: add more builder-based technical illustration examples
- architecture consistency goal: prioritize JSON Core IR and parser AST catch-up
- visual capability goal: design arc paths next
- math/geometry illustration goal: start a technical-illustration example set built with builder helpers

Default recommendation:

- add a small set of builder-based technical illustration examples next, starting with simple geometry/math diagrams, because it most directly stress-tests VizX’s target niche: programmable technical illustration in TypeScript.

## 8. Out Of Scope In This Pass

Explicitly deferred in this checkpoint pass:

- implementation changes
- new builder helpers
- parser syntax work
- JSON Core IR bridge work
- parser AST bridge work
- runtime behavior changes

## Related Documents

- [JS_TS_BUILDER_API_COOKBOOK.md](./JS_TS_BUILDER_API_COOKBOOK.md)
- [JS_TS_BUILDER_API_PLAN.md](./JS_TS_BUILDER_API_PLAN.md)
- [JS_GRAPHICS_LIBRARY_LANDSCAPE.md](./JS_GRAPHICS_LIBRARY_LANDSCAPE.md)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md)
- [TECHNICAL_GEOMETRY_HELPER_PLAN.md](./TECHNICAL_GEOMETRY_HELPER_PLAN.md)
