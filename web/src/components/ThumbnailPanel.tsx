import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Thumbnail} from '@remotion/player';
import type {Episode, HoaiNiemProps} from '../../../src/shared/types';
import {FPS} from '../../../src/shared/timeline';
import {THUMBNAIL_SIZE, thumbnailSceneIndex} from '../../../src/shared/thumbnail';
import {YoutubeThumbnail} from '../../../src/remotion/components/YoutubeThumbnail';
import {api, type RenderFile} from '../api';

type Props = {
  episode: Episode;
  onChange: (episode: Episode) => void;
  ensureSaved: () => Promise<void>;
};

export const ThumbnailPanel: React.FC<Props> = ({episode, onChange, ensureSaved}) => {
  const [files, setFiles] = useState<RenderFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputProps = useMemo<HoaiNiemProps>(() => ({episode, assetBaseUrl: `/media/${episode.id}`}), [episode]);

  const loadFiles = useCallback(() => {
    api
      .renders(episode.id)
      .then((all) => setFiles(all.filter((f) => f.kind === 'thumb').slice(0, 3)))
      .catch(() => setFiles([]));
  }, [episode.id]);

  useEffect(loadFiles, [loadFiles]);

  const exportThumbnail = async () => {
    setError(null);
    setBusy(true);
    try {
      await ensureSaved();
      await api.thumbnail(episode.id);
      loadFiles();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const autoIndex = thumbnailSceneIndex({...episode, thumbnailScene: undefined});

  return (
    <section className="thumbnail">
      <h2 className="section-title">Ảnh bìa YouTube</h2>
      <div className="player">
        <Thumbnail
          component={YoutubeThumbnail}
          inputProps={inputProps}
          frameToDisplay={0}
          durationInFrames={1}
          fps={FPS}
          compositionWidth={THUMBNAIL_SIZE.width}
          compositionHeight={THUMBNAIL_SIZE.height}
          style={{width: '100%'}}
        />
      </div>

      <div className="grid-2 thumbnail-fields">
        <label className="field">
          <span>Ảnh nền</span>
          <select
            value={episode.thumbnailScene !== undefined && episode.scenes[episode.thumbnailScene] ? episode.thumbnailScene : ''}
            onChange={(e) =>
              onChange({...episode, thumbnailScene: e.target.value === '' ? undefined : Number(e.target.value)})
            }
          >
            <option value="">Tự chọn{autoIndex >= 0 ? ` (cảnh ${autoIndex + 1})` : ''}</option>
            {episode.scenes.map((s, i) => (
              <option key={i} value={i}>
                Cảnh {i + 1}: {s.caption}
                {s.image ? '' : ' (chưa có ảnh)'}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Chữ trên ảnh bìa</span>
          <input
            value={episode.thumbnailText ?? ''}
            onChange={(e) => onChange({...episode, thumbnailText: e.target.value})}
            placeholder={episode.title}
          />
        </label>
      </div>
      <p className="muted hint">Ảnh bìa hiện rất nhỏ trên điện thoại: nên để 2 đến 5 chữ, ngắn hơn tên tập càng tốt.</p>

      <button type="button" className="button" disabled={busy} onClick={() => void exportThumbnail()}>
        {busy ? 'Đang xuất ảnh bìa…' : 'Xuất ảnh bìa 1280×720'}
      </button>
      {error ? <p className="field-error">Lỗi: {error}</p> : null}

      {files.length > 0 ? (
        <ul className="render-files">
          {files.map((f) => (
            <li key={f.name}>
              <a href={`/renders/${f.name}`} target="_blank" rel="noreferrer">
                <img className="thumbnail-file" src={`/renders/${f.name}`} alt="Ảnh bìa đã xuất" loading="lazy" />
              </a>
              <span className="muted">
                {new Date(f.updatedAt).toLocaleString('vi-VN')}, {Math.round(f.size / 1024)} KB
              </span>
              <a href={`/renders/${f.name}`} download className="link-button">
                Tải về
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};
