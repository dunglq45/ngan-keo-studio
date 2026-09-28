import React from 'react';
import {AbsoluteFill, Easing, interpolate, useVideoConfig} from 'remotion';
import type {Episode} from '../../shared/types';
import {transformOrigin} from '../../shared/focus';
import {fonts} from '../theme';
import {HandwrittenText} from '../components/HandwrittenText';
import {kenBurnsTransform, ScenePhoto, useSceneTiming, type SceneProps, type StyleKit} from './kit';

const nb = {
  paper: '#f7f3e6',
  ink: '#1f3fa8',
  redInk: '#c8322e',
  purple: '#7a5a9a',
  line: 'rgba(150,120,200,0.32)',
  lineBold: 'rgba(125,95,185,0.55)',
  cover: '#2f67b0',
};

/** Cỡ một dòng kẻ nhỏ của vở ô ly: bốn dòng nhỏ làm một ô lớn */
const gridUnit = (unit: number) => Math.round(unit * 1.4);

/** Trang vở ô ly: kẻ ngang từng dòng nhỏ, kẻ đậm mỗi ô lớn, kẻ dọc mỗi ô lớn và lề đỏ bên trái */
const NotebookPage: React.FC = () => {
  const {width, height} = useVideoConfig();
  const unit = Math.min(width, height) / 100;
  const g = gridUnit(unit);
  const big = g * 4;
  const margin = Math.round(width * (height > width ? 0.08 : 0.12));
  return (
    <AbsoluteFill
      style={{
        backgroundColor: nb.paper,
        backgroundImage: [
          `linear-gradient(90deg, rgba(0,0,0,0) ${margin}px, ${nb.redInk} ${margin}px ${margin + 2}px, rgba(0,0,0,0) ${margin + 2}px ${margin + 6}px, ${nb.redInk} ${margin + 6}px ${margin + 8}px, rgba(0,0,0,0) ${margin + 8}px)`,
          `repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 ${big - 2}px, ${nb.lineBold} ${big - 2}px ${big}px)`,
          `repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 ${g - 1}px, ${nb.line} ${g - 1}px ${g}px)`,
          `repeating-linear-gradient(to right, rgba(0,0,0,0) 0 ${big - 1}px, ${nb.line} ${big - 1}px ${big}px)`,
        ].join(', '),
      }}
    />
  );
};

