# Path Model Plan

This document defines the minimal design for introducing a first-class 2D `path` object in VizX.

Status:

- implemented in v0 for object model, resolver, renderer, inspect/debug flows, and examples
- parser syntax remains deferred
- JSON Core IR and parser AST support for `path` remain deferred

## 1. Purpose

After the implemented primitive sequence

- line
- polyline
- ellipse
- polygon
- style hardening

the next major substrate is a semantic path object.

The goal is to unlock a larger set of aspirational-gallery examples that depend on structured drawing commands, while keeping VizX as a JS/TS graphics and layout library rather than a source-language reimplementation of TikZ, Asymptote, or MetaPost.

## 2. Current Baseline

Current code baseline (from object model, resolver, renderer, and examples):

- object kinds: `group`, `rect`, `circle`, `text`, `line`, `polyline`, `ellipse`, `polygon`
- no first-class `path` object in the object model
- style baseline: `stroke`, `fill`, `strokeWidth`, `opacity`, text style fields, `markerStart`, `markerEnd`
- line-family defaults: `stroke: black`, `fill: none`, `strokeWidth: 1`
- rect default: `stroke: black`, `fill: white`, `strokeWidth: 1`
- connectors render as SVG `<path>` nodes using a straight `M ... L ...` command string
- bbox/anchors remain bbox-derived (`center`, cardinal/corner anchors; text also uses `baseline`)

Important distinction:

- The renderer already has internal support for render-node `path` elements (used by connectors).
- VizX does not yet have a semantic object-model `path` primitive that participates like other drawable objects.

Current limitation relevant to this plan:

- there is no object-level path command model to represent multi-command geometry in unresolved scenes.

## 3. Proposed Minimal Path Object

Introduce a first-class drawable object kind with a minimal command set:

```ts
interface PathObject extends BaseObject {
  readonly kind: "path";
  readonly commands: readonly PathCommand[];
}

type PathCommand =
  | { readonly kind: "moveTo"; readonly point: Point }
  | { readonly kind: "lineTo"; readonly point: Point }
  | { readonly kind: "closePath" };
```

Rationale:

- keeps v0 small and testable
- establishes command sequencing and close semantics now
- avoids immediate curve and arc complexity
- provides a clean extension point for later curve commands

## 4. Why Not Just Polyline Or Polygon

Semantic distinction in the model:

- `line`: exactly one segment
- `polyline`: open straight sequence
- `polygon`: closed straight sequence defined by vertices
- `path`: ordered drawing commands with explicit move and close semantics, and eventual support for multiple subpaths and curve/arc commands

Even if v0 path is straight-line only, it provides the command substrate needed for future path features without overloading polyline/polygon semantics.

## 5. BBox And Anchors

Proposed v0 bbox rules (for moveTo/lineTo/closePath only):

- bbox is computed from explicit command points in `moveTo` and `lineTo`
- `closePath` adds no new point; it closes to current subpath start for drawing semantics only
- anchors remain bbox-derived:
  - `center`
  - `north`
  - `south`
  - `east`
  - `west`
  - existing corner anchors can remain available through existing bbox-anchor helper

No new anchor types in v0:

- no path intersection anchors
- no tangent or perimeter anchors
- no segment index anchors

Invalid and edge-case behavior recommendation:

- empty `commands`: resolver diagnostic; treat as non-drawable and use zero bbox at origin
- only `moveTo` commands (no drawable segment): resolver diagnostic (warning or error policy to be decided consistently with current diagnostics)
- `lineTo` before first `moveTo`: resolver diagnostic; command stream considered invalid
- `closePath` without active subpath: resolver diagnostic; ignore command for geometry
- multiple `moveTo` commands: allowed in the model; geometry includes all explicit points (single path element can contain multiple subpaths)

Implementation note:

- v0 should preserve predictable resolver output and never throw for malformed input; diagnostics should follow current pattern.

## 6. Renderer Mapping

