import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {PlayerRef} from '@remotion/player';
import type {Episode, RenderFormat} from '../../src/shared/types';
import {computeTimeline, FADE_FRAMES} from '../../src/shared/timeline';
import {api, mediaUrl, type EpisodeSummary} from './api';
import {EpisodeMeta} from './components/EpisodeMeta';
import {SceneList} from './components/SceneList';
import {PreviewPanel} from './components/PreviewPanel';
import {RenderPanel} from './components/RenderPanel';
import {ThumbnailPanel} from './components/ThumbnailPanel';
import {YoutubeMetaPanel} from './components/YoutubeMetaPanel';

type SaveState = 'saved' | 'dirty' | 'saving' | 'error';
const SAVE_LABEL: Record<SaveState, string> = {
  saved: 'Đã lưu',
  dirty: 'Đang chờ lưu',
  saving: 'Đang lưu…',
  error: 'Chưa lưu được, sẽ thử lại khi bạn sửa tiếp',
};

export const App: React.FC = () => {
  const [episodes, setEpisodes] = useState<EpisodeSummary[]>([]);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [format, setFormat] = useState<RenderFormat>('16x9');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const dirty = useRef(false);
  const playerRef = useRef<PlayerRef>(null);

  const refreshList = useCallback(async () => {
    const list = await api.list();
    setEpisodes(list);
    return list;
  }, []);

  const open = useCallback(async (id: string) => {
    const ep = await api.get(id);
    dirty.current = false;
    setSaveState('saved');
    setEpisode(ep);
  }, []);

  useEffect(() => {
    refreshList()
      .then((list) => (list[0] ? open(list[0].id) : undefined))
      .catch((e: Error) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [refreshList, open]);

  /** Lưu ngay, trả về true nếu thành công */
  const flush = useCallback(
    async (ep: Episode) => {
      dirty.current = false;
      setSaveState('saving');
      try {
        await api.save(ep);
        setSaveState('saved');
        void refreshList();
        return true;
      } catch {
        dirty.current = true;
        setSaveState('error');
        return false;
      }
    },
    [refreshList],
  );

  // Tự lưu sau khi ngừng gõ 0,7 giây
  useEffect(() => {
    if (!episode || !dirty.current) return;
    const timer = window.setTimeout(() => void flush(episode), 700);
    return () => window.clearTimeout(timer);
  }, [episode, flush]);

  const change = (next: Episode) => {
    dirty.current = true;
    setSaveState('dirty');
    setEpisode(next);
  };

  const saveIfDirty = async () => {
    if (episode && dirty.current && !(await flush(episode))) {
      throw new Error('Chưa lưu được tập hiện tại, hãy thử lại');
    }
  };

  const select = async (id: string) => {
    await saveIfDirty();
    await open(id);
  };

  const create = async () => {
    const title = window.prompt('Tên tập mới', 'Tập mới');
    if (!title?.trim()) return;
    await saveIfDirty();
    const ep = await api.create(title.trim());
    await refreshList();
    dirty.current = false;
    setSaveState('saved');
    setEpisode(ep);
  };

  const remove = async () => {
    if (!episode || !window.confirm(`Xoá tập “${episode.title}” cùng toàn bộ ảnh và nhạc đã tải lên?`)) return;
    dirty.current = false;
    await api.remove(episode.id);
    const list = await refreshList();
    if (list[0]) await open(list[0].id);
    else setEpisode(null);
  };

  const previewScene = (index: number) => {
    if (!episode) return;
    const t = computeTimeline(episode);
    playerRef.current?.seekTo(t.scenes[index].from + FADE_FRAMES);
    playerRef.current?.play();
  };

  const upload = (file: File) => {
    if (!episode) return Promise.reject(new Error('Chưa chọn tập'));
    return api.upload(episode.id, file).then((r) => r.path);
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="brand">Ngăn Kéo Studio</h1>
        {episodes.length > 0 ? (
          <select
            className="episode-select"
            value={episode?.id ?? ''}
            onChange={(e) => void select(e.target.value)}
            aria-label="Chọn tập"
          >
            {episodes.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.title} ({ep.sceneCount} cảnh)
              </option>
            ))}
          </select>
        ) : null}
        <button type="button" className="button secondary" onClick={() => void create()}>
          Tạo tập mới
        </button>
        {episode ? (
          <>
            <span className={`save-state ${saveState}`} role="status">
              {SAVE_LABEL[saveState]}
            </span>
            <button type="button" className="link-button danger" onClick={() => void remove()}>
              Xoá tập này
            </button>
          </>
        ) : null}
      </header>

      {loadError ? (
        <p className="empty">Không kết nối được máy chủ: {loadError}</p>
      ) : loading ? (
        <p className="empty muted">Đang mở ngăn kéo…</p>
      ) : !episode ? (
        <div className="empty">
          <p>Chưa có tập nào. Tạo tập đầu tiên để bắt đầu.</p>
          <button type="button" className="button" onClick={() => void create()}>
            Tạo tập mới
          </button>
        </div>
      ) : (
        <main className="workspace">
          <div className="editor">
            <EpisodeMeta
              episode={episode}
              onChange={change}
              upload={upload}
              mediaUrl={(p) => mediaUrl(episode.id, p)}
            />
            <SceneList
              scenes={episode.scenes}
              onChange={(scenes) => change({...episode, scenes})}
              upload={upload}
              mediaUrl={(p) => mediaUrl(episode.id, p)}
              onPreview={previewScene}
            />
          </div>
          <aside className="side">
            <PreviewPanel episode={episode} format={format} onFormatChange={setFormat} playerRef={playerRef} />
            <RenderPanel episodeId={episode.id} ensureSaved={saveIfDirty} />
            <ThumbnailPanel episode={episode} onChange={change} ensureSaved={saveIfDirty} />
            <YoutubeMetaPanel episode={episode} />
          </aside>
        </main>
      )}
    </div>
  );
};
