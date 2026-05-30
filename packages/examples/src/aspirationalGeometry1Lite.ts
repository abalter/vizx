import { angleLabelPoint, lineLineIntersection, point } from "@vizx/geometry";
import { angleMarkPath, arrowEnd, circle, line, sceneOf, text } from "@vizx/object-model";
import type { VizxExample } from "./types";

/*
  Aspirational reproduction note:
  - Original: examples/aspirational_gallery/asymptote/geometry_1
  - Target level: Level 1 to Level 2
  - Compromises: manual coordinates and manual frame vectors; explicit helper-called intersections only;
    no source translation; no construction solver; no automatic label placement; no full visual fidelity
*/
export const aspirationalGeometry1LiteExample: VizxExample = {
  id: "aspirational-geometry-1-lite",
  title: "Aspirational geometry 1 lite",
  description:
    "Manual Level 1-2 approximation of Asymptote geometry_1 using current VizX geometry, paths, arcs, labels, and style fields.",
  expectedCapabilities: [
    "builder helpers",
    "technical geometry helpers",
    "line primitive",
    "circle primitive",
    "path arc command",
    "built-in arrow markers",
    "strokeDasharray",
    "strokeLineCap",
    "inspect output",
    "debug overlay",
  ],
  createScene: () => {
    const add = (a: { x: number; y: number }, b: { x: number; y: number }) => point(a.x + b.x, a.y + b.y);
    const scale = (v: { x: number; y: number }, s: number) => point(v.x * s, v.y * s);
    const fromBasis = (origin: { x: number; y: number }, i: { x: number; y: number }, j: { x: number; y: number }, x: number, y: number) =>
      add(origin, add(scale(i, x), scale(j, y)));

    const m = { x: 0.9, y: 1.1 };

    const origin = point(82, 184);
    const i = point(58, 0);
    const j = point(0, -58);
    const p = fromBasis(origin, i, j, m.x, m.y);

    const originPrime = point(210, 186);
    const iPrime = point(30, -30);
    const jPrime = point(-30, -30);
    const pPrimeLineA1 = add(originPrime, scale(iPrime, m.x));
    const pPrimeLineA2 = add(pPrimeLineA1, jPrime);
    const pPrimeLineB1 = add(originPrime, scale(jPrime, m.y));
    const pPrimeLineB2 = add(pPrimeLineB1, iPrime);
    const pPrime = lineLineIntersection(
      pPrimeLineA1,
      pPrimeLineA2,
      pPrimeLineB1,
      pPrimeLineB2,
    );

    if (!pPrime) {
      throw new Error("Expected non-parallel construction lines for P'");
    }

    const originDoublePrime = point(324, 188);
    const iDoublePrime = point(30, 30);
    const jDoublePrime = point(30, -30);
    const pDoublePrimeLineA1 = add(originDoublePrime, scale(iDoublePrime, m.x));
    const pDoublePrimeLineA2 = add(pDoublePrimeLineA1, jDoublePrime);
    const pDoublePrimeLineB1 = add(originDoublePrime, scale(jDoublePrime, m.y));
    const pDoublePrimeLineB2 = add(pDoublePrimeLineB1, iDoublePrime);
    const pDoublePrime = lineLineIntersection(
      pDoublePrimeLineA1,
      pDoublePrimeLineA2,
      pDoublePrimeLineB1,
      pDoublePrimeLineB2,
    );

    if (!pDoublePrime) {
      throw new Error("Expected non-parallel construction lines for P''");
    }

    const angleRadius = 24;
    const angleLabel = angleLabelPoint(origin, add(origin, i), add(origin, iPrime), angleRadius, {
      clockwise: true,
      offset: 11,
    });

    return sceneOf([
      line("geo1.axis.x", {
        start: origin,
        end: add(origin, scale(i, 1.25)),
        style: arrowEnd({ stroke: "#0f172a", strokeWidth: 1.8, strokeLineCap: "round" }),
      }),
      line("geo1.axis.y", {
        start: origin,
        end: add(origin, scale(j, 1.2)),
        style: arrowEnd({ stroke: "#0f172a", strokeWidth: 1.8, strokeLineCap: "round" }),
      }),
      line("geo1.axis.xp", {
        start: originPrime,
        end: add(originPrime, scale(iPrime, 1.3)),
        style: arrowEnd({ stroke: "#2563eb", strokeWidth: 1.8, strokeLineCap: "round" }),
      }),
      line("geo1.axis.yp", {
        start: originPrime,
        end: add(originPrime, scale(jPrime, 1.3)),
        style: arrowEnd({ stroke: "#2563eb", strokeWidth: 1.8, strokeLineCap: "round" }),
      }),
      line("geo1.axis.xpp", {
        start: originDoublePrime,
        end: add(originDoublePrime, scale(iDoublePrime, 1.2)),
        style: arrowEnd({ stroke: "#15803d", strokeWidth: 1.8, strokeLineCap: "round" }),
      }),
      line("geo1.axis.ypp", {
        start: originDoublePrime,
        end: add(originDoublePrime, scale(jDoublePrime, 1.2)),
        style: arrowEnd({ stroke: "#15803d", strokeWidth: 1.8, strokeLineCap: "round" }),
      }),
      circle("geo1.origin.circle", {
        center: origin,
        radius: 42,
        style: {
          stroke: "#cbd5e1",
          strokeWidth: 1,
          fill: "none",
          strokeDasharray: [5, 4],
        },
      }),
      line("geo1.map.p_to_pp", {
        start: p,
        end: pPrime,
        style: { stroke: "#94a3b8", strokeWidth: 1.2, strokeDasharray: [4, 3], strokeLineCap: "round" },
      }),
      line("geo1.map.pp_to_ppp", {
        start: pPrime,
        end: pDoublePrime,
        style: { stroke: "#94a3b8", strokeWidth: 1.2, strokeDasharray: [4, 3], strokeLineCap: "round" },
      }),
      angleMarkPath("geo1.angle.frame", {
        vertex: origin,
        fromPoint: add(origin, i),
        toPoint: add(origin, iPrime),
        radius: angleRadius,
        clockwise: true,
        style: { stroke: "#0f766e", strokeWidth: 1.8, fill: "none", strokeLineCap: "round" },
      }),
      circle("geo1.point.p", {
        center: p,
        radius: 3,
        style: { stroke: "#dc2626", fill: "#dc2626" },
      }),
      circle("geo1.point.pp", {
        center: pPrime,
        radius: 3,
        style: { stroke: "#2563eb", fill: "#2563eb" },
      }),
      circle("geo1.point.ppp", {
        center: pDoublePrime,
        radius: 3,
        style: { stroke: "#15803d", fill: "#15803d" },
      }),
      text("geo1.label.o", {
        center: add(origin, point(-16, 14)),
        text: "O",
        style: { fill: "#0f172a", fontSize: 11 },
      }),
      text("geo1.label.op", {
        center: add(originPrime, point(-16, 14)),
        text: "O'",
        style: { fill: "#2563eb", fontSize: 11 },
      }),
      text("geo1.label.opp", {
        center: add(originDoublePrime, point(-16, 14)),
        text: "O''",
        style: { fill: "#15803d", fontSize: 11 },
      }),
      text("geo1.label.i", {
        center: add(origin, scale(i, 1.42)),
        text: "i",
        style: { fill: "#0f172a", fontSize: 11 },
      }),
      text("geo1.label.j", {
        center: add(origin, add(scale(j, 1.35), point(-10, -6))),
        text: "j",
        style: { fill: "#0f172a", fontSize: 11 },
      }),
      text("geo1.label.ip", {
        center: add(originPrime, add(scale(iPrime, 1.45), point(10, -2))),
        text: "i'",
        style: { fill: "#2563eb", fontSize: 11 },
      }),
      text("geo1.label.jp", {
        center: add(originPrime, add(scale(jPrime, 1.45), point(-10, -2))),
        text: "j'",
        style: { fill: "#2563eb", fontSize: 11 },
      }),
      text("geo1.label.ipp", {
        center: add(originDoublePrime, add(scale(iDoublePrime, 1.35), point(8, 0))),
        text: "i''",
        style: { fill: "#15803d", fontSize: 11 },
      }),
      text("geo1.label.jpp", {
        center: add(originDoublePrime, add(scale(jDoublePrime, 1.35), point(8, 0))),
        text: "j''",
        style: { fill: "#15803d", fontSize: 11 },
      }),
      text("geo1.label.p", {
        center: add(p, point(10, -8)),
        text: "P",
        style: { fill: "#dc2626", fontSize: 11 },
      }),
      text("geo1.label.pp", {
        center: add(pPrime, point(10, -8)),
        text: "P'",
        style: { fill: "#2563eb", fontSize: 11 },
      }),
      text("geo1.label.ppp", {
        center: add(pDoublePrime, point(10, -8)),
        text: "P''",
        style: { fill: "#15803d", fontSize: 11 },
      }),
      text("geo1.label.angle", {
        center: angleLabel,
        text: "phi",
        style: { fill: "#0f766e", fontSize: 11 },
      }),
      text("geo1.caption", {
        center: point(208, 30),
        text: "Geometry 1 lite (manual coordinate-system sketch)",
        style: { fill: "#334155", fontSize: 12 },
      }),
    ]);
  },
};