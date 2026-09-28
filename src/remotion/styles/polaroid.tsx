import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {transformOrigin} from '../../shared/focus';
import {colors, fonts} from '../theme';
import {HandwrittenText} from '../components/HandwrittenText';
import {kenBurnsTransform, ScenePhoto, useSceneTiming, type SceneProps, type StyleKit} from './kit';

const pol = {
  card: '#f6f3ea',
  ink: '#262a3a',
  redInk: '#a5392b',
  paper: '#f4ecd8',
  wood: '#6b4526',
};

// Tỉ lệ khung Polaroid theo chiều rộng khung: viền trên và hai bên mỏng, dải dưới dày để viết chữ
const BORDER = 0.055;
const STRIP = 0.22;
const cardHeight = (w: number) => w * (BORDER + (1 - 2 * BORDER) + STRIP);

/** Mỗi ảnh nằm nghiêng một chút như được thả tay lên bàn */
const TILTS = [-3, 2.5, -1.5, 3.5, -2.5, 1.5];

const photoFilterPolaroid = 'sepia(0.28) saturate(0.92) contrast(0.95) brightness(1.05)';

/** Mặt bàn gỗ ghép từ nhiều tấm ván */
const WoodTable: React.FC = () => {
  const {width} = useVideoConfig();
  const plank = Math.round(width / 4);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: pol.wood,
        backgroundImage: [
          `repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 ${plank - 4}px, rgba(25,12,4,0.55) ${plank - 4}px ${plank}px)`,
          'repeating-linear-gradient(91deg, rgba(0,0,0,0.07) 0 3px, rgba(0,0,0,0) 3px 11px, rgba(255,230,190,0.05) 11px 13px, rgba(0,0,0,0) 13px 29px)',
          'repeating-linear-gradient(89deg, rgba(0,0,0,0) 0 37px, rgba(0,0,0,0.06) 37px 41px, rgba(0,0,0,0) 41px 67px)',
          'linear-gradient(90deg, #5a3a20, #7a5030 22%, #684328 48%, #80563a 74%, #5e3d22)',
        ].join(', '),
      }}
    />
  );
};

