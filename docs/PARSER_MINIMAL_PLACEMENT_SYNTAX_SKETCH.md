# Minimal Placement Syntax Sketch

This note sketches one possible experimental source form for a minimal placement-only parser front end.

Status:

- experimental design sketch only
- not public or stable syntax
- no parser implementation exists yet
- direct AST lowering remains the currently implemented path

See [PARSER_AST_LOWERING_CHECKPOINT.md](./PARSER_AST_LOWERING_CHECKPOINT.md) for the current direct AST-to-`ObjectScene` checkpoint, and [PARSER_LOWERING_CONTRACT.md](./PARSER_LOWERING_CONTRACT.md) for the broader parser-readiness boundary.

## 1. Purpose

The intent is to sketch a minimal source form that could later lower into the existing direct AST shape and then into `ObjectScene`.

This is only a design sketch. It does not define a final grammar, parser API, or diagnostics model.

## 2. Target Slice

This sketch targets only the `relative-placement` fixture family.

It covers:

- `group` objects
- text child objects
- rect child objects
- placement relations:
  - `absolute`
  - `rightOf`
  - `leftOf`
  - `above`
  - `below`
- connectors

It intentionally excludes alignment and distribution syntax.

## 3. Example Source Sketch

One tentative source shape could look like this:

```text
scene {
  group Center at (180, 120) {
    text Center.label "Center"
    rect Center.frame fitToText Center.label padding(12, 10) radius(6)
  }

  group Right rightOf Center.east by 44 {
    text Right.label "Right"
    rect Right.frame fitToText Right.label padding(12, 10) radius(6)
  }

  group Left leftOf Center.west by 44 {
    text Left.label "Left"
    rect Left.frame fitToText Left.label padding(12, 10) radius(6)
  }

  group Above above Center.north by 36 {
    text Above.label "Above"
    rect Above.frame fitToText Above.label padding(12, 10) radius(6)
  }

  group Below below Center.south by 36 {
    text Below.label "Below"
    rect Below.frame fitToText Below.label padding(12, 10) radius(6)
  }

  connect Center.east -> Right.west
  connect Center.west -> Left.east
  connect Center.north -> Above.south
  connect Center.south -> Below.north
}
```

This is deliberately tentative. It is meant to illustrate shape, not commit to tokenization or keywords.

## 4. Lowering Target

If a future parser accepted a source form like the sketch above, the intended lowering path would be:

source text -> parser AST -> lowerAstToObjectScene -> ObjectScene -> resolver

The parser AST would preserve explicit ids, child structure, placement relations, and connector refs. `lowerAstToObjectScene` would map that structured AST into the existing `ObjectScene` model, and the resolver would apply placement semantics and diagnostics.

## 5. Syntax Design Principles

Any eventual syntax should favor:

- explicit ids
- explicit relations
- explicit anchor references
- minimal implicit behavior
- easy lowering into Core IR
- no renderer-specific concepts
- no SVG-specific syntax

## 6. Open Questions

Open design questions include:

- block syntax vs expression syntax
- how much shorthand to allow
- how to represent child objects
- how to represent labels/text
- whether connectors should be inline or separate
- whether anchors should use dot syntax, object/anchor pairs, or another form

## 7. Out of Scope

Explicitly deferred here:

- parser implementation
- final grammar
- parser diagnostics
- source-string tests
- alignment syntax
- distribution syntax
- style syntax
- round-trip formatting
- public syntax stability
