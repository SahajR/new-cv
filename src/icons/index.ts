/**
 * Inline icon registry. Icons from the purchased pack land in this folder as
 * .tsx components; register each here and reference it from journey copy as
 * { text: '…', icon: '<key>' }.
 */
import { GameBoyAdvance } from './gba';
import { AndroidIcon } from './android';
import { CubeIcon } from './cube';
import { TerminalConsoleIcon } from './terminal-console';
import { ServerIcon } from './server';
import { AiSparkIcon } from './ai';
import { BriefcaseJob } from './work';
import { Telescope } from './telescope';
import { YCombinatorHackerNews } from './yc';
import { Email } from './email';
import { Linkedin } from './linkedin';
import { Github } from './github';
import { Up } from './up';
import { Flight } from './flight';

export const icons = {
  gba: GameBoyAdvance,
  android: AndroidIcon,
  cube: CubeIcon,
  terminal: TerminalConsoleIcon,
  server: ServerIcon,
  ai: AiSparkIcon,
  work: BriefcaseJob,
  telescope: Telescope,
  yc: YCombinatorHackerNews,
  email: Email,
  linkedin: Linkedin,
  github: Github,
  up: Up,
  flight: Flight,
} as const;

export type IconKey = keyof typeof icons;
