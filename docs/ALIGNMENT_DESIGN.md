# Alignment Design

VizX should treat alignment as a small deterministic post-placement operation, not as a general layout solver.

## Scope

Alignment is applied after an object's intrinsic geometry is resolved and after any explicit placement has been applied. It should adjust already-resolved objects into a shared baseline or edge relationship without introducing global layout behavior.

## Operation Status

| Operation | Status | Meaning |
| --- | --- | --- |
| `alignX` | implemented | `target.center.x = referenceAnchor.x` |
| `alignY` | implemented | `target.center.y = referenceAnchor.y` |
| `alignLeft` | implemented | `target.west.x = reference.west.x` |
| `alignRight` | future | `target.east.x = reference.east.x` |
| `alignTop` | future | `target.north.y = reference.north.y` |
| `alignBottom` | future | `target.south.y = reference.south.y` |
| `distributeX` | future | Not designed yet |
| `distributeY` | future | Not designed yet |

## Implemented Center-Axis Alignment

The current alignment model is intentionally narrow and deterministic:

- `alignX`: `target.center.x` is translated until it matches `referenceAnchor.x`
- `alignY`: `target.center.y` is translated until it matches `referenceAnchor.y`

Reference anchors currently used in tests are `center`, `north`, `south`, `east`, and `west`.

## Edge Alignment

Edge alignment is intentionally distinct from center-axis alignment.

- `alignX` and `alignY` align the target center axes (`target.center.x` or `target.center.y`) to a selected reference anchor coordinate.
- Edge alignment instead aligns corresponding target and reference edges by default.

The first intended edge semantics are:

- `alignLeft` (implemented)
- `alignRight`
- `alignTop`
- `alignBottom`

- `alignLeft`: `target.west.x = reference.west.x` (implemented)
- `alignRight`: `target.east.x = reference.east.x`
- `alignTop`: `target.north.y = reference.north.y`
- `alignBottom`: `target.south.y = reference.south.y`

Arbitrary target-edge-to-arbitrary-reference-anchor behavior is still deferred.

## Future Distribution

- `distributeX`
- `distributeY`

Distribution behavior and spacing policy are not designed yet.

## Current alignY semantics

The current `alignY` behavior is intentionally narrow:

- target side: always `target.center.y`
- reference side: `referenceAnchor.y` (for example `center`, `north`, `south`, `east`, or `west`)

Arbitrary target-anchor-to-reference-anchor alignment is not implemented yet.

## Current alignX semantics

The current `alignX` behavior is the horizontal counterpart of `alignY`:

- target side: always `target.center.x`
- reference side: `referenceAnchor.x` (for example `center`, `north`, `south`, `east`, or `west`)

Arbitrary target-anchor-to-reference-anchor alignment is not implemented yet.

## Coordinate convention

VizX currently uses SVG-style scene coordinates, so larger `y` values move downward.

## Relationship to placement

Alignment ordering is shared across implemented and future alignment operations:

- resolve intrinsic object geometry
- apply absolute and relative placement
- apply alignment adjustments
- resolve connectors and render scene from final anchors

## No solver yet

Alignment is not a general constraint solver. The following are explicitly deferred:

- arbitrary target-anchor-to-reference-anchor alignment
- multi-object alignment groups
- distributeX and distributeY
- solver behavior and general constraint solving
- collision avoidance
- automatic graph layout

## Diagnostics

When alignment is implemented, it should eventually report diagnostics for:

- missing target object
- missing reference object
- missing target anchor
- missing reference anchor
- unsupported alignment relation
- ambiguous or cyclic alignment