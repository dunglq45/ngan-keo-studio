# Ngăn Kéo Studio

Web app chạy trên máy bạn để sản xuất video hoài niệm 8x/9x phong cách phim cũ. Bạn soạn tập trên trình duyệt, xem trước ngay, rồi bấm nút để xuất mp4 cho YouTube (16:9) hoặc Shorts/Reels/TikTok (9:16).

## Kiến trúc

```
web/            Giao diện React (Vite): soạn tập, tải ảnh/nhạc, xem trước bằng @remotion/player
src/remotion/   Composition video: mở đầu đếm ngược, cảnh ảnh, kết, lớp phủ phim cũ
src/shared/     Kiểu dữ liệu và cách tính timeline, dùng chung cho giao diện, video và server
src/server/     Express: API lưu tập, nhận file tải lên, hàng đợi render (@remotion/renderer)
bin/            Lệnh khởi chạy sau khi đóng gói
scripts/        Bundle sẵn phần video lúc build
```

Giao diện và server render dùng chung một composition, nên bản xem trước khớp với video xuất ra.

Dữ liệu nằm ngoài thư mục code, mặc định ở `~/NganKeoStudio`:

```
episodes/<mã-tập>/episode.json   nội dung tập
episodes/<mã-tập>/assets/        ảnh và nhạc đã tải lên
renders/                         video đã xuất
```

## Phát triển

```bash
npm install
npm run dev        # server ở cổng 3210 + Vite ở http://localhost:5173
npm run studio     # mở Remotion Studio gốc để chỉnh hiệu ứng trong src/remotion
npm run typecheck
```

Ở chế độ dev, phần video được bundle lại mỗi lần render, nên sửa `src/remotion` là lần xuất sau thấy ngay.

## Đóng gói và cài đặt

```bash
npm run package                            # build rồi tạo ngan-keo-studio-1.0.0.tgz
npm install -g ./ngan-keo-studio-1.0.0.tgz # cài thành lệnh dùng ở mọi nơi
ngan-keo-studio                            # chạy và tự mở trình duyệt
ngan-keo-studio --port 4000 --data D:/Video/NganKeo --no-open
```

`npm run build` dựng ba thứ vào `dist/`: giao diện web, server đã biên dịch và bundle phần video. Bản cài đặt không cần webpack hay TypeScript khi chạy.

Lần render đầu tiên sẽ tải Chromium headless (khoảng 100 MB). Các lần sau bắt đầu ngay. Máy cần có mạng để tải font Google khi render.

## Lưu ý bản quyền khi đăng kênh

- Ảnh: ảnh gia đình, ảnh tự chụp đồ vật xưa, ảnh giấy phép tự do (Unsplash, Pexels, Wikimedia Commons) hoặc ảnh AI tự tạo.
- Nhạc: YouTube Audio Library, Pixabay Music hoặc nhạc có license. Nhạc Việt xưa gần như đều còn bản quyền và sẽ bị Content ID quét.
- Remotion miễn phí cho cá nhân và công ty dưới 4 người. Xem điều khoản mới nhất tại remotion.dev/license.
