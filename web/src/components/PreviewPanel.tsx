import React, {useMemo} from 'react';
import {Player, type PlayerRef} from '@remotion/player';
import type {Episode, HoaiNiemProps, RenderFormat} from '../../../src/shared/types';
import {computeTimeline, FORMAT_SIZE, FPS} from '../../../src/shared/timeline';
import {HoaiNiemVideo} from '../../../src/remotion/HoaiNiemVideo';

type Props = {
  episode: Episode;
  format: RenderFormat;
  onFormatChange: (format: RenderFormat) => void;
  playerRef: React.RefObject<PlayerRef>;
};

export const PreviewPanel: React.FC<Props> = ({episode, format, onFormatChange, playerRef}) => {
  const duration = useMemo(() => computeTimeline(episode).total, [episode]);
  const inputProps = useMemo<HoaiNiemProps>(() => ({episode, assetBaseUrl: `/media/${episode.id}`}), [episode]);
  const {width, height} = FORMAT_SIZE[format];

  return (
    <section className="preview">
      <div className="preview-head">
        <div className="segmented" role="group" aria-label="Khung hình xem trước">
          <button type="button" aria-pressed={format === '16x9'} onClick={() => onFormatChange('16x9')}>
            Ngang 16:9
          </button>
          <button type="button" aria-pressed={format === '9x16'} onClick={() => onFormatChange('9x16')}>
            Dọc 9:16
          </button>
        </div>
        <span className="muted">{(duration / FPS).toFixed(1)} giây</span>
      </div>
      <div className={format === '9x16' ? 'player portrait' : 'player'}>
        <Player
          ref={playerRef}
          component={HoaiNiemVideo}
          inputProps={inputProps}
          durationInFrames={duration}
          fps={FPS}
          compositionWidth={width}
          compositionHeight={height}
          controls
          style={{width: '100%'}}
        />
      </div>
    </section>
  );
};
