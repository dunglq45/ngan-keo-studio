import React, {useEffect, useRef, useState} from 'react';
import type {MemoryScene} from '../../../src/shared/types';

/**
 * Đo độ dài bằng cách giải mã hẳn file âm thanh. Không dùng audio.duration vì file webm
 * do Chrome thu bằng MediaRecorder thường không ghi độ dài, trình duyệt báo Infinity.
 */
const measureSeconds = async (blob: Blob) => {
  const ctx = new AudioContext();
  try {
    const buffer = await ctx.decodeAudioData(await blob.arrayBuffer());
    return Math.round(buffer.duration * 100) / 100;
  } catch {
    throw new Error('Không đọc được file âm thanh này');
  } finally {
    void ctx.close();
  }
};

const pickMimeType = () =>
  ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((t) => MediaRecorder.isTypeSupported(t)) ?? '';

const formatClock = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

type Props = {
  scene: MemoryScene;
  index: number;
  upload: (file: File) => Promise<string>;
  mediaUrl: (path: string) => string;
  onChange: (value: Pick<MemoryScene, 'narration' | 'narrationSec'>) => void;
};

type Phase = 'idle' | 'recording' | 'saving';

export const NarrationControl: React.FC<Props> = ({scene, index, upload, mediaUrl, onChange}) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<number | undefined>(undefined);
  // Thu âm có thể kéo dài; lúc dừng phải cập nhật theo dữ liệu mới nhất, không phải lúc bấm thu
  const latestOnChange = useRef(onChange);
  latestOnChange.current = onChange;

  // Rời trang hoặc xoá cảnh khi đang thu thì tắt micro
  useEffect(
    () => () => {
      window.clearInterval(timer.current);
      recorder.current?.stream.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  const save = async (file: File) => {
    setPhase('saving');
    setError(null);
    try {
      const narrationSec = await measureSeconds(file);
      if (narrationSec < 0.3) throw new Error('Lời kể quá ngắn, hãy thu lại');
      const narration = await upload(file);
      latestOnChange.current({narration, narrationSec});
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPhase('idle');
    }
  };

  const startRecording = async () => {
    setError(null);
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Trình duyệt này không thu âm được, hãy dùng Chrome hoặc Edge, hoặc tải file lên');
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true}});
    } catch {
      setError('Không mở được micro. Hãy cho phép trình duyệt dùng micro rồi thử lại');
      return;
    }
    const mimeType = pickMimeType();
    const rec = new MediaRecorder(stream, mimeType ? {mimeType} : undefined);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      window.clearInterval(timer.current);
      const type = rec.mimeType || 'audio/webm';
      const ext = type.includes('mp4') ? 'm4a' : 'webm';
      void save(new File(chunks, `loi-ke-canh-${index + 1}.${ext}`, {type: type.split(';')[0]}));
    };
    recorder.current = rec;
    rec.start();
    const started = Date.now();
    setElapsed(0);
    timer.current = window.setInterval(() => setElapsed((Date.now() - started) / 1000), 250);
    setPhase('recording');
  };

  const stopRecording = () => recorder.current?.stop();

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) void save(file);
  };

  const fileButton = (label: string) => (
    <label className="narration-button" aria-disabled={phase !== 'idle'}>
      {label}
      <input type="file" accept="audio/*" className="visually-hidden" onChange={pickFile} disabled={phase !== 'idle'} />
    </label>
  );

  return (
    <div className="narration" aria-busy={phase === 'saving'}>
      <span className="narration-label">Lời kể</span>
      {phase === 'recording' ? (
        <>
          <span className="rec-dot" aria-hidden />
          <span role="status">Đang thu {formatClock(elapsed)}</span>
          <button type="button" className="narration-button stop" onClick={stopRecording}>
            Dừng thu
          </button>
        </>
      ) : phase === 'saving' ? (
        <span className="muted" role="status">
          Đang lưu lời kể…
        </span>
      ) : scene.narration ? (
        <>
          <audio src={mediaUrl(scene.narration)} controls preload="none" />
          <span className="muted">{scene.narrationSec?.toFixed(1)} giây</span>
          <button type="button" className="narration-button" onClick={() => void startRecording()}>
            Thu lại
          </button>
          {fileButton('Đổi file')}
          <button
            type="button"
            className="link-button danger"
            onClick={() => onChange({narration: undefined, narrationSec: undefined})}
          >
            Bỏ lời kể
          </button>
        </>
      ) : (
        <>
          <button type="button" className="narration-button" onClick={() => void startRecording()}>
            Thu lời kể
          </button>
          {fileButton('Tải file lên')}
        </>
      )}
      {error ? <p className="field-error narration-error">{error}</p> : null}
    </div>
  );
};
