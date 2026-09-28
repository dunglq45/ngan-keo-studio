import React from 'react';
import {Easing, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Episode, KenBurns, MemoryScene} from '../../shared/types';
import {objectPosition} from '../../shared/focus';
import {writingFrames} from '../components/HandwrittenText';
import {PlaceholderPhoto} from '../components/PlaceholderPhoto';

export type SceneProps = {
  scene: MemoryScene;
  index: number;
  durationInFrames: number;
  fadeFrames: number;
  assetBaseUrl: string;
};

/** Kiểu chữ của phần mở đầu, kết và ảnh bìa, tính theo đơn vị 1% cạnh ngắn của khung hình */
export type StyleText = {
  title: React.CSSProperties;
  subtitle: React.CSSProperties;
  channel: React.CSSProperties;
  question: React.CSSProperties;
  cta: React.CSSProperties;
  outroChannel: React.CSSProperties;
  /** Nền riêng cho mở đầu (glow từ 0 đến 1 khi đèn bừng lên) và kết; bỏ trống thì thấy Background */
  introBackground?: (glow: number) => string;
  outroBackground?: string;
  /** Chữ lớn trên ảnh bìa: font, độ đậm và hệ số cỡ chữ so với phong cách phim nhựa */
  thumbTitle: {fontFamily: string; fontWeight: number; scale: number};
};

/**
 * Một phong cách hình ảnh. Timeline (thời điểm từng cảnh) dùng chung cho mọi phong cách,
 * chỉ khác cách vẽ, nên bản xem trước, mốc chương và video xuất ra luôn khớp nhau.
 */
export type StyleKit = {
  /** Nền đứng yên dưới mọi cảnh */
  Background: React.FC;
  /** Đoạn mở màn dài LEADER_FRAMES trước khi hiện tên tập */
  Leader: React.FC<{episode: Episode}>;
  /** Ảnh và chữ của một cảnh; việc mờ dần khi chuyển cảnh do components/Scene lo */
  Scene: React.FC<SceneProps>;
  /** Lớp phủ trên cùng; still = ảnh tĩnh, bỏ các hiệu ứng chỉ đẹp khi chuyển động */
  Overlay: React.FC<{still?: boolean}>;
  text: (unit: number) => StyleText;
  /**
   * Cảnh mới hiện đủ ngay rồi đè lên cảnh cũ đang mờ dần, thay vì hai cảnh cùng mờ một nửa.
   * Dùng khi ảnh là vật thể đặt lên nền (ảnh Polaroid, ảnh dán vở): hai tấm cùng trong suốt trông như kính.
   */
  quickEnter?: boolean;
};

const KEN_BURNS_CYCLE: KenBurns[] = ['zoom-in', 'pan-left', 'zoom-out', 'pan-right'];

export const kenBurnsTransform = (mode: KenBurns, p: number) => {
  switch (mode) {
    case 'zoom-in':
      return `scale(${1.04 + 0.14 * p})`;
    case 'zoom-out':
      return `scale(${1.18 - 0.14 * p})`;
    case 'pan-left':
      return `scale(1.16) translateX(${3 - 6 * p}%)`;
    case 'pan-right':
      return `scale(1.16) translateX(${-3 + 6 * p}%)`;
  }
};

/** Nhịp chung của một cảnh: tiến độ chuyển động ảnh, lúc bắt đầu viết chữ, lúc hiện dòng phụ và dấu ngày */
export const useSceneTiming = ({scene, index, durationInFrames, fadeFrames}: SceneProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    easing: Easing.inOut(Easing.sin),
    extrapolateRight: 'clamp',
  });
  const captionStart = fadeFrames + Math.round(fps * 0.3);
  const subStart = captionStart + writingFrames(scene.caption, fps) + Math.round(fps * 0.25);
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  return {
    frame,
    progress,
    mode: scene.kenBurns ?? KEN_BURNS_CYCLE[index % KEN_BURNS_CYCLE.length],
    captionStart,
    subOpacity: interpolate(frame, [subStart, subStart + fps * 0.6], [0, 1], clamp),
    stampOpacity: interpolate(frame, [fadeFrames, fadeFrames + 8], [0, 1], clamp),
  };
};

/** Ảnh của cảnh, cắt theo điểm lấy nét; cảnh chưa có ảnh thì hiện khung tạm */
export const ScenePhoto: React.FC<{
  scene: MemoryScene;
  index: number;
  assetBaseUrl: string;
  filter?: string;
  style?: React.CSSProperties;
}> = ({scene, index, assetBaseUrl, filter, style}) =>
  scene.image ? (
    <Img
      src={`${assetBaseUrl}/${scene.image}`}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: objectPosition(scene.focus),
        filter,
        ...style,
      }}
    />
  ) : (
    <PlaceholderPhoto index={index} caption={scene.caption} />
  );
