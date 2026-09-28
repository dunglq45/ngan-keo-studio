import type {Episode} from './types';

/** Tập mẫu, được tạo sẵn ở lần chạy đầu tiên */
export const sampleEpisode: Episode = {
  id: 'mua-he-nam-ay',
  channelName: 'Ngăn Kéo Tuổi Thơ',
  title: 'Mùa hè năm ấy',
  subtitle: 'Những điều nhỏ bé của thế hệ 8x, 9x',
  musicVolume: 0.55,
  outroQuestion: 'Bạn còn nhớ điều gì từ tuổi thơ mình?',
  outroCallToAction: 'Kể cho mình nghe ở phần bình luận nhé',
  scenes: [
    {caption: 'Những buổi trưa hè trốn ngủ', subCaption: 'Chờ mẹ ngủ say là rón rén mở cửa, chạy ra đầu ngõ', stamp: "'95 6 12"},
    {caption: 'Tiếng rao kem que đầu ngõ', subCaption: 'Kem đậu xanh, kem sữa dừa, cầm trong tay mà tan chảy vội', stamp: "'96 7 03"},
    {caption: 'Nhảy dây, ô ăn quan, bắn bi', subCaption: 'Chẳng cần đồ chơi đắt tiền, chỉ cần có bạn', stamp: "'96 7 21"},
    {caption: 'Cuộn băng rối và chiếc bút chì', subCaption: 'Ai cũng từng kiên nhẫn quay từng vòng băng cassette', stamp: "'97 8 02"},
    {caption: 'Cả xóm bên chiếc tivi đen trắng', subCaption: 'Cứ mất điện là cả làng cùng đồng thanh kêu lên', stamp: "'97 8 16"},
    {
      caption: 'Ngồi sau chiếc xe đạp của bố',
      subCaption: 'Ôm lưng bố, nghĩ rằng thế giới chỉ rộng bằng con đường về nhà',
      stamp: "'98 8 30",
      durationSec: 6.5,
    },
  ],
};
