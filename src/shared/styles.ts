import type {VisualStyle} from './types';

export const STYLE_OPTIONS: {value: VisualStyle; label: string; hint: string}[] = [
  {value: 'film', label: 'Phim nhựa', hint: 'Đếm ngược đầu cuộn phim, hạt phim, vết xước, dấu ngày cam'},
  {value: 'vhs', label: 'Băng VHS', hint: 'Màn hình xanh PLAY, vạch quét, nhiễu tracking, chữ OSD'},
  {value: 'polaroid', label: 'Ảnh Polaroid', hint: 'Ảnh khung trắng thả lên bàn gỗ, hiện dần như đang rửa'},
  {value: 'notebook', label: 'Vở ô ly', hint: 'Trang vở ô ly, ảnh dán băng keo, chữ mực xanh'},
];

export const DEFAULT_STYLE: VisualStyle = 'film';
