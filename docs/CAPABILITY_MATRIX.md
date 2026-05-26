# Capability Matrix

Current examples and tests cover the active inside-out pipeline only: unresolved object graph to resolved scene to render scene to SVG.

| Capability | Unit test | Resolver test | Example | Debug overlay | Notes |
| --- | --- | --- | --- | --- | --- |
| Rect bbox | [packages/geometry/src/geometry.test.ts](../packages/geometry/src/geometry.test.ts) | [packages/resolver/src/resolveScene.test.ts](../packages/resolver/src/resolveScene.test.ts) | `anchors` | Yes | Resolved bbox values are in scene coordinates. |
| Rect anchors | [packages/geometry/src/geometry.test.ts](../packages/geometry/src/geometry.test.ts) | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | `anchors` | Yes | `center`, `north`, `south`, `east`, and `west` are exercised directly. |
| Group bbox | [packages/geometry/src/geometry.test.ts](../packages/geometry/src/geometry.test.ts) | [packages/resolver/src/resolveScene.test.ts](../packages/resolver/src/resolveScene.test.ts) | `basic`, `nested-groups`, `connectors` | Yes | Group bounds come from child unions. |
| Nested group children | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | [packages/resolver/src/debugOverlay.test.ts](../packages/resolver/src/debugOverlay.test.ts) | `nested-groups` | Yes | Inspection and overlay recursion both cover nested groups. |
| `rightOf` placement | [packages/geometry/src/geometry.test.ts](../packages/geometry/src/geometry.test.ts) | [packages/resolver/src/resolveScene.test.ts](../packages/resolver/src/resolveScene.test.ts) | `basic` | Indirect | Current placement examples stay intentionally small. |
| Straight connector | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | [packages/resolver/src/resolveScene.test.ts](../packages/resolver/src/resolveScene.test.ts) | `basic`, `connectors` | Yes | Connectors resolve anchor endpoints and serialize as straight paths. |
| Inspect output | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | [packages/cli/src/demoScene.test.ts](../packages/cli/src/demoScene.test.ts) | All registered examples | Indirect | Example harness verifies every example can be inspected. |
| Debug overlay | [packages/resolver/src/debugOverlay.test.ts](../packages/resolver/src/debugOverlay.test.ts) | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | All registered examples | Yes | Overlay is generated from resolved model data using render nodes. |
| Debug overlay options | [packages/resolver/src/debugOverlay.test.ts](../packages/resolver/src/debugOverlay.test.ts) | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | All registered examples | Yes | Minimal programmatic overlay is validated without CLI flags. |
| SVG rendering | [packages/renderer-svg/src/renderSvg.test.ts](../packages/renderer-svg/src/renderSvg.test.ts) | [packages/examples/src/index.test.ts](../packages/examples/src/index.test.ts) | All registered examples | Indirect | Tests assert nonempty SVG without brittle snapshot formatting. |

## Not Yet Implemented

- Parser-driven example sources
- General graph layout
- Flowchart semantics
- Plotting or chart grammars
- Nonlinear constraints or a full constraint solver