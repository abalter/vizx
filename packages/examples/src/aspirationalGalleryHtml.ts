import type { AspirationalGalleryManifest } from "./aspirationalGalleryManifest";

export interface AspirationalGalleryHtmlPreviewInfo {
  readonly svgPath: string;
  readonly debugSvgPath: string;
  readonly hasSvg: boolean;
  readonly hasDebugSvg: boolean;
}

export interface AspirationalGalleryHtmlOptions {
  readonly generatedAtIso?: string;
  readonly previewsById?: Readonly<Record<string, AspirationalGalleryHtmlPreviewInfo>>;
  readonly title?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderList(items: readonly string[]): string {
  if (items.length === 0) {
    return '<li class="muted">none</li>';
  }

  return items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("\n");
}

function previewFor(
  id: string,
  previewsById: Readonly<Record<string, AspirationalGalleryHtmlPreviewInfo>>,
): AspirationalGalleryHtmlPreviewInfo {
  const preview = previewsById[id];

  return preview ?? {
    svgPath: `./${id}.svg`,
    debugSvgPath: `./${id}.debug.svg`,
    hasSvg: false,
    hasDebugSvg: false,
  };
}

export function createAspirationalGalleryHtml(
  manifest: AspirationalGalleryManifest,
  options: AspirationalGalleryHtmlOptions = {},
): string {
  const title = options.title ?? "VizX Aspirational Gallery";
  const generatedAtIso = options.generatedAtIso ?? "unknown";
  const previewsById = options.previewsById ?? {};

  const examples = manifest.examples
    .filter((example) => example.id.startsWith("aspirational-"))
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));

  const cards = examples
    .map((example) => {
      const preview = previewFor(example.id, previewsById);
      const imageMarkup = preview.hasSvg
        ? `<img class="preview-image" src="${escapeHtml(preview.svgPath)}" alt="${escapeHtml(example.title)} preview" loading="lazy" />`
        : '<div class="preview-missing">Preview missing. Run npm run examples to refresh SVG outputs.</div>';

      const debugLink = preview.hasDebugSvg
        ? `<a href="${escapeHtml(preview.debugSvgPath)}">Debug SVG</a>`
        : '<span class="muted">Debug SVG missing</span>';

      return [
        '<article class="card">',
        `  <h2>${escapeHtml(example.title)}</h2>`,
        `  <p class="id"><strong>ID:</strong> ${escapeHtml(example.id)}</p>`,
        `  <p><strong>Reproduction level:</strong> ${escapeHtml(example.reproductionLevel)}</p>`,
        `  <p><strong>Source path:</strong> <span class="path">${escapeHtml(example.sourcePath)}</span></p>`,
        '  <div class="preview">',
        `    ${imageMarkup}`,
        "  </div>",
        '  <p class="links">',
        `    <a href="${escapeHtml(preview.svgPath)}">Normal SVG</a>`,
        "    |",
        `    ${debugLink}`,
        "  </p>",
        `  <p>${escapeHtml(example.description)}</p>`,
        '  <section>',
        "    <h3>Helper families</h3>",
        "    <ul>",
        renderList(example.helperFamilies),
        "    </ul>",
        "  </section>",
        '  <section>',
        "    <h3>Compromises</h3>",
        "    <ul>",
        renderList(example.compromises),
        "    </ul>",
        "  </section>",
        "</article>",
      ].join("\n");
    })
    .join("\n\n");

  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    `  <title>${escapeHtml(title)}</title>`,
    "  <style>",
    "    :root {",
    "      --bg: #f7f7f3;",
    "      --surface: #ffffff;",
    "      --ink: #17212b;",
    "      --muted: #5b6570;",
    "      --line: #d7dde3;",
    "      --accent: #0f766e;",
    "      --shadow: 0 8px 24px rgba(23, 33, 43, 0.08);",
    "    }",
    "    * { box-sizing: border-box; }",
    "    body {",
    "      margin: 0;",
    "      font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;",
    "      color: var(--ink);",
    "      background: radial-gradient(circle at 15% 0%, #eef6f5 0%, var(--bg) 45%), var(--bg);",
    "    }",
    "    main {",
    "      max-width: 1200px;",
    "      margin: 0 auto;",
    "      padding: 28px 20px 36px;",
    "    }",
    "    header {",
    "      margin-bottom: 24px;",
    "      padding: 20px;",
    "      background: linear-gradient(135deg, #ffffff 0%, #edf4f3 100%);",
    "      border: 1px solid var(--line);",
    "      border-radius: 16px;",
    "      box-shadow: var(--shadow);",
    "    }",
    "    h1 { margin: 0 0 8px; font-size: 1.7rem; }",
    "    p { margin: 8px 0; line-height: 1.45; }",
    "    .meta { color: var(--muted); font-size: 0.95rem; }",
    "    .grid {",
    "      display: grid;",
    "      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));",
    "      gap: 18px;",
    "    }",
    "    .card {",
    "      border: 1px solid var(--line);",
    "      border-radius: 14px;",
    "      padding: 14px;",
    "      background: var(--surface);",
    "      box-shadow: var(--shadow);",
    "      display: flex;",
    "      flex-direction: column;",
    "      gap: 6px;",
    "    }",
    "    .card h2 { margin: 0; font-size: 1.15rem; }",
    "    .id { color: var(--muted); margin: 2px 0; }",
    "    .path { font-family: 'IBM Plex Mono', 'Consolas', monospace; font-size: 0.9rem; }",
    "    .preview {",
    "      border: 1px solid var(--line);",
    "      border-radius: 10px;",
    "      padding: 8px;",
    "      background: #fcfcfa;",
    "      min-height: 148px;",
    "      display: flex;",
    "      align-items: center;",
    "      justify-content: center;",
    "    }",
    "    .preview-image { max-width: 100%; max-height: 240px; }",
    "    .preview-missing { color: var(--muted); text-align: center; font-size: 0.95rem; }",
    "    .links { margin: 4px 0; }",
    "    a { color: var(--accent); text-decoration-thickness: 1.5px; }",
    "    ul { margin: 6px 0 2px 18px; padding: 0; }",
    "    h3 { margin: 8px 0 2px; font-size: 0.98rem; }",
    "    .muted { color: var(--muted); }",
    "    footer { margin-top: 20px; color: var(--muted); font-size: 0.92rem; }",
    "    @media (max-width: 620px) {",
    "      main { padding: 18px 12px 24px; }",
    "      header { padding: 14px; }",
    "      .card { padding: 12px; }",
    "    }",
    "  </style>",
    "</head>",
    "<body>",
    "  <main>",
    "    <header>",
    `      <h1>${escapeHtml(title)}</h1>`,
    "      <p>Static metadata and rendered-output review page for current aspirational examples.</p>",
    `      <p class=\"meta\">Generated from ${escapeHtml(manifest.generatedFrom)} | manifest v${manifest.version} | generated ${escapeHtml(generatedAtIso)}</p>`,
    "      <p class=\"meta\">This page is review tooling only. It is not source translation and does not guarantee source-fidelity parity.</p>",
    "    </header>",
    '    <section class="grid">',
    cards,
    "    </section>",
    "    <footer>",
    "      Preview links are relative to the examples directory. Missing previews are non-fatal and indicate outputs were not generated yet.",
    "    </footer>",
    "  </main>",
    "</body>",
    "</html>",
    "",
  ].join("\n");
}
