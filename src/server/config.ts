import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Chạy từ src/server (dev) hay dist/server (bản đóng gói) thì gốc package đều cách hai cấp
const here = path.dirname(fileURLToPath(import.meta.url));
export const PKG_ROOT = path.resolve(here, '../..');

export const HOST = '127.0.0.1'; // chỉ nghe trên máy mình, không mở ra mạng LAN
export const PORT = Number(process.env.HOAINIEM_PORT ?? 3210);
export const ORIGIN = `http://${HOST}:${PORT}`;

export const DATA_DIR = path.resolve(process.env.HOAINIEM_DATA ?? path.join(os.homedir(), 'NganKeoStudio'));
export const EPISODES_DIR = path.join(DATA_DIR, 'episodes');
export const RENDERS_DIR = path.join(DATA_DIR, 'renders');

export const REMOTION_ENTRY = path.join(PKG_ROOT, 'src/remotion/index.ts');
/** Bundle dựng sẵn bởi `npm run build`; bản đóng gói chỉ dùng cái này */
export const PREBUILT_BUNDLE = path.join(PKG_ROOT, 'dist/remotion-bundle');
export const WEB_DIST = path.join(PKG_ROOT, 'dist/web');
