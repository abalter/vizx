# Mechanism/Linkage Helper Plan (v0)

This document defines the bounded static mechanism/linkage authoring slice inspired by the current aspirational mechanism example.

Status:

- scope: implementation-facing v0 example note
- runtime object-model changes: none
- parser/JSON Core IR/AST changes: none
- dependencies: none

## 1. Purpose

Keep a small, explicit authoring surface for static linkage schematics.

The first slice is intentionally narrow:

- explicit author-called construction
- emits existing primitives, paths, and annotation helpers only
- no new runtime object kinds
- no solver behavior
- no mechanics/kinematics simulation
- no animation
- no source-language translation

## 2. v0 Coverage

Current example coverage can already express a static linkage/mechanism schematic using:

- `circleCircleIntersections(...)` for joint construction points
- `line(...)` for bars and guide axes
- `circle(...)` for pivots and construction guides
- `angleMarkPath(...)` and `angleLabelPoint(...)` for crank-angle annotation
- `labelAlongSegment(...)` and `segmentTickMarks(...)` for equal-length link cues
- ordinary text labels for joint naming

This slice does not require a new builder helper layer yet.

## 3. Semantics

Bounded static semantics:

- one or more pivots remain author-chosen
- derived joint points come from explicit intersection helpers
- linkage bars are ordinary line or path objects
- construction circles and guide axes are ordinary visual guides
- the output is a static schematic only

## 4. Deferred

Explicitly deferred from this slice:

- kinematic solving
- joint constraints or linkage simulation
- motion playback or animation
- automatic inference of linkage closure
- bar thickness or mechanical tolerances
- parser syntax
- JSON Core IR support
- parser AST support
- source-language translation