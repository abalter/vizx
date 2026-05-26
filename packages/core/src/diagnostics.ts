import type { SourceSpan } from "./errors";

export type DiagnosticSeverity = "info" | "warning" | "error";

export interface Diagnostic {
  readonly severity: DiagnosticSeverity;
  readonly message: string;
  readonly span?: SourceSpan;
}

export interface Result<T> {
  readonly value?: T;
  readonly diagnostics: readonly Diagnostic[];
}