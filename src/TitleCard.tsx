import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface TitleCardMedia {
  videoSrc?: string;
  imageSrc?: string;
}

interface Props {
  title: string;
  media: TitleCardMedia[];
}

const FLASH_FRAMES = 3;

export const TitleCard: React.FC<Props> = ({ title, media }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ── Rapid montage index ───────────────────────────────────────────────────
  const montageItem = media[Math.floor(frame / FLASH_FRAMES) % media.length];

  // ── Dark overlay fades in over the montage ───────────────────────────────
  const overlayOpacity = interpolate(frame, [10, 35], [0, 0.82], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Title slams in with spring burst ─────────────────────────────────────
  const titleSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 10, stiffness: 180, mass: 0.6 },
    durationInFrames: 20,
  });
  const titleScale = interpolate(titleSpring, [0, 1], [2.2, 1]);
  const titleOpacity = interpolate(frame, [30, 38], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Title shake (burst energy) ────────────────────────────────────────────
  const shakeIntensity = interpolate(frame, [30, 38, 50], [14, 4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shakeX = Math.sin(frame * 2.7) * shakeIntensity;
  const shakeY = Math.cos(frame * 3.1) * shakeIntensity;

  // ── Accent line grows under title ────────────────────────────────────────
  const lineWidth = interpolate(frame, [36, 52], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Rumble slowly rises then fades out when title slams ─────────────────
  const rumbleVolume = interpolate(frame, [0, 25, 32], [0, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Whole card fades out at end ───────────────────────────────────────────
  const cardOpacity = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const fontSize = title.length > 20 ? 72 : 96;

  return (
    <AbsoluteFill style={{ opacity: cardOpacity, overflow: "hidden" }}>
      <style>{`
        @font-face {
          font-family: 'Bungee';
          src: url('${staticFile("fonts/Bungee-Regular.ttf")}');
        }
      `}</style>

      {/* Rapid montage — cycle through clips (video) or panels (image) */}
      {montageItem?.videoSrc ? (
        <OffthreadVideo
          src={staticFile(montageItem.videoSrc)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          muted
        />
      ) : montageItem?.imageSrc ? (
        <Img
          src={staticFile(montageItem.imageSrc)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : null}

      {/* Dark overlay fades over montage */}
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: overlayOpacity }} />

      {/* Red glow behind title */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: titleOpacity,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,40,40,0.45) 0%, transparent 70%)",
          }}
        />
      </AbsoluteFill>

      {/* Content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Main title — slams in */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale}) translate(${shakeX}px, ${shakeY}px)`,
            transformOrigin: "center center",
            fontFamily: "Bungee, sans-serif",
            fontSize,
            fontWeight: 900,
            color: "#ffffff",
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.1,
            paddingLeft: 60,
            paddingRight: 60,
            filter:
              "drop-shadow(0px 0px 30px rgba(255,40,40,0.9)) drop-shadow(0px 4px 12px rgba(0,0,0,0.8))",
            wordBreak: "break-word",
          }}
        >
          {title}
        </div>

        {/* Accent line */}
        <div
          style={{
            marginTop: 32,
            width: lineWidth,
            height: 4,
            background: "linear-gradient(90deg, transparent, #ff3c3c, transparent)",
            borderRadius: 2,
          }}
        />
      </AbsoluteFill>

      {/* Rumble loop — builds tension during montage, fades out at slam */}
      <Audio src={staticFile("sfx/sfx_rumble.mp3")} loop volume={rumbleVolume} />

      {/* Impact BAM on title slam */}
      <Sequence from={30} durationInFrames={durationInFrames - 30} layout="none">
        <Audio src={staticFile("sfx/sfx_impact.mp3")} volume={1.0} />
      </Sequence>
    </AbsoluteFill>
  );
};
