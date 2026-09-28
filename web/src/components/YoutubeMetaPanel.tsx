import React, {useMemo, useState} from 'react';
import type {Episode} from '../../../src/shared/types';
import {buildYoutubeMeta, MIN_CHAPTER_SEC, MIN_CHAPTERS} from '../../../src/shared/youtube';

type Field = 'title' | 'description' | 'tags';

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Trình duyệt chặn clipboard API thì chép theo cách cũ
    const area = document.createElement('textarea');
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
};

export const YoutubeMetaPanel: React.FC<{episode: Episode}> = ({episode}) => {
  const meta = useMemo(() => buildYoutubeMeta(episode), [episode]);
  const [copied, setCopied] = useState<Field | null>(null);

  const copy = async (field: Field) => {
    await copyText(meta[field]);
    setCopied(field);
    window.setTimeout(() => setCopied((c) => (c === field ? null : c)), 1500);
  };

  const copyButton = (field: Field) => (
    <button type="button" className="link-button" onClick={() => void copy(field)}>
      {copied === field ? 'Đã chép' : 'Chép'}
    </button>
  );

  return (
    <section className="youtube-meta">
      <h2 className="section-title">Nội dung đăng YouTube</h2>

      <div className="field">
        <span className="meta-label">
          Tiêu đề <span className="muted">{Array.from(meta.title).length}/100</span>
          {copyButton('title')}
        </span>
        <input value={meta.title} readOnly />
      </div>

      <div className="field">
        <span className="meta-label">
          Mô tả
          {copyButton('description')}
        </span>
        <textarea value={meta.description} readOnly rows={12} />
      </div>
      <p className="muted hint">
        {meta.hasChapters
          ? `Đã chia ${meta.chapters.length} chương. Các cảnh ngắn được gộp lại vì YouTube chỉ nhận chương dài từ ${MIN_CHAPTER_SEC} giây.`
          : `Video chưa đủ dài để chia chương: YouTube cần ít nhất ${MIN_CHAPTERS} chương, mỗi chương từ ${MIN_CHAPTER_SEC} giây. Thêm cảnh hoặc tăng số giây để có mốc thời gian.`}
      </p>

      <div className="field">
        <span className="meta-label">
          Thẻ tag
          {copyButton('tags')}
        </span>
        <textarea value={meta.tags} readOnly rows={2} />
      </div>
    </section>
  );
};
