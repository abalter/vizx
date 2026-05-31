import type { ExampleGalleryManifest } from "./exampleGalleryManifest";

interface PreviewPaths {
  readonly svgPath: string;
  readonly debugSvgPath: string;
  readonly hasSvg: boolean;
  readonly hasDebugSvg: boolean;
}

interface CreateExampleGalleryHtmlOptions {
  readonly generatedAtIso?: string;
  readonly previewsById?: Readonly<Record<string, PreviewPaths>>;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function categoryLabel(id: string): "Aspirational" | "Technical" {
  return id.startsWith("technical-") ? "Technical" : "Aspirational";
}

export function createExampleGalleryHtml(
  manifest: ExampleGalleryManifest,
  options?: CreateExampleGalleryHtmlOptions,
): string {
  const generatedAt = options?.generatedAtIso ?? new Date().toISOString();

  const sortedExamples = [...manifest.examples].sort((a, b) => a.id.localeCompare(b.id));

  const cards = sortedExamples
    .map((entry) => {
      const preview = options?.previewsById?.[entry.id];
      const previewPanel = preview
        ? `<div class="preview-grid">${[
            `<div class="preview-cell"><h4>Scene</h4>${
              preview.hasSvg
                ? `<img src="${escapeHtml(preview.svgPath)}" alt="${escapeHtml(entry.id)} scene preview" loading="lazy" />`
                : "<p class=\"preview-missing\">Preview missing. Run npm run examples to refresh SVG outputs.</p>"
            }</div>`,
            `<div class="preview-cell"><h4>Debug</h4>${
              preview.hasDebugSvg
                ? `<img src="${escapeHtml(preview.debugSvgPath)}" alt="${escapeHtml(entry.id)} debug preview" loading="lazy" />`
                : "<p class=\"preview-missing\">Debug preview missing. Run npm run examples to refresh SVG outputs.</p>"
            }</div>`,
          ].join("")}</div>`
        : "";

      return `<article class="card">${[
        `<h2>${escapeHtml(entry.title)} <span class=\"badge ${categoryLabel(entry.id).toLowerCase()}\">${categoryLabel(entry.id)}</span></h2>`,
        `<p class="id">${escapeHtml(entry.id)}</p>`,
        `<p>${escapeHtml(entry.description)}</p>`,
        `<dl>${[
          `<dt>Source</dt><dd>${escapeHtml(entry.sourcePath ?? "internal technical example")}</dd>`,
          `<dt>Reproduction Level</dt><dd>${escapeHtml(entry.reproductionLevel ?? "unspecified")}</dd>`,
          `<dt>Helper Families</dt><dd>${entry.helperFamilies.map((value) => escapeHtml(value)).join(", ")}</dd>`,
          `<dt>Compromises</dt><dd>${entry.compromises.map((value) => escapeHtml(value)).join(", ")}</dd>`,
        ].join("")}</dl>`,
        previewPanel,
      ].join("")}</article>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>VizX Example Gallery</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f8fafc;
      --fg: #0f172a;
      --muted: #475569;
      --card: #ffffff;
      --border: #cbd5e1;
      --asp: #0369a1;
      --tech: #15803d;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
      background: radial-gradient(circle at 20% 0%, #e0f2fe 0%, var(--bg) 40%);
      color: var(--fg);
      line-height: 1.5;
    }
    main {
      max-width: 1100px;
      margin: 0 auto;
      padding: 1.5rem;
    }
    h1 {
      margin: 0;
      font-size: clamp(1.6rem, 2.2vw, 2.3rem);
    }
    .meta {
      margin-top: 0.5rem;
      color: var(--muted);
      font-size: 0.95rem;
    }
    .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      margin-top: 1.25rem;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1rem;
      box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
    }
    .card h2 {
      margin: 0;
      font-size: 1.05rem;
      display: flex;
      gap: 0.55rem;
      align-items: baseline;
      flex-wrap: wrap;
    }
    .badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.14rem 0.46rem;
      border-radius: 999px;
      border: 1px solid currentColor;
    }
    .badge.aspirational { color: var(--asp); }
    .badge.technical { color: var(--tech); }
    .id {
      margin: 0.3rem 0 0.6rem;
      color: var(--muted);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.88rem;
    }
    dl {
      display: grid;
      grid-template-columns: 9.5rem 1fr;
      gap: 0.26rem 0.5rem;
      margin: 0.75rem 0 0;
      font-size: 0.92rem;
    }
    dt { color: var(--muted); }
    dd { margin: 0; }
    .preview-grid {
      margin-top: 0.9rem;
      display: grid;
      gap: 0.75rem;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    }
    .preview-cell {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.55rem;
      background: #f8fafc;
    }
    .preview-cell h4 {
      margin: 0 0 0.45rem;
      font-size: 0.84rem;
      color: #334155;
    }
    .preview-cell img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
    }
    .preview-missing {
      margin: 0;
      font-size: 0.84rem;
      color: #b45309;
    }
    @media (max-width: 720px) {
      main { padding: 1rem; }
      dl { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <h1>VizX Example Gallery</h1>
    <p class="meta">Generated from ${escapeHtml(manifest.generatedFrom)} at ${escapeHtml(generatedAt)}.</p>
    <p class="meta">Included prefixes: ${manifest.includedPrefixes.map((prefix) => escapeHtml(prefix)).join(", ")}</p>
    <section class="grid">
      ${cards}
    </section>
  </main>
</body>
</html>`;
}