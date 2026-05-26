# Copilot Prompt: Add Example Registry and Capability Test Harness

You are continuing development on VizX.

Current state:

- `npm run build` passes.
- `npm run test` passes.
- `npm run demo` passes.
- `npm run inspect` passes.
- `npm run debug` passes.
- `npm run debug` writes `examples/basic.debug.svg`.
- Inspection includes nested children.
- Bounding boxes, anchors, and geometry summaries all use resolved scene coordinates.
- Debug overlay is generated from resolved model data using normal render nodes.
- `DebugOverlayOptions` exists.
- `createDebugOverlay(...)` and `createDebugRenderScene(...)` accept optional debug overlay options.
- Defaults preserve the current dense debug overlay:
  - bounding boxes enabled
  - anchors enabled
  - labels enabled
  - connector endpoints enabled
  - nested children enabled
- The debug options surface is programmatic only for now.
- `npm run debug` still uses default options and writes `examples/basic.debug.svg`.
- `.tsbuildinfo` is ignored.

Please begin by reading:

- `README.md`
- `DESIGN.md`
- `ROADMAP.md` or `roadmap.md`
- `tests_and_examples.md`
- `package.json`
- `packages/cli/src/*`
- `packages/resolver/src/*`
- `packages/object-model/src/*`
- `packages/renderer-svg/src/*`
- `packages/geometry/src/*`

Do not work on parser syntax yet. Do not add flowchart semantics, graph layout, plotting, browser playground, Canvas, PDF, TikZ, nonlinear constraints, or a full constraint solver.

The goal of this pass is to add a small example registry and capability-oriented example/test harness, following the strategy described in `tests_and_examples.md`.

## Goal

Create a clean system for adding examples that are:

1. human-readable
2. reusable by tests
3. renderable through the active pipeline
4. inspectable
5. debug-renderable

The examples should still be TypeScript scene builders for now, not parser-driven source files.

Current architecture should remain:

```text
unresolved object graph
  → resolver
  → resolved scene
  → render scene graph
  → SVG output
```

## Preferred Structure

Add something like:

```text
examples-src/
  index.ts
  basic.scene.ts
  anchors.scene.ts
  nested-groups.scene.ts
  connectors.scene.ts
```

or, if the current package structure suggests a better place:

```text
packages/examples/src/
  index.ts
  basic.ts
  anchors.ts
  nestedGroups.ts
  connectors.ts
```

Choose the cleanest structure for the existing monorepo.

Each example should export enough metadata to support tests and CLI generation, such as:

```ts
export interface VizxExample {
  id: string;
  title: string;
  description: string;
  scene: VizxScene;
  expectedCapabilities: string[];
}
```

Adjust names to match current project types.

## Required Examples

Start small. Add only focused examples:

1. `basic`
   - existing demo scene
   - boxes, `rightOf` placement, connector

2. `anchors`
   - one or two objects
   - demonstrates `center`, `east`, `west`, `north`, and `south` anchors

3. `nested-groups`
   - group with children
   - demonstrates nested inspection/debug behavior

4. `connectors`
   - at least two connectors between anchored objects
   - straight connectors only

Do not make a large gallery yet.

## CLI Behavior

Update the CLI so examples can be generated consistently.

Keep the existing commands working:

```text
npm run demo
npm run inspect
npm run debug
```

Add one of these, whichever is cleaner:

Option A:

```text
npm run examples
```

which generates normal and debug SVGs for all registered examples.

Option B:

```text
npm run example -- basic
npm run example -- anchors
```

If simple argument handling already exists, support both listing and selecting examples. But do not overbuild a CLI parser.

Preferred output:

```text
examples/basic.svg
examples/basic.debug.svg
examples/anchors.svg
examples/anchors.debug.svg
examples/nested-groups.svg
examples/nested-groups.debug.svg
examples/connectors.svg
examples/connectors.debug.svg
```

If that is too much for this pass, generate only normal SVGs for all examples and keep debug generation for the built-in demo.

Important: keep `npm run debug` working exactly as it does now for the built-in/basic demo unless the example registry naturally replaces the hard-coded demo path.

If the example registry replaces the hard-coded demo path, preserve the user-facing behavior:

```text
npm run demo      # writes examples/basic.svg
npm run inspect   # inspects the basic example
npm run debug     # writes examples/basic.debug.svg
```

Do not add CLI flags for debug overlay options in this pass.

Do not add a full argument parser.

## Debug Overlay Options

Use the existing debug overlay options API where helpful.

Tests should verify that every registered example can produce:

1. a normal render scene
2. a default debug render scene
3. optionally, a minimal debug render scene using programmatic `DebugOverlayOptions`

Do not add brittle SVG snapshots for these. Prefer structural assertions that debug render scenes are nonempty and contain expected categories of render nodes.

Do not add a debug preset system unless it is directly useful for the example harness and remains very small.

## Tests

Add a capability-oriented test harness.

At minimum, tests should verify:

- every registered example has a unique id
- every registered example has a title and description
- every registered example has nonempty `expectedCapabilities`
- every registered example resolves without fatal diagnostics
- every registered example renders to a nonempty render scene
- every registered example serializes to nonempty SVG
- every registered example can be inspected
- every registered example can produce a default debug render scene
- every registered example can produce a minimal debug render scene using programmatic `DebugOverlayOptions`

Add specific tests for the new focused examples:

- anchors example exposes expected anchor names
- nested-groups example includes child inspection output
- connectors example includes resolved connector endpoint points

Avoid brittle full-SVG snapshots. Prefer structural tests.

## Capability Matrix

Add a lightweight docs file:

```text
docs/CAPABILITY_MATRIX.md
```

It should include a small table like:

```text
Capability | Unit test | Resolver test | Example | Debug overlay | Notes
```

Include current capabilities only, such as:

- rect bbox
- rect anchors
- group bbox
- nested group children
- `rightOf` placement
- straight connector
- inspect output
- debug overlay
- debug overlay options
- SVG rendering

Do not list speculative long-term capabilities except perhaps in a short "not yet implemented" section.

## README Update

Update `README.md` enough to document:

- examples are currently TypeScript scene builders
- how to run the example generation command
- how examples relate to tests
- where to look for the capability matrix

Keep README concise. Put details in `docs/CAPABILITY_MATRIX.md` or `tests_and_examples.md`.

## Important Constraints

- Do not move to parser-driven examples.
- Do not add new diagram semantics.
- Do not make tests depend on exact SVG whitespace.
- Do not make a huge visual gallery.
- Do not change resolver behavior except for small fixes discovered while making examples reusable.
- Do not break existing `demo`, `inspect`, or `debug` commands.
- Do not add CLI flags for debug overlay options.
- Do not turn this into a CLI redesign.

## Validation

Run:

```text
npm run build
npm run test
npm run demo
npm run inspect
npm run debug
```

Also run the new examples command if you add one, for example:

```text
npm run examples
```

If validation generates `.tsbuildinfo` files, remove them from the working tree unless they are intentionally tracked. Confirm `.gitignore` ignores them.

## Deliverable Summary

When finished, summarize:

- files changed
- example registry structure
- examples added
- CLI scripts added or changed
- tests added or changed
- capability matrix added
- commands run
- known limitations
- recommended next step

Keep this pass narrow. The purpose is to create a disciplined examples/test harness before expanding placement and layout features.
