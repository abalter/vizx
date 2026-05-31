# Aspirational Example Gallery Index

This index compares the current aspirational examples by source, reproduction target, helper usage, and declared compromises.

Purpose:

- make target selection easier for future example-driven prompts
- keep helper usage and scope boundaries comparable across examples
- clarify that these are manual TypeScript reproductions, not source translation fixtures

Current metadata source:

- optional aspirational metadata fields on `VizxExample` objects
- standardized top-level reproduction notes in each aspirational example file

Machine-readable manifest:

- generated file: `examples/aspirational-gallery-manifest.json`
- writer script: `packages/examples/src/writeAspirationalGalleryManifest.ts`
- generation command: `npm run manifest:aspirational`
- payload is metadata-only and intentionally excludes scenes, render output, and source contents

Generated static gallery report:

- generated file: `examples/aspirational-gallery.html`
- writer script: `packages/examples/src/writeAspirationalGalleryHtml.ts`
- generation command: `npm run gallery:aspirational`
- the page uses manifest metadata plus current `examples/{id}.svg` and `examples/{id}.debug.svg` outputs when present
- missing SVG previews are shown as non-fatal gaps; run `npm run examples` first for fresh previews

Boundary reminder:

- no source translation guarantee
- no fidelity guarantee beyond the declared Level 1 / Level 2 target
- no solver, automatic layout/routing, or physics/mechanics system is implied by these examples

| Example id | Source path | Reproduction level target | Primary drawing type | Main helper families used | Current compromises | Next possible fidelity improvement |
| --- | --- | --- | --- | --- | --- | --- |
| `aspirational-pullys-lite` | `examples/aspirational_gallery/metapost/pullys.mp` | `Level 1-2` | Static pulley/mechanism sketch | `primitives`, `tangents`, `common tangents`, `annotation helpers`, `circular arcs / angle marks`, `belt/pulley path`, `style fields` | `manual coordinates`; `no source translation`; `no solver`; `no mechanics/physics simulation`; `no full visual fidelity`; `no clipping/gradients`; `no parser/JSON/AST support` | Add tighter pulley silhouette/support details and clearer rope masking once clipping or cut operations exist. |
| `aspirational-pendagon-lite` | `examples/aspirational_gallery/metapost/pendagon.mp` | `Level 1-2` | Intersection-driven geometry construction | `primitives`, `intersections`, `segment/ray clipping`, `annotation helpers`, `style fields` | `manual coordinates`; `no source translation`; `no solver`; `no full visual fidelity`; `no clipping/gradients`; `no parser/JSON/AST support` | Add additional construction arcs and cleaner construction-label placement if annotation helpers expand. |
| `aspirational-geometry-1-lite` | `examples/aspirational_gallery/asymptote/geometry_1` | `Level 1-2` | Coordinate-frame geometry sketch | `primitives`, `intersections`, `annotation helpers`, `circular arcs / angle marks`, `style fields` | `manual coordinates`; `no source translation`; `no solver`; `no full visual fidelity`; `no clipping/gradients`; `no parser/JSON/AST support` | Add denser point-set sampling or coordinate-system conveniences without introducing a full transformed-frame subsystem. |
| `aspirational-labeled-polygon` | `examples/aspirational_gallery/asymptote/labeled_polygon` | `Level 1-2` | Labeled polygon / angle-mark diagram | `primitives`, `circular arcs / angle marks`, `style fields` | `manual coordinates`; `no source translation`; `no solver`; `no full visual fidelity`; `no clipping/gradients`; `no parser/JSON/AST support` | Improve label placement and richer angle-mark variants when annotation helpers broaden. |
| `aspirational-projectile-motion-lite` | `examples/aspirational_gallery/tikz/projectile_motion` | `Level 1-2` | Physics-style trajectory sketch | `primitives`, `paths/Bezier`, `circular arcs / angle marks`, `style fields` | `manual coordinates`; `no source translation`; `no solver`; `no mechanics/physics simulation`; `no full visual fidelity`; `no clipping/gradients`; `no parser/JSON/AST support` | Add plotted axis semantics or sampled trajectory markers if plot/data work becomes a priority. |
| `aspirational-android-lifecycle` | `examples/aspirational_gallery/tikz/Diagram of Android activity life cycle` | `Level 2` | Node/link lifecycle flow diagram | `primitives`, `connectors/placement` | `no source translation`; `no solver`; `no automatic layout`; `no full visual fidelity`; `no clipping/gradients`; `no parser/JSON/AST support` | Add orthogonal connector routing and cut-style edge avoidance if routing work is prioritized later. |
| `aspirational-arrow-label` | `examples/aspirational_gallery/metapost/arrow_label.mp` | `Level 2` | Labeled arrow segment | `primitives` | `manual coordinates`; `no source translation`; `no solver`; `no full visual fidelity`; `no clipping/gradients`; `no parser/JSON/AST support` | Add native `cutbefore`/`cutafter`-style trimming and label-aware path shortening. |