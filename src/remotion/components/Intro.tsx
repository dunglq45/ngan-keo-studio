import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Episode} from '../../shared/types';
import {LEADER_FRAMES} from '../../shared/timeline';
import type {StyleKit} from '../styles/kit';
import {HandwrittenText, writingFrames} from './HandwrittenText';

export const Intro: React.FC<{episode: Episode; durationInFrames: number; fadeFrames: number; kit: StyleKit}> = ({
  episode,
  durationInFrames,
  fadeFrames,
  kit,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const unit = Math.min(width, height) / 100;
  const text = kit.text(unit);

  if (frame < LEADER_FRAMES) return <kit.Leader episode={episode} />;

  const local = frame - LEADER_FRAMES;
  const titleStart = Math.round(fps * 0.9);
  const subStart = titleStart + writingFrames(episode.title, fps, 14) + Math.round(fps * 0.3);

  const fadeOut = interpolate(frame, [durationInFrames - fadeFrames, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const channelOpacity = interpolate(local, [0, fps * 0.8], [0, 1], {extrapolateRight: 'clamp'});
  const subOpacity = interpolate(local, [subStart, subStart + fps * 0.7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glow = interpolate(local, [0, fps * 1.2], [0.2, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        background: text.introBackground?.(glow),
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: unit * 8,
      }}
    >
      <div style={{...text.channel, opacity: channelOpacity, marginBottom: unit * 2}}>{episode.channelName}</div>
      <HandwrittenText text={episode.title} startFrame={titleStart} charsPerSecond={14} style={text.title} />
      {episode.subtitle ? (
        <div style={{...text.subtitle, marginTop: unit * 2.5, opacity: subOpacity}}>{episode.subtitle}</div>
      ) : null}
    </AbsoluteFill>
  );
};
