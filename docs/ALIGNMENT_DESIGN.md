# Alignment Design

VizX should treat alignment as a small deterministic post-placement operation, not as a general layout solver.

## Scope

Alignment is applied after an object's intrinsic geometry is resolved and after any explicit placement has been applied. It should adjust already-resolved objects into a shared baseline or edge relationship without introducing global layout behavior.

## Initial operations

The intended first operations are:

- `alignY`: make a target object's center `y` match the referenced anchor's `y`
- `alignX`: make a target object's center `x` match the referenced anchor's `x`
- `alignLeft`: align left edges
- `alignRight`: align right edges
- `alignTop`: align top edges
- `alignBottom`: align bottom edges

The first implementation target should be the simplest one available in the current object model, preferably `alignY` using the target center and a reference anchor.

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

Alignment should conceptually happen after intrinsic object geometry is resolved and after explicit placement relations have been applied. The current placement system establishes the scene baseline; alignment can then make a selected axis or edge consistent with a reference object.

## No solver yet

Alignment is not a general constraint solver. The following remain out of scope for now:

- cycles
- multi-object distribution
- collision avoidance
- automatic graph layout
- general nonlinear constraint solving

## Diagnostics

When alignment is implemented, it should eventually report diagnostics for:

- missing target object
- missing reference object
- missing target anchor
- missing reference anchor
- unsupported alignment relation
- ambiguous or cyclic alignment

This note is intentionally preparatory. It documents the intended model before implementation begins.