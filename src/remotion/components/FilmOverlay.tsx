import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * Lớp phủ phim cũ: hạt film, vết xước dọc, bụi, viền tối và ánh sáng nhấp nháy.
 * Dùng random() của Remotion nên mỗi lần render đều ra kết quả giống hệt nhau.
 */
export const FilmOverlay: React.FC<{
  intensity?: number;
  /** Ảnh tĩnh thì bỏ vết xước và bụi: chúng chỉ đẹp khi lướt qua, đứng yên trông như ảnh lỗi */
  still?: boolean;
}> = ({intensity = 1, still = false}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  // Hạt film đổi mẫu mỗi 2 frame, giống tốc độ phim nhựa hơn là nhiễu số
  const grainSeed = Math.floor(frame / 2) % 97;

  // Vết xước: đổi vị trí mỗi 3 frame, chỉ thỉnh thoảng xuất hiện
  const scratchStep = Math.floor(frame / 3);
  const scratches = [0, 1, 2].map((i) => {
    if (random(`scratch-on-${i}-${scratchStep}`) < 0.72) return null;
    const x = random(`scratch-x-${i}-${scratchStep}`) * width;
    const top = random(`scratch-top-${i}-${scratchStep}`) * height * 0.4;
    return (
      <div
        key={`s${i}`}
        style={{
          position: 'absolute',
          left: x,
          top,
          width: 1.5,
          height: height - top,
          background: 'rgba(255, 248, 230, 0.22)',
        }}
      />
    );
  });

  const dust = Array.from({length: 8}).map((_, i) => {
    if (random(`dust-on-${i}-${frame}`) < 0.82) return null;
    const size = 2 + random(`dust-s-${i}-${frame}`) * 6;
    return (
      <div
        key={`d${i}`}
        style={{
          position: 'absolute',
          left: random(`dust-x-${i}-${frame}`) * width,
          top: random(`dust-y-${i}-${frame}`) * height,
          width: size,
          height: size * (0.6 + random(`dust-r-${i}-${frame}`)),
          borderRadius: '50%',
          background: 'rgba(25, 14, 6, 0.6)',
        }}
      />
    );
  });

  const flicker = 0.035 * intensity * random(`flicker-${frame}`);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* Ám vàng ấm */}
      <AbsoluteFill style={{background: 'rgba(255, 196, 120, 0.12)', mixBlendMode: 'multiply'}} />

      {/* Hạt film */}
      <svg
        width={width}
        height={height}
        style={{position: 'absolute', opacity: 0.2 * intensity, mixBlendMode: 'overlay'}}
      >
        <filter id="film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={grainSeed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain)" />
      </svg>

      {still ? null : scratches}
      {still ? null : dust}

      {/* Viền tối như ống kính cũ */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(24,12,2,0.35) 80%, rgba(12,6,0,0.7) 100%)',
        }}
      />

      {/* Đèn máy chiếu chập chờn */}
      <AbsoluteFill style={{background: '#fff6df', opacity: flicker}} />
    </AbsoluteFill>
  );
};
