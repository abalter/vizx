import type { SourceSpan } from "@vizx/core";
import type { AnchorName } from "@vizx/object-model";

export interface AstProgram {
  readonly kind: "program";
  readonly statements: readonly AstStatement[];
}

export type AstStatement = BoxStatement | ConnectStatement;

export interface BoxStatement {
  readonly kind: "box";
  readonly id: string;
  readonly label: string;
  readonly placement:
    | { readonly kind: "absolute"; readonly x: number; readonly y: number }
    | { readonly kind: "rightOf"; readonly referenceId: string; readonly distance: number }
    | { readonly kind: "none" };
  readonly span?: SourceSpan;
}

export interface ConnectStatement {
  readonly kind: "connect";
  readonly fromObjectId: string;
  readonly fromAnchorName: string;
  readonly toObjectId: string;
  readonly toAnchorName: string;
  readonly span?: SourceSpan;
}

export interface VizxAstPoint {
  readonly x: number;
  readonly y: number;
}

export interface VizxAstAnchorRef {
  readonly objectId: string;
  readonly anchor: AnchorName;
}

export interface VizxAstAbsolutePlacement {
  readonly kind: "absolute";
  readonly position: VizxAstPoint;
}

export interface VizxAstRelativePlacement {
  readonly kind: "rightOf" | "leftOf" | "above" | "below";
  readonly reference: VizxAstAnchorRef;
  readonly gap: number;
}

export type VizxAstPlacement = VizxAstAbsolutePlacement | VizxAstRelativePlacement;

export interface VizxAstBaseObject {
  readonly id: string;
  readonly placement?: VizxAstPlacement;
}

export interface VizxAstRectFitToText {
  readonly textId: string;
  readonly paddingX: number;
  readonly paddingY: number;
}

export interface VizxAstRectObject extends VizxAstBaseObject {
  readonly kind: "rect";
  readonly fitToText: VizxAstRectFitToText;
  readonly rx?: number;
  readonly ry?: number;
}

export interface VizxAstTextObject extends VizxAstBaseObject {
  readonly kind: "text";
  readonly center: VizxAstPoint;
  readonly text: string;
}

export interface VizxAstGroupObject extends VizxAstBaseObject {
  readonly kind: "group";
  readonly children: readonly VizxAstObject[];
}

export type VizxAstObject = VizxAstRectObject | VizxAstTextObject | VizxAstGroupObject;

export interface VizxAstConnector {
  readonly kind: "connector";
  readonly id: string;
  readonly from: VizxAstAnchorRef;
  readonly to: VizxAstAnchorRef;
}

export interface VizxAstScene {
  readonly kind: "scene";
  readonly objects: readonly VizxAstObject[];
  readonly connectors?: readonly VizxAstConnector[];
}
