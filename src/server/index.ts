import fs from 'node:fs';
import path from 'node:path';
import express, {type NextFunction, type Request, type Response} from 'express';
import multer from 'multer';
import type {RenderFormat} from '../shared/types';
import {DATA_DIR, EPISODES_DIR, HOST, ORIGIN, PORT, RENDERS_DIR, WEB_DIST} from './config.js';
import {
  HttpError,
  createEpisode,
  deleteEpisode,
  episodeDir,
  getEpisode,
  listEpisodes,
  saveEpisode,
  seedIfEmpty,
  slugify,
} from './episodes.js';
import {enqueueRender, getJob, listRenders, renderThumbnail, subscribe} from './render.js';

type AsyncHandler = (req: Request, res: Response) => Promise<unknown>;
const wrap = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res).catch(next);
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      try {
        const dir = path.join(episodeDir(String(req.params.id)), 'assets');
        fs.mkdirSync(dir, {recursive: true});
        cb(null, dir);
      } catch (err) {
        cb(err as Error, '');
      }
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
      const base = slugify(path.basename(file.originalname, path.extname(file.originalname)), 'file');
      cb(null, `${Date.now().toString(36)}-${base}${ext}`);
    },
  }),
  limits: {fileSize: 200 * 1024 * 1024},
  fileFilter: (_req, file, cb) => cb(null, /^(image|audio)\//.test(file.mimetype)),
});

export const startServer = async () => {
  await seedIfEmpty();
  fs.mkdirSync(RENDERS_DIR, {recursive: true});

  const app = express();
  app.use(express.json({limit: '2mb'}));

  app.get('/api/episodes', wrap(async (_req, res) => res.json(await listEpisodes())));

  app.post(
    '/api/episodes',
    wrap(async (req, res) => {
      const title = String(req.body?.title ?? '').trim() || 'Tập mới';
      res.status(201).json(await createEpisode(title));
    }),
  );

  app.get('/api/episodes/:id', wrap(async (req, res) => res.json(await getEpisode(req.params.id))));

  app.put('/api/episodes/:id', wrap(async (req, res) => res.json(await saveEpisode(req.params.id, req.body))));

  app.delete(
    '/api/episodes/:id',
    wrap(async (req, res) => {
      await deleteEpisode(req.params.id);
      res.json({ok: true});
    }),
  );

  app.post('/api/episodes/:id/assets', upload.single('file'), (req, res) => {
    if (!req.file) throw new HttpError(400, 'Chỉ nhận file ảnh hoặc âm thanh');
    res.status(201).json({path: `assets/${req.file.filename}`});
  });

  app.get('/api/episodes/:id/renders', wrap(async (req, res) => res.json(await listRenders(req.params.id))));

  app.post(
    '/api/episodes/:id/render',
    wrap(async (req, res) => {
      const format: RenderFormat = req.body?.format === '9x16' ? '9x16' : '16x9';
      await getEpisode(req.params.id); // báo 404 ngay nếu tập không tồn tại
      res.status(202).json(enqueueRender(req.params.id, format));
    }),
  );

  app.post(
    '/api/episodes/:id/thumbnail',
    wrap(async (req, res) => {
      await getEpisode(req.params.id);
      res.status(201).json(await renderThumbnail(req.params.id));
    }),
  );

  // Tiến độ render đẩy về trình duyệt qua Server-Sent Events
  app.get('/api/jobs/:jobId/events', (req, res) => {
    const job = getJob(req.params.jobId);
    if (!job) throw new HttpError(404, 'Không tìm thấy lượt render này');
    res.set({'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive'});
    res.flushHeaders();
    const send = (data: unknown) => res.write(`data: ${JSON.stringify(data)}\n\n`);
    send(job);
    const unsubscribe = subscribe(job.id, send);
    req.on('close', unsubscribe);
  });

  app.use('/media', express.static(EPISODES_DIR));
  app.use('/renders', express.static(RENDERS_DIR));

  if (fs.existsSync(WEB_DIST)) {
    app.use(express.static(WEB_DIST));
    app.get('*', (_req, res) => res.sendFile(path.join(WEB_DIST, 'index.html')));
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error(err);
    res.status(status).json({error: err instanceof Error ? err.message : 'Lỗi không xác định'});
  });

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(PORT, HOST, () => resolve());
    server.on('error', reject);
  });

  console.log(`\n  Ngăn Kéo Studio đang chạy tại ${ORIGIN}`);
  console.log(`  Dữ liệu lưu ở ${DATA_DIR}\n`);
  return {url: ORIGIN};
};
