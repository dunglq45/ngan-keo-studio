import React, {useEffect, useRef, useState} from 'react';
import type {FocusPoint} from '../../../src/shared/types';
import {coverCrop, DEFAULT_FOCUS} from '../../../src/shared/focus';

const FRAMES = [
  {key: '16x9', label: 'Ngang 16:9', aspect: 16 / 9},
  {key: '9x16', label: 'Dọc 9:16', aspect: 9 / 16},
];

const clampPct = (v: number) => Math.round(Math.min(100, Math.max(0, v)));

type Props = {
  src: string;
  caption: string;
  focus?: FocusPoint;
  onChange: (focus: FocusPoint | undefined) => void;
  onClose: () => void;
};

/** Hộp thoại chọn điểm cần giữ khi ảnh bị cắt vào khung ngang hoặc dọc */
export const FocusEditor: React.FC<Props> = ({src, caption, focus, onChange, onClose}) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const [aspect, setAspect] = useState<number | null>(null);
  const f = focus ?? DEFAULT_FOCUS;

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const setFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onChange({x: clampPct(((e.clientX - r.left) / r.width) * 100), y: clampPct(((e.clientY - r.top) / r.height) * 100)});
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const d = delta[e.key];
    if (!d) return;
    e.preventDefault();
    onChange({x: clampPct(f.x + d[0]), y: clampPct(f.y + d[1])});
  };

  return (
    <dialog ref={dialog} className="focus-dialog" onClose={onClose}>
      <h2 className="section-title">Lấy nét: {caption}</h2>
      <p className="muted hint">
        Bấm hoặc kéo vào chỗ quan trọng nhất của ảnh, thường là khuôn mặt. Hai khung cho thấy phần ảnh còn lại ở mỗi
        khổ video; hiệu ứng phóng sẽ phóng quanh điểm này.
      </p>

      <div
        className="focus-stage"
        tabIndex={0}
        role="group"
        aria-label={`Điểm lấy nét đang ở ${f.x}% ngang, ${f.y}% dọc. Dùng phím mũi tên để dịch, giữ Shift để dịch nhanh.`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromPointer(e);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) setFromPointer(e);
        }}
        onKeyDown={onKeyDown}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          onLoad={(e) => setAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
        />
        {aspect
          ? FRAMES.map(({key, label, aspect: frameAspect}) => {
              const c = coverCrop(aspect, frameAspect, f);
              return (
                <div
                  key={key}
                  className={`crop crop-${key}`}
                  style={{
                    left: `${c.left * 100}%`,
                    top: `${c.top * 100}%`,
                    width: `${c.width * 100}%`,
                    height: `${c.height * 100}%`,
                  }}
                >
                  <span>{label}</span>
                </div>
              );
            })
          : null}
        <div className="focus-dot" style={{left: `${f.x}%`, top: `${f.y}%`}} />
      </div>

      <div className="focus-actions">
        <button type="button" className="link-button" onClick={() => onChange(undefined)} disabled={!focus}>
          Đặt lại giữa ảnh
        </button>
        <button type="button" className="button" onClick={() => dialog.current?.close()}>
          Xong
        </button>
      </div>
    </dialog>
  );
};
