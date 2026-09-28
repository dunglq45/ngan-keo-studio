import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * Hiện chữ dần từng ký tự như đang viết.
 * Phần chưa hiện vẫn được render trong suốt để dòng chữ không bị xô lệch khi căn giữa.
 */
export const HandwrittenText: React.FC<{
  text: string;
  startFrame?: number;
  charsPerSecond?: number;
  style?: React.CSSProperties;
}> = ({text, startFrame = 0, charsPerSecond = 20, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const chars = Array.from(text);
  const count = Math.max(0, Math.floor(((frame - startFrame) / fps) * charsPerSecond));
  const shown = chars.slice(0, count).join('');
  const rest = chars.slice(count).join('');

  return (
    <span style={style}>
      <span>{shown}</span>
      <span style={{opacity: 0}}>{rest}</span>
    </span>
  );
};

/** Số frame cần để viết xong một đoạn chữ */
export const writingFrames = (text: string, fps: number, charsPerSecond = 20) =>
  Math.ceil((Array.from(text).length / charsPerSecond) * fps);
