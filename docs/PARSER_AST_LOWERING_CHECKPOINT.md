# Parser AST Lowering Checkpoint

This note marks the end of the current direct AST-to-`ObjectScene` scaffold phase.

Status:

- docs-only checkpoint
- no runtime behavior changes in this pass
- no parser syntax implementation in this pass

See [PARSER_MINIMAL_PLACEMENT_SYNTAX_SKETCH.md](./PARSER_MINIMAL_PLACEMENT_SYNTAX_SKETCH.md) for one tentative experimental placement-only source sketch.
See [PARSER_LOWERING_CONTRACT.md](./PARSER_LOWERING_CONTRACT.md), [CORE_IR_SPEC.md](./CORE_IR_SPEC.md), and [PARSER_FIXTURE_MATRIX.md](./PARSER_FIXTURE_MATRIX.md) for surrounding context.

## 1. Implemented Now

The direct AST lowerer currently supports:

- object kinds: `group`, `text`, `rect`
- nested `group.children`
- placement relations: `absolute`, `rightOf`, `leftOf`, `above`, `below`
- alignment relations: `alignX`, `alignY`, `alignLeft`, `alignRight`, `alignTop`, `alignBottom`
- distribution relations: `distributeX`, `distributeY`
- connectors with anchor refs (`from` / `to`)
- parser-local lowerer behavior tests (including unsupported relation handling)
- examples-level semantic parity tests against registry-backed references:
  - `relative-placement`
  - `alignment-family`
  - `distribute-x`
  - `distribute-y`

## 2. Intentionally Not Implemented

The following remain intentionally deferred:

- source text parsing
- final grammar design
- parser-lowering tests from source strings
- parser diagnostics for real syntax errors
- pretty-printing and round-trip formatting guarantees
- parser integration with JSON representation as a parsing surface
- public syntax stability guarantees

## 3. Current Architecture Boundary

Current boundary is explicit:

- parser AST lowerer maps structured AST to `ObjectScene`
- resolver owns layout semantics and semantic graph diagnostics
- examples-level parity tests compare resolved semantics, not SVG snapshots
- JSON Core IR remains a separate interchange/fixture path

## 4. Reasonable Next Implementation Options

Possible next directions:

1. Add a tiny text parser for one minimal placement-only source form.
2. Add parser diagnostics/error-model planning before syntax implementation.
3. Add AST lowering support for future object kinds only after object-model growth.
4. Add a CLI experiment for lowering structured AST or JSON-like input, if useful later.

## 5. Default Recommendation

Before writing a real grammar, add a small syntax-design note for one minimal placement-only source form and mark it explicitly experimental.

This keeps early syntax decisions narrow, reversible, and clearly separated from current resolver semantics.

## 6. Out of Scope for This Pass

Explicitly deferred in this checkpoint pass:

- all code changes
- parser text parsing
- grammar implementation
- runtime validation boundary changes
- new layout behavior or solver behavior