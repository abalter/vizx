export interface SourceSpan {
  file?: string;
  line?: number;
  column?: number;
  length?: number;
}

export class VizxError extends Error {
  readonly span: SourceSpan | undefined;

  constructor(message: string, span?: SourceSpan) {
    super(message);
    this.name = "VizxError";
    this.span = span;
  }
}
