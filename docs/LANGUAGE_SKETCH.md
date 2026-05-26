# VizX Language Sketch

The VizX surface syntax is not finalized. This document captures provisional syntax ideas only.

## MVP syntax

The current parser only recognizes a small line-oriented sketch language:

```vizx
box A "Raw data" at 60 40
box B "Clean / transform" right_of A by 120
connect A.east -> B.west
```

This is intentionally small. It exists only to exercise the pipeline.

## Possible future syntax

```vizx
style box_style:
  stroke: black
  fill: none
  radius: 4pt
  padding: 6pt

component Box(label):
  t = Text(label)
  r = Rect.around(t, padding=6pt, radius=4pt)
  return Group(r, t):
    anchors:
      center = r.center
      east = r.east
      west = r.west

A = Box("Raw data")
B = Box("Clean / transform")

place A at (0cm, 0cm)
place B.west right_of A.east by 2cm
connect A.east to B.west
```

## Design constraints for syntax

The surface syntax should make these concepts easy:

- create named objects,
- refer to anchors,
- place objects relative to anchors,
- define reusable components,
- define styles,
- compute geometry,
- lower cleanly to a small core IR.

Syntax should not determine the architecture. The core model should.
