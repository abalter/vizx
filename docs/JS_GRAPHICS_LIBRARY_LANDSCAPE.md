# JavaScript Graphics Library Landscape

This note compares VizX with commonly used JavaScript graphics/visualization libraries and identifies API/design ideas worth studying.

Scope:

- docs-only design/research note
- no runtime changes
- no dependency additions
- no parser/JSON Core IR/AST catch-up work

## 1. Purpose

This comparison matters now because VizX has crossed a meaningful baseline:

- primitive geometry exists
- path and first Bezier commands exist
- ordered transforms exist
- style/marker behavior exists
- resolver and debug/inspect surfaces exist

At this stage, VizX can accidentally drift toward "yet another drawing API" unless its distinct architecture is explicit.

This note clarifies where VizX should intentionally differ from Two.js, Raphaël, Snap.svg, D3, and Three.js.

## 2. Current VizX Identity

As implemented today, VizX is best described as a semantic layout/diagram/geometry pipeline, not a direct immediate drawing API.

Current identity:

- typed object model (`ObjectScene`, object kinds, semantic connectors)
- resolver pipeline from unresolved model to resolved/render scenes
- bbox-derived named anchors and anchor-based relations
- placement/alignment/distribution semantics as first-class model concepts
- primitive geometry foundation plus path commands (`moveTo`, `lineTo`, `quadraticCurveTo`, `cubicCurveTo`, `closePath`)
- ordered `translate` / `rotate` / `scale` transforms
- shared style model plus marker support
- inspect/debug outputs suitable for deterministic analysis
- SVG renderer as current backend
- examples and tests as behavior contracts

Practical implication:

- VizX captures intent (relationships and layout constraints) and resolves it; it does not only issue shape commands to a browser surface.

## 3. Library Comparison Matrix

| Library | Primary Domain | Mental Model | Rendering Model | Data Model | Strengths | Limits Relative To VizX | What VizX Can Learn | What VizX Should Avoid Copying |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Two.js | 2D drawing and animation | Scene graph of shapes/groups with direct mutation | Renderer-agnostic 2D (SVG/Canvas/WebGL) | In-memory shape objects | Simple shape creation, animation loop, backend flexibility | Weaker semantic layout/anchor model; less explicit resolve pipeline | Renderer abstraction patterns; clear shape factories | Becoming primarily an immediate drawing/animation API |
| Raphaël | Cross-browser vector graphics convenience | Paper + elements + attr/event/transform helpers | SVG/VML-era DOM-backed vector abstraction | Element-centric objects | Approachable API, direct manipulation ergonomics, path utility functions | Low-level shape manipulation; browser-centric; less semantic scene intent | API naming ergonomics; concise helpers for common tasks | Re-centering Core IR on raw DOM element mutation |
| Snap.svg | SVG-first graphics/manipulation | SVG document fragment manipulation with high-level helpers | SVG-first, direct SVG affordances | SVG element-centric | Strong SVG affordances (groups, transforms, masks, gradients) | Core model tied to SVG concepts and browser assumptions | SVG feature mapping discipline; explicit render-support backlog design | Making raw SVG object model the primary VizX model |
| D3.js | Data-driven visualization | Data joins and selections over documents | Direct DOM/SVG/Canvas operations via modules | Data-first, module-composed toolbox | Scales, joins, composability, huge data-viz ecosystem | No built-in semantic diagram object model; layout intent is user-authored imperative code | Data-to-scene patterns; optional compatibility with D3 scales | Full D3-style DOM-selection API as VizX core abstraction |
| Three.js | 3D scene/rendering ecosystem | Scene/camera/object/material/renderer architecture | Primarily WebGL/WebGPU ecosystem plus addons | Object3D + geometry/material graph | Mature 3D engine concepts, renderer layering, scene/render separation | 3D complexity far beyond current VizX 2D mission | Scene/render separation patterns; renderer contract ideas | Full engine scope or dependency path that drags VizX into engine complexity |

