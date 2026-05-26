import type { AnchorRef, Point } from "./geometry";
import type { SourceSpan } from "./errors";
import type { Style } from "./style";

export interface CoreProgram {
  readonly commands: readonly CoreCommand[];
}

export type CoreCommand =
  | CreateTextBoxCommand
  | PlaceRightOfCommand
  | ConnectCommand;

export interface BaseCommand {
  readonly span?: SourceSpan;
}

export interface CreateTextBoxCommand extends BaseCommand {
  readonly kind: "createTextBox";
  readonly id: string;
  readonly label: string;
  readonly at?: Point;
  readonly padding?: number;
  readonly style?: Style;
}

export interface PlaceRightOfCommand extends BaseCommand {
  readonly kind: "placeRightOf";
  readonly targetId: string;
  readonly referenceId: string;
  readonly distance: number;
}

export interface ConnectCommand extends BaseCommand {
  readonly kind: "connect";
  readonly id?: string;
  readonly from: AnchorRef;
  readonly to: AnchorRef;
  readonly style?: Style;
}
