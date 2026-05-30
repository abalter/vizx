export interface Style {
  readonly stroke?: string;
  readonly fill?: string;
  readonly strokeWidth?: number;
  readonly strokeDasharray?: readonly number[];
  readonly strokeLineCap?: "butt" | "round" | "square";
  readonly strokeLineJoin?: "miter" | "round" | "bevel";
  readonly fillRule?: "nonzero" | "evenodd";
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly textAnchor?: "start" | "middle" | "end";
  readonly dominantBaseline?: string;
  readonly opacity?: number;
  readonly markerStart?: string;
  readonly markerEnd?: string;
}

export const defaultBoxStyle: Style = {
  stroke: "black",
  fill: "white",
  strokeWidth: 1,
  fontFamily: "system-ui, sans-serif",
  fontSize: 14,
};

export const defaultLineStyle: Style = {
  stroke: "black",
  fill: "none",
  strokeWidth: 1,
};

export const defaultConnectorStyle: Style = {
  stroke: "black",
  fill: "none",
  strokeWidth: 1.5,
  markerEnd: "arrow",
};
