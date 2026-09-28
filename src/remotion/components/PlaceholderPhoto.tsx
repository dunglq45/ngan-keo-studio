import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {colors, fonts} from '../theme';

/** Khung tạm khi cảnh chưa có ảnh, để xem thử nhịp video ngay trong Studio */
export const PlaceholderPhoto: React.FC<{index: number; caption: string}> = ({index, caption}) => {
  const {width, height} = useVideoConfig();
  const unit = Math.min(width, height) / 100;
  const hue = [28, 36, 18, 44, 24, 32][index % 6];

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 35% 30%, hsl(${hue} 45% 62%), hsl(${hue} 38% 34%) 60%, ${colors.umber})`,
        justifyContent: 'center',
        alignItems: 'center',
        color: 'rgba(239, 226, 196, 0.55)',
        textAlign: 'center',
      }}
    >
      <div style={{fontFamily: fonts.book, fontSize: unit * 3, lineHeight: 1.5, maxWidth: '70%'}}>
        Chưa có ảnh cho cảnh {index + 1}
        <br />
        <span style={{fontSize: unit * 2.2}}>
          Chọn ảnh cho cảnh “{caption}” trong trình chỉnh sửa
        </span>
      </div>
    </AbsoluteFill>
  );
};