/** Bìa vở với nhãn vở ghi tên kênh bằng mực xanh */
const NotebookLeader: React.FC<{episode: Episode}> = ({episode}) => {
  const {width, height} = useVideoConfig();
  const unit = Math.min(width, height) / 100;
  const labelW = unit * 82;
  const row = (label: string, value: string) => (
    <div style={{display: 'flex', alignItems: 'baseline', gap: unit * 1.5, marginTop: unit * 2.6}}>
      <span style={{fontFamily: fonts.book, fontStyle: 'italic', fontSize: unit * 4, color: '#555', whiteSpace: 'nowrap'}}>
        {label}
      </span>
      <span
        style={{
          flex: 1,
          borderBottom: `${unit * 0.2}px dotted #8a8a8a`,
          fontFamily: fonts.hand,
          fontWeight: 700,
          fontSize: unit * 6,
          color: nb.ink,
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </div>
  );
  return (
    <AbsoluteFill
      style={{
        backgroundColor: nb.cover,
        backgroundImage:
          'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12) 0 8%, rgba(0,0,0,0) 8.5%), radial-gradient(circle at 80% 75%, rgba(255,255,255,0.1) 0 11%, rgba(0,0,0,0) 11.5%)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: labelW,
          padding: `${unit * 3}px ${unit * 4}px ${unit * 4}px`,
          background: '#fffdf5',
          borderRadius: unit * 3,
          border: `${unit * 0.6}px double ${nb.cover}`,
          boxShadow: `0 ${unit * 0.6}px ${unit * 2}px rgba(0,0,0,0.35)`,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            fontFamily: fonts.book,
            fontStyle: 'italic',
            fontSize: unit * 6.5,
            color: nb.cover,
            letterSpacing: unit * 0.3,
          }}
        >
          Nhãn vở
        </div>
        {row('Họ và tên:', episode.channelName)}
        {row('Lớp:', '8x, 9x')}
        {row('Vở:', episode.title)}
      </div>
    </AbsoluteFill>
  );
};

/** Hai miếng băng keo giấy dán chéo ở góc trên của ảnh */
const Tape: React.FC<{side: 'left' | 'right'; size: number}> = ({side, size}) => (
  <div
    style={{
      position: 'absolute',
      top: -size * 0.28,
      [side]: -size * 0.35,
      width: size * 1.4,
      height: size * 0.45,
      background:
        'repeating-linear-gradient(90deg, rgba(236,206,120,0.78) 0 6px, rgba(244,220,150,0.78) 6px 12px)',
      transform: `rotate(${side === 'left' ? -35 : 35}deg)`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    }}
  />
);

const TILTS = [-1.8, 1.4, -1, 2, -1.4, 1];

const NotebookScene: React.FC<SceneProps> = (props) => {
  const {scene, index, assetBaseUrl, fadeFrames} = props;
  const {width, height} = useVideoConfig();
  const unit = Math.min(width, height) / 100;
  const isPortrait = height > width;
  const t = useSceneTiming(props);

  // Ảnh in có viền trắng, tỉ lệ 4:3
  const pw = isPortrait ? width * 0.78 : width * 0.47;
  const ph = pw * 0.75;
  const left = isPortrait ? (width - pw) / 2 + width * 0.03 : width * 0.17;
  const top = isPortrait ? height * 0.1 : (height - ph) / 2 - unit * 2;
  const settle = interpolate(t.frame, [0, fadeFrames + 6], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp',
  });
  const border = unit * 1.1;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width: pw,
          height: ph,
          padding: border,
          background: '#fff',
          transform: `rotate(${TILTS[index % TILTS.length]}deg) scale(${1.04 - 0.04 * settle})`,
          boxShadow: `0 ${unit * 0.5}px ${unit * 1.5}px rgba(60,40,20,0.3)`,
        }}
      >
        <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden'}}>
          <AbsoluteFill style={{transform: kenBurnsTransform(t.mode, t.progress), transformOrigin: transformOrigin(scene.focus)}}>
            <ScenePhoto scene={scene} index={index} assetBaseUrl={assetBaseUrl} filter="sepia(0.3) saturate(0.85)" />
          </AbsoluteFill>
        </div>
        <Tape side="left" size={unit * 9} />
        <Tape side="right" size={unit * 9} />
      </div>

      <div
        style={{
          position: 'absolute',
          ...(isPortrait
            ? {left: width * 0.12, right: unit * 6, top: top + ph + unit * 12}
            : {left: left + pw + unit * 6, right: unit * 5, top: 0, bottom: 0, justifyContent: 'center'}),
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <HandwrittenText
          text={scene.caption}
          startFrame={t.captionStart}
          style={{
            fontFamily: fonts.hand,
            fontWeight: 700,
            fontSize: unit * (isPortrait ? 8 : 6.2),
            lineHeight: 1.15,
            color: nb.ink,
          }}
        />
        {scene.subCaption ? (
          <div
            style={{
              marginTop: unit * 2,
              fontFamily: fonts.hand,
              fontWeight: 500,
              fontSize: unit * (isPortrait ? 5 : 4),
              lineHeight: 1.3,
              color: nb.ink,
              opacity: t.subOpacity * 0.9,
            }}
          >
            {scene.subCaption}
          </div>
        ) : null}
      </div>

      {scene.stamp ? (
        <div
          style={{
            position: 'absolute',
            right: unit * 5,
            top: unit * 5,
            fontFamily: fonts.hand,
            fontWeight: 700,
            fontSize: unit * 4.4,
            color: nb.redInk,
            opacity: t.stampOpacity * 0.9,
            transform: 'rotate(-4deg)',
          }}
        >
          {scene.stamp}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Giấy ngả vàng ở mép, như vở để lâu trong ngăn kéo */
const NotebookOverlay: React.FC<{still?: boolean}> = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill
      style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(150,110,40,0.22) 85%, rgba(110,75,20,0.4) 100%)'}}
    />
  </AbsoluteFill>
);

export const notebookKit: StyleKit = {
  Background: NotebookPage,
  Leader: NotebookLeader,
  Scene: NotebookScene,
  Overlay: NotebookOverlay,
  quickEnter: true,
  text: (unit) => ({
    channel: {fontFamily: fonts.book, fontStyle: 'italic', fontSize: unit * 3.2, color: nb.purple},
    title: {fontFamily: fonts.hand, fontWeight: 700, fontSize: unit * 11, lineHeight: 1.1, color: nb.ink},
    subtitle: {fontFamily: fonts.hand, fontWeight: 500, fontSize: unit * 4.4, color: nb.ink},
    question: {fontFamily: fonts.hand, fontWeight: 700, fontSize: unit * 7, lineHeight: 1.25, color: nb.ink},
    cta: {fontFamily: fonts.book, fontStyle: 'italic', fontSize: unit * 3.2, color: nb.purple},
    outroChannel: {fontFamily: fonts.hand, fontWeight: 700, fontSize: unit * 4.6, color: nb.redInk},
    thumbTitle: {fontFamily: fonts.hand, fontWeight: 700, scale: 1},
  }),
};