## 4. VizX Versus Two.js

Two.js is a strong reference for renderer abstraction in a 2D scenegraph API.

Useful lessons:

- keep renderer contracts explicit and narrow
- keep object/scene semantics decoupled from output backend details
- preserve shape identity across updates

VizX difference:

- Two.js is primarily a drawing-and-animation API
- VizX is currently a semantic model + resolver pipeline for deterministic diagram/geometry generation

Future compatibility direction:

- VizX could add renderer backends while preserving Core IR and resolver contracts
- backend expansion should happen after an explicit renderer abstraction checkpoint

Do not copy directly:

- implicit runtime animation-loop centric architecture as the center of the model
- convenience shape APIs that bypass semantic object/anchor relations

## 5. VizX Versus Raphaël

Raphaël succeeded by being approachable and practical during cross-browser SVG/VML friction.

Useful lessons:

- concise API naming and discoverable helpers
- ergonomic shape construction and simple transform calls
- practical utility functions around paths and transforms

VizX difference:

- Raphaël is element manipulation centered
- VizX needs to remain relationship/resolution centered

Do not copy directly:

- browser-era element wrapper architecture as the primary model
- plugin patterns that can bypass Core IR and resolver invariants

## 6. VizX Versus Snap.svg

Snap.svg is SVG-first and intentionally close to direct SVG capabilities.

Useful lessons:

- clear mapping between high-level API and SVG behavior
- practical treatment of groups/transforms/effects as rendering features
- feature-aware SVG authoring affordances

VizX intentional difference:

- VizX should not expose raw SVG as primary Core IR
- SVG remains one renderer target, not the source-of-truth object model

Good inspiration but not Core IR concepts today:

- masks/clipping/gradients/filter-like render affordances
- richer SVG feature support in renderer layers

## 7. VizX Versus D3

D3 is a low-level, data-driven toolbox built around web standards and dynamic updates.

Useful lessons:

- data-join thinking for update workflows
- composable scale/time/format utilities
- modular decomposition of concerns

VizX difference:

- D3 centers on document/selection updates
- VizX centers on semantic scene objects resolved into a render scene

Recommendation:

- keep data binding in host JS/TS rather than embedding a D3-like binding engine in VizX core
- support interoperable host patterns (for example host apps using D3 scales before constructing VizX objects)

Do not copy directly:

- DOM-selection model as the main VizX API
- broad charting-toolbox scope expansion before core diagram/layout identity is settled

## 8. VizX Versus Three.js

Three.js demonstrates strong architecture for complex scene/render systems.

Useful lessons:

- explicit scene/render separation
- clear renderer and object responsibilities
- transform hierarchy discipline and pipeline thinking

VizX near-term reality:

- VizX is not pursuing full 3D engine scope in the near term
- current mission remains 2D semantic diagram/geometry workflows

Possible long-term conceptual reuse without dependency:

- camera/projection mental models if projection work is ever designed
- render backend abstraction patterns

Clearly out of scope for now:

- full material/light/shader/asset/physics ecosystem adoption

## 9. Better / Worse Summary

### Where VizX Is Likely Better

- semantic diagram layout and relationship preservation
- anchors/connectors as first-class concepts
- inspect/debug outputs aligned with resolver state
- deterministic static figure generation
- explicit Core IR and resolver stages
- testable layout behavior at model level
- backend-neutral aspirations through staged resolution
- leverage of host JS/TS generation without a custom programming language

### Where VizX Is Likely Worse

- direct browser interactivity and animation ergonomics
- mature SVG feature coverage
- Canvas/WebGL runtime performance ecosystems
- 3D capability and tooling
- community/ecosystem breadth and longevity
- polished low-level drawing ergonomics
- rich geometry utility breadth
- data-visualization primitives and charting utilities

## 10. API/Syntax Ideas Worth Borrowing

Ideas to study intentionally, not copy blindly:

