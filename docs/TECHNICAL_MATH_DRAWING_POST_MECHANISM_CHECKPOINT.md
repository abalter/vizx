# Technical Math Drawing Post-Mechanism Checkpoint

This checkpoint captures the technical/math drawing state after the current helper/application milestone:

- intersection helpers
- segment/ray clipped helpers
- tangent helpers
- common circle-circle tangents
- technical annotation helpers
- open and crossed belt helpers
- richer pulley/mechanism aspirational coverage
- static mechanism/linkage coverage
- aspirational manifest and HTML gallery tooling

Status:

- scope: docs-only checkpoint and roadmap decision
- runtime changes: none
- parser/JSON Core IR/AST changes: none
- dependencies: none

## 1. Purpose

VizX can now author multiple static technical/mechanical/math-style drawings through explicit TypeScript builder code plus pure geometry helpers.

This remains intentionally bounded:

- authoring is still TypeScript `ObjectScene` plus builder helpers
- this is not a source-language translator
- this is not a construction solver
- this is not a kinematics or mechanics simulator
- this is not an animation system

The important milestone is not that VizX can reproduce one isolated figure, but that several different static technical diagram families now fit the same explicit helper-called model.

## 2. Implemented Capability Stack

### 2.1 Primitive/object layer

Implemented baseline object and rendering surface:

- `rect`, `circle`, `text`, `group`
- `line`, `polyline`, `ellipse`, `polygon`
- `path` commands: `moveTo`, `lineTo`, `quadraticCurveTo`, `cubicCurveTo`, `arc`, `closePath`
- ordered transforms: `translate`, `rotate`, `scale`
- connectors and built-in arrow markers
- current style fields including dash/cap/join/fill-rule support

### 2.2 Geometry construction helpers

Implemented pure helper families:

- point/angle/polar helpers: `point`, `offsetPoint`, `midpoint`, `distance`, `angleOf`, `polar`, `circlePoint`, `regularPolygonPoints`
- intersections: `lineLineIntersection`, `lineCircleIntersections`, `circleCircleIntersections`
- segment/ray clipping: `pointOnSegment`, `pointOnRay`, `segmentSegmentIntersection`, `segmentCircleIntersections`, `rayCircleIntersections`
- tangents: `tangentLineAtCirclePoint`, `tangentPointsFromPointToCircle`
- common tangents: `circleCircleTangents`

All remain explicit author-called helpers with no resolver inference.

### 2.3 Technical annotation helpers

Implemented annotation surface:

- `labelAlongSegment`
- `rightAngleMarkPath`
- `segmentTickMarkPath`
- `segmentTickMarks`
- angle-mark support through `angleBetweenPoints`, `angleLabelPoint`, and `angleMarkPath`

These remain convenience outputs built from existing points and `path` objects.

### 2.4 Mechanical/static composition helpers

Implemented static composition surface:

- `openBeltPath`
- `crossedBeltPath`
- mechanism/linkage remains represented as a static example pattern, not a generalized helper API

This is sufficient for static pulley and linkage schematics, but it does not imply dynamics or solver behavior.

### 2.5 Gallery tooling

Implemented aspirational review tooling:

- typed aspirational metadata on `VizxExample`
- generated `examples/aspirational-gallery-manifest.json`
- generated `examples/aspirational-gallery.html`
- registry-backed semantic checks that keep metadata/examples/rendering aligned

## 3. Example Coverage

| Example id | Source / role | Helper families exercised | What it proves | Main remaining fidelity gap |
| --- | --- | --- | --- | --- |
| `aspirational-mechanism-lite` | MetaPost `mechanism.mp` aspirational reproduction | `primitives`, `intersections`, `annotation helpers`, `circular arcs / angle marks`, `style fields` | Static linkage schematics can be built from explicit intersection math plus annotation cues without adding solver or mechanics runtime | No kinematics, no animation, no construction inference, limited visual fidelity |
| `aspirational-pullys-lite` | MetaPost `pullys.mp` aspirational reproduction | `primitives`, `tangents`, `common tangents`, `annotation helpers`, `circular arcs / angle marks`, `belt/pulley path`, `style fields` | Belt/tangent/helper stack is strong enough for richer static pulley compositions | No clipping/masking polish, no mechanics simulation, no belt thickness semantics |
| `aspirational-pendagon-lite` | MetaPost `pendagon.mp` aspirational reproduction | `primitives`, `intersections`, `segment/ray clipping`, `annotation helpers`, `style fields` | Explicit clipped construction helpers are sufficient for finite geometry constructions | No richer construction arcs, no automated labeling, no solver |
| `aspirational-geometry-1-lite` | Asymptote `geometry_1` aspirational reproduction | `primitives`, `intersections`, `annotation helpers`, `circular arcs / angle marks`, `style fields` | Coordinate-frame and mapping-style technical geometry sketches fit the current model | No transformed-frame subsystem, no source translation, manual coordinates |
| `aspirational-labeled-polygon` | Asymptote labeled polygon aspirational reproduction | `primitives`, `circular arcs / angle marks`, `style fields` | Circular angle marks plus current style fields are enough for clean labeled polygon diagrams | Limited label placement sophistication and style fidelity |
| `aspirational-projectile-motion-lite` | TikZ projectile-motion aspirational reproduction | `primitives`, `paths/Bezier`, `circular arcs / angle marks`, `style fields` | Physics-style trajectory sketches work without a plot subsystem | No measurement/trim helpers, no mechanics simulation, no data/plot semantics |
| `technical-belt-pulley` | Focused technical example | `common tangents`, `belt/pulley path`, `circular arcs / angle marks`, `style fields` | Open and crossed belt helpers are stable, explicit builder composition on top of tangent math | No belt metrics, no thickness, no pulley mechanics |
| `technical-common-tangents` | Focused technical example | `common tangents`, `annotation helpers`, `style fields` | Circle-circle common tangents are deterministic and useful for technical guides | No tangent-to-path/arc families, no higher-level trimming |
| `technical-tangents` | Focused technical example | `tangents`, `style fields` | Point-to-circle tangent helpers cover the expected v0 construction cases | No finite tangent clipping families, no perimeter-aware trim behavior |
| `technical-angle-arc` | Focused technical example | `circular arcs / angle marks` | Arc command plus angle-mark helper supports readable angle annotation | No arc measurement, no elliptical arcs, no advanced arc labeling |

