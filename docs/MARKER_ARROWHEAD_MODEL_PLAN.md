# Marker Arrowhead Model Plan

This document defines the minimal design for introducing first-class arrowhead and marker semantics in VizX.

Status:

- implemented in v0 for built-in `"arrow"` support on `line`, `polyline`, `path`, and connectors
- `renderer-svg` now owns built-in marker definition synthesis
- the legacy `"arrowhead"` value remains accepted as a trivial compatibility alias and maps to the same built-in arrow marker
- parser syntax, JSON Core IR shape, and parser AST support remain out of scope

## 1. Purpose

Arrowheads are the next high-value diagramming capability after the current straight-segment primitive family (`line`, `polyline`, `path`) and straight `connector` support.

The purpose of this slice is to unlock a wider set of box-and-arrow, process, lifecycle, UML, graph, and annotated diagram examples from the aspirational gallery without turning VizX into a TikZ, MetaPost, or Asymptote importer.

Arrowheads matter because they make directionality explicit in the kinds of diagrams VizX is already structurally close to:

- lifecycle diagrams
- process and workflow diagrams
- UML and component diagrams
- directed graph sketches
- simple physics/load/force annotations

## 2. Current Baseline

Current code baseline relevant to markers and arrowheads:

- shared `Style` already includes:
  - `stroke`
  - `fill`
  - `strokeWidth`
  - `fontFamily`
  - `fontSize`
  - `textAnchor`
  - `dominantBaseline`
  - `opacity`
  - `markerStart`
  - `markerEnd`
- drawable objects and connectors both carry `style?: Style`
- resolved render nodes for `line`, `polyline`, `path`, `rect`, `circle`, `ellipse`, `polygon`, `text`, and `group` all carry style when present
- `renderSvg` already serializes `marker-start` and `marker-end` attributes for any render node whose style includes `markerStart` or `markerEnd`
- connectors currently resolve to SVG `path` render nodes with straight `M ... L ...` output
- `line`, `polyline`, and `path` primitives already resolve/render through normal object and render-node pipelines

Important distinction in the current code:

1. Marker fields already exist in style.
2. SVG marker attributes already serialize.
3. Semantic arrowhead support is not yet a coherent VizX feature.

Why that distinction matters:

- having `markerStart` and `markerEnd` in `Style` does not by itself define what marker names are valid
- serializing `marker-end="url(#...)"` does not by itself ensure the matching SVG `<marker>` definitions exist
- today, reusable marker definition emission is not generalized across line/polyline/path/connector usage

Current marker-definition behavior before this slice:

- the render scene supports `<defs>` and `marker` definitions through `RenderDef`
- resolver currently emits a hard-coded `arrowhead` marker definition when any connectors are present
- current connector default style is:

```ts
{
  stroke: "black",
  fill: "none",
  strokeWidth: 1.5,
  markerEnd: "arrowhead"
}
```

That means the current system already has a connector-specific arrow appearance, but not a minimal general-purpose marker model.

## 3. Implemented v0 Arrowhead Model

The smallest useful v0 is:

- keep marker placement in the existing shared style surface
- support built-in marker names, not arbitrary custom geometry
- introduce one built-in public value:
  - `"arrow"`
- map that built-in value to generated SVG `<marker>` definitions during rendering
- accept `"arrowhead"` as a backwards-compatible alias that maps to the same built-in marker id

Recommended style shape:

```ts
{
  stroke: "black",
  strokeWidth: 1,
  markerEnd: "arrow"
}
```

Recommended v0 rule:

- `markerStart` and `markerEnd` accept built-in VizX marker names in the semantic model
- v0 officially recognizes only `"arrow"`
- arbitrary marker ids or custom marker paths are out of scope in v0

This keeps the public model small while preserving the existing style field names.

## 4. Supported Objects In v0

Recommended v0 object support:

- `connector`
- `line`
- `polyline`
- `path`

Not needed in v0:

- `rect`
- `circle`
- `ellipse`
- `polygon`
- `text`
- `group`

Reasoning:

- those four targets are the directional stroke-bearing family where arrowheads are immediately useful
- they already render as directional line/path-like SVG primitives
- sharing the behavior through style and render-node handling keeps the implementation uniform

Recommended boundary:

- marker support should be style-based and renderer-level
- any render node whose style includes `markerStart` or `markerEnd` can use the same mapping logic
- object-model logic should not branch per object kind beyond normal style propagation

## 5. SVG Rendering Model

Recommended v0 SVG approach:

