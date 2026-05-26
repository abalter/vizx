# Capability Matrix

Current examples and tests cover the active inside-out pipeline only: unresolved object graph to resolved scene to render scene to SVG.

| Capability | Unit test | Resolver test | Example | Debug overlay | Notes |
| --- | --- | --- | --- | --- | --- |
| Rect bbox | [packages/geometry/src/geometry.test.ts](../packages/geometry/src/geometry.test.ts) | [packages/resolver/src/resolveScene.test.ts](../packages/resolver/src/resolveScene.test.ts) | `anchors` | Yes | Resolved bbox values are in scene coordinates. |
| Rect anchors | [packages/geometry/src/geometry.test.ts](../packages/geometry/src/geometry.test.ts) | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | `anchors`, `alignment-reference` | Yes | `center`, `north`, `south`, `east`, and `west` are exercised directly and reused inside the alignment reference fixture. |
| Group bbox | [packages/geometry/src/geometry.test.ts](../packages/geometry/src/geometry.test.ts) | [packages/resolver/src/resolveScene.test.ts](../packages/resolver/src/resolveScene.test.ts) | `basic`, `nested-groups`, `connectors`, `mixed-nested-placement`, `alignment-reference` | Yes | Group bounds come from child unions. |
| Nested group children | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | [packages/resolver/src/debugOverlay.test.ts](../packages/resolver/src/debugOverlay.test.ts) | `nested-groups`, `mixed-nested-placement`, `alignment-reference` | Yes | Inspection and overlay recursion both cover nested groups. |
| `rightOf` placement | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | [packages/resolver/src/resolveScene.test.ts](../packages/resolver/src/resolveScene.test.ts) | `basic`, `relative-placement`, `mixed-nested-placement`, `alignment-reference` | Indirect | Aligns target `west` to the right of reference `east` by the requested gap. |
| `leftOf` placement | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | [packages/resolver/src/resolveScene.test.ts](../packages/resolver/src/resolveScene.test.ts) | `relative-placement`, `mixed-nested-placement`, `alignment-reference` | Indirect | Aligns target `east` to the left of reference `west` by the requested gap. |
| `above` placement | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | [packages/resolver/src/resolveScene.test.ts](../packages/resolver/src/resolveScene.test.ts) | `relative-placement`, `mixed-nested-placement`, `alignment-reference` | Indirect | Uses SVG-style downward-positive Y, so `above` subtracts the gap from the reference `north`. |
| `below` placement | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | [packages/resolver/src/resolveScene.test.ts](../packages/resolver/src/resolveScene.test.ts) | `relative-placement`, `mixed-nested-placement`, `alignment-reference` | Indirect | Uses SVG-style downward-positive Y, so `below` adds the gap to the reference `south`. |
| `alignY` alignment | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | [packages/resolver/src/resolveScene.test.ts](../packages/resolver/src/resolveScene.test.ts) | `alignment-reference` | Indirect | Runs after placement and sets target `center.y` to the reference `center.y`. |
| Straight connector | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | [packages/resolver/src/resolveScene.test.ts](../packages/resolver/src/resolveScene.test.ts) | `basic`, `connectors`, `mixed-nested-placement`, `alignment-reference` | Yes | Connectors resolve anchor endpoints and serialize as straight paths. |
| Inspect output | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | [packages/cli/src/demoScene.test.ts](../packages/cli/src/demoScene.test.ts) | All registered examples | Indirect | Example harness verifies every example can be inspected. |
| Debug overlay | [packages/resolver/src/debugOverlay.test.ts](../packages/resolver/src/debugOverlay.test.ts) | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | All registered examples | Yes | Overlay is generated from resolved model data using render nodes. |
| Debug overlay options | [packages/resolver/src/debugOverlay.test.ts](../packages/resolver/src/debugOverlay.test.ts) | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | All registered examples | Yes | Minimal programmatic overlay is validated without CLI flags. |
| SVG rendering | [packages/renderer-svg/src/renderSvg.test.ts](../packages/renderer-svg/src/renderSvg.test.ts) | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | All registered examples | Indirect | Tests assert nonempty SVG without brittle snapshot formatting. |

## Not Yet Implemented

- Parser-driven example sources
- General graph layout
- align (other than `alignY`)
- distribute
- Flowchart semantics
- Plotting or chart grammars
- Nonlinear constraints or a full constraint solver

The `alignment-reference` example remains a reference fixture for ongoing alignment and future distribution work. The first alignment semantic (`alignY`) is implemented, while other align operations and distribution remain future work in [`docs/ALIGNMENT_DESIGN.md`](./ALIGNMENT_DESIGN.md).