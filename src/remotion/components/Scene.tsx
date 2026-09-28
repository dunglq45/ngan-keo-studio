import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import type {SceneProps, StyleKit} from '../styles/kit';

/** Một cảnh: mờ dần vào và ra để chồng lên cảnh kề bên, phần vẽ bên trong tuỳ phong cách */
export const Scene: React.FC<SceneProps & {kit: StyleKit}> = ({kit, ...props}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fadeFrames} = props;
  // Cảnh sau nằm trên cảnh trước, nên hiện nhanh là đủ che cảnh cũ đang mờ dần bên dưới
  const enterFrames = kit.quickEnter ? Math.round(fadeFrames * 0.4) : fadeFrames;
  const opacity = interpolate(frame, [0, enterFrames, durationInFrames - fadeFrames, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity}}>
      <kit.Scene {...props} />
    </AbsoluteFill>
  );
};
