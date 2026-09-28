import type {Episode} from './types';

/** Mã composition ảnh bìa, server gọi renderStill theo mã này */
export const THUMBNAIL_ID = 'Thumbnail';

/** Kích thước ảnh bìa YouTube khuyến nghị */
export const THUMBNAIL_SIZE = {width: 1280, height: 720};

/** Chỉ số cảnh dùng làm nền ảnh bìa, hoặc -1 nếu tập chưa có cảnh nào */
export const thumbnailSceneIndex = (episode: Episode) => {
  const chosen = episode.thumbnailScene;
  if (chosen !== undefined && episode.scenes[chosen]) return chosen;
  const withImage = episode.scenes.findIndex((s) => s.image);
  return withImage >= 0 ? withImage : episode.scenes.length > 0 ? 0 : -1;
};

export const thumbnailText = (episode: Episode) => episode.thumbnailText?.trim() || episode.title;