- fluent builders for host-side object construction
- ergonomic group/factory APIs
- transform chaining ergonomics while preserving explicit transform lists
- D3-scale compatibility patterns at host boundary
- D3-like data-to-object generation recipes (outside core runtime)
- Snap-like awareness of renderer affordances (SVG-first capabilities tracked explicitly)
- Two.js-style renderer abstraction discipline
- Three.js-style explicit scene/render separation vocabulary
- clear object factory interfaces for common patterns

## 11. Ideas To Avoid Or Defer

Explicitly avoid/defer:

- raw DOM/SVG object as primary Core IR
- browser-only architecture assumptions
- immediate-mode drawing as main model
- full D3 clone
- full Three.js clone
- custom programming language in VizX
- wholesale dependency on any single graphics library
- direct TikZ/MetaPost/Asymptote translation as a primary strategy

## 12. Reuse / Dependency Policy

Aligned with [GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md](./GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md):

- reusable ideas are higher value than code reuse at this stage
- dependencies should be added only for concrete, scheduled capability needs
- wrappers should live behind VizX-owned APIs
- third-party types should not leak into Core IR unless explicitly designed
- host JS/TS applications can use D3/math libraries without VizX taking those dependencies

Current policy remains:

- no external geometry/math dependency chosen now
- dependency evaluation belongs to future feature gates (tight bounds, arcs, intersections, flattening, plotting scales, graph layout, projection)

## 13. Recommended Next Steps

Reasonable follow-up options:

1. API ergonomics design note
- builder/fluent API for JS/TS object creation

2. Renderer abstraction checkpoint
- what SVG/canvas/backend separation would require while preserving resolver/Core IR

3. D3-style data generation note
- host-side mapping from data tables/streams to `ObjectScene`

4. Continue path geometry planning
- arc path model design (docs-only)

5. JSON/parser catch-up plan
- primitives/transforms/path/markers parity across interchange/parser layers

Default recommendation:

- do API ergonomics design next (builder/fluent JS/TS construction)

Reasoning:

- likely VizX niche is semantic model + ergonomic host-language construction
- this improves day-to-day usability without forcing scope jumps into charting engines or 3D systems

## 14. Out Of Scope In This Pass

Explicitly deferred in this pass:

- implementation changes
- dependency selection or installation
- parser syntax additions
- JSON Core IR additions
- parser AST additions
- any new geometry or rendering capabilities

This note is design/research documentation only.

## Sources

VizX internal references:

- [PATH_CURVE_CHECKPOINT.md](./PATH_CURVE_CHECKPOINT.md)
- [PRIMITIVE_GEOMETRY_CHECKPOINT.md](./PRIMITIVE_GEOMETRY_CHECKPOINT.md)
- [PRIMITIVE_GEOMETRY_MODEL_PLAN.md](./PRIMITIVE_GEOMETRY_MODEL_PLAN.md)
- [PATH_MODEL_PLAN.md](./PATH_MODEL_PLAN.md)
- [BEZIER_PATH_MODEL_PLAN.md](./BEZIER_PATH_MODEL_PLAN.md)
- [GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md](./GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md)
- [ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md](./ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md)

External official sources consulted:

- Two.js: [two.js.org](https://two.js.org/) and [docs/two](https://two.js.org/docs/two/)
- Raphaël: [raphael site](https://dmitrybaranovskiy.github.io/raphael/) and [reference](https://dmitrybaranovskiy.github.io/raphael/reference.html)
- Snap.svg: [Snap.svg repository/readme](https://github.com/adobe-webplatform/Snap.svg)
- D3: [d3js.org](https://d3js.org/) and [What is D3?](https://d3js.org/what-is-d3)
- Three.js: [threejs docs index](https://threejs.org/docs/)

Note on Snap.svg official site access:

- `snapsvg.io` content fetch redirected unexpectedly during this pass; Snap.svg details above were validated from the official repository and linked docs listed there.