## 4. What Is Now Feasible

Current VizX capability is enough to author:

- static linkage/mechanism schematics
- pulley/belt diagrams
- circle/line construction diagrams
- tangent diagrams
- labeled polygon and angle diagrams
- projectile and trajectory sketches
- mixed helper-driven technical illustrations combining guides, annotations, and derived points
- Level 1-2 aspirational reproductions built with manual coordinates and explicit helper math

That is a credible manual technical-illustration baseline rather than a one-off geometry demo stack.

## 5. Remaining Strategic Gaps

### A. Visual/fidelity gaps

- clipping
- gradients and patterns
- fill-region work beyond current primitive fills
- split stroke/fill opacity controls if/when needed
- broader text style expansion
- richer arrow/marker customization

### B. Geometry/computation gaps

- path length and point-at-length
- curve flattening and sampling
- Bezier/arc/path intersections
- `cutbefore` / `cutafter`-style trimming
- shape-perimeter-aware anchors
- construction dependency graph or reusable derived-geometry graph

### C. Authoring/system gaps

- parser syntax
- parser AST catch-up for current path/style/transform/object-kind surfaces
- source-language translation
- stronger reusable example/component conventions for technical figures
- automated visual comparison or regression review tooling

### D. Dynamic/mechanical gaps

- kinematics solvers
- animation and timeline systems
- physical simulation
- path tracing or motion tracing systems

## 6. Next Branch Options

### Option A — Visual fidelity / clipping and fill regions

Pros:

- improves resemblance to TikZ/MetaPost/Asymptote examples
- broadly useful across current aspirational examples
- unlocks overlapping filled technical diagrams and cleaner masking

Cons:

- likely requires renderer/model design work
- may affect bbox, resolve, and render semantics

### Option B — Path measurement and trimming

Examples:

- path length
- point-at-length
- trim a segment near an object boundary
- `cutbefore` / `cutafter`

Pros:

- directly addresses repeated polish gaps in current examples
- useful for arrows, labels, and lines near circles or boundaries
- would improve technical drawing quality without adding a solver

Cons:

- requires careful path/arc/Bezier math
- can easily grow into flattening and intersection work

### Option C — Parser AST catch-up for current Core IR surface

Pros:

- reduces drift between runtime/Core IR and parser modeling
- prepares for later parser/source work without committing to syntax now
- keeps parser syntax deferred while still improving model parity

Cons:

- less visually exciting than geometry or fidelity work
- may expose unresolved design questions in current object/style/path coverage

### Option D — Source-language / parser planning

Pros:

- directly addresses TikZ/Asymptote/MetaPost inspiration
- clarifies long-term scope

Cons:

- very large
- premature while IR and AST still lag current runtime capabilities

### Option E — More rich aspirational examples

Pros:

- continues validating the current stack on visible outputs
- useful for demos and gallery growth
- low infrastructure risk compared with solver or renderer work

Cons:

- diminishing returns if the same unresolved gaps recur
- increases pressure on deferred JSON/parser catch-up without reducing drift

### Option F — Dynamic/mechanism/animation branch

Pros:

- mechanism-oriented sources naturally suggest it

Cons:

- not aligned with the current static technical drawing focus
- large, solver-heavy, and architecturally premature

## 7. Recommendation

Recommend prioritizing **Option C: parser AST catch-up for the current Core IR surface**.

Rationale:

- the builder/helper stack has grown substantially across geometry, paths, style fields, transforms, markers, and example metadata
- JSON Core IR catch-up has started, but parser AST coverage remains narrow while runtime/Core IR moved forward
- parser AST catch-up now reduces long-term model drift before another major feature branch expands the gap further
- this does not require committing to parser syntax or source translation yet
- it creates a cleaner foundation for later parser, interchange, or source-planning work

If the immediate goal were visual output quality rather than model consolidation, **Option B** would be the next most useful branch.

## 8. Suggested Next Implementation Slice

Concrete next prompt target for Option C:

- inventory current parser AST coverage against [CORE_IR_SPEC.md](./CORE_IR_SPEC.md) and [JSON_CORE_IR_CATCHUP_AUDIT.md](./JSON_CORE_IR_CATCHUP_AUDIT.md)
- add bounded parser AST type/lowering catch-up for object kinds and path/style/transform fields already accepted by JSON Core IR
- create or update a JSON Core IR catch-up plan that enumerates the missing representable surfaces and any unresolved design questions
- implement only a very small first catch-up if the gap is narrow and low-risk; otherwise keep the next pass docs-first
- do not add parser syntax
- do not translate examples

If Option B is chosen instead, the bounded first prompt should be:

- create `PATH_MEASUREMENT_AND_TRIMMING_PLAN.md`
- implement line/segment trimming helpers first
- explicitly defer Bezier and arc length

## 9. Out Of Scope For This Pass

Explicitly not implemented here:

- drawing/runtime features
- new examples
- parser syntax
- JSON Core IR changes
- parser AST changes
- source translation
- solver, animation, or mechanics work