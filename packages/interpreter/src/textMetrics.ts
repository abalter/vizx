export interface TextMetricsOptions {
  readonly fontSize?: number;
  readonly averageCharacterWidthFactor?: number;
  readonly lineHeightFactor?: number;
}

export interface SimpleTextMetrics {
  readonly width: number;
  readonly height: number;
  readonly baselineOffset: number;
}

export function measureTextApprox(
  text: string,
  options: TextMetricsOptions = {},
): SimpleTextMetrics {
  const fontSize = options.fontSize ?? 14;
  const averageCharacterWidthFactor = options.averageCharacterWidthFactor ?? 0.56;
  const lineHeightFactor = options.lineHeightFactor ?? 1.25;

  return {
    width: text.length * fontSize * averageCharacterWidthFactor,
    height: fontSize * lineHeightFactor,
    baselineOffset: fontSize * 0.35,
  };
}
