# Path Trimming Post-Application Checkpoint

Status:

- scope: docs-only consolidation and branch decision
- runtime model changes: none
- parser syntax changes: none
- source translation: none
- dependencies: none

## 1. Purpose

This checkpoint captures the state after the explicit trimming helper stack was implemented and applied across current technical and aspirational examples.

Current trimming behavior remains explicit authoring:

- helpers emit ordinary line objects or point-pair results
- no automatic resolver or renderer trimming exists
- no full object-level `cutbefore` / `cutafter` semantics exist

## 2. Implemented Trimming Stack

### 2.1 Pure geometry

- `trimSegment`
- `trimSegmentStart`
- `trimSegmentEnd`
- `trimSegmentToCircle`

### 2.2 Builder authoring

- `trimmedLine`
- `circleToCircleLine`
- `circleToCircleArrow`

### 2.3 Example application

- `technical-trimmed-segments`
- `technical-tangents`
- `technical-common-tangents`
- `technical-belt-pulley`
- `aspirational-mechanism-lite`
- `aspirational-pullys-lite`
- `aspirational-pendagon-lite`
- `aspirational-geometry-1-lite`

## 3. What Is Now Feasible

With the current explicit helper stack, VizX can now author:

- lines that stop short of endpoints
- arrows that do not run into circular markers
- circle-to-circle node links
- polished tangent and guide diagrams
- more readable static mechanism/pulley constructions
- manual Level 1-2 technical diagrams with better endpoint quality

## 4. Current Limitations

### A. Object-level semantics

- no `cutbefore` / `cutafter` properties
- no automatic lookup of object boundaries
- no resolver integration
- no renderer inference

### B. Geometry/path measurement

- no path length
- no point-at-length
- no Bezier/arc trim
- no curve flattening

### C. Shape boundaries

- no general perimeter anchors
- no text bbox trimming
- no polygon/ellipse boundary trimming
- circle-only helper convenience

### D. Interchange/syntax

- no JSON Core IR helper constructs
- no parser AST helper constructs
- no parser syntax
- no source translation

## 5. Examples Updated

| Example id | Trimming helper used | What was improved | Remaining fidelity gap |
| --- | --- | --- | --- |
| `technical-trimmed-segments` | `trimSegment`, `trimSegmentStart`, `trimmedLine`, `circleToCircleArrow` | Dedicated showcase for bounded straight-segment and circle-boundary endpoint polish | Still manual and circle-focused; no curve/path trim semantics |
| `technical-tangents` | `trimmedLine` | Tangent and radius guides no longer run through point markers | No inferred object-boundary trimming |
| `technical-common-tangents` | `trimmedLine` | Center-to-contact guide readability improved near marker circles | No automatic cutbefore/cutafter behavior |
| `technical-belt-pulley` | `trimmedLine` | Contact guide radii trimmed at contact markers in open/crossed layouts | No belt metrics/physics and no inferred trim |
| `aspirational-mechanism-lite` | `circleToCircleLine` | Linkage bars trim to pivot/joint marker boundaries cleanly | Manual coordinate authoring and no object-level semantics |
| `aspirational-pullys-lite` | `circleToCircleLine`, `trimmedLine` | Hook branches and center drop avoid endpoint overlap with circular markers | Manual branch trimming; no resolver inference |
| `aspirational-pendagon-lite` | `circleToCircleLine` | Construction guides between named points avoid marker overdraw | No shape-generic boundary trimming |
| `aspirational-geometry-1-lite` | `circleToCircleLine` | Mapping guide lines between points avoid point-marker collision | No generalized perimeter-aware trimming |

## 6. Next Branch Options

### Option A - Continue explicit helper polish

Examples:

- point-to-circle line/arrow helper
- circle-to-point arrow helper
- label-to-node callouts
- ellipse boundary line helper

Pros:

- low risk
- keeps authoring explicit
- improves examples quickly

Cons:

- helper proliferation
- still manual

### Option B - Plan object-level `cutbefore` / `cutafter`

Pros:

- matches TikZ-like mental model
- reduces manual endpoint math
- centralizes trimming semantics

Cons:

- requires resolver design
- needs object boundary/perimeter conventions
- likely needs bbox/perimeter APIs
- affects rendering/IR/parser decisions

### Option C - Path measurement foundation

Pros:

- enables general trimming later
- useful for labels, arrows, animations, and sampling
- builds toward Bezier/arc support

Cons:

- more math-heavy
- needs flattening or analytic decisions

### Option D - Shape perimeter anchors

Pros:

- directly supports object-level trimming
- useful for connectors and labels

Cons:

- must define behavior for circle/ellipse/rect/polygon/text
- may overlap with resolver anchor system

## 7. Recommendation

Recommended next branch: **Option B as a docs-only design pass** for object-level `cutbefore` / `cutafter` semantics.

Rationale:

- explicit helpers now prove demand and usefulness
- example application shows repeated endpoint-trimming pressure
- immediate implementation would be premature without model boundaries
- a design pass can define object-boundary conventions, IR/parser implications, and resolver responsibilities before code

Alternative if implementation momentum is preferred:

- add one more bounded explicit helper slice (`pointToCircleArrow`) before the larger design pass

## 8. Suggested Next Slice

Suggested next prompt target:

- `docs/CUTBEFORE_CUTAFTER_DESIGN_PLAN.md`
- implementation: none (docs-only)

Design analysis scope:

- supported shapes
- boundary definitions
- style/API surface
- resolver vs builder responsibility
- JSON Core IR/parser implications
- interaction with connectors/markers
- test strategy
- decision on first implementation scope: circle-only or shape-generic
