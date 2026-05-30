# Technical Math Drawing Track

This note clarifies near-term roadmap priority after Milestone 5 plot/data-coordinate planning and first helper-slice work.

The plot/data branch remains documented and useful, but immediate priority should emphasize technical and mathematical construction drawing.

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
- tangent helpers (`tangentLineAtCirclePoint`, `tangentPointsFromPointToCircle`)
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
- no segment/ray intersection clipping helpers
- no polygon/path/Bezier/arc intersection helpers
- no common tangent helpers (for example circle-circle common tangents)
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

## 6. Recommended Next Feature Gaps

Likely future technical/math feature slices (not implemented in this pass):

- intersection helpers
- label/annotation helper refinements
- common tangent helper families
- right-angle marker helper
- cutbefore/cutafter support
- projection helpers
- clipping and fill-surface refinements