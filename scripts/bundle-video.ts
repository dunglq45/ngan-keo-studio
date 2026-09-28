// Bundle sẵn phần video lúc build, để bản đóng gói không cần webpack khi chạy
import path from 'node:path';
import {bundle} from '@remotion/bundler';

const outDir = path.resolve('dist/remotion-bundle');
await bundle({entryPoint: path.resolve('src/remotion/index.ts'), outDir});
console.log(`Đã bundle phần video vào ${outDir}`);