- generate SVG `<defs>` entries for built-in markers that are actually used in the scene
- generate `<marker id="...">` definitions for built-in marker names
- map `markerStart` / `markerEnd` style values to `marker-start="url(#...)"` and `marker-end="url(#...)"`

Implemented ownership:

- built-in marker synthesis now lives in `renderer-svg`
- resolver no longer emits connector-only marker defs
- renderer maps both `"arrow"` and the compatibility alias `"arrowhead"` to the stable internal SVG marker id `vizx-marker-arrow`

Recommended built-in arrow marker shape in v0:

- a single filled triangular arrowhead
- orientation: `orient="auto"`
- size: fixed small marker suitable for the current default stroke widths
- marker id: renderer-generated stable id such as `vizx-marker-arrow`

Color strategy recommendation for v0:

- fixed black fill is acceptable if that keeps the first slice simple
- stroke-matching color is preferable only if it can be done with very low complexity
- do not design a broader marker paint model in v0

Minimal example output shape:

```svg
<defs>
  <marker id="vizx-marker-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
  </marker>
</defs>
```

And on the node:

```svg
<path d="M 10 10 L 80 10" marker-end="url(#vizx-marker-arrow)" />
```

Do not add in v0:

- custom marker shapes
- marker libraries
- marker scaling rules
- per-node marker geometry overrides

## 6. Style And Default Behavior

Important decision: connectors should not gain new semantic defaults just because the marker model becomes explicit.

Recommended v0 behavior:

- preserve current connector appearance unless changed deliberately in the implementation slice
- examples and tests should opt into `markerStart` / `markerEnd` explicitly first
- avoid silently broadening the meaning of connectors in the same slice as the first marker model

Implemented v0 behavior:

- connector defaults now use the semantic built-in marker value `"arrow"`
- the visual intent of arrowheaded connectors is preserved
- examples can opt into the same behavior explicitly with `markerStart` and `markerEnd`

This keeps the change legible and makes it obvious whether arrowheads are coming from explicit style or from legacy connector defaults.

## 7. BBox, Debug, And Inspect Implications

Recommended v0 decision:

- marker geometry does not expand object bbox
- bbox remains based on line/path geometry only
- debug overlay remains based on existing bbox and anchor data
- inspect output reports style fields but not expanded marker geometry

Reasoning:

- bbox inflation for markers would complicate placement, alignment, distribution, and debug expectations immediately
- current diagrams are already bbox-driven on the underlying stroke geometry
- marker visuals are best treated as render-time decoration in v0

This should be documented explicitly so there is no ambiguity when arrowheads visually extend beyond the terminal point.

## 8. Examples Unlocked

Arrowheads do not solve every remaining gallery gap, but they materially improve the most diagram-adjacent families already close to VizX.

Examples and clusters helped by v0 arrowheads:

- `TikZ/Diagram of Android activity life cycle`
- `TikZ/Database decimation process`
- `MetaPost/example_umlcomponent.mp`
- `MetaPost/arrow_label.mp`
- simple graph and flow diagrams
- force/load/physics annotation diagrams built from straight segments

Arrowheads alone do not unlock:

- routing
- curves or arcs
- plotting/chart grammars
- clipping and fills beyond current styling
- 3D or projection work

## 9. Implemented First Slice

Implemented v0 slice:

1. implement built-in SVG arrow marker support in `renderer-svg`
2. use the existing `markerStart` and `markerEnd` style fields
3. support `line`, `polyline`, `path`, and connector render nodes through the same renderer path
4. replace connector-specific hard-coded marker-definition behavior with shared built-in marker synthesis
5. add one `arrowheads` or `marker-arrowheads` example
6. add renderer tests asserting `<defs>`, `<marker>`, and `marker-end="url(#...)"`
7. add resolver/example tests only where current harness needs explicit coverage
8. update capability/spec/plan docs
9. keep parser syntax out of scope
10. keep JSON Core IR and parser AST support out of scope
11. do not add custom marker shapes

## 10. Future Extensions

Deferred after v0:

- multiple built-in arrowhead shapes
- open triangle, filled triangle, stealth, diamond, circle markers
- custom marker geometry
- marker scaling by `strokeWidth`
- stroke-matched marker color
- midpoint markers
- arrowheads on curved paths as a broader path/curve feature set
- connector routing
- semantic directed-edge model
- JSON Core IR marker support
- parser AST marker support
- source syntax marker support

## 11. Out Of Scope

Explicitly deferred in this pass:

- any implementation code
- parser syntax updates
- JSON Core IR updates
- parser AST updates
- custom marker language
- connector routing
- graph layout
- curves and arcs
- clipping and gradients
- plotting/chart semantics
- 3D/projection
- constraint solver behavior
