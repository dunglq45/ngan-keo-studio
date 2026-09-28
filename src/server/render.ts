import {EventEmitter} from 'node:events';
import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {ensureBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import type {RenderFormat} from '../shared/types';
import {THUMBNAIL_ID} from '../shared/thumbnail.js';
import {ORIGIN, PREBUILT_BUNDLE, REMOTION_ENTRY, RENDERS_DIR} from './config.js';
import {assertId, getEpisode} from './episodes.js';

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

const jobs = new Map<string, RenderJob>();
const events = new EventEmitter();
events.setMaxListeners(100);

const update = (job: RenderJob, patch: Partial<RenderJob>) => {
  Object.assign(job, patch);
  events.emit(job.id, {...job});
};

export const getJob = (id: string) => jobs.get(id);

export const subscribe = (jobId: string, listener: (job: RenderJob) => void) => {
  events.on(jobId, listener);
  return () => {
    events.off(jobId, listener);
  };
};

// Bản đóng gói dùng bundle dựng sẵn trong dist/remotion-bundle.
// Khi dev thì bundle bằng webpack lúc chạy (mất 10–30 giây), và với HOAINIEM_REBUNDLE=1
// sẽ bundle lại mỗi lần render để thấy ngay thay đổi trong src/remotion.
let bundlePromise: Promise<string> | null = null;
const getServeUrl = (): Promise<string> => {
  const rebundle = process.env.HOAINIEM_REBUNDLE === '1';
  if (!rebundle && existsSync(PREBUILT_BUNDLE)) return Promise.resolve(PREBUILT_BUNDLE);
  if (!bundlePromise || rebundle) {
    bundlePromise = import('@remotion/bundler').then(({bundle}) => bundle({entryPoint: REMOTION_ENTRY}));
    bundlePromise.catch(() => {
      bundlePromise = null;
    });
  }
  return bundlePromise;
};

/** Dấu thời gian cho tên file, tính đến giây để hai lần xuất liền nhau không ghi đè lên nhau */
const fileStamp = () => new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');

const prepare = async (episodeId: string, compositionId: string) => {
  await ensureBrowser();
  const serveUrl = await getServeUrl();
  const episode = await getEpisode(episodeId);
  const inputProps = {episode, assetBaseUrl: `${ORIGIN}/media/${episodeId}`};
  const composition = await selectComposition({serveUrl, id: compositionId, inputProps});
  await fs.mkdir(RENDERS_DIR, {recursive: true});
  return {serveUrl, inputProps, composition};
};

const run = async (job: RenderJob) => {
  try {
    update(job, {status: 'preparing'});
    const {serveUrl, inputProps, composition} = await prepare(job.episodeId, `HoaiNiem-${job.format}`);
    const outputFile = `${job.episodeId}-${job.format}-${fileStamp()}.mp4`;

    update(job, {status: 'rendering', progress: 0});
    let lastSent = 0;
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      crf: 18,
      imageFormat: 'jpeg',
      outputLocation: path.join(RENDERS_DIR, outputFile),
      inputProps,
      onProgress: ({progress}) => {
        if (progress - lastSent >= 0.01 || progress === 1) {
          lastSent = progress;
          update(job, {progress});
        }
      },
    });

    update(job, {status: 'done', progress: 1, outputFile});
  } catch (err) {
    console.error(`[render ${job.id}]`, err);
    update(job, {status: 'error', error: err instanceof Error ? err.message : String(err)});
  }
};

// Render lần lượt từng video, vì mỗi lần render đã dùng hết các nhân CPU
let queue: Promise<void> = Promise.resolve();

export const enqueueRender = (episodeId: string, format: RenderFormat): RenderJob => {
  assertId(episodeId);
  const job: RenderJob = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    episodeId,
    format,
    status: 'queued',
    progress: 0,
  };
  jobs.set(job.id, job);
  queue = queue.then(() => run(job));
  return {...job};
};

/** Ảnh bìa chỉ là một khung hình nên xuất thẳng, không cần xếp hàng sau các video đang dựng */
export const renderThumbnail = async (episodeId: string): Promise<RenderFile> => {
  assertId(episodeId);
  const {serveUrl, inputProps, composition} = await prepare(episodeId, THUMBNAIL_ID);
  const name = `${episodeId}-thumb-${fileStamp()}.jpg`;
  const output = path.join(RENDERS_DIR, name);
  await renderStill({composition, serveUrl, inputProps, output, imageFormat: 'jpeg', jpegQuality: 90});
  const stat = await fs.stat(output);
  return {name, kind: 'thumb', size: stat.size, updatedAt: stat.mtimeMs};
};

export type RenderFile = {name: string; kind: RenderFormat | 'thumb'; size: number; updatedAt: number};

export const listRenders = async (episodeId: string): Promise<RenderFile[]> => {
  assertId(episodeId);
  await fs.mkdir(RENDERS_DIR, {recursive: true});
  // Mã tập chỉ gồm a-z, 0-9 và "-" nên ghép thẳng vào regex được
  const pattern = new RegExp(`^${episodeId}-(?:(16x9|9x16)-\\d+\\.mp4|(thumb)-\\d+\\.jpg)$`);
  const matches = (await fs.readdir(RENDERS_DIR)).flatMap((name) => {
    const m = pattern.exec(name);
    return m ? [{name, kind: (m[1] ?? m[2]) as RenderFile['kind']}] : [];
  });
  const files = await Promise.all(
    matches.map(async ({name, kind}) => {
      const stat = await fs.stat(path.join(RENDERS_DIR, name));
      return {name, kind, size: stat.size, updatedAt: stat.mtimeMs};
    }),
  );
  return files.sort((a, b) => b.updatedAt - a.updatedAt);
};