SVG mapping for v0 commands:

- `moveTo` -> `M x y`
- `lineTo` -> `L x y`
- `closePath` -> `Z`

Rendering target:

- emit a normal SVG `<path>` node with computed `d`
- reuse existing renderer style serialization and transform handling

Explicitly out of renderer scope in v0:

- gradients
- clipping
- path effects
- marker semantics beyond currently supported generic style fields

## 7. Style Boundary

Use the current minimal style surface only:

- `stroke`
- `fill`
- `strokeWidth`
- `opacity`
- existing text-related fields remain unchanged for text objects
- existing `markerStart`/`markerEnd` fields remain part of shared style type, but no new path-specific arrowhead feature is introduced here

Recommended path default for consistency with current line-family primitives:

- `stroke: black`
- `fill: none`
- `strokeWidth: 1`

This keeps path behavior aligned with line/polyline/ellipse/polygon defaults.

## 8. Resolver Integration

Path should use the same pipeline as current primitives:

- local geometry pass computes bbox from path commands
- anchors come from existing bbox anchor helper
- placement, alignment, and distribution work unchanged through bbox anchors
- translation/transform application uses existing resolved-object translation behavior
- resolver emits a render-node `path` with generated `d` and merged style

No special path behavior in v0:

- no path simplification
- no routing logic
- no geometry boolean operations
- no connector-to-perimeter behavior

## 9. Examples Unlocked

Minimal path v0 starts to unlock clusters identified in the aspirational audit, especially where structured straight-line paths matter:

- simple TikZ path-heavy diagrams using explicit move/line segments
- MetaPost compositions with line/path command sequencing
- straight decorative outlines or multi-subpath shapes
- coordinate-geometry sketches that exceed simple polyline/polygon semantics

Still not unlocked in v0:

- Bezier-heavy examples
- arc-heavy examples
- clipping-heavy examples
- advanced fill-rule examples
- 3D/projection examples

## 10. Implemented First Slice

Implemented v0 slice:

1. add first-class `path` object type to object model
2. support `moveTo` / `lineTo` / `closePath` only
3. compute bbox from explicit command points
4. keep bbox-derived anchors only
5. emit SVG `<path d="...">` render node
6. apply line-style default fallback (`stroke`, `fill`, `strokeWidth`)
7. add one registry-backed `path-primitive` example
8. add geometry/resolver/renderer/examples tests
9. update capability/spec/plan docs
10. kept parser syntax and JSON Core IR/AST support out of scope for this slice

## 11. Future Extensions

Deferred features after current path slice:

- arc commands
- explicit multi-subpath semantics and utilities
- fill rules and winding controls
- clipping integration
- marker and arrowhead behavior as a dedicated feature
- path length and sampling helpers
- path interpolation and animation utilities
- path boolean operations
- conversion helpers from polyline/polygon to path
- source-language import/transpilation layers (TikZ/Asymptote/MetaPost)

Implemented after v0 path:

- `quadraticCurveTo`
- `cubicCurveTo`
- conservative bbox from explicit Bezier control/end points
- SVG `Q` / `C` renderer serialization
- Bezier path diagnostics for curve-before-move and non-finite curve coordinates

## 12. Out Of Scope

Explicitly deferred in this pass:

- any implementation code
- parser syntax updates
- JSON Core IR updates
- parser AST updates
- full SVG path language coverage
- curves and arcs in v0
- clipping and gradients
- arrowhead feature work
- plotting/chart semantics
- 3D/projection
- graph layout
- constraint solver behavior

## Related Documents

- [GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md](./GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md) defines the policy for keeping lightweight geometry helpers in-house and reviewing external dependencies before advanced path geometry (curves/arcs/intersections/clipping).
- [BEZIER_PATH_MODEL_PLAN.md](./BEZIER_PATH_MODEL_PLAN.md) defines the next path extension design for quadratic/cubic Bezier command support.
