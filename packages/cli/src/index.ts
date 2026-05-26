#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { evaluateProgram, diagramToRenderScene } from "@vizx/interpreter";
import { lowerAstToCore, parseVizxSource } from "@vizx/parser";
import { renderSvg } from "@vizx/renderer-svg";

async function main(): Promise<void> {
  const inputPath = process.argv[2] ?? "examples/basic.vizx";
  const outputPath = process.argv[3] ?? "examples/basic.svg";

  const input = resolve(inputPath);
  const output = resolve(outputPath);

  const source = await readFile(input, "utf8");
  const ast = parseVizxSource(source, inputPath);
  const core = lowerAstToCore(ast);
  const diagram = evaluateProgram(core);
  const scene = diagramToRenderScene(diagram);
  const svg = renderSvg(scene, { pretty: true });

  await writeFile(output, svg, "utf8");
  console.log(`Wrote ${outputPath}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
