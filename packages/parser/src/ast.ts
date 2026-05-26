import type { SourceSpan } from "@vizx/core";

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
