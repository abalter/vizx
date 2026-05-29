import { readdir, readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import Ajv2020 from "ajv/dist/2020";

const SCHEMA_RELATIVE_PATH = "schemas/json-core-ir-v0.schema.json";
const FIXTURES_RELATIVE_DIR = "packages/examples/fixtures/json-core-ir-v0";

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const schemaPath = resolve(repoRoot, SCHEMA_RELATIVE_PATH);
  const fixturesDir = resolve(repoRoot, FIXTURES_RELATIVE_DIR);

  const schemaText = await readFile(schemaPath, "utf8");
  const schema = JSON.parse(schemaText) as object;

  const fixturePaths = await findJsonFiles(fixturesDir);

  if (fixturePaths.length === 0) {
    throw new Error(`No JSON fixture files found in ${FIXTURES_RELATIVE_DIR}.`);
  }

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const failures: string[] = [];

  for (const fixturePath of fixturePaths) {
    const fixtureText = await readFile(fixturePath, "utf8");
    const fixture = JSON.parse(fixtureText) as unknown;
    const isValid = validate(fixture);

    if (!isValid) {
      const displayPath = relative(repoRoot, fixturePath);
      const errorLines = (validate.errors ?? [])
        .map((error) => `${error.instancePath || "/"} ${error.message || "validation error"}`)
        .join("\n");
      failures.push(`${displayPath}\n${errorLines || "unknown validation error"}`);
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`Schema validation failed:\n${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `Validated ${fixturePaths.length} JSON Core IR fixture files against ${SCHEMA_RELATIVE_PATH}.`,
  );
}

async function findJsonFiles(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = resolve(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...await findJsonFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  files.sort();
  return files;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
