import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {RenderFormat} from '../../../src/shared/types';
import {api, type RenderFile, type RenderJob} from '../api';

const FORMATS: {format: RenderFormat; label: string}[] = [
  {format: '16x9', label: 'Xuất bản YouTube 16:9'},
  {format: '9x16', label: 'Xuất bản dọc 9:16'},
];

const statusText = (job: RenderJob) => {
  switch (job.status) {
    case 'queued':
      return 'Đang chờ lượt';
    case 'preparing':
      return 'Đang chuẩn bị (lần đầu mất khoảng nửa phút)';
    case 'rendering':
      return `Đang dựng ${Math.round(job.progress * 100)}%`;
    case 'done':
      return 'Đã xuất xong';
    case 'error':
      return `Lỗi: ${job.error ?? 'không rõ nguyên nhân'}`;
  }
};

const isBusy = (job?: RenderJob) => !!job && ['queued', 'preparing', 'rendering'].includes(job.status);

type Props = {episodeId: string; ensureSaved: () => Promise<void>};

export const RenderPanel: React.FC<Props> = ({episodeId, ensureSaved}) => {
  const [jobs, setJobs] = useState<Partial<Record<RenderFormat, RenderJob>>>({});
  const [files, setFiles] = useState<RenderFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const streams = useRef<EventSource[]>([]);

  const loadFiles = useCallback(() => {
    api
      .renders(episodeId)
      .then((all) => setFiles(all.filter((f) => f.kind !== 'thumb')))
      .catch(() => setFiles([]));
  }, [episodeId]);

  useEffect(loadFiles, [loadFiles]);
  useEffect(() => () => streams.current.forEach((s) => s.close()), []);

  const start = async (format: RenderFormat) => {
    setError(null);
    try {
      await ensureSaved();
      const job = await api.render(episodeId, format);
      setJobs((j) => ({...j, [format]: job}));

      const stream = new EventSource(`/api/jobs/${job.id}/events`);
      streams.current.push(stream);
      stream.onmessage = (ev) => {
        const next = JSON.parse(ev.data) as RenderJob;
        setJobs((j) => ({...j, [format]: next}));
        if (next.status === 'done' || next.status === 'error') {
          stream.close();
          if (next.status === 'done') loadFiles();
        }
      };
      stream.onerror = () => stream.close();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section className="render">
      <div className="render-buttons">
        {FORMATS.map(({format, label}) => {
          const job = jobs[format]?.episodeId === episodeId ? jobs[format] : undefined;
          return (
            <div key={format} className="render-slot">
              <button type="button" className="button" disabled={isBusy(job)} onClick={() => start(format)}>
                {label}
              </button>
              {job ? (
                <div className={`progress ${job.status}`}>
                  <div className="progress-bar" style={{width: `${Math.round(job.progress * 100)}%`}} />
                  <span>{statusText(job)}</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {error ? <p className="field-error">{error}</p> : null}

      <h2 className="section-title">Video đã xuất</h2>
      {files.length === 0 ? (
        <p className="muted">Chưa có video nào cho tập này.</p>
      ) : (
        <ul className="render-files">
          {files.map((f) => (
            <li key={f.name}>
              <a href={`/renders/${f.name}`} target="_blank" rel="noreferrer">
                {f.kind === '9x16' ? 'Bản dọc 9:16' : 'Bản ngang 16:9'}
              </a>
              <span className="muted">
                {new Date(f.updatedAt).toLocaleString('vi-VN')}, {(f.size / 1024 / 1024).toFixed(1)} MB
              </span>
              <a href={`/renders/${f.name}`} download className="link-button">
                Tải về
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
