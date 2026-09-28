import React from 'react';
import {AbsoluteFill, Img, useVideoConfig} from 'remotion';
import type {HoaiNiemProps} from '../../shared/types';
import {thumbnailSceneIndex, thumbnailText} from '../../shared/thumbnail';
import {objectPosition, transformOrigin} from '../../shared/focus';
import {colors, fonts, photoFilter} from '../theme';
import {getKit} from '../styles';

/** Chữ càng dài thì càng nhỏ, để luôn nằm gọn trong hai dòng */
const titleSize = (text: string) => {
  const n = Array.from(text).length;
  if (n <= 14) return 17;
  if (n <= 22) return 14;
  if (n <= 32) return 11.5;
  return 9.5;
};

/**
 * Ảnh bìa YouTube: một ảnh kỉ niệm làm nền, tên tập viết tay thật to bên trái.
 * Ảnh bìa hiện rất nhỏ trên điện thoại nên chữ phải to, tương phản mạnh và ít chữ.
 */
export const YoutubeThumbnail: React.FC<HoaiNiemProps> = ({episode, assetBaseUrl}) => {
  const {width, height} = useVideoConfig();
  const unit = Math.min(width, height) / 100;
  const index = thumbnailSceneIndex(episode);
  const scene = index >= 0 ? episode.scenes[index] : undefined;
  const text = thumbnailText(episode);
  const kit = getKit(episode.style);
  const {thumbTitle} = kit.text(unit);

  return (
    <AbsoluteFill style={{backgroundColor: colors.umber}}>
      {scene?.image ? (
        <Img
          src={`${assetBaseUrl}/${scene.image}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: objectPosition(scene.focus),
            filter: photoFilter,
            transform: 'scale(1.04)',
            transformOrigin: transformOrigin(scene.focus),
          }}
        />
      ) : (
        <AbsoluteFill
          style={{background: `radial-gradient(circle at 70% 40%, #c48a5a, #7a4a2a 45%, ${colors.umber} 85%)`}}
        />
      )}

      {/* Tối dần sang trái để chữ nổi trên mọi loại ảnh */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to right, rgba(20,10,2,0.88) 0%, rgba(20,10,2,0.6) 40%, rgba(20,10,2,0.1) 75%, rgba(0,0,0,0) 100%)',
        }}
      />

      <kit.Overlay still />

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          padding: `${unit * 7}px ${unit * 8}px`,
          maxWidth: width * 0.68,
        }}
      >
        <div
          style={{
            alignSelf: 'flex-start',
            fontFamily: fonts.book,
            fontStyle: 'italic',
            fontSize: unit * 4.2,
            color: colors.umber,
            background: colors.amber,
            padding: `${unit * 0.6}px ${unit * 2}px`,
            borderRadius: unit * 0.6,
            marginBottom: unit * 3,
            transform: 'rotate(-2deg)',
          }}
        >
          {episode.channelName}
        </div>
        <div
          style={{
            fontFamily: thumbTitle.fontFamily,
            fontWeight: thumbTitle.fontWeight,
            fontSize: unit * titleSize(text) * thumbTitle.scale,
            lineHeight: 1.05,
            color: colors.paper,
            textShadow: `0 ${unit * 0.4}px 0 ${colors.umber}, 0 0 ${unit * 3}px rgba(0,0,0,0.85)`,
          }}
        >
          {text}
        </div>
      </AbsoluteFill>

      {scene?.stamp ? (
        <div
          style={{
            position: 'absolute',
            right: unit * 5,
            bottom: unit * 5,
            fontFamily: fonts.stamp,
            fontWeight: 700,
            fontSize: unit * 5,
            letterSpacing: unit * 0.5,
            color: colors.stampOrange,
            textShadow: `0 0 ${unit}px rgba(255, 110, 20, 0.85)`,
          }}
        >
          {scene.stamp}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
