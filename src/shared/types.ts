export type KenBurns = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right';

export type VisualStyle = 'film' | 'vhs' | 'polaroid' | 'notebook';

export type MemoryScene = {
  /** Đường dẫn tương đối trong thư mục của tập, ví dụ "assets/kem-que.jpg" */
  image?: string;
  caption: string;
  subCaption?: string;
  /** Dấu ngày kiểu máy ảnh phim, ví dụ "'96 6 15" */
  stamp?: string;
  durationSec?: number;
  kenBurns?: KenBurns;
  /** Lời kể của cảnh, đường dẫn tương đối trong thư mục của tập, ví dụ "assets/loi-ke-canh-1.webm" */
  narration?: string;
  /** Độ dài lời kể (giây), đo lúc thu hoặc tải lên; cảnh tự kéo dài cho đủ lời kể */
  narrationSec?: number;
  /** Điểm cần giữ trong khung khi cắt ảnh, tính theo % chiều ngang/dọc của ảnh. Mặc định là giữa ảnh */
  focus?: FocusPoint;
};

export type FocusPoint = {x: number; y: number};

export type Episode = {
  /** Tên thư mục của tập, do server tạo */
  id: string;
  channelName: string;
  title: string;
  /** Phong cách hình ảnh của cả tập, mặc định là phim nhựa */
  style?: VisualStyle;
  subtitle?: string;
  /** Đường dẫn tương đối trong thư mục của tập, ví dụ "assets/nhac-nen.mp3" */
  music?: string;
  musicVolume?: number;
  /** Âm lượng lời kể của mọi cảnh, 0–1, mặc định 1 (giữ nguyên âm lượng gốc của file) */
  narrationVolume?: number;
  introDurationSec?: number;
  outroDurationSec?: number;
  outroQuestion: string;
  outroCallToAction?: string;
  scenes: MemoryScene[];
  /** Ảnh bìa YouTube lấy ảnh của cảnh này, bỏ trống thì dùng cảnh đầu tiên có ảnh */
  thumbnailScene?: number;
  /** Chữ lớn trên ảnh bìa, bỏ trống thì dùng tên tập */
  thumbnailText?: string;
};

export type HoaiNiemProps = {
  episode: Episode;
  /** Gốc URL để tải ảnh/nhạc của tập, ví dụ "/media/mua-he-nam-ay-x1y2" */
  assetBaseUrl: string;
};

export type RenderFormat = '16x9' | '9x16';
