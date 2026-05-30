# Plot/Data Coordinate Model Plan

This document starts Milestone 5 of the aspirational reproduction roadmap.

Scope for this pass:

- docs-only planning
- no runtime implementation
- no parser syntax work
- no JSON Core IR expansion
- no parser AST expansion
- no dependency additions

## 1. Purpose

Milestone 5 targets a narrow but important gap: data-coordinate and plot-like figures.

The goal is to support practical authoring for examples that need:

- axes
- scales
- ticks
- labels
- data series
- timeline/schedule-like structures
- scatter/line/regression-like illustrations
- annotation layers

This milestone is not intended to become:

- a full grammar-of-graphics system
- a D3 clone
- an automatic chart layout engine

The intent is a small coordinate substrate that composes with existing VizX objects, paths, labels, markers, and debug/inspect behavior.

## 2. Current Baseline

VizX can already do the following manually:

- draw lines, paths, text, and marker arrows
- author quadratic/cubic Bezier curves
- place labels and guide geometry
- style technical guides with dash/cap/join controls
- use builder helpers with ordinary TypeScript arrays and loops
- manually approximate axes, guides, and plotted trajectories

`aspirational-projectile-motion-lite` demonstrates this manual approach clearly:

- all coordinates are hand-authored scene coordinates
- trajectory and construction guides are authored directly as geometry
- angle and label annotations are layered manually

Current limitation:

- all numbers are currently treated as scene/user coordinates
- there is no built-in data-to-scene mapping abstraction
- axes/ticks/scales are not first-class helper surfaces
- chart semantics are not modeled

## 3. Model Concepts (v0)

Keep v0 deliberately small.

Proposed concepts:

1. CoordinateFrame (or PlotFrame)
- rectangular plot area in scene coordinates
- data domain metadata for x and y

2. LinearScale
- maps one numeric domain to one numeric range
- supports xScale and yScale use cases

3. Domain and Range
- domain: data extent, for example `[xMin, xMax]`
- range: scene extent, for example `[left, right]`

4. Axis Orientation
- x-axis and y-axis helper orientation
- no new runtime object kinds required

5. Ticks and Tick Labels
- explicit values first
- optional count-based generation later

6. Grid Lines (optional in v0)
- generated from tick values using existing line objects

7. Data Series
- line and scatter helper surfaces
- map data points into scene points

8. Annotation Layer
- reuse existing text/path/line/arrow/angle-mark objects
- no separate annotation subsystem in v0

## 4. Package Boundary Recommendation

Recommendation:

1. Put pure numeric scale helpers in `@vizx/geometry`.
2. Put ObjectScene-producing helper constructors in `@vizx/object-model` builder helpers only when stable.
3. Start with a thin helper module or example-side helper pattern first if API shape is still moving.
4. Avoid introducing a new package until API churn drops.

Boundary principle:

- host JS/TS remains responsible for data ingestion, transformation, and statistics
- VizX helper layer handles coordinate mapping and object construction convenience

D3 interop stance:

- host applications may use D3 scales externally and pass mapped coordinates into VizX
- VizX may expose small built-in scale helpers for common linear use cases
- VizX should not adopt D3 selection/join runtime semantics as a core model

## 5. v0 Scale Helpers

Recommended initial helper surface:

```ts
linearScale(domainMin, domainMax, rangeMin, rangeMax)
mapPoint(frame, dataPoint)
```

Proposed behavior:

- reversed ranges are allowed and produce reversed output mapping
- zero-width domains should produce a deterministic diagnostic-friendly behavior
- non-finite values should throw or return clearly invalid diagnostics at helper boundary
- clamping is deferred in v0 (explicitly out of initial slice)
- invertScale is useful but deferred to a follow-on slice

Suggested return shape:

```ts
interface LinearScale {
  map(value: number): number;
}
```

Keep this pure and dependency-free.

## 6. v0 Axis Helpers

Recommended helper surface:

```ts
xAxis(idPrefix, frame, options)
yAxis(idPrefix, frame, options)
```

Options should stay narrow:

- tick values (explicit list first)
- optional tick count (secondary)
- tick size
- label formatter callback
- optional grid line generation

Output model recommendation:

- return ordinary ObjectScene object arrays (line/text/path)
- do not introduce new object kinds
- do not add resolver layout semantics

This keeps the milestone additive and low-risk.

## 7. v0 Data-Series Helpers

Recommended helper candidates:

```ts
lineSeries(id, points, options)
scatterSeries(idPrefix, points, options)
```

Scope guidance:

- regression computation itself stays host-side for now
- VizX helpers should focus on mapped-mark generation

Recommended first-slice approach:

- helpers accept frame plus data points and map internally
- also allow pre-mapped scene points for advanced host control

Do not include automatic statistical modeling in v0.

## 8. Annotation Layer

Existing capabilities already cover most annotation needs:

- text labels
- arrow markers on lines/paths/connectors
- angle marks via `angleMarkPath(...)`
- dashed construction lines
- arbitrary paths for callouts

Recommendation:

- keep annotation as compositional usage of existing objects
- do not introduce a dedicated annotation runtime type yet

## 9. Relationship To Projectile Example

`aspirational-projectile-motion-lite` is the immediate bridge example.

Why it matters for Milestone 5:

- it is already plot-like in intent (x/y interpretation, trajectory, guides)
- it currently computes/mixes everything in scene coordinates manually
- it is a direct before/after target for future frame/scale/axis helpers

Important boundary:

- this example remains a manual Level 1-2 approximation today
- it is not evidence that plot/data-coordinate features are implemented

## 10. Recommended First Implementation Slice

After this plan, recommended narrow code slice:

1. Add pure `linearScale(...)` helper.
2. Add a small frame mapping helper for data point to scene point conversion.
3. Add one axis helper that emits existing line/text objects.
4. Add one registry-backed example:
- `technical-linear-plot` or
- `aspirational-linear-regression-lite`
5. Add focused tests for scale mapping and helper-generated object semantics.

Hard constraints for this slice:

- no new object kinds
- no parser syntax changes
- no JSON Core IR changes
- no parser AST changes
- no D3 dependency

## 11. Future Slices

Likely follow-on slices after v0:

- tick generation strategies
- tick label formatting helpers
- grid line styling helpers
- scatter series helpers
- richer line/area series helpers
- timeline/schedule helper families
- error bars and interval marks
- polar/radar helpers (for kiviat-like targets)
- log scales
- categorical scales
- optional invert and clamp scale behavior
- host-side D3 interop guidance examples
- parser/JSON support only when interchange priorities justify it

## 12. Out Of Scope

Explicitly out of scope in this pass:

- runtime implementation
- grammar-of-graphics system design
- automatic chart layout
- D3 dependency in core
- parser syntax additions
- JSON Core IR additions
- parser AST additions
- automatic regression/statistical modeling
- animation/interactivity systems

## Related Documents

- [ASPIRATIONAL_REPRODUCTION_ROADMAP.md](./ASPIRATIONAL_REPRODUCTION_ROADMAP.md)
- [PLOT_DATA_ASPIRATIONAL_TARGETS.md](./PLOT_DATA_ASPIRATIONAL_TARGETS.md)
- [STYLE_EXPANSION_CHECKPOINT.md](./STYLE_EXPANSION_CHECKPOINT.md)
- [CAPABILITY_MATRIX.md](./CAPABILITY_MATRIX.md)
- [CORE_IR_SPEC.md](./CORE_IR_SPEC.md)