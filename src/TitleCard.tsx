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

// Total duration of the TitleCard at a given fps
export const getTitleCardDuration = (fps: number) =>
  Math.round(0.548 * fps) + Math.round(0.7 * fps) + 8;

export const TitleCard: React.FC<Props> = ({ title, media }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ── Rapid montage index ───────────────────────────────────────────────────
  const montageItem = media[Math.floor(frame / FLASH_FRAMES) % media.length];

  // BAM in the transition audio lands at 0.548s → frame 13 at 24fps
  const SLAM_FRAME = Math.round(0.548 * fps);

  // ── Dark overlay fades in over the montage ───────────────────────────────
  const overlayOpacity = interpolate(frame, [5, 20], [0, 0.82], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Title slams in with spring burst ─────────────────────────────────────
  const titleSpring = spring({
    frame: frame - SLAM_FRAME,
    fps,
    config: { damping: 10, stiffness: 180, mass: 0.6 },
    durationInFrames: 20,
  });
  const titleScale = interpolate(titleSpring, [0, 1], [2.2, 1]);
  const titleOpacity = interpolate(frame, [SLAM_FRAME, SLAM_FRAME + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Title shake (burst energy) ────────────────────────────────────────────
  const shakeIntensity = interpolate(frame, [SLAM_FRAME, SLAM_FRAME + 8, SLAM_FRAME + 20], [14, 4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shakeX = Math.sin(frame * 2.7) * shakeIntensity;
  const shakeY = Math.cos(frame * 3.1) * shakeIntensity;

  // ── Accent line grows under title ────────────────────────────────────────
  const lineWidth = interpolate(frame, [SLAM_FRAME + 6, SLAM_FRAME + 22], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Rumble builds into BAM, then fades out over the rest of the 1.1s clip ─
  const audioEndFrame = Math.round(1.1 * fps);
  const rumbleVolume = interpolate(frame, [0, SLAM_FRAME, audioEndFrame], [2.5, 4.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Whole card fades out 0.7s after slam ─────────────────────────────────
  const titleEndFrame = SLAM_FRAME + Math.round(0.7 * fps);
  const cardOpacity = interpolate(
    frame,
    [titleEndFrame, titleEndFrame + 8],
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

      {/* Transition audio — trimmed to 1.1s (26 frames at 24fps) */}
      <Sequence from={0} durationInFrames={Math.round(1.1 * fps)} layout="none">
        <Audio src={staticFile("sfx/dragon-studio-epic-transition-478367.mp3")} volume={rumbleVolume} />
      </Sequence>

    </AbsoluteFill>
  );
};
