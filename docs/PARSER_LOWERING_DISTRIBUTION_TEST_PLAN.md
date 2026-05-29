# Parser-Lowering Distribution Test Plan (Stub)

This document defines a concrete planning stub for a future parser-lowering fixture focused on distribution semantics.

Status:

- direct-AST scaffold coverage is now implemented with hand-authored AST lowering/parity tests for `distribute-x` and `distribute-y`
- no source-text parser implementation in this pass
- no parser-lowering tests from source strings in this pass
- no runtime behavior changes in this pass

## 1. Purpose

The future distribution fixtures should prove that:

- source text -> AST -> Core IR
- preserves distribution intent equivalent to the existing TypeScript example builders

Equivalence target:

- parser-lowered Core IR should resolve to the same distribution semantics as the registry-backed reference scenes.

## 2. Reference Examples

Reference ids:

- `distribute-x`
- `distribute-y`

What each example covers:

- `distribute-x` covers scene-level `distributeX` over ordered object ids and validates horizontal center spacing semantics.
- `distribute-y` covers scene-level `distributeY` over ordered object ids and validates vertical center spacing semantics.

Core IR concepts exercised:

- `ObjectScene.distribution` with relation `distributeX` or `distributeY`
- ordered `distribution.objectIds`
- object ids and anchors used by connectors after distribution is applied
- interaction with prior placement/alignment ordering in resolver pipeline

Why two references are appropriate:

- `distributeX` and `distributeY` have axis-specific semantics (primary coordinate changes while orthogonal coordinate remains stable).
- Keeping them separate avoids conflating axis expectations and makes failures localized.
- Existing registry already provides deterministic single-purpose references per axis.

## 3. Future Source Fixture

Final surface grammar is intentionally undecided.

Future fixtures should remain syntax-neutral in this planning phase, optionally using abstract pseudocode such as:

```text
# distribute-x style
object A at (...)
object B relative to A (...)
object C at (...)
distributeX [A, B, C]
connect A.center -> B.center
connect B.center -> C.center

# distribute-y style
object Top at (...)
object Middle relative to Top (...)
object Bottom at (...)
distributeY [Top, Middle, Bottom]
connect Top.center -> Middle.center
connect Middle.center -> Bottom.center
```

Important:

- This pseudocode is illustrative only.
- It is not a grammar commitment.

## 4. Expected Lowered Core IR Shape

Future tests should assert Core IR properties, not exact JSON formatting.

Expected properties:

- scene contains expected ordered object ids for each fixture
- scene-level distribution contains the expected relation (`distributeX` or `distributeY`)
- `distribution.objectIds` preserves source order exactly
- first and last ids in `distribution.objectIds` represent fixed endpoints for the distribution operation
- connectors reference expected object anchors

The lowered shape should remain unresolved geometry (distribution intent encoded in scene-level Core IR fields, not pre-resolved coordinates).

## 5. Semantic Equivalence Assertions

Future test flow (for each reference fixture):

1. Parse future source fixture.
2. Lower AST to Core IR (`ObjectScene`).
3. Resolve lowered Core IR.
4. Resolve corresponding reference TypeScript example (`distribute-x` or `distribute-y`).
5. Compare inspected/resolved semantics.

Expected assertions:

- same expected top-level object ids
- same distribution relation (`distributeX` or `distributeY`)
- same ordered distribution object ids
- first/last center positions preserved by distribution
- intermediate centers evenly spaced along the distribution axis
- orthogonal coordinate remains unchanged for intermediate objects
  - for `distributeX`: preserve `center.y`
  - for `distributeY`: preserve `center.x`
- same connector endpoint anchor semantics
- diagnostics are absent for valid fixtures
- no SVG snapshot assertions

Comparison style guidance:

- prefer resolver and inspection semantic comparisons
- avoid text-format-sensitive render output checks

## 6. Parser Error vs Resolver Diagnostic Boundary

Keep error channels explicit and separate.

Parser errors:

- malformed distribution syntax
- invalid grammar/order/token structure
- AST construction failures

Resolver diagnostics:

- syntax is valid and lowers structurally, but semantic references are invalid
- examples: missing object ids in `distribution.objectIds`, missing center anchors, unsupported distribution relation values

Duplicate id boundary:

- duplicate object ids in distribution lists are resolver diagnostics in the current model
- if future syntax forbids duplicates earlier, parser-level rejection may become appropriate, but that is not assumed by this plan

## 7. Out of Scope

This plan explicitly defers:

- final syntax design
- parser implementation details
- parser-lowering test implementation code
- pretty-printing or round-trip guarantees
- SVG snapshot comparisons
- new distribution modes beyond `distributeX` and `distributeY`
- solver behavior
- automatic graph layout

## 8. Initial Implementation Sketch (Future Work)

When parser-lowering tests are enabled later, start with two canonical fixtures:

- fixture name suggestion: `distribution.x-baseline` -> reference `distribute-x`
- fixture name suggestion: `distribution.y-baseline` -> reference `distribute-y`

Assertion style:

- Core IR shape + resolved semantic equivalence
- axis-specific expectations kept separate to preserve precise diagnostics
