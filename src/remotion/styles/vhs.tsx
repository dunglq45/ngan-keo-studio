import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {LEADER_FRAMES} from '../../shared/timeline';
import {transformOrigin} from '../../shared/focus';
import {fonts} from '../theme';
import {HandwrittenText} from '../components/HandwrittenText';
import {kenBurnsTransform, ScenePhoto, useSceneTiming, type SceneProps, type StyleKit} from './kit';

const vhs = {
  black: '#07070a',
  blue: '#1b2fb0',
  white: '#f4f4f0',
  yellow: '#ecec9a',
  cyan: '#9fe6ff',
};

/** Chữ OSD tách màu đỏ/xanh như tín hiệu băng từ bị lệch */
const rgbSplit = (unit: number, blur = 0.8) =>
  `${-unit * 0.25}px 0 rgba(255,0,80,0.75), ${unit * 0.25}px 0 rgba(0,200,255,0.75), 0 0 ${unit * blur}px rgba(0,0,0,0.9)`;

const photoFilterVhs = 'saturate(1.35) contrast(1.12) brightness(1.03) blur(0.6px)';

/** Nhiễu hạt, đổi mẫu mỗi frame như tuyết trên màn hình tivi */
const Snow: React.FC<{opacity: number; seed: number}> = ({opacity, seed}) => {
  const {width, height} = useVideoConfig();
  return (
    <svg width={width} height={height} style={{position: 'absolute', opacity}}>
      <filter id={`vhs-snow-${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={seed} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#vhs-snow-${seed})`} />
    </svg>
  );
};

/** Nửa giây nhiễu trắng rồi màn hình xanh PLAY của đầu máy video */
const VhsLeader: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const unit = Math.min(width, height) / 100;
  if (frame < 15) {
    return (
      <AbsoluteFill style={{backgroundColor: '#777'}}>
        <Snow opacity={1} seed={frame % 50} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{backgroundColor: vhs.blue}}>
      <div
        style={{
          position: 'absolute',
          top: unit * 6,
          left: unit * 7,
          fontFamily: fonts.vhs,
          fontSize: unit * 9,
          color: vhs.white,
          textShadow: rgbSplit(unit, 0),
        }}
      >
        PLAY ►
      </div>
    </AbsoluteFill>
  );
};

