#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderSvg } from "@vizx/renderer-svg";
import { inspectScene, resolveScene } from "@vizx/resolver";
import { createBasicDemoScene } from "./demoScene";

async function main(): Promise<void> {
  const command = process.argv[2];

  if (command === "inspect") {
    const inspection = inspectScene(createBasicDemoScene());
    console.log(JSON.stringify(inspection, null, 2));
    return;
  }

  const outputPath = process.argv[3] ?? process.argv[2] ?? "examples/basic.svg";
  const output = resolve(outputPath);
  const result = resolveScene(createBasicDemoScene());
  const svg = renderSvg(result.renderScene, { pretty: true });

  await writeFile(output, svg, "utf8");

  if (result.diagnostics.length > 0) {
    for (const diagnostic of result.diagnostics) {
      console.error(`${diagnostic.severity}: ${diagnostic.message}`);
    }
  }

  console.log(`Wrote ${outputPath}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
