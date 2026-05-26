#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { vizxExamples } from "@vizx/examples";
import { renderSvg } from "@vizx/renderer-svg";
import { createDebugRenderScene, inspectScene, resolveScene } from "@vizx/resolver";
import { createBasicDemoScene } from "./demoScene";

async function main(): Promise<void> {
  const command = process.argv[2];
  const basicScene = createBasicDemoScene();
  const result = resolveScene(basicScene);

  if (command === "inspect") {
    const inspection = inspectScene(basicScene);
    console.log(JSON.stringify(inspection, null, 2));
    return;
  }

  if (command === "debug") {
    const outputPath = process.argv[3] ?? "examples/basic.debug.svg";
    await writeDebugExampleSvg(outputPath, result);
    reportDiagnostics(result.diagnostics);
    console.log(`Wrote ${outputPath}`);
    return;
  }

  if (command === "examples") {
    for (const example of vizxExamples) {
      const exampleResult = resolveScene(example.createScene());
      const scenePath = `examples/${example.id}.svg`;
      const debugPath = `examples/${example.id}.debug.svg`;

      await writeExampleSvg(scenePath, exampleResult);
      await writeDebugExampleSvg(debugPath, exampleResult);
      reportDiagnostics(exampleResult.diagnostics);
      console.log(`Wrote ${scenePath}`);
      console.log(`Wrote ${debugPath}`);
    }

    return;
  }

  const outputPath = process.argv[3] ?? process.argv[2] ?? "examples/basic.svg";
  await writeExampleSvg(outputPath, result);
  reportDiagnostics(result.diagnostics);

  console.log(`Wrote ${outputPath}`);
}

async function writeExampleSvg(outputPath: string, result: ReturnType<typeof resolveScene>): Promise<void> {
  const output = resolve(outputPath);
  const svg = renderSvg(result.renderScene, { pretty: true });
  await writeFile(output, svg, "utf8");
}

async function writeDebugExampleSvg(outputPath: string, result: ReturnType<typeof resolveScene>): Promise<void> {
  const output = resolve(outputPath);
  const svg = renderSvg(createDebugRenderScene(result), { pretty: true });
  await writeFile(output, svg, "utf8");
}

function reportDiagnostics(diagnostics: ReturnType<typeof resolveScene>["diagnostics"]): void {
  for (const diagnostic of diagnostics) {
    console.error(`${diagnostic.severity}: ${diagnostic.message}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
