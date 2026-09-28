import type {Episode, RenderFormat} from '../../src/shared/types';

export type EpisodeSummary = {id: string; title: string; sceneCount: number; updatedAt: number};
export type RenderStatus = 'queued' | 'preparing' | 'rendering' | 'done' | 'error';
export type RenderJob = {
  id: string;
  episodeId: string;
  format: RenderFormat;
  status: RenderStatus;
  progress: number;
  outputFile?: string;
  error?: string;
};
export type RenderFile = {name: string; kind: RenderFormat | 'thumb'; size: number; updatedAt: number};

const json = async <T,>(res: Response): Promise<T> => {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {error?: string};
    throw new Error(body.error ?? `Máy chủ trả lỗi ${res.status}`);
  }
  return res.json() as Promise<T>;
};

const send = (method: string, body: unknown): RequestInit => ({
  method,
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(body),
});

export const api = {
  list: () => fetch('/api/episodes').then((r) => json<EpisodeSummary[]>(r)),
  get: (id: string) => fetch(`/api/episodes/${id}`).then((r) => json<Episode>(r)),
  create: (title: string) => fetch('/api/episodes', send('POST', {title})).then((r) => json<Episode>(r)),
  save: (episode: Episode) => fetch(`/api/episodes/${episode.id}`, send('PUT', episode)).then((r) => json<Episode>(r)),
  remove: (id: string) => fetch(`/api/episodes/${id}`, {method: 'DELETE'}).then((r) => json<{ok: true}>(r)),
  upload: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return fetch(`/api/episodes/${id}/assets`, {method: 'POST', body: form}).then((r) => json<{path: string}>(r));
  },
  render: (id: string, format: RenderFormat) =>
    fetch(`/api/episodes/${id}/render`, send('POST', {format})).then((r) => json<RenderJob>(r)),
  thumbnail: (id: string) => fetch(`/api/episodes/${id}/thumbnail`, {method: 'POST'}).then((r) => json<RenderFile>(r)),
  renders: (id: string) => fetch(`/api/episodes/${id}/renders`).then((r) => json<RenderFile[]>(r)),
};

export const mediaUrl = (episodeId: string, assetPath: string) => `/media/${episodeId}/${assetPath}`;
