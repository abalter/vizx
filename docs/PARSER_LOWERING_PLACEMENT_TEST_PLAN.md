# Parser-Lowering Placement Test Plan (Stub)

This document defines a concrete planning stub for a future parser-lowering fixture focused on placement semantics.

Status:

- planning only
- no parser implementation in this pass
- no parser-lowering tests in this pass
- no runtime behavior changes in this pass

## 1. Purpose

The future placement fixture should prove that:

- source text -> AST -> Core IR
- preserves placement intent equivalent to the existing TypeScript example builder

Equivalence target:

- parser-lowered Core IR should resolve to the same placement semantics as the registry-backed reference scene.

## 2. Reference Example

Preferred reference id:

- `relative-placement`

Rationale:

- It isolates placement semantics with minimal unrelated complexity.
- It includes all currently supported placement relations in one scene.
- It includes connectors anchored to the placed objects, which helps lock endpoint semantics.

Covered placement relations in reference:

- `rightOf`
- `leftOf`
- `above`
- `below`
- plus `absolute` placement for the center object

Core IR concepts exercised:

- `ObjectScene` top-level `objects` and `connectors`
- `DrawableObject` group objects with stable ids
- `ObjectPlacement` variants (`absolute`, `rightOf`, `leftOf`, `above`, `below`)
- `AnchorRef` object-id and anchor-name references
- connector `from`/`to` anchor references

Alternative reference (only if needed later):

- `mixed-nested-placement`
- use this only when placement semantics must be validated in deeper nested-group contexts

## 3. Future Source Fixture

Final surface grammar is intentionally undecided.

Future fixture should remain syntax-neutral in this planning phase, for example with abstract pseudocode such as:

```text
object Center at (x, y)
object Right rightOf Center.east by d1
object Left leftOf Center.west by d2
object Above above Center.north by d3
object Below below Center.south by d4
connect Center.east -> Right.west
connect Center.west -> Left.east
connect Center.north -> Above.south
connect Center.south -> Below.north
```

Important:

- This pseudocode is illustrative only.
- It is not a grammar commitment.

## 4. Expected Lowered Core IR Shape

Future tests should assert Core IR properties, not exact JSON formatting.

Expected properties:

- scene contains expected top-level object ids: `Center`, `Right`, `Left`, `Above`, `Below`
- `Center` has `placement.kind = absolute`
- each neighbor object has a relative `placement.kind` matching intended relation
- each relative placement includes a `reference` with expected `objectId` and `anchor`
- each relative placement carries expected gap distance value
- scene contains expected connectors with stable ids
- each connector references expected object/anchor pairs in `from` and `to`

The lowered shape should remain unresolved geometry (no pre-resolved coordinates beyond explicit absolute placement values).

## 5. Semantic Equivalence Assertions

Future test flow:

1. Parse future source fixture.
2. Lower AST to Core IR (`ObjectScene`).
3. Resolve lowered Core IR.
4. Resolve reference TypeScript example scene for `relative-placement`.
5. Compare inspected/resolved semantics.

Expected assertions:

- same expected top-level object ids
- same placement relation kinds per object
- same placement references (`objectId`, `anchor`) per relation
- same gap distances for placement operations
- same resolved relative positions (for example west/east and north/south anchor inequalities and relation-specific offsets)
- same connector endpoint anchor references (`from`/`to` ids and anchors)
- same resolved connector endpoint semantics relative to object anchors
- diagnostics are absent for the valid placement fixture
- no SVG snapshot assertions

Comparison style guidance:

- prefer structural/semantic comparisons from resolver or inspection output
- avoid text-format-sensitive rendering assertions

## 6. Parser Error vs Resolver Diagnostic Boundary

Keep error channels explicit and separate.

Parser errors:

- malformed source syntax
- invalid token/order/grammar structure
- AST construction failures

Resolver diagnostics:

- source parses and lowers structurally, but scene has semantic reference issues
- examples: missing referenced object ids, missing anchors, unsupported relation values

Boundary rule:

- placement fixture for valid syntax should expect no parser error and no resolver diagnostic
- malformed-syntax cases belong to parser-focused fixtures, not this placement-equivalence fixture

## 7. Out of Scope

This plan explicitly defers:

- final syntax design
- parser implementation details
- parser-lowering test implementation code
- pretty-printing or round-trip guarantees
- SVG snapshot comparisons
- new layout behavior
- graph layout and solver behavior beyond current resolver semantics

## 8. Initial Implementation Sketch (Future Work)

When parser-lowering tests are enabled later, start with one canonical case:

- fixture name suggestion: `placement.relative-baseline`
- reference example id: `relative-placement`
- assertion style: Core IR shape + resolved semantic equivalence

Optional expansion after baseline is stable:

- add nested placement variant using `mixed-nested-placement`
- keep nested variant separate so baseline placement coverage remains simple and deterministic