const VhsScene: React.FC<SceneProps> = (props) => {
  const {scene, index, assetBaseUrl} = props;
  const {width, height} = useVideoConfig();
  const unit = Math.min(width, height) / 100;
  const isPortrait = height > width;
  const t = useSceneTiming(props);
  const moving = {transform: kenBurnsTransform(t.mode, t.progress), transformOrigin: transformOrigin(scene.focus)};

  return (
    <AbsoluteFill style={{backgroundColor: vhs.black}}>
      <AbsoluteFill style={moving}>
        <ScenePhoto scene={scene} index={index} assetBaseUrl={assetBaseUrl} filter={photoFilterVhs} />
      </AbsoluteFill>
      {/* Bóng đỏ lệch sang phải: màu bị loang như băng từ chép đi chép lại */}
      {scene.image ? (
        <AbsoluteFill
          style={{
            ...moving,
            transform: `translateX(${unit * 0.45}px) ${moving.transform}`,
            mixBlendMode: 'screen',
            opacity: 0.28,
          }}
        >
          <ScenePhoto
            scene={scene}
            index={index}
            assetBaseUrl={assetBaseUrl}
            filter="grayscale(1) sepia(1) saturate(6) hue-rotate(-45deg) blur(1px)"
          />
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 35%, rgba(0,0,0,0) 55%)'}} />

      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          textAlign: 'center',
          padding: `0 ${unit * 8}px ${isPortrait ? unit * 32 : unit * 11}px`,
        }}
      >
        <HandwrittenText
          text={scene.caption}
          startFrame={t.captionStart}
          charsPerSecond={24}
          style={{
            fontFamily: fonts.vhs,
            fontSize: unit * (isPortrait ? 9.5 : 8.5),
            lineHeight: 1.05,
            color: vhs.white,
            textShadow: rgbSplit(unit),
          }}
        />
        {scene.subCaption ? (
          <div
            style={{
              marginTop: unit * 1.5,
              fontFamily: fonts.vhs,
              fontSize: unit * 4.6,
              lineHeight: 1.15,
              maxWidth: unit * 120,
              color: vhs.yellow,
              opacity: t.subOpacity,
              textShadow: `0 0 ${unit * 0.6}px rgba(0,0,0,0.95)`,
            }}
          >
            {scene.subCaption}
          </div>
        ) : null}
      </AbsoluteFill>

      {scene.stamp ? (
        <div
          style={{
            position: 'absolute',
            right: unit * 6,
            bottom: unit * (isPortrait ? 22 : 5),
            fontFamily: fonts.vhs,
            fontSize: unit * 5.5,
            letterSpacing: unit * 0.3,
            color: vhs.white,
            opacity: t.stampOpacity,
            textShadow: rgbSplit(unit, 0.4),
          }}
        >
          {scene.stamp}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Bộ đếm băng dạng 0:00:12 */
const counter = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

/** Vạch quét, nhiễu, dải tracking chạy dọc màn hình và chữ OSD của đầu máy */
const VhsOverlay: React.FC<{still?: boolean}> = ({still = false}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const unit = Math.min(width, height) / 100;

  // Mỗi 5 giây dải nhiễu tracking trôi từ dưới lên trong 1,3 giây
  const cycle = frame % (fps * 5);
  const bandActive = !still && cycle < fps * 1.3;
  const bandY = interpolate(cycle, [0, fps * 1.3], [105, -15]);
  const showOsd = !still && frame >= LEADER_FRAMES;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Snow opacity={still ? 0.06 : 0.1} seed={still ? 3 : frame % 60} />
      <AbsoluteFill
        style={{background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0 2px, rgba(0,0,0,0) 2px 4px)'}}
      />
      {bandActive ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${bandY}%`,
            height: '7%',
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 35%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.12) 70%, rgba(255,255,255,0) 100%)',
            filter: `blur(${unit * 0.3}px)`,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${random(`band-x-${i}-${frame}`) * 100}%`,
                top: `${20 + random(`band-y-${i}-${frame}`) * 60}%`,
                width: `${6 + random(`band-w-${i}-${frame}`) * 18}%`,
                height: 2,
                background: 'rgba(255,255,255,0.8)',
              }}
            />
          ))}
        </div>
      ) : null}
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.45) 100%)'}}
      />
      {showOsd ? (
        <>
          <div
            style={{
              position: 'absolute',
              top: unit * 5,
              left: unit * 6,
              fontFamily: fonts.vhs,
              fontSize: unit * 6,
              color: vhs.white,
              textShadow: rgbSplit(unit, 0.4),
            }}
          >
            PLAY ►
          </div>
          <div
            style={{
              position: 'absolute',
              top: unit * 5,
              right: unit * 6,
              fontFamily: fonts.vhs,
              fontSize: unit * 5,
              color: vhs.white,
              textShadow: rgbSplit(unit, 0.4),
            }}
          >
            SP {counter((frame - LEADER_FRAMES) / fps)}
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

export const vhsKit: StyleKit = {
  Background: () => <AbsoluteFill style={{backgroundColor: vhs.black}} />,
  Leader: VhsLeader,
  Scene: VhsScene,
  Overlay: VhsOverlay,
  text: (unit) => ({
    channel: {fontFamily: fonts.vhs, fontSize: unit * 5, color: vhs.cyan, textShadow: rgbSplit(unit, 0.4)},
    // VT323 hẹp và thấp hơn các font khác nên cần cỡ lớn hơn để tên tập đủ nổi
    title: {fontFamily: fonts.vhs, fontSize: unit * 16, lineHeight: 1, color: vhs.white, textShadow: rgbSplit(unit, 1.2)},
    subtitle: {fontFamily: fonts.vhs, fontSize: unit * 5, color: vhs.yellow},
    question: {fontFamily: fonts.vhs, fontSize: unit * 8.5, lineHeight: 1.1, color: vhs.white, textShadow: rgbSplit(unit)},
    cta: {fontFamily: fonts.vhs, fontSize: unit * 5, color: vhs.yellow},
    outroChannel: {fontFamily: fonts.vhs, fontSize: unit * 5, color: vhs.cyan, textShadow: rgbSplit(unit, 0.4)},
    introBackground: () => `radial-gradient(ellipse at 50% 45%, #141c3a, ${vhs.black} 70%)`,
    outroBackground: `radial-gradient(ellipse at 50% 45%, #141c3a, ${vhs.black} 70%)`,
    thumbTitle: {fontFamily: fonts.vhs, fontWeight: 400, scale: 1},
  }),
};
