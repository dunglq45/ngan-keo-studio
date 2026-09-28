import React from 'react';
import type {Episode, VisualStyle} from '../../../src/shared/types';
import {DEFAULT_STYLE, STYLE_OPTIONS} from '../../../src/shared/styles';
import {FilePicker} from './FilePicker';

type Props = {
  episode: Episode;
  onChange: (episode: Episode) => void;
  upload: (file: File) => Promise<string>;
  mediaUrl: (path: string) => string;
};

export const EpisodeMeta: React.FC<Props> = ({episode, onChange, upload, mediaUrl}) => {
  const set = <K extends keyof Episode>(key: K, value: Episode[K]) => onChange({...episode, [key]: value});
  const style = episode.style ?? DEFAULT_STYLE;
  const hasNarration = episode.scenes.some((s) => s.narration);
  const narrationVolume = episode.narrationVolume ?? 1;

  return (
    <section className="meta">
      <input
        className="title-input"
        value={episode.title}
        onChange={(e) => set('title', e.target.value)}
        placeholder="Tên tập"
        aria-label="Tên tập"
      />
      <input
        className="subtitle-input"
        value={episode.subtitle ?? ''}
        onChange={(e) => set('subtitle', e.target.value)}
        placeholder="Dòng giới thiệu dưới tên tập"
        aria-label="Dòng giới thiệu"
      />

      <div className="grid-2">
        <label className="field">
          <span>Phong cách</span>
          <select value={style} onChange={(e) => set('style', e.target.value as VisualStyle)}>
            {STYLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <small className="muted style-hint">{STYLE_OPTIONS.find((o) => o.value === style)?.hint}</small>
        </label>
        <label className="field">
          <span>Tên kênh</span>
          <input value={episode.channelName} onChange={(e) => set('channelName', e.target.value)} />
        </label>
        <label className="field">
          <span>Câu hỏi cuối video</span>
          <input value={episode.outroQuestion} onChange={(e) => set('outroQuestion', e.target.value)} />
        </label>
        <label className="field">
          <span>Lời nhắn cuối video</span>
          <input
            value={episode.outroCallToAction ?? ''}
            onChange={(e) => set('outroCallToAction', e.target.value)}
            placeholder="Ví dụ: Kể cho mình nghe ở phần bình luận nhé"
          />
        </label>

        <div className="field">
          <span>Nhạc nền</span>
          {episode.music ? (
            <div className="music">
              <audio src={mediaUrl(episode.music)} controls preload="none" />
              <div className="music-row">
                <label className="volume">
                  Âm lượng
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={episode.musicVolume ?? 0.6}
                    onChange={(e) => set('musicVolume', Number(e.target.value))}
                  />
                </label>
                <button type="button" className="link-button" onClick={() => set('music', undefined)}>
                  Bỏ nhạc
                </button>
              </div>
            </div>
          ) : (
            <FilePicker accept="audio/*" upload={upload} onUploaded={(p) => set('music', p)} className="button secondary">
              Chọn file nhạc
            </FilePicker>
          )}
        </div>

        {hasNarration ? (
          <div className="field">
            <span>Lời kể</span>
            <label className="volume">
              Âm lượng
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={narrationVolume}
                onChange={(e) => set('narrationVolume', Number(e.target.value))}
                aria-valuetext={`${Math.round(narrationVolume * 100)}%`}
              />
              <output className="volume-value">{Math.round(narrationVolume * 100)}%</output>
            </label>
            <small className="muted style-hint">
              Áp dụng cho lời kể của mọi cảnh. Muốn giọng nổi hơn nữa thì giảm âm lượng nhạc nền.
            </small>
          </div>
        ) : null}
      </div>
    </section>
  );
};
