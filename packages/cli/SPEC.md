# @vizx/cli Specification

`@vizx/cli` provides a command-line development entry point for the VizX pipeline.

## Responsibilities

- Read a `.vizx` source file.
- Parse it to AST.
- Lower it to core commands.
- Evaluate it to a resolved diagram.
- Lower to render scene.
- Render SVG.
- Write output file.

## Usage

```bash
vizx input.vizx output.svg
```

During development, from the repository root:

```bash
npm run demo
```

## Future options

```text
--dump-ast
--dump-core
--dump-diagram
--dump-scene
--pretty false
--watch
```
