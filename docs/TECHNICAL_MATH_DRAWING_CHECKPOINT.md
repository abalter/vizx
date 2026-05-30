# Technical Math Drawing Checkpoint

This document is a docs-only checkpoint after landing the current technical/math drawing slices for:

- explicit intersection helpers
- explicit tangent helpers
- arc/angle helper usage
- first bounded aspirational geometry applications

No runtime behavior changes are made in this pass.

## 1. Purpose

This checkpoint captures the current technical/math drawing track after adding explicit construction helpers and applying them to aspirational examples.

Current state:

- VizX can now author manual helper-driven technical construction diagrams in TypeScript.
- Authoring remains explicit and host-driven, not source-language translation.
- No construction solver or automatic geometric inference has been introduced.

Boundary reminder:

- examples call helper math directly
- resolver does not infer intersections/tangencies
- helper surfaces remain pure utility layers

## 2. Implemented Construction Helper Surface

### 2.1 Basic geometry helpers

Current core helpers include:

- `point`
- `offsetPoint`
- `midpoint`
- `distance`
- `angleOf`
- `polar`
- `circlePoint`
- `regularPolygonPoints`

### 2.2 Arc and angle helpers

Current helper set includes:

- `normalizeAngleDegrees`
- `angleDeltaDegrees`
- `isAngleWithinSweep`
- `bboxFromCircularArc`
- `angleBetweenPoints`
- `angleLabelPoint`

### 2.3 Intersection helpers

Current explicit intersection helpers include:

- `lineLineIntersection`
- `lineCircleIntersections`
- `circleCircleIntersections`

These currently operate on infinite primitives and intentionally do not provide segment/ray clipping variants yet.

### 2.4 Tangent helpers

Current explicit tangent helpers include:

- `tangentLineAtCirclePoint`
- `tangentPointsFromPointToCircle`

These currently cover circle-point tangent direction and external-point-to-circle tangent points only.

### 2.5 Shared helper identity

Across the above families, the design remains:

- pure
- dependency-free
- explicit author-called
- deterministic behavior
- no resolver inference
- no new runtime object kinds

## 3. Example Coverage

Current technical/math-relevant examples and coverage:

- `technical-angle-arc`
  - demonstrates circular arc/angle-mark composition (`angleMarkPath`, `angleLabelPoint`)
- `technical-tangents`
  - demonstrates explicit tangent construction with circle-point tangent line and external tangent points
- `aspirational-labeled-polygon`
  - demonstrates angle marks plus v0 technical style fields (`strokeDasharray`, `strokeLineCap`, `strokeLineJoin`)
- `aspirational-geometry-1-lite`
  - demonstrates explicit helper-called construction points (`lineLineIntersection`) in a geometry-frame sketch
- `aspirational-pendagon-lite`
  - demonstrates explicit circle-circle and line-circle intersection construction
- `aspirational-projectile-motion-lite`
  - demonstrates a current-capability physics-style trajectory sketch with arc annotations and guides
- `styled-primitives`
  - demonstrates the v0 technical style surface used by geometry examples

All remain manual TypeScript builder-authored Level 1-2 approximations.

## 4. What Is Now Feasible

Current helper and object surfaces are sufficient to manually author:

- labeled polygon diagrams
- angle diagrams with visible angle arcs
- circle/line construction diagrams
- tangent diagrams from external points to circles
- circle-circle and line-circle construction sketches
- dashed guide/construction-line diagrams
- simple physics/trajectory sketches
- selected Level 1-2 reproductions from Asymptote/MetaPost/TikZ geometry families

This is now a credible manual technical-construction baseline for the current track.

## 5. Remaining Limitations

Still missing for higher-fidelity technical/math construction work:

- no construction solver
- no automatic dependency graph/inference for geometric constructions
- no common tangents between two circles
- no segment/ray-clipped intersection variants
- no tangent-to-path or tangent-to-arc helpers
- no `cutbefore`/`cutafter`
- no path length or point-at-length
- no curve flattening
- no path/Bezier/arc intersections
- no clipping/fill-region operations
- no projection/3D helper surface
- no source-language translation
- no parser/JSON/AST support for helper surfaces

## 6. Next Branch Options

### Option A: Segment/ray variants and clipped constructions

Examples:

- `segmentSegmentIntersection` or `segmentLineIntersection`
- `segmentCircleIntersections`
- `rayCircleIntersections`
- closest-point-on-segment helpers

Pros:

- aligns with finite construction-diagram authoring needs
- reduces manual filtering of infinite-line helper outputs
- prepares for later `cutbefore`/`cutafter` style work

Cons:

- still incremental rather than transformational
- can create API-surface growth across related variants

### Option B: Common tangents between two circles

Pros:

- natural continuation after current tangent slice
- unlocks additional circle-geometry diagram families
- remains pure helper math

Cons:

- more algorithmically complex than current tangent scope
- narrower broad-day usage than segment/ray clipping helpers

### Option C: Right-angle and annotation helpers

Examples:

- `rightAngleMarkPath`
- `labelAlongSegment`
- tick-mark helpers for equal segments

Pros:

- fast readability gains for geometry diagrams
- low implementation risk
- useful for Euclidean teaching-style figures

Cons:

- primarily authoring convenience, not core math capability expansion

### Option D: `cutbefore`/`cutafter`-style segment trimming

Pros:

- repeatedly identified visual-quality gap for arrow/label diagrams
- improves line/circle/text overlap handling

Cons:

- needs clearer perimeter/intersection conventions first
- likely overlaps with later path-length/perimeter-anchor decisions

### Option E: Another aspirational application with current helpers

Pros:

- validates current stack without widening helper surface
- keeps momentum on example-driven roadmap pressure

Cons:

- likely re-exposes the same missing finite-construction helper gaps

## 7. Recommendation

Default recommendation: choose Option A next (segment/ray clipped construction helpers).

Rationale:

- current `lineLineIntersection` and `lineCircleIntersections` are infinite-primitive helpers
- many technical construction diagrams are segment/ray-oriented, not infinite-line oriented
- clipped variants are a bounded pure-helper extension
- this reduces repeated manual post-filtering in examples
- this branch prepares later `cutbefore`/`cutafter` work without introducing rendering semantics now

Alternate sequencing if visible output is prioritized:

- add one more aspirational application using the current helper stack before extending helper families

## 8. Suggested Next Implementation Slice

Recommended next prompt target:

- docs-first plan: `docs/GEOMETRY_SEGMENT_RAY_HELPER_PLAN.md`

Then a bounded implementation slice:

- helper additions (pure geometry only):
  - `segmentSegmentIntersection` (or `segmentLineIntersection`)
  - `segmentCircleIntersections`
  - `rayCircleIntersections`
  - optional internal predicates such as point-on-segment/ray checks
- focused geometry tests
- one small application example:
  - `technical-segment-intersections`
  - or a narrow update to `aspirational-pendagon-lite` using clipped helpers

Non-goals for that slice:

- no solver/resolver inference
- no parser syntax
- no JSON Core IR expansion
- no parser AST expansion

## 9. Out Of Scope In This Pass

Explicitly not done in this checkpoint pass:

- runtime implementation changes
- new helper implementation
- new example implementation
- parser syntax work
- JSON Core IR work
- parser AST work
- dependency additions

This pass is documentation-only consolidation of current technical/math drawing state and next-branch recommendation.
