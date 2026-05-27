# Parser-Lowering Alignment Test Plan (Stub)

This document defines a concrete planning stub for a future parser-lowering fixture focused on alignment semantics.

Status:

- planning only
- no parser implementation in this pass
- no parser-lowering tests in this pass
- no runtime behavior changes in this pass

## 1. Purpose

The future alignment fixture should prove that:

- source text -> AST -> Core IR
- preserves alignment intent equivalent to the existing TypeScript example builder

Equivalence target:

- parser-lowered Core IR should resolve to the same alignment semantics as the registry-backed reference scene.

## 2. Reference Example

Reference id:

- `alignment-family`

Why this is the correct reference:

- It is the dedicated registry example for the full implemented alignment family.
- It isolates both center-axis and edge-alignment operations in one deterministic scene.
- It includes connector references that lock anchor-level outcomes after alignment.

Alignment operations covered:

- `alignX`
- `alignY`
- `alignLeft`
- `alignRight`
- `alignTop`
- `alignBottom`

Core IR concepts exercised:

- `ObjectScene` object and connector lists
- `ObjectAlignment` fields on target objects
- `AnchorRef` mapping for alignment references (`objectId`, `anchor`)
- interplay of `ObjectPlacement` followed by `ObjectAlignment`
- connector `from` and `to` anchor references after alignment has been applied

## 3. Future Source Fixture

Final surface grammar is intentionally undecided.

Future fixture should remain syntax-neutral in this planning phase, optionally using abstract pseudocode such as:

```text
object Reference at (x, y)
object AxisX placed below Reference by d1, alignX to Reference.center
object AxisY placed rightOf Reference by d2, alignY to Reference.center
object EdgeLeft placed below Reference by d3, alignLeft to Reference.west
object EdgeRight placed above Reference by d4, alignRight to Reference.east
object EdgeTop placed rightOf Reference by d5, alignTop to Reference.north
object EdgeBottom placed leftOf Reference by d6, alignBottom to Reference.south
connect Reference.center -> AxisX.center
connect Reference.center -> AxisY.center
connect Reference.west -> EdgeLeft.west
connect Reference.east -> EdgeRight.east
connect Reference.north -> EdgeTop.north
connect Reference.south -> EdgeBottom.south
```

Important:

- This pseudocode is illustrative only.
- It is not a grammar commitment.

## 4. Expected Lowered Core IR Shape

Future tests should assert Core IR properties, not exact JSON formatting.

Expected properties:

- scene contains expected top-level object ids: `Reference`, `AxisX`, `AxisY`, `EdgeLeft`, `EdgeRight`, `EdgeTop`, `EdgeBottom`
- target objects include expected `align` field values:
  - `AxisX.align.relation = alignX`
  - `AxisY.align.relation = alignY`
  - `EdgeLeft.align.relation = alignLeft`
  - `EdgeRight.align.relation = alignRight`
  - `EdgeTop.align.relation = alignTop`
  - `EdgeBottom.align.relation = alignBottom`
- each `align.reference` preserves expected `objectId` and `anchor`
- connector list contains expected ids and expected `from`/`to` anchor refs

The lowered shape should remain unresolved geometry (alignment intent encoded in Core IR fields, not pre-resolved coordinates).

## 5. Semantic Equivalence Assertions

Future test flow:

1. Parse future source fixture.
2. Lower AST to Core IR (`ObjectScene`).
3. Resolve lowered Core IR.
4. Resolve reference TypeScript example scene for `alignment-family`.
5. Compare inspected/resolved semantics.

Expected assertions:

- same expected top-level object ids
- same alignment relations per target object
- same alignment references (`objectId`, `anchor`) per relation
- same resolved center-axis effects:
  - `AxisX.center.x == Reference.center.x`
  - `AxisY.center.y == Reference.center.y`
- same resolved edge-alignment effects:
  - `EdgeLeft.west.x == Reference.west.x`
  - `EdgeRight.east.x == Reference.east.x`
  - `EdgeTop.north.y == Reference.north.y`
  - `EdgeBottom.south.y == Reference.south.y`
- same connector endpoint anchor semantics for all reference-to-target edges
- diagnostics are absent for the valid alignment fixture
- no SVG snapshot assertions

Comparison style guidance:

- prefer resolver and inspection semantic comparisons
- avoid text-format-sensitive render output checks

## 6. Parser Error vs Resolver Diagnostic Boundary

Keep error channels explicit and separate.

Parser errors:

- malformed alignment syntax
- invalid grammar/order/token structure
- AST construction failures

Resolver diagnostics:

- syntax is valid and lowers structurally, but semantic references are invalid
- examples: missing alignment reference object ids, missing referenced anchors, unsupported relation values in structurally valid lowered Core IR

Boundary rule:

- alignment-equivalence fixture should expect no parser error and no resolver diagnostic
- malformed-syntax alignment cases belong to parser-focused fixtures, not this equivalence fixture

## 7. Out of Scope

This plan explicitly defers:

- final syntax design
- parser implementation details
- parser-lowering test implementation code
- pretty-printing or round-trip guarantees
- SVG snapshot comparisons
- new alignment behavior
- distribution behavior

## 8. Initial Implementation Sketch (Future Work)

When parser-lowering tests are enabled later, start with one canonical case:

- fixture name suggestion: `alignment.family-baseline`
- reference example id: `alignment-family`
- assertion style: Core IR shape + resolved semantic equivalence

Optional expansion after baseline is stable:

- add follow-up variants that isolate each alignment relation individually
- keep the family-baseline fixture as the single integration contract for all six alignment operations
