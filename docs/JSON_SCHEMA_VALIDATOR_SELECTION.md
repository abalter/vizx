# JSON Schema Validator Selection (Planning)

This note defines what VizX should require from a JSON Schema validator before any dependency is added for JSON Core IR work.

Status:

- planning only
- no validator dependency is installed
- not wired into runtime conversion
- not a final dependency decision
- not a public format stability commitment

See [JSON_CORE_IR_SCHEMA_PLAN.md](./JSON_CORE_IR_SCHEMA_PLAN.md) for the broader JSON schema strategy and [CORE_IR_SPEC.md](./CORE_IR_SPEC.md) for the current runtime Core IR contract.

## 1. Purpose

VizX will eventually need a JSON Schema validator for JSON Core IR fixture/schema validation.

Current constraint:

- schema validation is not yet part of runtime behavior
- the current draft schema file is a review artifact
- the current converter and resolver remain the executable behavior owners

This note exists so validator adoption can be reviewed against explicit criteria rather than added ad hoc.

## 2. Requirements

Before adding a dependency, the chosen validator should satisfy all of the following:

- supports the JSON Schema draft used by [schemas/json-core-ir-v0.schema.json](../schemas/json-core-ir-v0.schema.json)
- works cleanly in the current Node test environment used by `vitest`
- can be introduced as a dev dependency first
- produces useful validation errors that are readable in tests and review output
- does not force runtime or browser integration in the first slice
- has TypeScript-friendly usage patterns for loading schemas and typing validation results
- does not change JSON-to-`ObjectScene` converter semantics
- preserves the current separation between structural schema validation and resolver-owned semantic diagnostics

Secondary preferences:

- low setup overhead for a single draft schema file
- straightforward support for local `$ref` usage
- predictable behavior in ESM-based Node projects

## 3. Candidate Validator

Ajv is the likely default candidate for the first evaluation pass because it is widely used, supports modern JSON Schema drafts, and has solid TypeScript/Node usage patterns.

That is a working default candidate, not a final project decision.

No dependency should be added from this note alone.

## 4. Validation Boundary

Planned responsibility split:

- schema validation catches structural JSON shape problems
- the converter maps structurally valid JSON payloads into `ObjectScene`-compatible values
- the resolver continues to own semantic graph diagnostics such as missing referenced object ids, invalid graph ordering cases, and other scene-context-dependent failures unless those checks are explicitly moved elsewhere later

This boundary matters because validator adoption should tighten structural guarantees without redefining resolver semantics.

## 5. First Future Implementation Slice

Recommended first implementation slice after this note:

1. Add the chosen validator as a dev-only dependency.
2. Validate the committed JSON Core IR fixtures against [schemas/json-core-ir-v0.schema.json](../schemas/json-core-ir-v0.schema.json) in tests.
3. Keep validation out of the runtime converter path for that first slice.

This keeps the first validator pass narrow, reviewable, and separate from runtime behavior changes.

## 6. Explicitly Out of Scope

This note defers:

- installing dependencies
- runtime schema validation
- parser integration
- public JSON format stability guarantees
- auto-generating schemas from TypeScript types
- replacing converter diagnostics