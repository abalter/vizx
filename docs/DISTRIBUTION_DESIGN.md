# Distribution Design

VizX should treat initial distribution as a deterministic post-alignment translation pass, not as a general layout solver.

## Scope

The first distribution model is designed but not implemented.

Distribution is intended to run on already-resolved objects after placement and alignment, using scene-coordinate anchors and the existing translation path.

## Intended First Semantics

### distributeX

Given an ordered list of target object ids:

- keep first object fixed
- keep last object fixed
- move intermediate objects horizontally so `center.x` values are evenly spaced between first and last
- preserve each object's current `center.y` (except for effects already introduced by earlier placement/alignment)

### distributeY

Given an ordered list of target object ids:

- keep first object fixed
- keep last object fixed
- move intermediate objects vertically so `center.y` values are evenly spaced between first and last
- preserve each object's current `center.x` (except for effects already introduced by earlier placement/alignment)

## Coordinate and Translation Guarantees

When implemented, distribution should move objects by reusing the existing resolver translation path so the following remain consistent in resolved scene coordinates:

- nested children
- bbox
- anchors
- geometry summaries
- render nodes
- connector endpoints (resolved after final positions)

## Explicitly Deferred

The initial distribution model does not include:

- spacing by edges
- spacing by gaps between bounding boxes
- automatic ordering
- collision avoidance
- multi-row or grid distribution
- force layout
- general constraint solving
- weighted distribution
- arbitrary anchor distribution

## Intended Resolver Ordering

1. Resolve intrinsic geometry.
2. Apply absolute and relative placement.
3. Apply center-axis and corresponding-edge alignment.
4. Apply distribution.
5. Resolve connectors and render scene using final anchors.

This ordering keeps alignment deterministic and lets distribution operate on final aligned anchors.

## Pending Specs

Initial pending specs are tracked in resolver tests as skipped cases:

- `distributeX evenly spaces center.x across ordered objects while preserving first/last center.x`
- `distributeY evenly spaces center.y across ordered objects while preserving first/last center.y`
