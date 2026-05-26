export type Unit = "px" | "pt" | "cm" | "mm" | "in";

export interface Length {
  readonly value: number;
  readonly unit: Unit;
}

export const px = (value: number): Length => ({ value, unit: "px" });
export const pt = (value: number): Length => ({ value, unit: "pt" });
export const cm = (value: number): Length => ({ value, unit: "cm" });
export const mm = (value: number): Length => ({ value, unit: "mm" });
export const inch = (value: number): Length => ({ value, unit: "in" });

export function toPx(length: Length): number {
  switch (length.unit) {
    case "px": return length.value;
    case "pt": return length.value * (96 / 72);
    case "in": return length.value * 96;
    case "cm": return length.value * (96 / 2.54);
    case "mm": return length.value * (96 / 25.4);
  }
}
