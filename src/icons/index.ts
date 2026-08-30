/**
 * Inline icon registry. Icons from the purchased pack land in this folder as
 * .tsx components; register each here and reference it from journey copy as
 * { text: '…', icon: '<key>' }.
 */
import { GamingPad } from './gba';
import { AndroidIcon } from './android';
import { CubeIcon } from './cube';
import { TerminalConsoleIcon } from './terminal-console';
import { ServerIcon } from './server';
import { AiSparkIcon } from './ai';

export const icons = {
  gba: GamingPad,
  android: AndroidIcon,
  cube: CubeIcon,
  terminal: TerminalConsoleIcon,
  server: ServerIcon,
  ai: AiSparkIcon,
} as const;

export type IconKey = keyof typeof icons;
