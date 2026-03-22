import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { WordTiming } from "./types";

function wordTilt(word: string): number {
  const code = word.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ((code % 11) - 5) * 0.9;
}

function wordColor(index: number): string {
  return index % 2 === 0 ? "#FFE600" : "#FFFFFF";
}

interface Props {
  wordTimings: WordTiming[];
  fontFile?: string; // path under public/, defaults to "fonts/Bungee-Regular.ttf"
}

export const KineticSubtitles: React.FC<Props> = ({
  wordTimings,
  fontFile = "fonts/Bungee-Regular.ttf",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!wordTimings || wordTimings.length === 0) return null;

  const currentSeconds = frame / fps;
  const currentIndex = wordTimings.findIndex(
    (wt) => currentSeconds >= wt.start && currentSeconds <= wt.end
  );

  if (currentIndex === -1) return null;

  const currentWord = wordTimings[currentIndex];
  const wordStartFrame = Math.round(currentWord.start * fps);
  const elapsed = frame - wordStartFrame;

  const scale = interpolate(
    elapsed,
    [0, 3, 7, 13],
    [0.6, 1.45, 1.05, 1.1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const translateY = interpolate(
    elapsed,
    [0, 4, 9, 14],
    [-30, 6, -3, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const tiltBase = wordTilt(currentWord.word);
  const tilt = interpolate(
    elapsed,
    [0, 5, 12],
    [tiltBase * 2.5, -tiltBase * 0.4, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const color = wordColor(currentIndex);
  const fontSize = currentWord.word.length > 9 ? "90px" : "140px";
  const strokeColor = "#000000";

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "22%",
        paddingLeft: "40px",
        paddingRight: "40px",
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      <style>{`
        @font-face {
          font-family: 'Bungee';
          src: url('${staticFile(fontFile)}');
        }
      `}</style>

      <div
        style={{
          transform: `scale(${scale}) translateY(${translateY}px) rotate(${tilt}deg)`,
          transformOrigin: "center bottom",
          textAlign: "center",
          maxWidth: "88%",
          filter: `drop-shadow(0px 6px 0px ${strokeColor}) drop-shadow(0px -6px 0px ${strokeColor}) drop-shadow(6px 0px 0px ${strokeColor}) drop-shadow(-6px 0px 0px ${strokeColor}) drop-shadow(0px 16px 20px rgba(0,0,0,0.85))`,
        }}
      >
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 0, right: 0, top: 0,
              fontFamily: "Bungee, sans-serif",
              fontSize,
              fontWeight: 900,
              color: strokeColor,
              textTransform: "uppercase",
              WebkitTextStroke: "22px black",
              lineHeight: 1,
              letterSpacing: "3px",
              wordBreak: "break-word",
              paintOrder: "stroke fill",
            }}
          >
            {currentWord.word}
          </span>
          <span
            style={{
              position: "relative",
              fontFamily: "Bungee, sans-serif",
              fontSize,
              fontWeight: 900,
              color,
              textTransform: "uppercase",
              lineHeight: 1,
              letterSpacing: "3px",
              wordBreak: "break-word",
            }}
          >
            {currentWord.word}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
