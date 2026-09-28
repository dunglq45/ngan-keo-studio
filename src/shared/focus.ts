import type {FocusPoint} from './types';

export const DEFAULT_FOCUS: FocusPoint = {x: 50, y: 50};

/**
 * Với object-fit: cover, object-position x% đặt điểm x% của ảnh trùng điểm x% của khung.
 * Vì thế cùng một cặp % vừa dùng để cắt ảnh, vừa làm tâm phóng cho hiệu ứng Ken Burns.
 */
export const objectPosition = (focus: FocusPoint = DEFAULT_FOCUS) => `${focus.x}% ${focus.y}%`;

/**
 * Tâm phóng giới hạn trong 20–80%: hiệu ứng trượt phóng 1.16 lần rồi dịch 3%,
 * nếu tâm sát mép hơn thì mép ảnh bị kéo vào trong và lộ nền trống.
 */
export const transformOrigin = (focus: FocusPoint = DEFAULT_FOCUS) => {
  const clamp = (v: number) => Math.min(80, Math.max(20, v));
  return `${clamp(focus.x)}% ${clamp(focus.y)}%`;
};

export type CropRect = {left: number; top: number; width: number; height: number};

/** Phần ảnh (tính theo tỉ lệ 0–1) còn thấy được khi đặt vào khung có tỉ lệ frameAspect với object-fit: cover */
export const coverCrop = (imageAspect: number, frameAspect: number, focus: FocusPoint = DEFAULT_FOCUS): CropRect => {
  const width = Math.min(1, frameAspect / imageAspect);
  const height = Math.min(1, imageAspect / frameAspect);
  return {
    left: (1 - width) * (focus.x / 100),
    top: (1 - height) * (focus.y / 100),
    width,
    height,
  };
};
