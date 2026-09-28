#!/usr/bin/env node
import {spawn} from 'node:child_process';

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

if (args.includes('--help') || args.includes('-h')) {
  console.log(`Ngăn Kéo Studio: xưởng dựng video hoài niệm 8x/9x

Cách dùng: ngan-keo-studio [tuỳ chọn]

  --port <số>        Cổng chạy web app (mặc định 3210)
  --data <thư mục>   Nơi lưu các tập phim và video đã xuất (mặc định ~/NganKeoStudio)
  --no-open          Không tự mở trình duyệt`);
  process.exit(0);
}

// Phải đặt biến môi trường trước khi nạp server, vì cấu hình được đọc lúc import
if (option('--port')) process.env.HOAINIEM_PORT = option('--port');
if (option('--data')) process.env.HOAINIEM_DATA = option('--data');

const {startServer} = await import('../dist/server/index.js');
const {url} = await startServer();

if (!args.includes('--no-open')) {
  const [cmd, cmdArgs] =
    process.platform === 'darwin'
      ? ['open', [url]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', url]]
        : ['xdg-open', [url]];
  spawn(cmd, cmdArgs, {stdio: 'ignore', detached: true}).on('error', () => {}).unref();
}
