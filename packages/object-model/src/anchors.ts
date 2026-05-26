import type { BoundingBox, Point } from "@vizx/geometry";

export type AnchorName =
  | "center"
  | "north"
  | "south"
  | "east"
  | "west"
  | "northEast"
  | "northWest"
  | "southEast"
  | "southWest"
  | "baseline";

export interface AnchorRef {
  readonly objectId: string;
  readonly anchor: AnchorName;
}

export type AnchorMap = Partial<Record<AnchorName, Point>>;

export function anchorFromBoundingBox(box: BoundingBox, anchor: AnchorName): Point {
  const left = box.x;
  const right = box.x + box.width;
  const top = box.y;
  const bottom = box.y + box.height;
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  switch (anchor) {
    case "center":
      return { x: centerX, y: centerY };
    case "north":
      return { x: centerX, y: top };
    case "south":
      return { x: centerX, y: bottom };
    case "east":
      return { x: right, y: centerY };
    case "west":
      return { x: left, y: centerY };
    case "northEast":
      return { x: right, y: top };
    case "northWest":
      return { x: left, y: top };
    case "southEast":
      return { x: right, y: bottom };
    case "southWest":
      return { x: left, y: bottom };
    case "baseline":
      return { x: centerX, y: centerY };
  }
}