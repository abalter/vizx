# @vizx/parser Specification

`@vizx/parser` translates human-facing VizX source into an AST and then lowers the AST into `@vizx/core` commands.

## Responsibilities

- Tokenize/parse source syntax.
- Preserve source locations for diagnostics.
- Produce AST nodes that reflect user syntax.
- Lower AST to canonical core commands.

## Non-responsibilities

- Resolving geometry.
- Measuring text.
- Rendering SVG.
- Deciding the final language syntax.

## Current MVP syntax

```vizx
box A "Raw data" at 60 40
box B "Clean / transform" right_of A by 120
connect A.east -> B.west
```

This source syntax surface remains intentionally minimal and is not yet expanded to cover the full runtime/Core IR model.

## AST nodes

Current AST nodes:

```ts
BoxStatement
ConnectStatement
```

In addition to source-syntax AST nodes above, the parser package also exposes a syntax-neutral direct scene AST scaffold (`VizxAstScene`) used for lowering/model parity work. That scaffold currently represents broader object/path/style/transform surfaces without making them user-facing syntax.

A `BoxStatement` can either place a box at an absolute point or place it to the right of another object.

## Lowering

The parser lowers AST to core commands:

```text
box ... at x y          -> createTextBox
box ... right_of A by d -> createTextBox + placeRightOf
connect A.east -> B.west -> connect
```
