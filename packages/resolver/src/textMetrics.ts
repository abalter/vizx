export interface TextMetricsOptions {
  readonly fontSize?: number;
}

export interface SimpleTextMetrics {
  readonly width: number;
  readonly height: number;
  readonly baselineOffset: number;
}

export function measureTextApprox(text: string, options: TextMetricsOptions = {}): SimpleTextMetrics {
  const fontSize = options.fontSize ?? 14;

  return {
    width: text.length * fontSize * 0.6,
    height: fontSize * 1.2,
    baselineOffset: fontSize * 0.35,
  };
}