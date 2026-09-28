import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, useVideoConfig} from 'remotion';
import type {HoaiNiemProps} from '../shared/types';
import {computeTimeline, FADE_FRAMES, musicDuck} from '../shared/timeline';
import {getKit} from './styles';
import {Intro} from './components/Intro';
import {Scene} from './components/Scene';
import {Outro} from './components/Outro';

export const HoaiNiemVideo: React.FC<HoaiNiemProps> = ({episode, assetBaseUrl}) => {
  const {fps} = useVideoConfig();
  const t = computeTimeline(episode, fps);
  const volume = episode.musicVolume ?? 0.6;
  const kit = getKit(episode.style);

  return (
    <AbsoluteFill>
      <kit.Background />

      <Sequence durationInFrames={t.intro} name="Mở đầu">
        <Intro episode={episode} durationInFrames={t.intro} fadeFrames={FADE_FRAMES} kit={kit} />
      </Sequence>

      {episode.scenes.map((scene, i) => (
        <Sequence key={i} from={t.scenes[i].from} durationInFrames={t.scenes[i].duration} name={`Cảnh ${i + 1}`}>
          <Scene
            kit={kit}
            scene={scene}
            index={i}
            durationInFrames={t.scenes[i].duration}
            fadeFrames={FADE_FRAMES}
            assetBaseUrl={assetBaseUrl}
          />
        </Sequence>
      ))}

      <Sequence from={t.outroFrom} durationInFrames={t.outro} name="Kết">
        <Outro episode={episode} durationInFrames={t.outro} fadeFrames={FADE_FRAMES} kit={kit} />
      </Sequence>

      {episode.scenes.map((scene, i) => {
        const n = t.narrations[i];
        return n && scene.narration ? (
          <Sequence key={`voice-${i}`} from={n.from} durationInFrames={n.duration} name={`Lời kể ${i + 1}`}>
            <Audio src={`${assetBaseUrl}/${scene.narration}`} volume={episode.narrationVolume ?? 1} />
          </Sequence>
        ) : null;
      })}

      {episode.music ? (
        <Audio
          src={`${assetBaseUrl}/${episode.music}`}
          loop
          volume={(f) =>
            interpolate(f, [0, fps * 2, t.total - fps * 3, t.total], [0, volume, volume, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }) * musicDuck(f, t.narrations, fps)
          }
        />
      ) : null}

      <kit.Overlay />
    </AbsoluteFill>
  );
};
