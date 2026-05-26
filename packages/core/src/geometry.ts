export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Vector {
  readonly dx: number;
  readonly dy: number;
}

export interface BoundingBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type CompassAnchor =
  | "center"
  | "north"
  | "south"
  | "east"
  | "west"
  | "north_east"
  | "north_west"
  | "south_east"
  | "south_west";

export type AnchorName = CompassAnchor | "baseline" | string;

export interface AnchorRef {
  readonly objectId: string;
  readonly anchorName: AnchorName;
}

export const point = (x: number, y: number): Point => ({ x, y });
export const vector = (dx: number, dy: number): Vector => ({ dx, dy });

export function addVector(p: Point, v: Vector): Point {
  return { x: p.x + v.dx, y: p.y + v.dy };
}

export function subtractPoints(a: Point, b: Point): Vector {
  return { dx: a.x - b.x, dy: a.y - b.y };
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function rectFromCenter(center: Point, width: number, height: number): BoundingBox {
  return {
    x: center.x - width / 2,
    y: center.y - height / 2,
    width,
    height,
  };
}

export function anchorOnBox(box: BoundingBox, anchorName: AnchorName): Point {
  const left = box.x;
  const right = box.x + box.width;
  const top = box.y;
  const bottom = box.y + box.height;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  switch (anchorName) {
    case "center": return { x: cx, y: cy };
    case "north": return { x: cx, y: top };
    case "south": return { x: cx, y: bottom };
    case "east": return { x: right, y: cy };
    case "west": return { x: left, y: cy };
    case "north_east": return { x: right, y: top };
    case "north_west": return { x: left, y: top };
    case "south_east": return { x: right, y: bottom };
    case "south_west": return { x: left, y: bottom };
    case "baseline": return { x: cx, y: cy };
    default:
      throw new Error(`Unknown box anchor: ${anchorName}`);
  }
}
