import fs from 'node:fs/promises';
import path from 'node:path';
import type {Episode} from '../shared/types';
import {sampleEpisode} from '../shared/sample.js';
import {EPISODES_DIR} from './config.js';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;

export const assertId = (id: string) => {
  if (!ID_RE.test(id)) throw new HttpError(400, 'Mã tập không hợp lệ');
};

export const episodeDir = (id: string) => {
  assertId(id);
  return path.join(EPISODES_DIR, id);
};

/** "Mùa hè năm ấy" -> "mua-he-nam-ay" */
export const slugify = (text: string, fallback = 'tap') =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || fallback;

const writeJson = async (file: string, data: unknown) => {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file);
};

export const getEpisode = async (id: string): Promise<Episode> => {
  try {
    const raw = await fs.readFile(path.join(episodeDir(id), 'episode.json'), 'utf8');
    return {...(JSON.parse(raw) as Episode), id};
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') throw new HttpError(404, 'Không tìm thấy tập này');
    throw err;
  }
};

export const saveEpisode = async (id: string, body: unknown): Promise<Episode> => {
  const candidate = body as Partial<Episode> | null;
  if (!candidate || typeof candidate.title !== 'string' || !Array.isArray(candidate.scenes)) {
    throw new HttpError(400, 'Dữ liệu tập không hợp lệ: cần có title và scenes');
  }
  const dir = episodeDir(id);
  await fs.mkdir(path.join(dir, 'assets'), {recursive: true});
  const episode = {...(candidate as Episode), id};
  await writeJson(path.join(dir, 'episode.json'), episode);
  return episode;
};

export const createEpisode = async (title: string): Promise<Episode> => {
  const id = `${slugify(title)}-${Date.now().toString(36).slice(-5)}`;
  return saveEpisode(id, {
    id,
    channelName: sampleEpisode.channelName,
    title,
    subtitle: '',
    musicVolume: 0.55,
    outroQuestion: sampleEpisode.outroQuestion,
    outroCallToAction: sampleEpisode.outroCallToAction,
    scenes: [
      {caption: 'Kỉ niệm thứ nhất', subCaption: 'Một dòng kể thêm về kỉ niệm này'},
      {caption: 'Kỉ niệm thứ hai'},
      {caption: 'Kỉ niệm thứ ba'},
    ],
  } satisfies Episode);
};

export const deleteEpisode = async (id: string) => {
  await fs.rm(episodeDir(id), {recursive: true, force: true});
};

export type EpisodeSummary = {id: string; title: string; sceneCount: number; updatedAt: number};

export const listEpisodes = async (): Promise<EpisodeSummary[]> => {
  await fs.mkdir(EPISODES_DIR, {recursive: true});
  const entries = await fs.readdir(EPISODES_DIR, {withFileTypes: true});
  const items = await Promise.all(
    entries
      .filter((e) => e.isDirectory() && ID_RE.test(e.name))
      .map(async (e): Promise<EpisodeSummary | null> => {
        try {
          const file = path.join(EPISODES_DIR, e.name, 'episode.json');
          const [raw, stat] = await Promise.all([fs.readFile(file, 'utf8'), fs.stat(file)]);
          const ep = JSON.parse(raw) as Episode;
          return {id: e.name, title: ep.title, sceneCount: ep.scenes.length, updatedAt: stat.mtimeMs};
        } catch {
          return null; // thư mục hỏng hoặc thiếu episode.json thì bỏ qua
        }
      }),
  );
  return items.filter((x): x is EpisodeSummary => x !== null).sort((a, b) => b.updatedAt - a.updatedAt);
};

/** Lần chạy đầu tiên: tạo sẵn tập mẫu để có cái xem ngay */
export const seedIfEmpty = async () => {
  if ((await listEpisodes()).length === 0) {
    await saveEpisode(sampleEpisode.id, sampleEpisode);
  }
};
