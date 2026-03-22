import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BaseAnimationProps } from "./animations";

interface Props extends BaseAnimationProps {
  /** Foreground content — receives the full animation transform */
  children: React.ReactNode;
  /** Optional blurred background slot — rendered un-transformed behind children */
  background?: React.ReactNode;
  /** Clip/panel audio source (under public/) */
  audioSrc?: string;
}

export const AnimatedBase: React.FC<Props> = ({
  children,
  background,
  audioSrc,
  zoomStart = 1,
  zoomEnd = 1.08,
  zoomSettleFraction = 1,
  panXStart = 0,
  panXEnd = 0,
  panYStart = 0,
  panYEnd = 0,
  rotateStart = 0,
  rotateEnd = 0,
  rotateSettleFraction = 0.25,
  slideFrom = null,
  slideCompleteFraction = 0.2,
  shake = false,
  fadeIn = false,
  flashEffect = false,
  punchIn = false,
  recoilEffect = false,
  heartbeatEffect = false,
  trembleEffect = false,
  rattleEffect = false,
  shockwaveEffect = false,
  breatheEffect = false,
  sfx,
  sfxVolume = 0.35,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const progress = frame / durationInFrames;

  // ── ZOOM ──────────────────────────────────────────────────────────────────
  let zoom = 1;

  if (punchIn) {
    const attackFrames = durationInFrames * 0.15;
    zoom = frame <= attackFrames
      ? interpolate(frame, [0, attackFrames], [1.0, 1.2], { extrapolateRight: "clamp" })
      : interpolate(frame, [attackFrames, durationInFrames], [1.2, 1.05], { extrapolateRight: "clamp" });
  } else if (recoilEffect) {
    zoom = interpolate(frame, [0, 6, 20, durationInFrames], [1.0, 0.9, 1.03, 1.01], { extrapolateRight: "clamp" });
  } else if (shockwaveEffect) {
    zoom = frame <= 16
      ? interpolate(frame, [0, 4, 16], [1.0, 1.06, 1.0], { extrapolateRight: "clamp" })
      : interpolate(frame, [16, durationInFrames], [1.0, 1.04], { extrapolateRight: "clamp" });
  } else if (heartbeatEffect) {
    zoom = 1.0 + 0.04 * Math.abs(Math.sin((frame * Math.PI) / 18));
  } else if (breatheEffect) {
    zoom = 1.0 + 0.025 * Math.sin((frame * Math.PI * 1.5) / durationInFrames);
  } else {
    const settleProgress = Math.min(progress / zoomSettleFraction, 1);
    const settledZoom = interpolate(settleProgress, [0, 1], [zoomStart, zoomEnd], { extrapolateRight: "clamp" });
    const driftProgress = zoomSettleFraction < 1
      ? Math.max(0, (progress - zoomSettleFraction) / (1 - zoomSettleFraction))
      : progress;
    const driftAmount = interpolate(driftProgress, [0, 1], [0, 0.04], { extrapolateRight: "clamp" });
    zoom = settledZoom + driftAmount;
  }

  // ── ROTATE ────────────────────────────────────────────────────────────────
  const rotateSettleProgress = Math.min(progress / (rotateSettleFraction || 0.25), 1);
  const rotate = interpolate(rotateSettleProgress, [0, 1], [rotateStart, rotateEnd], { extrapolateRight: "clamp" });

  // ── PAN ───────────────────────────────────────────────────────────────────
  const panX = interpolate(progress, [0, 1], [panXStart, panXEnd], { extrapolateRight: "clamp" });
  const panY = interpolate(progress, [0, 1], [panYStart, panYEnd], { extrapolateRight: "clamp" });

  // ── SLIDE ─────────────────────────────────────────────────────────────────
  let slideOffsetX = 0;
  let slideOffsetY = 0;
  if (slideFrom) {
    const slideEnd = durationInFrames * slideCompleteFraction;
    const slideProgress = interpolate(frame, [0, slideEnd], [1, 0], { extrapolateRight: "clamp" });
    if (slideFrom === "left")   slideOffsetX = slideProgress * -width;
    if (slideFrom === "right")  slideOffsetX = slideProgress * width;
    if (slideFrom === "top")    slideOffsetY = slideProgress * -height;
    if (slideFrom === "bottom") slideOffsetY = slideProgress * height;
  }

  // ── SHAKE ─────────────────────────────────────────────────────────────────
  let shakeX = 0;
  let shakeY = 0;
  if (shake) {
    const intensity = interpolate(frame, [0, 8, durationInFrames], [12, 0, 0], { extrapolateRight: "clamp" });
    shakeX = Math.sin(frame * 2.3) * intensity;
    shakeY = Math.cos(frame * 1.7) * intensity;
  } else if (trembleEffect) {
    const intensity = interpolate(frame, [0, durationInFrames * 0.4], [8, 0], { extrapolateRight: "clamp" });
    shakeX = Math.sin(frame * 5.1) * intensity;
    shakeY = Math.cos(frame * 4.7) * intensity;
  } else if (rattleEffect) {
    shakeX = Math.sin(frame * 3.7) * 4;
    shakeY = Math.cos(frame * 4.1) * 4;
  }

  // ── OPACITY ───────────────────────────────────────────────────────────────
  const opacity = fadeIn
    ? interpolate(frame, [0, durationInFrames * 0.3], [0, 1], { extrapolateRight: "clamp" })
    : 1;

  // ── FLASH ─────────────────────────────────────────────────────────────────
  const flashOpacity = flashEffect
    ? interpolate(frame, [0, durationInFrames * 0.1], [1, 0], { extrapolateRight: "clamp" })
    : 0;

  const translateX = panX + slideOffsetX + shakeX;
  const translateY = panY + slideOffsetY + shakeY;
  const transform = `scale(${zoom}) rotate(${rotate}deg) translate(${translateX}px, ${translateY}px)`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden", opacity }}>
      {background}

      <AbsoluteFill style={{ transform, transformOrigin: "center center" }}>
        {children}
      </AbsoluteFill>

      {flashEffect && (
        <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: flashOpacity, pointerEvents: "none" }} />
      )}

      {audioSrc && <Audio src={staticFile(audioSrc)} />}
      {sfx && <Audio src={staticFile(`sfx/${sfx}`)} volume={sfxVolume} />}
    </AbsoluteFill>
  );
};
