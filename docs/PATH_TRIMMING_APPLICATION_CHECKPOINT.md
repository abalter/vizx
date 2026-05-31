# Path Trimming Application Checkpoint

Status:

- scope: docs + example application pass
- runtime model changes: none
- parser syntax changes: none
- source translation: none
- dependencies: none

## 1. Purpose

This checkpoint records where existing trimming helpers are now applied across current examples for clearer line polish near circular pivots/contact points.

This pass is intentionally bounded to explicit TypeScript authoring updates.

## 2. Current Trimming Surface

Geometry helpers:

- `trimSegment`
- `trimSegmentStart`
- `trimSegmentEnd`
- `trimSegmentToCircle`

Builder helpers:

- `trimmedLine`
- `circleToCircleLine`

## 3. Examples With Applied Trimming

Focused technical example baseline:

- `technical-trimmed-segments` (existing focused trimming showcase)

Additional application in this pass:

- `technical-tangents`
  - tangent and radius lines now use explicit trimming near endpoint point markers
- `technical-common-tangents`
  - center-to-contact radius guides now trim away from center/contact marker circles
- `technical-belt-pulley`
  - radial guide lines trim at contact-point markers
- `aspirational-mechanism-lite`
  - linkage bars between pivot/joint circles now use circle-boundary trimming
- `aspirational-pullys-lite`
  - hook branch ropes and center drop line now trim at branch/hook point markers
- `aspirational-pendagon-lite`
  - guide lines between named point markers now use circle-boundary trimming
- `aspirational-geometry-1-lite`
  - mapping lines between point markers now use circle-boundary trimming

## 4. Examples Intentionally Left Unchanged

No trimming changes were applied where endpoint overlap with circular markers was not a clear readability issue, or where changes would introduce unnecessary churn.

Examples in the preferred inspection list left unchanged in this pass:

- none

## 5. Boundaries Confirmed

Current usage remains explicit authoring only:

- no automatic `cutbefore` / `cutafter` semantics
- no resolver integration for inferred trimming
- no renderer trimming behavior
- no generalized perimeter anchors
- no general path length or point-at-length helpers

## 6. Recommended Next Branches

1. Continue applying explicit trimming helpers in examples where marker overlap reduces readability.
2. Add a bounded line-to-circle builder helper only if repeated authoring patterns justify it.
3. Plan object-level `cutbefore` / `cutafter` semantics as a later model branch.
4. Defer path measurement and flattening to a later geometry-focused branch.
