# Parser Lowering Contract (Planning)

This document defines a minimal contract for future parser lowering into VizX Core IR.

Scope of this document:

- parser-readiness planning only
- no runtime behavior changes
- no grammar lock-in

See [CORE_IR_SPEC.md](./CORE_IR_SPEC.md) for the current Core IR target model.
See [JSON_CORE_IR_SCHEMA_PLAN.md](./JSON_CORE_IR_SCHEMA_PLAN.md) for planned JSON interchange/schema guidance; parser lowering still targets Core IR directly and does not require JSON text as an intermediate.
See [PARSER_FIXTURE_MATRIX.md](./PARSER_FIXTURE_MATRIX.md) for planned fixture-family to example-reference mapping.
See [PARSER_LOWERING_PLACEMENT_TEST_PLAN.md](./PARSER_LOWERING_PLACEMENT_TEST_PLAN.md) for a concrete docs-only test-plan stub pattern.
See [PARSER_LOWERING_ALIGNMENT_TEST_PLAN.md](./PARSER_LOWERING_ALIGNMENT_TEST_PLAN.md) for the alignment-family concrete docs-only test-plan stub pattern.
See [PARSER_LOWERING_DISTRIBUTION_TEST_PLAN.md](./PARSER_LOWERING_DISTRIBUTION_TEST_PLAN.md) for the distribution-family concrete docs-only test-plan stub pattern.

## Status

- Parser syntax is not yet a stable product surface.
- Parser/lowering implementation is provisional.
- A direct-AST lowering scaffold now exists for placement/alignment/distribution-focused scenes (`VizxAstScene` -> `lowerAstToObjectScene` -> `ObjectScene`) without source-text parsing.
- This contract defines boundaries and test intent for future parser-readiness work.

## 1. Parser Output Responsibility

Responsibilities are split by stage:

- Parser: source text -> AST
- Lowerer: AST -> Core IR target (`ObjectScene` and related object-model contracts)

Required boundaries:

- Parser/lowerer must not know about SVG serialization details.
- Parser/lowerer must not bypass resolver semantics (placement/alignment/distribution/connector resolution behavior lives in resolver).
- Parser/lowerer should emit structured model data, not resolved geometry.

Non-responsibilities for parser/lowerer:

- text measurement
- anchor resolution
- connector endpoint resolution
- render-node construction

## 2. Lowering Target

The target of parser lowering is the Core IR documented in [CORE_IR_SPEC.md](./CORE_IR_SPEC.md), with primary entry shape:

- `ObjectScene`

And dependent contracts including:

- `DrawableObject` (`rect`, `circle`, `text`, `group`)
- `ConnectorObject`
- `ObjectPlacement`
- `ObjectAlignment`
- `SceneDistribution`
- anchor references (`AnchorRef`)

Lowering success criteria:

- Lowered output is structurally equivalent to hand-built TypeScript scene builders for the same intent.

## 3. Minimal Fixture Families (Future)

Future parser-lowering fixture coverage should prove 1:1 mapping into Core IR shapes.

### 3.1 Primitive Objects

Fixtures for:

- rect
- circle
- text

Checks:

- ids and kinds
- geometry-bearing fields mapped to object-model fields
- optional style passthrough when present

### 3.2 Group With Children

Fixtures for:

- top-level group with nested children
- nested group inside group

Checks:

- child ordering retained
- child ids retained
- group structure maps directly to `children`

### 3.3 Connectors

Fixtures for:

- connector between two object anchors

Checks:

- connector id
- `from` / `to` object id + anchor name mapping

### 3.4 Placement

Fixtures for:

- absolute placement
- rightOf
- leftOf
- above
- below

Checks:

- relation kind and fields map to `ObjectPlacement`
- lowering does not pre-resolve coordinates

### 3.5 Alignment

Fixtures for:

- alignX
- alignY
- alignLeft
- alignRight
- alignTop
- alignBottom

Checks:

- relation values and reference anchors map to `ObjectAlignment`

### 3.6 Distribution

Fixtures for:

- distributeX
- distributeY

Checks:

- scene-level relation mapping
- ordered `objectIds` preserved

### 3.7 Diagnostics for Malformed References

Fixtures for intentionally malformed references that still parse structurally (for example missing target ids).

Checks:

- parser-level structural errors remain parser errors
- lowered scenes that are structurally valid but semantically unresolved are handled by resolver diagnostics

### 3.8 Styles (If Stable)

When style fields are stable enough in syntax and AST:

- add style-lowering fixtures
- assert style object shape maps cleanly into current object-model style slots

## 4. Round-Trip Expectations

Current goal is one-way lowering:

- source -> AST -> Core IR (`ObjectScene`)

Out of scope for now:

- pretty-printing
- formatter fidelity
- Core IR -> source round-trip stability

## 5. Source Syntax Neutrality

This contract intentionally avoids locking final language grammar.

Guidelines:

- keep examples abstract or pseudocode-level when discussing syntax
- specify semantic mapping targets, not token-level grammar commitments

The lowering contract is syntax-neutral as long as produced Core IR matches [CORE_IR_SPEC.md](./CORE_IR_SPEC.md).

## 6. Future Test Strategy

Parser-lowering tests should focus on structure and semantics, not rendering snapshots.

### 6.1 Lowering Shape Tests

- parse fixture source
- lower AST
- assert Core IR shape against expected `ObjectScene` contract

### 6.2 Semantic Equivalence Tests

- compare lowered Core IR behavior with equivalent hand-built TypeScript scene builders
- run both through resolver and compare relevant resolved outcomes (objects/connectors/diagnostics)

### 6.3 Renderer-Agnostic Assertions

- do not depend on SVG snapshot formatting
- if render is used at all, assert coarse non-empty/structural behavior only

### 6.4 Error Channel Separation

- parser errors: syntax/AST construction failures
- resolver diagnostics: semantic graph/reference/layout relation issues after lowering

Tests should keep these channels separate and explicit.

## 7. Relationship to Existing Examples

Existing registry-backed TypeScript examples in `@vizx/examples` can serve as expected Core IR fixtures.

Practical use in future parser-lowering tests:

- for each selected capability fixture, pair parser-lowered Core IR with an existing or equivalent TypeScript example scene
- assert structural/semantic equivalence at Core IR and resolver-result levels

This enables parser-readiness validation without introducing new layout behavior.

## 8. Non-Goals for This Contract

- parser implementation details
- final grammar specification
- new layout or solver behavior
- backend expansion beyond current architecture

This document is strictly a parser-readiness contract aligned with existing Core IR and resolver boundaries.
