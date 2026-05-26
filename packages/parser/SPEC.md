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

## AST nodes

Current AST nodes:

```ts
BoxStatement
ConnectStatement
```

A `BoxStatement` can either place a box at an absolute point or place it to the right of another object.

## Lowering

The parser lowers AST to core commands:

```text
box ... at x y          -> createTextBox
box ... right_of A by d -> createTextBox + placeRightOf
connect A.east -> B.west -> connect
```
