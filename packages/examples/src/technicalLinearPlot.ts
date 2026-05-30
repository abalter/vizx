import { mapDataPoint, point, type PlotFrame } from "@vizx/geometry";
import { polyline, rect, sceneOf, text, xAxis, yAxis } from "@vizx/object-model";
import type { VizxExample } from "./types";

export const technicalLinearPlotExample: VizxExample = {
  id: "technical-linear-plot",
  title: "Technical linear plot",
  description:
    "Demonstrates v0 linear scale + plot-frame mapping helpers with minimal axis helpers and an explicit data series.",
  expectedCapabilities: [
    "linearScale helper",
    "plot frame mapping helper",
    "xAxis helper",
    "yAxis helper",
    "polyline primitive",
    "strokeDasharray",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => {
    const frame: PlotFrame = {
      xDomain: [0, 10],
      yDomain: [60, 130],
      xRange: [70, 350],
      yRange: [220, 70],
    };
    const data = [82, 90, 100, 97, 70, 75, 93, 103, 115, 121, 119];
    const seriesPoints = data.map((value, index) => mapDataPoint(frame, { x: index, y: value }));

    return sceneOf([
      rect("plot.frame", {
        center: point((frame.xRange[0] + frame.xRange[1]) / 2, (frame.yRange[0] + frame.yRange[1]) / 2),
        width: frame.xRange[1] - frame.xRange[0],
        height: frame.yRange[0] - frame.yRange[1],
        style: { stroke: "#94a3b8", strokeWidth: 1, fill: "none" },
      }),
      ...xAxis("plot.x", frame, {
        axisValue: 60,
        tickValues: [0, 2, 4, 6, 8, 10],
        tickSize: 8,
        labelOffset: 14,
        gridLines: true,
        axisStyle: { stroke: "#0f172a", strokeWidth: 1.5 },
        tickStyle: { stroke: "#334155", strokeWidth: 1 },
        gridStyle: { stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: [4, 4] },
        labelStyle: { fill: "#334155", fontSize: 10 },
      }),
      ...yAxis("plot.y", frame, {
        axisValue: 0,
        tickValues: [60, 80, 100, 120],
        tickSize: 8,
        labelOffset: 16,
        axisStyle: { stroke: "#0f172a", strokeWidth: 1.5 },
        tickStyle: { stroke: "#334155", strokeWidth: 1 },
        labelStyle: { fill: "#334155", fontSize: 10 },
      }),
      polyline("plot.series", {
        points: seriesPoints,
        style: {
          stroke: "#0f766e",
          strokeWidth: 2,
          fill: "none",
          strokeLineCap: "round",
          strokeLineJoin: "round",
        },
      }),
      text("plot.annotation", {
        center: point(276, 86),
        text: "sample trend",
        style: { fill: "#0f766e", fontSize: 11 },
      }),
      text("plot.title", {
        center: point(210, 34),
        text: "Technical linear plot (v0 helper slice)",
        style: { fill: "#0f172a", fontSize: 12 },
      }),
    ]);
  },
};