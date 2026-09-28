import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Episode} from '../../shared/types';
import type {StyleKit} from '../styles/kit';
import {HandwrittenText, writingFrames} from './HandwrittenText';

export const Outro: React.FC<{episode: Episode; durationInFrames: number; fadeFrames: number; kit: StyleKit}> = ({
  episode,
  durationInFrames,
  fadeFrames,
  kit,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const unit = Math.min(width, height) / 100;
  const text = kit.text(unit);

  const opacity = interpolate(
    frame,
    [0, fadeFrames, durationInFrames - fps, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const questionStart = fadeFrames;
  const ctaStart = questionStart + writingFrames(episode.outroQuestion, fps) + Math.round(fps * 0.4);
  const ctaOpacity = interpolate(frame, [ctaStart, ctaStart + fps * 0.7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: text.outroBackground,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: unit * 10,
      }}
    >
      <HandwrittenText text={episode.outroQuestion} startFrame={questionStart} style={text.question} />
      <div style={{opacity: ctaOpacity, marginTop: unit * 3.5}}>
        {episode.outroCallToAction ? <div style={text.cta}>{episode.outroCallToAction}</div> : null}
        <div style={{...text.outroChannel, marginTop: unit * 2.5}}>{episode.channelName}</div>
      </div>
    </AbsoluteFill>
  );
};
