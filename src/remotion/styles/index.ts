import type {VisualStyle} from '../../shared/types';
import {DEFAULT_STYLE} from '../../shared/styles';
import type {StyleKit} from './kit';
import {filmKit} from './film';
import {vhsKit} from './vhs';
import {polaroidKit} from './polaroid';
import {notebookKit} from './notebook';

const KITS: Record<VisualStyle, StyleKit> = {
  film: filmKit,
  vhs: vhsKit,
  polaroid: polaroidKit,
  notebook: notebookKit,
};

/** Tập cũ chưa có style, hoặc style lạ do sửa tay episode.json, đều về phim nhựa */
export const getKit = (style: VisualStyle | undefined): StyleKit => KITS[style ?? DEFAULT_STYLE] ?? filmKit;
