import type { AnchorName, AnchorRef, BoundingBox, Point } from "./geometry";
import type { Style } from "./style";

export interface ResolvedDiagram {
  readonly objects: readonly DiagramObject[];
  readonly connectors: readonly ConnectorObject[];
}

export type DiagramObject = TextBoxObject;

export interface TextBoxObject {
  readonly kind: "textBox";
  readonly id: string;
  readonly label: string;
  readonly center: Point;
  readonly box: BoundingBox;
  readonly textPosition: Point;
  readonly anchors: Readonly<Record<AnchorName, Point>>;
  readonly style: Style;
}

export interface ConnectorObject {
  readonly kind: "connector";
  readonly id: string;
  readonly from: AnchorRef;
  readonly to: AnchorRef;
  readonly start: Point;
  readonly end: Point;
  readonly style: Style;
}