/** Đèn flash chụp ảnh loé lên rồi tắt, để lại chồng ảnh trống trên bàn */
const PolaroidLeader: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const flash = interpolate(frame, [0, 4, 24], [0, 1, 0], {extrapolateRight: 'clamp'});
  const w = Math.min(width, height) * 0.42;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      {[-8, 5, -2].map((deg, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: w,
            height: cardHeight(w),
            background: pol.card,
            transform: `rotate(${deg}deg) translate(${(i - 1) * w * 0.06}px, ${(1 - i) * w * 0.03}px)`,
            boxShadow: `0 ${w * 0.02}px ${w * 0.06}px rgba(0,0,0,0.45)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: w * BORDER,
              top: w * BORDER,
              width: w * (1 - 2 * BORDER),
              height: w * (1 - 2 * BORDER),
              background: '#2b2620',
            }}
          />
        </div>
      ))}
      <AbsoluteFill style={{background: '#fffdf6', opacity: flash}} />
    </AbsoluteFill>
  );
};

const PolaroidScene: React.FC<SceneProps> = (props) => {
  const {scene, index, assetBaseUrl, fadeFrames} = props;
  const {width, height, fps} = useVideoConfig();
  const unit = Math.min(width, height) / 100;
  const isPortrait = height > width;
  const t = useSceneTiming(props);

  const w = isPortrait ? width * 0.8 : height * 0.66;
  const h = cardHeight(w);
  const photo = w * (1 - 2 * BORDER);
  const hasNote = !!scene.subCaption && !isPortrait;
  const cx = isPortrait ? width / 2 : hasNote ? width * 0.37 : width / 2;
  const cy = isPortrait ? height * 0.14 + h / 2 : height / 2;
  const tilt = TILTS[index % TILTS.length];

  // Thả ảnh xuống bàn: từ cao hơn, nghiêng hơn, rồi nằm yên
  const drop = interpolate(t.frame, [0, fadeFrames + 8], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp',
  });
  const scale = 1.14 - 0.14 * drop;
  const rotate = tilt * (2.2 - 1.2 * drop);
  const lift = (1 - drop) * unit * 4;
  // Ảnh Polaroid hiện dần từ nền xám như đang rửa
  const develop = interpolate(t.frame, [fadeFrames, fadeFrames + fps * 1.6], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Dải trắng cao 0,22w nên đủ chỗ cho hai dòng ở cỡ nhỏ
  const captionSize = Array.from(scene.caption).length > 22 ? w * 0.068 : w * 0.085;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: cx - w / 2,
          top: cy - h / 2,
          width: w,
          height: h,
          background: pol.card,
          transform: `translateY(${-lift}px) rotate(${rotate}deg) scale(${scale})`,
          boxShadow: `0 ${unit * (0.8 + 1.4 * drop)}px ${unit * (2 + 2 * drop)}px rgba(0,0,0,${0.3 + 0.2 * drop})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: w * BORDER,
            top: w * BORDER,
            width: photo,
            height: photo,
            overflow: 'hidden',
            background: '#2b2620',
          }}
        >
          <AbsoluteFill style={{transform: kenBurnsTransform(t.mode, t.progress), transformOrigin: transformOrigin(scene.focus)}}>
            <ScenePhoto scene={scene} index={index} assetBaseUrl={assetBaseUrl} filter={photoFilterPolaroid} />
          </AbsoluteFill>
          <AbsoluteFill style={{background: '#cfc8b4', opacity: develop}} />
          <AbsoluteFill style={{boxShadow: 'inset 0 0 12px rgba(0,0,0,0.35)'}} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: w * 0.06,
            right: w * 0.06,
            top: w * BORDER + photo,
            height: w * STRIP,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <HandwrittenText
            text={scene.caption}
            startFrame={t.captionStart}
            style={{fontFamily: fonts.marker, fontSize: captionSize, lineHeight: 1.05, color: pol.ink}}
          />
        </div>
        {scene.stamp ? (
          <div
            style={{
              position: 'absolute',
              right: w * 0.05,
              bottom: w * 0.02,
              fontFamily: fonts.marker,
              fontSize: w * 0.038,
              color: pol.redInk,
              opacity: t.stampOpacity * 0.85,
            }}
          >
            {scene.stamp}
          </div>
        ) : null}
      </div>

      {scene.subCaption ? (
        <div
          style={{
            position: 'absolute',
            ...(isPortrait
              ? {left: unit * 8, right: unit * 8, top: cy + h / 2 + unit * 6, textAlign: 'center'}
              : {left: width * 0.63, width: width * 0.3, top: 0, bottom: 0, display: 'flex', alignItems: 'center'}),
            fontFamily: fonts.marker,
            fontSize: unit * (isPortrait ? 5 : 4.6),
            lineHeight: 1.3,
            color: pol.paper,
            opacity: t.subOpacity,
            textShadow: '0 2px 10px rgba(0,0,0,0.7)',
          }}
        >
          {scene.subCaption}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Ánh đèn bàn ấm từ góc trên, viền tối quanh mép */
const PolaroidOverlay: React.FC<{still?: boolean}> = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill
      style={{background: 'radial-gradient(ellipse at 30% 20%, rgba(255,214,150,0.16), rgba(255,214,150,0) 55%)'}}
    />
    <AbsoluteFill
      style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(20,10,2,0.5) 100%)'}}
    />
  </AbsoluteFill>
);

export const polaroidKit: StyleKit = {
  Background: WoodTable,
  Leader: PolaroidLeader,
  Scene: PolaroidScene,
  Overlay: PolaroidOverlay,
  quickEnter: true,
  text: (unit) => ({
    channel: {fontFamily: fonts.marker, fontSize: unit * 4.2, color: colors.amber},
    title: {
      fontFamily: fonts.marker,
      fontSize: unit * 12,
      lineHeight: 1.05,
      color: pol.paper,
      textShadow: `0 ${unit * 0.3}px ${unit * 1.5}px rgba(0,0,0,0.7)`,
    },
    subtitle: {fontFamily: fonts.book, fontStyle: 'italic', fontSize: unit * 3.4, color: '#ecdcbc'},
    question: {
      fontFamily: fonts.marker,
      fontSize: unit * 7.5,
      lineHeight: 1.2,
      color: pol.paper,
      textShadow: `0 ${unit * 0.3}px ${unit * 1.5}px rgba(0,0,0,0.7)`,
    },
    cta: {fontFamily: fonts.book, fontStyle: 'italic', fontSize: unit * 3.2, color: colors.amber},
    outroChannel: {fontFamily: fonts.marker, fontSize: unit * 4.6, color: colors.amber},
    // Tối bớt mặt bàn quanh chữ để tên tập nổi lên
    introBackground: () => 'radial-gradient(ellipse at 50% 50%, rgba(20,10,4,0.55) 0%, rgba(20,10,4,0.25) 60%, rgba(20,10,4,0.5) 100%)',
    outroBackground: 'radial-gradient(ellipse at 50% 50%, rgba(20,10,4,0.55) 0%, rgba(20,10,4,0.25) 60%, rgba(20,10,4,0.5) 100%)',
    thumbTitle: {fontFamily: fonts.marker, fontWeight: 400, scale: 1.05},
  }),
};
