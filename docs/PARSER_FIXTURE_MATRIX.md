# Parser Fixture Matrix (Planning)

This matrix maps future parser-lowering fixture families to existing registry-backed `@vizx/examples` scene ids.

Purpose:

- identify which parser-lowering fixtures are needed
- identify current TypeScript Core IR references for semantic comparison
- define what future assertions should check

Status note:

- This is a planning artifact only.
- It does not mark parser syntax/lowering tests as implemented.

## Fixture Matrix

| Fixture family | Existing example reference | Core IR concepts covered | Future parser fixture status | Future assertions |
| --- | --- | --- | --- | --- |
| Primitive objects | `anchors`, `basic` | `rect`, `text`, ids, placement baseline (`absolute`) | Partial reference exists; dedicated parser fixture still future | Parse fixture, lower AST to `ObjectScene`, assert object kinds/ids/field mapping, compare resolved anchors/bbox semantics with reference example scene. |
| Group with children | `nested-groups` | `group.children`, nested object hierarchy, child ordering | Reference exists; parser fixture future | Assert lowered nested `group` tree shape matches expected Core IR hierarchy and resolves to equivalent child inspection structure. |
| Connectors | `connectors`, `basic` | `ConnectorObject`, `from`/`to` `AnchorRef`, connector ids | Reference exists; parser fixture future | Assert lowered connector endpoint refs (`objectId`, `anchor`) and resolved connector endpoints semantically match reference. |
| Placement | `relative-placement`, `mixed-nested-placement` | `ObjectPlacement`: `absolute`, `rightOf`, `leftOf`, `above`, `below` | Reference exists; parser fixture future. Detailed stub: [PARSER_LOWERING_PLACEMENT_TEST_PLAN.md](./PARSER_LOWERING_PLACEMENT_TEST_PLAN.md). | Assert relation kinds/fields lower correctly; compare resolved anchor relationships/gaps against reference semantics (not SVG text diffs). |
| Alignment | `alignment-family`, `alignment-reference` | `ObjectAlignment`: `alignX`, `alignY`, `alignLeft`, `alignRight`, `alignTop`, `alignBottom` | Reference exists; parser fixture future | Assert relation lowering shape and compare resolved alignment semantics (center/edge anchor equalities) with reference scenes. |
| Distribution | `distribute-x`, `distribute-y` | Scene-level `distribution`: `distributeX`, `distributeY`, ordered `objectIds` | Reference exists; parser fixture future | Assert scene-level distribution lowering and compare resolved center-spacing semantics to reference examples. |
| Inspection/debug readiness | `alignment-family`, `basic` | Resolver/inspection stability of lowered Core IR output; debug-overlay-compatible resolved model | Reference exists; parser fixture future | Resolve lowered scene and reference scene, compare inspected object/connector semantics and diagnostics shape; avoid SVG snapshot coupling. |
| Malformed references / diagnostics | No direct ideal registry example; use dedicated future malformed parser fixtures | Missing ids/anchors, unsupported relations, malformed references | Future fixture required | Keep channels separate: parser syntax/AST errors asserted at parser stage; resolver diagnostics asserted only for structurally valid lowered Core IR. |
| Styles | `alignment-reference`, `mixed-nested-placement`, `nested-groups`, `anchors` (partial) | `style` passthrough on objects/connectors where present | Partial reference exists; parser style fixtures future | Assert style fields that exist in syntax/AST map into Core IR style slots without forcing renderer-level snapshot checks. |

## Expected Future Testing Strategy

Future parser-lowering tests should avoid SVG snapshot comparisons and instead compare Core IR shape and semantic outcomes.

Planned flow:

1. Parse source fixture.
2. Lower AST to Core IR (`ObjectScene`).
3. Resolve lowered Core IR.
4. Resolve reference TypeScript example scene (`@vizx/examples`).
5. Compare inspected/resolved semantics (objects, connectors, anchors, diagnostics intent).

Error separation requirement:

- parser syntax/AST errors are parser failures
- resolver diagnostics are semantic/runtime-safety diagnostics for valid lowered Core IR

This separation should remain explicit in fixture naming and assertions.
