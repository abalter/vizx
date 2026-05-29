# Path Curve Checkpoint

This document is a docs-only checkpoint after landing the first path/curve foundation in VizX.

It summarizes what is implemented now, clarifies architectural boundaries, records current limitations, and defines the next branch options.

No runtime behavior changes are made in this pass.

## 1. What Is Now Implemented

Current path/curve foundation:

- first-class `path` object in the object model
- path commands:
  - `moveTo`
  - `lineTo`
  - `quadraticCurveTo`
  - `cubicCurveTo`
  - `arc` (circular center/radius/start/end-angle)
  - `closePath`
- conservative explicit-point bbox behavior:
  - `moveTo` and `lineTo` contribute explicit points
  - `quadraticCurveTo` contributes control + endpoint
  - `cubicCurveTo` contributes control1 + control2 + endpoint
  - `closePath` contributes no additional bbox point
- anchors remain bbox-derived
- ordered transforms (`translate`, `rotate`, `scale`) apply to explicit command points
- renderer emits SVG path commands `M` / `L` / `Q` / `C` / `Z`
- renderer emits SVG arc `A` segments for circular `arc` commands
- existing primitive style behavior applies to paths
- existing built-in arrow marker behavior applies to paths through `markerStart` / `markerEnd`
- resolver diagnostics include:
  - curve-before-`moveTo`
  - non-finite curve control/endpoint coordinates
  - arc-before-`moveTo`
  - arc radius and angle diagnostics
  - arc current-point/start-point mismatch diagnostics
  - non-uniform scale diagnostics for arc paths
  - existing malformed command stream checks
- registry examples now include:
  - `path-primitive`
  - `bezier-path`
  - `arrowheads` (relevant for marker behavior on path output)

## 2. Current Architectural Boundary

Current boundary for path/curve support:

- VizX owns simple path command representation and conservative bbox behavior.
- VizX does not yet own tight curve geometry.
- No external geometry/math dependency is used in this baseline.
- JavaScript/TypeScript host code can generate path commands procedurally.
- Parser syntax remains deferred.
- JSON Core IR support remains behind this newer path/primitive/transform surface.
- Parser AST support remains behind this newer path/primitive/transform surface.

The active geometry policy remains: keep lightweight geometry helpers in-house and review dependency choices explicitly before advanced path math.

## 3. Current Limitations

Still not implemented in the current path/curve baseline:

- tight Bezier bounds
- path length
- point-at-length
- curve flattening / sampling
- curve intersections
- arc commands
- smooth shorthand path commands
- fill rules / winding rules
- clipping
- gradients
- curve-aware connector routing
- curve tangent marker refinements
- SVG import and source-language translation (`TikZ`, `MetaPost`, `Asymptote`)
- parser syntax support for this surface
- JSON Core IR catch-up for this surface
- parser AST catch-up for this surface

## 4. Relationship To The Aspirational Gallery

What the new path + Bezier foundation makes more plausible:

- curved arrows
- smooth outlines
- decorative curves
- simple path-heavy `MetaPost` / `TikZ` style diagrams
- simple physics/geometry diagrams that need curves

What remains blocked:

- arc-heavy examples
- clipping/blending-heavy examples
- plotting/data-coordinate examples
- 3D/projection examples
- examples requiring tight curve geometry, intersections, or complex path operations

This checkpoint should be read as a practical foundation milestone, not gallery parity.

## 5. Next Branch Options

Reasonable next branches from this point:

1. Arc path model
- add arc commands
- choose SVG arc parameter representation
- define initial arc bbox strategy (likely more complex than current explicit-point approach)

2. Tight Bezier bounds
- compute Bezier extrema
- improve bbox/anchors/debug precision
- keep dependency decision explicit per geometry boundary policy

3. Path flattening / sampling
- approximate curves as polylines
- create prerequisites for length, intersections, and some hit-testing workflows

4. JSON Core IR / parser AST catch-up
- extend JSON and parser AST layers for newer primitive/path/transform/marker support

5. Transform completion
- define text transform policy
- define ellipse rotate policy
- refine group/local-coordinate behavior

6. Plot/data-coordinate model
- add axes/scales/data series substrate

## 6. Recommendation

This is a deliberate choice point. Recommended sequencing by intent:

- if the goal is broader visual-example coverage, design arcs next
- if the goal is geometry correctness, design tight Bezier bounds next
- if the goal is internal layer consistency, do JSON Core IR / parser AST catch-up next
- if the goal is future-proof path operations, design flattening/sampling next

Default recommendation for the next branch:

- do arc path model design next, docs-only first

Reasoning:

- arc parameterization and bbox semantics need explicit design before implementation
- arcs unlock a visible set of path-heavy examples
- a docs-first arc design keeps implementation scope controlled

## 7. Out Of Scope In This Pass

Explicitly deferred in this checkpoint pass:

- any runtime implementation changes
- dependency additions
- parser syntax additions
- JSON Core IR additions
- parser AST additions
- tight Bezier bounds
- path length and point-at-length
- flattening/sampling implementation
- intersections implementation
- arc implementation
- clipping/gradient implementation
- plotting/data model implementation
- 3D/projection implementation
- graph layout/solver behavior

This pass is checkpointing and roadmap documentation only.

## Related Documents

- [PATH_MODEL_PLAN.md](./PATH_MODEL_PLAN.md)
- [BEZIER_PATH_MODEL_PLAN.md](./BEZIER_PATH_MODEL_PLAN.md)
- [ARC_AND_ANGLE_MARK_MODEL_PLAN.md](./ARC_AND_ANGLE_MARK_MODEL_PLAN.md)
- [PRIMITIVE_GEOMETRY_CHECKPOINT.md](./PRIMITIVE_GEOMETRY_CHECKPOINT.md)
- [GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md](./GEOMETRY_MATH_DEPENDENCY_BOUNDARY.md)
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
- [ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md](./ASPIRATIONAL_GALLERY_CAPABILITY_AUDIT.md)
- [ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./ASPIRATIONAL_REPRODUCTION_ROADMAP.md)
- [JS_GRAPHICS_LIBRARY_LANDSCAPE.md](./JS_GRAPHICS_LIBRARY_LANDSCAPE.md)
