import React from 'react';
import {Composition, Still} from 'remotion';
import {HoaiNiemVideo} from './HoaiNiemVideo';
import {YoutubeThumbnail} from './components/YoutubeThumbnail';
import {computeTimeline, FORMAT_SIZE, FPS} from '../shared/timeline';
import {THUMBNAIL_ID, THUMBNAIL_SIZE} from '../shared/thumbnail';
import {sampleEpisode} from '../shared/sample';
import type {HoaiNiemProps, RenderFormat} from '../shared/types';

const defaultProps: HoaiNiemProps = {episode: sampleEpisode, assetBaseUrl: ''};

/** Server render gọi composition theo id này, props thật được truyền qua inputProps */
export const compositionId = (format: RenderFormat) => `HoaiNiem-${format}`;

export const RemotionRoot: React.FC = () => (
  <>
    {(Object.keys(FORMAT_SIZE) as RenderFormat[]).map((format) => (
      <Composition
        key={format}
        id={compositionId(format)}
        component={HoaiNiemVideo}
        fps={FPS}
        width={FORMAT_SIZE[format].width}
        height={FORMAT_SIZE[format].height}
        durationInFrames={computeTimeline(sampleEpisode).total}
        defaultProps={defaultProps}
        calculateMetadata={({props}) => ({durationInFrames: computeTimeline(props.episode).total})}
      />
    ))}
    <Still
      id={THUMBNAIL_ID}
      component={YoutubeThumbnail}
      width={THUMBNAIL_SIZE.width}
      height={THUMBNAIL_SIZE.height}
      defaultProps={defaultProps}
    />
  </>
);
