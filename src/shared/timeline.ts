import type {Episode, MemoryScene, RenderFormat} from './types';

export const FPS = 30;
/** Số frame hai cảnh chồng lên nhau khi chuyển cảnh */
export const FADE_FRAMES = 20;
/** Thời gian đếm ngược 3-2-1 kiểu đầu cuộn phim */
export const LEADER_FRAMES = 60;
/** Khoảng lặng sau lời kể trước khi bắt đầu chuyển sang cảnh sau */
export const NARRATION_TAIL_SEC = 0.5;
/** Nhạc nền còn lại bao nhiêu phần khi đang có lời kể */
export const MUSIC_DUCK_LEVEL = 0.3;

export const FORMAT_SIZE: Record<RenderFormat, {width: number; height: number}> = {
  '16x9': {width: 1920, height: 1080},
  '9x16': {width: 1080, height: 1920},
};

export type TimelineItem = {from: number; duration: number};

export const narrationFrames = (scene: MemoryScene, fps: number = FPS) =>
  scene.narration && scene.narrationSec ? Math.ceil(scene.narrationSec * fps) : 0;

/**
 * Lời kể bắt đầu khi cảnh vừa hiện rõ (sau đoạn chồng mờ), nên cảnh phải dài ít nhất:
 * chồng mờ vào + lời kể + khoảng lặng + chồng mờ ra.
 */
export const sceneFrames = (scene: MemoryScene, fps: number = FPS) => {
  const base = Math.max(FADE_FRAMES * 2 + 1, Math.round((scene.durationSec ?? 5.5) * fps));
  const voice = narrationFrames(scene, fps);
  return voice > 0 ? Math.max(base, FADE_FRAMES * 2 + voice + Math.round(NARRATION_TAIL_SEC * fps)) : base;
};

export const computeTimeline = (episode: Episode, fps: number = FPS) => {
  const intro = Math.round((episode.introDurationSec ?? 5) * fps) + LEADER_FRAMES;
  const outro = Math.round((episode.outroDurationSec ?? 6) * fps);

  let cursor = intro - FADE_FRAMES;
  const scenes: TimelineItem[] = episode.scenes.map((scene) => {
    const duration = sceneFrames(scene, fps);
    const item = {from: cursor, duration};
    cursor += duration - FADE_FRAMES;
    return item;
  });

  // Vị trí lời kể của từng cảnh trên toàn video (null nếu cảnh không có lời kể)
  const narrations: (TimelineItem | null)[] = episode.scenes.map((scene, i) => {
    const duration = narrationFrames(scene, fps);
    return duration > 0 ? {from: scenes[i].from + FADE_FRAMES, duration} : null;
  });

  const outroFrom = cursor;
  return {intro, scenes, narrations, outroFrom, outro, total: outroFrom + outro};
};

/**
 * Mức nhạc nền tại một frame: hạ xuống MUSIC_DUCK_LEVEL trong lúc có lời kể,
 * hạ dần 0,3 giây trước khi nói và trả lại dần 0,5 giây sau khi nói xong.
 */
export const musicDuck = (frame: number, narrations: (TimelineItem | null)[], fps: number = FPS) => {
  const down = Math.round(fps * 0.3);
  const up = Math.round(fps * 0.5);
  let duck = 0;
  for (const n of narrations) {
    if (!n) continue;
    const start = n.from;
    const end = n.from + n.duration;
    let d = 0;
    if (frame >= start - down && frame < start) d = (frame - (start - down)) / down;
    else if (frame >= start && frame <= end) d = 1;
    else if (frame > end && frame < end + up) d = 1 - (frame - end) / up;
    duck = Math.max(duck, d);
  }
  return 1 - (1 - MUSIC_DUCK_LEVEL) * duck;
};
