import type { ObjectScene } from "@vizx/object-model";

export type VizxExampleReproductionLevel = "Technical" | "Level 1" | "Level 2" | "Level 1-2" | "Level 3";

export type VizxExampleHelperFamily =
  | "primitives"
  | "paths/Bezier"
  | "circular arcs / angle marks"
  | "intersections"
  | "tangents"
  | "common tangents"
  | "segment/ray clipping"
  | "annotation helpers"
  | "belt/pulley path"
  | "style fields"
  | "connectors/placement";

export type VizxExampleCompromise =
  | "manual coordinates"
  | "no source translation"
  | "no solver"
  | "no automatic layout"
  | "no mechanics/physics simulation"
  | "no full visual fidelity"
  | "no clipping/gradients"
  | "no parser/JSON/AST support";

export interface VizxExample {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly expectedCapabilities: readonly string[];
  readonly sourcePath?: string;
  readonly reproductionLevel?: VizxExampleReproductionLevel;
  readonly helperFamilies?: readonly VizxExampleHelperFamily[];
  readonly compromises?: readonly VizxExampleCompromise[];
  readonly createScene: () => ObjectScene;
}