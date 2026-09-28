import {loadFont as loadDancing} from '@remotion/google-fonts/DancingScript';
import {loadFont as loadLora} from '@remotion/google-fonts/Lora';
import {loadFont as loadPatrickHand} from '@remotion/google-fonts/PatrickHand';
import {loadFont as loadVT323} from '@remotion/google-fonts/VT323';

// Chữ viết tay nắn nót như vở ô ly, và một serif sách cũ cho dòng phụ.
// Cả hai đều có đủ dấu tiếng Việt.
const dancing = loadDancing('normal', {weights: ['500', '700'], subsets: ['vietnamese', 'latin']});
const lora = loadLora('italic', {weights: ['400'], subsets: ['vietnamese', 'latin']});
// Chữ màn hình đầu máy video cho phong cách VHS, và nét bút dạ viết trên ảnh Polaroid
const vt323 = loadVT323('normal', {weights: ['400'], subsets: ['vietnamese', 'latin']});
const patrick = loadPatrickHand('normal', {weights: ['400'], subsets: ['vietnamese', 'latin']});

export const fonts = {
  hand: dancing.fontFamily,
  book: lora.fontFamily,
  stamp: '"Courier New", Courier, monospace',
  vhs: vt323.fontFamily,
  marker: patrick.fontFamily,
};

// Bảng màu lấy từ ảnh rửa tiệm thập niên 90: giấy ngả vàng, nâu umber, xanh ngọc phai.
export const colors = {
  umber: '#23160c',
  paper: '#efe2c4',
  amber: '#e2b36a',
  fadedTeal: '#6f958d',
  stampOrange: '#ff7a1a',
};

/** Bộ lọc áp lên ảnh gốc để có màu ảnh phim đã phai */
export const photoFilter = 'sepia(0.42) saturate(0.8) contrast(1.06) brightness(0.96) hue-rotate(-6deg)';
