# Technical Math Drawing Track

This note clarifies near-term roadmap priority after Milestone 5 plot/data-coordinate planning and first helper-slice work.

The plot/data branch remains documented and useful, but immediate priority should emphasize technical and mathematical construction drawing.

Latest checkpoint:

- [TECHNICAL_MATH_DRAWING_CHECKPOINT.md](./TECHNICAL_MATH_DRAWING_CHECKPOINT.md)
- [GEOMETRY_COMMON_TANGENT_HELPER_PLAN.md](./GEOMETRY_COMMON_TANGENT_HELPER_PLAN.md)
- [GEOMETRY_BELT_PULLEY_HELPER_PLAN.md](./GEOMETRY_BELT_PULLEY_HELPER_PLAN.md)
- [GEOMETRY_SEGMENT_RAY_HELPER_PLAN.md](./GEOMETRY_SEGMENT_RAY_HELPER_PLAN.md)
- [TECHNICAL_ANNOTATION_HELPER_PLAN.md](./TECHNICAL_ANNOTATION_HELPER_PLAN.md)

## 1. Purpose

This track focuses on geometry/math/physics-style drawing rather than chart infrastructure.

Target drawing families include:

- Euclidean geometry diagrams
- labeled polygons
- angle diagrams
- construction lines
- curves and arcs
- simple physics diagrams
- mechanism diagrams
- annotated mathematical figures

## 2. Current Foundation

Current VizX capabilities that already support this track:

- point and geometry helpers (`point`, `midpoint`, `distance`, `angleOf`, `polar`, `circlePoint`, `regularPolygonPoints`, `angleBetweenPoints`, `angleLabelPoint`)
- intersection helpers (`lineLineIntersection`, `lineCircleIntersections`, `circleCircleIntersections`)
- segment/ray clipped helpers (`segmentSegmentIntersection`, `segmentCircleIntersections`, `rayCircleIntersections`, `pointOnSegment`, `pointOnRay`)
- tangent helpers (`tangentLineAtCirclePoint`, `tangentPointsFromPointToCircle`)
- common tangent helpers (`circleCircleTangents`)
- belt/pulley path helper (`openBeltPath`)
- annotation helpers (`labelAlongSegment`, `rightAngleMarkPath`, `segmentTickMarkPath`, `segmentTickMarks`)
- primitive geometry (`line`, `polyline`, `polygon`, `ellipse`, `circle`, `path`, `rect`, `text`, `group`)
- Bezier and circular-arc path commands (`moveTo`, `lineTo`, `quadraticCurveTo`, `cubicCurveTo`, `arc`, `closePath`)
- angle-mark helper (`angleMarkPath`)
- text labels and anchor-driven placement/alignment/distribution
- built-in arrow markers
- dashed technical guides (`strokeDasharray`)
- explicit cap/join styling (`strokeLineCap`, `strokeLineJoin`)
- ObjectScene builder helpers for ergonomic JS/TS authoring
- inspect/debug output for semantic and geometric verification

## 3. Current Limitations

Current blockers for higher-fidelity technical/math diagrams:

- no construction solver behavior
- no broad segment/ray intersection family coverage (for example ray-ray and segment-ray variants)
- no polygon/path/Bezier/arc intersection helpers
- no annotation collision avoidance or dimension-line annotation system
- no crossed-belt helper (internal-tangent belt runs)
- no cutbefore/cutafter behavior
- no path length or point-at-length helpers
- no path flattening helpers
- no clipping
- no gradient/pattern fills
- no projection/3D helper surface
- no source-language translation (TikZ/Asymptote/MetaPost)

## 4. Relationship To Plot/Data Branch

Current positioning:

- plot/data-coordinate planning and the first helper slice remain valid and documented
- plot/data implementation is not the immediate roadmap priority
- `aspirational-projectile-motion-lite` remains a bridge example, not a plot subsystem
- near-term examples should favor geometry/math construction diagrams over chart infrastructure

## 5. Recommended Near-Term Examples

Reachable next examples using current capabilities:

- `aspirational-geometry-1-lite`
- `aspirational-fig0110-lite`
- `aspirational-fig0140-lite`
- `aspirational-pappus-lite` (likely Level 1 only)
- `aspirational-pendagon-lite`
- one additional small technical/mechanism-lite example when scoped tightly

Current note:

- `aspirational-pendagon-lite` is now implemented as a manual Level 1-2 approximation using explicit helper-called circle-circle and line-circle intersection construction points.
- this example remains solver-free, resolver-inference-free, and source-translation-free.

## 6. Recommended Next Feature Gaps

Likely future technical/math feature slices (not implemented in this pass):

- segment/ray clipped intersection variants
- label/annotation helper refinements
- common tangent helper families
- dimension-line and collision-aware annotation helpers
- cutbefore/cutafter support
- projection helpers
- clipping and fill-surface refinements