import type {Episode} from './types';
import {computeTimeline, FPS} from './timeline';

// Điều kiện để YouTube nhận chương: mốc đầu là 0:00, ít nhất 3 chương, mỗi chương dài từ 10 giây
export const MIN_CHAPTER_SEC = 10;
export const MIN_CHAPTERS = 3;

const TITLE_MAX = 100;
const DESCRIPTION_MAX = 5000;
const TAGS_MAX = 500;
const HASHTAGS = ['#hoainiem', '#tuoitho', '#8x9x'];
const BASE_TAGS = ['hoài niệm', 'tuổi thơ', 'kí ức tuổi thơ', 'thế hệ 8x 9x', 'tuổi thơ 8x 9x', 'ngày xưa'];

export type Chapter = {startSec: number; title: string};

export type YoutubeMeta = {
  title: string;
  description: string;
  tags: string;
  chapters: Chapter[];
  /** false khi video quá ngắn để chia được 3 chương hợp lệ */
  hasChapters: boolean;
};

/** YouTube từ chối tiêu đề và mô tả có dấu < hoặc > */
const clean = (text: string) => text.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();

const truncate = (text: string, max: number) => {
  const chars = Array.from(text);
  return chars.length <= max ? text : `${chars.slice(0, max - 1).join('').trimEnd()}…`;
};

/** 75 -> "1:15", 3725 -> "1:02:05" */
export const formatTimestamp = (totalSec: number) => {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
};

/**
 * Mỗi cảnh là một mốc, nhưng cảnh thường chỉ dài 5–6 giây nên các cảnh liền nhau
 * được gộp lại cho đến khi đủ 10 giây. Chương cuối còn thiếu thì gộp vào chương trước.
 */
export const buildChapters = (episode: Episode, fps: number = FPS): Chapter[] => {
  const t = computeTimeline(episode, fps);
  const points = [
    {startSec: 0, title: 'Mở đầu', structural: true},
    ...episode.scenes.map((scene, i) => ({
      startSec: Math.floor(t.scenes[i].from / fps),
      title: clean(scene.caption) || `Cảnh ${i + 1}`,
      structural: false,
    })),
    {startSec: Math.floor(t.outroFrom / fps), title: 'Lời kết', structural: true},
  ];

  const groups: {startSec: number; points: typeof points}[] = [];
  for (const p of points) {
    const last = groups[groups.length - 1];
    if (last && p.startSec - last.startSec < MIN_CHAPTER_SEC) last.points.push(p);
    else groups.push({startSec: p.startSec, points: [p]});
  }
  const tail = groups[groups.length - 1];
  if (groups.length > 1 && t.total / fps - tail.startSec < MIN_CHAPTER_SEC) {
    groups[groups.length - 2].points.push(...tail.points);
    groups.pop();
  }

  return groups.map((g) => {
    // "Mở đầu"/"Lời kết" chỉ giữ khi chương không có cảnh nào khác để đặt tên
    const named = g.points.filter((p) => !p.structural);
    const titles = (named.length > 0 ? named : g.points).map((p) => p.title);
    return {startSec: g.startSec, title: truncate(titles.join(' · '), TITLE_MAX)};
  });
};

const buildTags = (episode: Episode) => {
  const seen = new Set<string>();
  const tags: string[] = [];
  let length = 0;
  for (const raw of [episode.title, episode.channelName, ...BASE_TAGS]) {
    const tag = clean(raw ?? '').replace(/,/g, '');
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    const added = length === 0 ? tag.length : tag.length + 2;
    if (length + added > TAGS_MAX) break;
    seen.add(key);
    tags.push(tag);
    length += added;
  }
  return tags.join(', ');
};

export const buildYoutubeMeta = (episode: Episode): YoutubeMeta => {
  const title = clean(episode.title);
  const subtitle = clean(episode.subtitle ?? '');
  const channel = clean(episode.channelName);
  const chapters = buildChapters(episode);
  const hasChapters = chapters.length >= MIN_CHAPTERS;

  const sections = [
    subtitle ? `${title}: ${subtitle.charAt(0).toLowerCase()}${subtitle.slice(1)}.` : `${title}.`,
    `Cùng ${channel} mở lại ngăn kéo kí ức, nơi cất giữ những điều nhỏ bé của một thời đã qua.`,
    hasChapters
      ? ['Mốc thời gian', ...chapters.map((c) => `${formatTimestamp(c.startSec)} ${c.title}`)].join('\n')
      : '',
    [clean(episode.outroQuestion), clean(episode.outroCallToAction ?? '')].filter(Boolean).join(' '),
    `Đăng ký kênh ${channel} để xem những tập hoài niệm tiếp theo.`,
    HASHTAGS.join(' '),
  ];

  return {
    title: truncate(subtitle ? `${title} | ${subtitle}` : title, TITLE_MAX),
    description: truncate(sections.filter(Boolean).join('\n\n'), DESCRIPTION_MAX),
    tags: buildTags(episode),
    chapters,
    hasChapters,
  };
};
