# JSON Core IR Schema Plan (Planning)

This document outlines a future JSON schema strategy for VizX Core IR interchange.

Status:

- planning only
- no schema files implemented in this pass
- no parser implementation in this pass
- no parser-lowering tests in this pass
- no runtime behavior changes in this pass

See [CORE_IR_SPEC.md](./CORE_IR_SPEC.md) for the current effective Core IR contract.
See [JSON_CORE_IR_V0_SHAPE.md](./JSON_CORE_IR_V0_SHAPE.md) for the docs-only minimal v0 shape focused on the current `basic` baseline example.
See [JSON_CORE_IR_V0_CONFORMANCE_CHECKLIST.md](./JSON_CORE_IR_V0_CONFORMANCE_CHECKLIST.md) for docs-only pass/fail acceptance checks for future v0 schema/converter work.

## 1. Purpose

A future JSON Core IR format is intended as:

- an interchange format for tooling and fixtures
- a stable shape for machine-readable test inputs
- a language-agnostic representation of Core IR intent

It is not intended to be the final human-facing authoring syntax.

Human-facing syntax remains a separate parser/front-end concern.

## 2. Relationship to TypeScript Scene Builders

Current authoritative typed examples are the `@vizx/examples` TypeScript scene builders.

Today they are the most reliable executable references for Core IR semantics because they:

- already construct valid `ObjectScene` structures
- already drive resolver and inspection tests
- already encode implemented placement/alignment/distribution behavior

Future JSON fixtures should be able to express the same object-model concepts as these builders, with semantic parity validated through resolver/inspection comparisons.

## 3. Initial Schema Surface (Planned)

Future JSON schema coverage should map directly to current Core IR concepts in `ObjectScene` and related object-model types.

### 3.1 Scene and Objects

Planned coverage:

- top-level scene object
- required `objects` array
- optional `connectors` array
- optional scene-level `distribution` array

Object-level required/optional fields:

- object `id`
- object `kind`
- `style` (when stable enough)
- `transform`
- `placement`
- `align`

Supported object kinds:

- `rect`
- `circle`
- `text`
- `group`

### 3.2 Geometry and Hierarchy

Planned geometry fields by kind:

- `rect`: `center`, `width`, `height`, `rx`, `ry`, `fitToText`
- `circle`: `center`, `radius`
- `text`: `center`, `text`
- `group`: `children` (recursive drawable objects)

Hierarchy coverage:

- nested `group.children` recursion
- ordering preserved exactly as declared

### 3.3 Connectors and Anchor References

Planned connector coverage:

- connector `kind = connector`
- connector `id`
- `from` and `to` anchor refs
- optional connector style fields

Planned anchor-ref coverage:

- `objectId`
- `anchor` (enum aligned to current anchor names in Core IR)

### 3.4 Placement, Alignment, Distribution

Planned placement coverage:

- `absolute`
- `rightOf`
- `leftOf`
- `above`
- `below`

Planned alignment coverage:

- `alignX`
- `alignY`
- `alignLeft`
- `alignRight`
- `alignTop`
- `alignBottom`

Planned distribution coverage:

- scene-level `distributeX`
- scene-level `distributeY`
- ordered `objectIds`

### 3.5 Styles and Fixture Metadata

Styles:

- include style fields that are already stable enough in current model (`@vizx/core` `Style` usage)
- avoid overcommitting to a public style compatibility guarantee at this stage

Fixture metadata (optional, outside strict runtime scene fields):

- fixture id/name
- expected diagnostics count/categories
- expected equivalence reference id (for example matching `@vizx/examples` id)

If metadata is introduced, keep it clearly separated from the runtime `ObjectScene` payload.

## 4. Validation Strategy (Planned)

Future schema validation should run before resolver execution.

Primary goals:

- validate top-level shape and required fields
- reject invalid object kinds
- reject malformed anchor refs
- reject malformed placement relation names
- reject malformed alignment relation names
- reject malformed distribution relation names

Boundary with resolver diagnostics:

- schema validates structural shape
- resolver keeps responsibility for semantic graph checks that need scene context or runtime object lookup

Examples that should remain resolver diagnostics unless statically provable by schema alone:

- missing referenced object ids
- missing resolved anchors on specific object kinds
- unsupported semantic combinations detected during resolution

## 5. Future Test Strategy

Future JSON fixture tests should be semantic and renderer-agnostic.

Planned flow:

1. Load JSON fixture.
2. Validate JSON against schema.
3. Convert validated JSON payload into `ObjectScene`.
4. Resolve `ObjectScene`.
5. Compare inspected/resolved semantics against a matching TypeScript example.

Recommended assertions:

- object ids and kinds
- placement/alignment/distribution relation shape
- anchor-ref endpoint semantics for connectors
- distribution/alignment positional invariants where applicable
- diagnostics expectations (none for valid baseline fixtures, targeted diagnostics for malformed semantic fixtures)

Avoid SVG snapshot coupling.

## 6. Relationship to Parser Lowering

Parser lowering should continue to target Core IR semantics (`ObjectScene` contract), not SVG details.

Conceptually, parser-lowered output and JSON fixture payloads should converge on equivalent Core IR shape and behavior.

Important constraint:

- parser implementation does not need JSON text as an intermediate representation
- JSON is an interchange/fixture format option, not a mandatory parser pipeline stage

## 7. Explicit Deferrals

This plan explicitly defers:

- actual JSON schema implementation
- schema validator dependency decision
- JSON fixture file introduction
- parser syntax changes
- parser implementation changes
- parser-lowering tests
- pretty-printing and round-trip serialization guarantees
- public stability/versioning guarantees for JSON schema

## 8. Initial Future Work Sequence (Non-Binding)

When implementation begins later, a narrow sequence is recommended:

1. Define minimal draft schema for `ObjectScene` + drawable objects + connectors.
2. Add conversion layer JSON payload -> `ObjectScene`.
3. Add baseline semantic-equivalence fixtures against `@vizx/examples` (`basic`, placement, alignment, distribution references).
4. Expand optional style coverage and fixture metadata only after baseline equivalence is stable.

This keeps interchange planning incremental and aligned with existing Core IR behavior.
