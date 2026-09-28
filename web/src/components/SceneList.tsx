import React, {useState} from 'react';
import type {KenBurns, MemoryScene} from '../../../src/shared/types';
import {objectPosition} from '../../../src/shared/focus';
import {FilePicker} from './FilePicker';
import {FocusEditor} from './FocusEditor';
import {NarrationControl} from './NarrationControl';
import {FPS, sceneFrames} from '../../../src/shared/timeline';

const MOTIONS: {value: KenBurns | ''; label: string}[] = [
  {value: '', label: 'Tự động'},
  {value: 'zoom-in', label: 'Phóng dần vào'},
  {value: 'zoom-out', label: 'Lùi dần ra'},
  {value: 'pan-left', label: 'Trượt sang trái'},
  {value: 'pan-right', label: 'Trượt sang phải'},
];

type Props = {
  scenes: MemoryScene[];
  onChange: (scenes: MemoryScene[]) => void;
  upload: (file: File) => Promise<string>;
  mediaUrl: (path: string) => string;
  onPreview: (index: number) => void;
};

export const SceneList: React.FC<Props> = ({scenes, onChange, upload, mediaUrl, onPreview}) => {
  const [focusing, setFocusing] = useState<number | null>(null);
  const focusScene = focusing === null ? undefined : scenes[focusing];

  const patch = (i: number, value: Partial<MemoryScene>) =>
    onChange(scenes.map((s, j) => (j === i ? {...s, ...value} : s)));

  const move = (i: number, dir: -1 | 1) => {
    const next = [...scenes];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  const remove = (i: number) => {
    if (window.confirm(`Xoá cảnh “${scenes[i].caption}”?`)) onChange(scenes.filter((_, j) => j !== i));
  };

  return (
    <section>
      <h2 className="section-title">Các cảnh</h2>
      <ol className="filmstrip">
        {scenes.map((scene, i) => (
          <li key={i} className="frame">
            <FilePicker
              accept="image/*"
              upload={upload}
              onUploaded={(p) => patch(i, {image: p})}
              className="thumb"
            >
              {scene.image ? (
                <img src={mediaUrl(scene.image)} alt="" style={{objectPosition: objectPosition(scene.focus)}} />
              ) : (
                <span className="thumb-empty">Chọn ảnh</span>
              )}
            </FilePicker>

            <div className="frame-fields">
              <input
                className="caption-input"
                value={scene.caption}
                onChange={(e) => patch(i, {caption: e.target.value})}
                placeholder="Dòng chữ chính"
                aria-label={`Dòng chữ chính của cảnh ${i + 1}`}
              />
              <textarea
                rows={2}
                value={scene.subCaption ?? ''}
                onChange={(e) => patch(i, {subCaption: e.target.value})}
                placeholder="Dòng kể thêm (không bắt buộc)"
                aria-label={`Dòng kể thêm của cảnh ${i + 1}`}
              />
              <div className="frame-options">
                <label className="field compact">
                  <span>Dấu ngày</span>
                  <input
                    value={scene.stamp ?? ''}
                    onChange={(e) => patch(i, {stamp: e.target.value})}
                    placeholder="'96 7 03"
                  />
                </label>
                <label className="field compact">
                  <span>Số giây</span>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    step={0.5}
                    value={scene.durationSec ?? 5.5}
                    onChange={(e) => patch(i, {durationSec: Number(e.target.value) || 5.5})}
                  />
                </label>
                <label className="field compact">
                  <span>Chuyển động</span>
                  <select
                    value={scene.kenBurns ?? ''}
                    onChange={(e) => patch(i, {kenBurns: (e.target.value || undefined) as KenBurns | undefined})}
                  >
                    {MOTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <NarrationControl
                scene={scene}
                index={i}
                upload={upload}
                mediaUrl={mediaUrl}
                onChange={(value) => patch(i, value)}
              />
              {sceneFrames(scene) > sceneFrames({...scene, narration: undefined}) ? (
                <p className="muted narration-hint">
                  Cảnh tự kéo dài thành {(sceneFrames(scene) / FPS).toFixed(1)} giây cho đủ lời kể.
                </p>
              ) : null}
            </div>

            <div className="frame-actions">
              <button type="button" onClick={() => onPreview(i)}>
                Xem cảnh
              </button>
              {scene.image ? (
                <button type="button" onClick={() => setFocusing(i)} aria-pressed={!!scene.focus}>
                  {scene.focus ? 'Đã lấy nét' : 'Lấy nét'}
                </button>
              ) : null}
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Đưa cảnh lên trước">
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === scenes.length - 1}
                aria-label="Đưa cảnh xuống sau"
              >
                ↓
              </button>
              <button type="button" className="danger" onClick={() => remove(i)}>
                Xoá
              </button>
            </div>
          </li>
        ))}
      </ol>
      {focusScene?.image ? (
        <FocusEditor
          src={mediaUrl(focusScene.image)}
          caption={focusScene.caption}
          focus={focusScene.focus}
          onChange={(focus) => patch(focusing!, {focus})}
          onClose={() => setFocusing(null)}
        />
      ) : null}
      <button type="button" className="button secondary add-scene" onClick={() => onChange([...scenes, {caption: 'Kỉ niệm mới'}])}>
        Thêm cảnh
      </button>
    </section>
  );
};
