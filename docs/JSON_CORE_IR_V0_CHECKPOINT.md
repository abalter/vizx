# JSON Core IR v0 Checkpoint

This note marks the current implementation checkpoint for the JSON Core IR v0 foundation.

Status:

- docs-only checkpoint
- no runtime behavior changes in this pass
- no schema-rule changes in this pass

See [JSON_CORE_IR_SCHEMA_PLAN.md](./JSON_CORE_IR_SCHEMA_PLAN.md), [JSON_SCHEMA_VALIDATOR_SELECTION.md](./JSON_SCHEMA_VALIDATOR_SELECTION.md), and [CORE_IR_SPEC.md](./CORE_IR_SPEC.md) for broader context.

## 1. Implemented Now

JSON Core IR v0 currently includes:

- committed fixtures: `basic`, `relative-placement`, `alignment-family`, `distribute-x`, `distribute-y`
- JSON-to-`ObjectScene` converter coverage for object kinds `group`, `text`, and `rect`
- connector conversion (`kind`, `id`, `from`, `to` anchor refs)
- placement conversion (`absolute`, `rightOf`, `leftOf`, `above`, `below`)
- alignment conversion (`alignX`, `alignY`, `alignLeft`, `alignRight`, `alignTop`, `alignBottom`)
- distribution conversion (`distributeX`, `distributeY`)
- semantic parity tests against TypeScript examples
- draft schema at [../schemas/json-core-ir-v0.schema.json](../schemas/json-core-ir-v0.schema.json)
- schema smoke test coverage (schema JSON parseability and shallow enum structure)
- positive fixture-vs-schema validation tests (Ajv)
- negative schema validation tests for malformed shapes (Ajv)
- developer validation command: `npm run validate:json-core-ir` for fixture directory validation against the draft schema

## 2. Intentionally Not Implemented

The following remain intentionally out of scope at this checkpoint:

- runtime schema validation in `convertJsonCoreIrV0ToObjectScene`
- public JSON format stability guarantees
- parser lowering integration
- parser syntax implementation
- browser/runtime validation integration
- full object-kind coverage beyond the current v0 fixture surface

## 3. Current Validation Boundary

Current boundary is explicit:

- schema tests validate fixture structure
- the converter maps JSON-shaped payloads to `ObjectScene`-compatible data
- the resolver owns semantic graph diagnostics (for example missing references and context-dependent semantic failures)
- parser lowering remains a separate concern and is not coupled to JSON representation

## 4. Reasonable Next Options

Possible next implementation directions (non-mandatory):

1. Add a runtime validation wrapper around JSON conversion.
2. Add a CLI command/script to validate JSON Core IR files against the draft schema.
3. Add parser-lowering fixture scaffolding using existing Core IR example families.

## 5. Default Recommendation

Default next step: add a CLI/script-level schema validation command before wiring validation into converter runtime behavior.

This preserves current runtime semantics while making schema validation easier to run in local workflows and CI.

## 6. Out of Scope for This Pass

Explicitly deferred in this checkpoint pass:

- dependency changes
- runtime code changes
- converter behavior changes
- parser syntax/lowering tests
- schema expansion work