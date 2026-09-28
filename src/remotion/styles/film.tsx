import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {LEADER_FRAMES} from '../../shared/timeline';
import {transformOrigin} from '../../shared/focus';
import {colors, fonts, photoFilter} from '../theme';
import {FilmOverlay} from '../components/FilmOverlay';
import {HandwrittenText} from '../components/HandwrittenText';
import {kenBurnsTransform, ScenePhoto, useSceneTiming, type SceneProps, type StyleKit} from './kit';

/** Đếm ngược 3-2-1 như đầu cuộn phim nhựa khi chiếu */
const FilmLeader: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const unit = Math.min(width, height) / 100;
  const perNumber = LEADER_FRAMES / 3;
  const number = 3 - Math.floor(frame / perNumber);
  const sweep = ((frame % perNumber) / perNumber) * 360;
  const r = unit * 30;

  return (
    <AbsoluteFill style={{backgroundColor: '#bdb3a0', justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          width: r * 2.4,
          height: r * 2.4,
          borderRadius: '50%',
          background: `conic-gradient(rgba(40,28,16,0.35) ${sweep}deg, rgba(0,0,0,0) ${sweep}deg)`,
        }}
      />
      <div style={{position: 'absolute', width: '100%', height: 2, background: 'rgba(30,20,10,0.6)'}} />
      <div style={{position: 'absolute', width: 2, height: '100%', background: 'rgba(30,20,10,0.6)'}} />
      {[r * 2, r * 1.7].map((d) => (
        <div
          key={d}
          style={{
            position: 'absolute',
            width: d,
            height: d,
            borderRadius: '50%',
            border: `${unit * 0.5}px solid rgba(250,245,230,0.9)`,
          }}
        />
      ))}
      <div style={{fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: r * 1.3, color: 'rgba(25,16,8,0.85)'}}>
        {Math.max(number, 1)}
      </div>
    </AbsoluteFill>
  );
};

/** Ảnh tràn khung với hiệu ứng Ken Burns, chữ viết tay phía dưới và dấu ngày cam của máy ảnh phim */
const FilmScene: React.FC<SceneProps> = (props) => {
  const {scene, index, assetBaseUrl} = props;
  const {width, height} = useVideoConfig();
  const unit = Math.min(width, height) / 100;
  const isPortrait = height > width;
  const t = useSceneTiming(props);

  return (
    <AbsoluteFill style={{backgroundColor: colors.umber}}>
      <AbsoluteFill style={{transform: kenBurnsTransform(t.mode, t.progress), transformOrigin: transformOrigin(scene.focus)}}>
        <ScenePhoto scene={scene} index={index} assetBaseUrl={assetBaseUrl} filter={photoFilter} />
      </AbsoluteFill>

      {/* Nền tối dần phía dưới để chữ dễ đọc */}
      <AbsoluteFill
        style={{background: 'linear-gradient(to top, rgba(20,10,2,0.78) 0%, rgba(20,10,2,0.25) 38%, rgba(0,0,0,0) 60%)'}}
      />

      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          textAlign: 'center',
          padding: `0 ${unit * 8}px ${isPortrait ? unit * 32 : unit * 9}px`,
        }}
      >
        <HandwrittenText
          text={scene.caption}
          startFrame={t.captionStart}
          style={{
            fontFamily: fonts.hand,
            fontWeight: 700,
            fontSize: unit * (isPortrait ? 8 : 7),
            lineHeight: 1.2,
            color: colors.paper,
            textShadow: '0 2px 12px rgba(0,0,0,0.6)',
          }}
        />
        {scene.subCaption ? (
          <div
            style={{
              marginTop: unit * 1.6,
              fontFamily: fonts.book,
              fontStyle: 'italic',
              fontSize: unit * 3,
              lineHeight: 1.55,
              maxWidth: unit * 110,
              color: colors.amber,
              opacity: t.subOpacity,
              textShadow: '0 1px 8px rgba(0,0,0,0.7)',
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
            bottom: unit * (isPortrait ? 20 : 5),
            fontFamily: fonts.stamp,
            fontWeight: 700,
            fontSize: unit * 3.4,
            letterSpacing: unit * 0.4,
            color: colors.stampOrange,
            opacity: t.stampOpacity * 0.9,
            textShadow: `0 0 ${unit * 0.8}px rgba(255, 110, 20, 0.85)`,
          }}
        >
          {scene.stamp}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const filmKit: StyleKit = {
  Background: () => <AbsoluteFill style={{backgroundColor: colors.umber}} />,
  Leader: FilmLeader,
  Scene: FilmScene,
  Overlay: ({still}) => (still ? <FilmOverlay intensity={0.6} still /> : <FilmOverlay />),
  text: (unit) => ({
    channel: {fontFamily: fonts.book, fontStyle: 'italic', fontSize: unit * 3.2, color: colors.fadedTeal},
    title: {fontFamily: fonts.hand, fontWeight: 700, fontSize: unit * 11, lineHeight: 1.1, color: colors.paper},
    subtitle: {fontFamily: fonts.book, fontStyle: 'italic', fontSize: unit * 3.4, color: colors.amber},
    question: {fontFamily: fonts.hand, fontWeight: 700, fontSize: unit * 7, lineHeight: 1.25, color: colors.paper},
    cta: {fontFamily: fonts.book, fontStyle: 'italic', fontSize: unit * 3.2, color: colors.amber},
    outroChannel: {fontFamily: fonts.hand, fontSize: unit * 4.2, color: colors.fadedTeal},
    // Ánh sáng máy chiếu bừng lên sau đoạn đếm ngược
    introBackground: (glow) => `radial-gradient(ellipse at 50% 45%, rgba(226,179,106,${0.28 * glow}), ${colors.umber} 70%)`,
    outroBackground: `radial-gradient(ellipse at 50% 45%, rgba(111,149,141,0.22), ${colors.umber} 70%)`,
    thumbTitle: {fontFamily: fonts.hand, fontWeight: 700, scale: 1},
  }),
};
