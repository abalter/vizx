# JSON Core IR v0 Ownership Lanes (Planning)

This document maps the v0 conformance checklist areas to future implementation and review lanes so later passes stay small and focused.

Status:

- planning only
- not an implementation plan with code
- not a schema file
- not a fixture file
- not a parser contract
- not a public stability guarantee
- committed converter and fixture coverage now exists; this document remains about review boundaries, not about whether code/fixtures exist

See [JSON_CORE_IR_V0_CONFORMANCE_CHECKLIST.md](./JSON_CORE_IR_V0_CONFORMANCE_CHECKLIST.md) for the acceptance checklist this document organizes.

## 1. Purpose

The goal is to assign each future acceptance area to the correct review lane before implementation begins.

That keeps future work narrow:

- schema-shape concerns stay in schema review
- object conversion concerns stay in converter review
- semantic behavior stays in fixture review
- resolver-owned diagnostics stay in diagnostic review
- provisional vs stable wording stays in documentation/API stability review

This document is not:

- implementation code
- a schema file
- a fixture file
- a parser contract
- a public stability guarantee

## 2. Lane Definitions

- Schema draft review: validates JSON shape, enums, and required/optional structure before conversion.
- JSON-to-ObjectScene converter review: verifies JSON maps to `ObjectScene` without resolving geometry or anchors.
- Semantic fixture review: resolves JSON-converted scenes and compares semantics to the TypeScript `basic` example.
- Resolver diagnostic review: confirms resolver-owned semantic errors remain in resolver diagnostics.
- Documentation/API stability review: tracks what is provisional, what is intentionally omitted, and what should not be treated as stable yet.

## 3. Checklist-to-Lane Table

| Checklist area | Example acceptance item | Primary lane | Secondary lane | Notes |
| --- | --- | --- | --- | --- |
| Scene-level checks | JSON payload has an `objects` array | Schema draft review | Converter review | Shape presence is the first gate before conversion.
| Scene-level checks | JSON payload omits `distribution` for `basic` | Schema draft review | Documentation/API stability review | `basic` intentionally stays minimal.
| Scene-level checks | Optional metadata is not treated as runtime scene data | Documentation/API stability review | Converter review | Metadata policy should be explicit before conversion.
| Object checks | All objects have stable string ids | Schema draft review | Semantic fixture review | Id stability matters for both validation and later comparisons.
| Object checks | Group objects include a `children` array | Schema draft review | Converter review | This is a structural requirement for the `basic` slice.
| Object checks | Rect children represent fit-to-text behavior | Converter review | Semantic fixture review | This becomes meaningful once actual conversion exists.
| Object checks | Unsupported object fields are rejected or ignored by policy | Documentation/API stability review | Schema draft review | Policy must be written before implementation claims are made.
| Placement checks | `rightOf` has `placement.kind = rightOf` | Schema draft review | Converter review | Relation names should be caught early.
| Placement checks | `placement.reference.objectId` is present | Schema draft review | Converter review | Converter should preserve the reference shape.
| Placement checks | `placement.gap` is present | Schema draft review | Converter review | Gap is part of the representation, not a resolved result.
| Placement checks | No JSON `targetAnchor` field is required | Documentation/API stability review | Resolver diagnostic review | The absence of a field is an intentional API decision.
| Connector checks | Connector `id` is present | Schema draft review | Converter review | Connector identity should survive conversion.
| Connector checks | `from.objectId` / `from.anchor` are present | Schema draft review | Converter review | Anchor refs should remain intact across conversion.
| Connector checks | Anchor names are valid enum values | Schema draft review | Resolver diagnostic review | Invalid anchor names should be rejected or diagnosed consistently.
| Conversion checks | JSON converts to an `ObjectScene`-compatible value | Converter review | Schema draft review | Conversion should preserve the runtime contract.
| Conversion checks | Conversion does not resolve geometry | Converter review | Semantic fixture review | Geometry resolution remains the resolver's job.
| Conversion checks | Conversion does not bypass placement semantics | Converter review | Resolver diagnostic review | Placement behavior should still flow through existing passes.
| Semantic comparison checks | Resolve the JSON-converted `ObjectScene` and the TypeScript `basic` example | Semantic fixture review | Resolver diagnostic review | This is the main future parity check.
| Semantic comparison checks | Assert no error diagnostics for valid baseline fixtures | Resolver diagnostic review | Semantic fixture review | Diagnostics are the observable boundary for semantic failures.
| Boundary checks | Structural errors are handled at validation/conversion boundaries | Schema draft review | Converter review | This keeps concerns separated.
| Boundary checks | Missing referenced object ids remain resolver diagnostics unless safely detected | Resolver diagnostic review | Converter review | Safe early detection may be added later, but not assumed.
| Boundary checks | Parser syntax and parser lowering are out of scope | Documentation/API stability review | N/A | This keeps the JSON work independent from parser work.
| Out of scope / stability checks | Public format stability guarantees are deferred | Documentation/API stability review | Schema draft review | Stability claims should follow implementation, not precede it.

## 4. Future Slice Recommendations

Recommended future order:

1. Schema-shape draft only.
2. Converter skeleton for `basic` only.
3. Basic JSON fixture only.
4. Semantic equivalence test against TypeScript `basic`.
5. Diagnostics boundary tests.

This sequence keeps each pass reviewable and avoids mixing shape, conversion, and semantic behavior too early.

That sequence has now been partially realized in code for the current provisional converter and fixture set, but the lane split remains useful for future schema-validation and stability work.

## 5. Explicitly Out of Scope

This document defers:

- choosing a validator library
- writing executable schema
- parser syntax work
- parser lowering work
- round-trip serialization
- public format stability commitments