/**
 * ThreePartBuildUp — splits an image into N horizontal strips and reveals
 * them one by one. Works for any image-based media (comics, posters, etc.).
 *
 * Timeline: durationInFrames split into N equal phases.
 * Each phase springs a strip in from below. The group scales so all visible
 * strips always fill the screen.
 */
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export interface BuildUpData {
  imageSrc: string;
  audioSrc?: string;
  originalWidth?: number;
  originalHeight?: number;
  buildUpParts?: number; // default 3
}

const STRIP_SFX = [
  { file: "sfx/sfx_whoosh.mp3",      volume: 0.28 },
  { file: "sfx/sfx_paper_slide.mp3", volume: 0.40 },
  { file: "sfx/sfx_sandbag.mp3",     volume: 0.42 },
];

export const ThreePartBuildUp: React.FC<{ data: BuildUpData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, height: screenHeight, width: screenWidth } = useVideoConfig();

  const N = Math.max(2, data.buildUpParts ?? 3);
  const imgAspect = data.originalWidth && data.originalHeight
    ? data.originalWidth / data.originalHeight
    : 0.6;

  const imgRenderHeight = Math.min(screenHeight, screenWidth / imgAspect);
  const imgRenderWidth  = imgRenderHeight * imgAspect;
  const sectionH        = imgRenderHeight / N;

  const phaseFrames      = Math.floor(durationInFrames / N);
  const transitionFrames = Math.min(24, Math.floor(phaseFrames / 2));

  const inputFrames: number[]  = [];
  const outputValues: number[] = [];
  for (let i = 1; i < N; i++) {
    inputFrames.push(i * phaseFrames - transitionFrames / 2);
    inputFrames.push(i * phaseFrames + transitionFrames / 2);
    outputValues.push(i);
    outputValues.push(i + 1);
  }
  const numVisible = interpolate(frame, inputFrames, outputValues, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scaleByH   = (screenHeight * 0.92) / (numVisible * sectionH);
  const scaleByW   = (screenWidth  * 0.92) / imgRenderWidth;
  const groupScale = Math.min(scaleByH, scaleByW);

  const groupLeft = (screenWidth  - imgRenderWidth       * groupScale) / 2;
  const groupTop  = (screenHeight - numVisible * sectionH * groupScale) / 2;

  const renderSection = (index: number) => {
    const startFrame = index * phaseFrames;
    const idleStart  = startFrame + transitionFrames;

    const slideProgress = spring({
      frame: frame - startFrame,
      fps,
      config: { damping: 16, stiffness: 100 },
      durationInFrames: transitionFrames,
    });

    const slideY = frame < startFrame
      ? screenHeight
      : interpolate(slideProgress, [0, 1], [screenHeight, 0]);

    const idleProgress = frame > idleStart
      ? interpolate(frame, [idleStart, durationInFrames], [0, 1], { extrapolateRight: "clamp" })
      : 0;
    const idleZoom = interpolate(idleProgress, [0, 1], [1.0, 1.03]);
    const idlePanY = interpolate(idleProgress, [0, 1], [0, -6]);

    return (
      <div
        key={index}
        style={{
          position: "absolute",
          left: 0,
          top: index * sectionH,
          width: imgRenderWidth,
          height: sectionH,
          overflow: "hidden",
          transform: `translateY(${slideY}px)`,
          opacity: frame < startFrame ? 0 : 1,
        }}
      >
        <div style={{
          width: "100%",
          height: "100%",
          transform: `scale(${idleZoom}) translateY(${idlePanY}px)`,
          transformOrigin: "center center",
        }}>
          <Img
            src={staticFile(data.imageSrc)}
            style={{
              position: "absolute",
              top: -(index * sectionH),
              left: 0,
              width: imgRenderWidth,
              height: imgRenderHeight,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {data.imageSrc && (
        <Img
          src={staticFile(data.imageSrc)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(24px) brightness(0.35)",
            transform: "scale(1.08)",
          }}
        />
      )}

      <div style={{
        position: "absolute",
        left: groupLeft,
        top: groupTop,
        width: imgRenderWidth,
        height: sectionH * N,
        transform: `scale(${groupScale})`,
        transformOrigin: "top left",
      }}>
        {Array.from({ length: N }, (_, i) => renderSection(i))}
      </div>

      {data.audioSrc && <Audio src={staticFile(data.audioSrc)} />}

      {Array.from({ length: N }, (_, i) => {
        const sfx = STRIP_SFX[i % STRIP_SFX.length];
        return (
          <Sequence key={i} from={i * phaseFrames} durationInFrames={transitionFrames} layout="none">
            <Audio src={staticFile(sfx.file)} volume={sfx.volume} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
