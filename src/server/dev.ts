// Chế độ dev: bundle lại phần video mỗi lần render để thấy ngay thay đổi trong src/remotion
process.env.HOAINIEM_REBUNDLE ??= '1';

const {startServer} = await import('./index.js');
await startServer();

export {};
