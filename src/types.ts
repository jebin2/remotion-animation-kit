export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

// Full superset of all animations across ReelForge and PanelFlow.
// Each project defines its own subset type using Extract<AnimationName, ...>.
export type AnimationName =
  // ── Camera ──────────────────────────────────────────────────────────────
  | "ken_burns"
  | "zoom_in"
  | "zoom_out"
  | "pan_up"
  | "pan_down"
  | "creep"
  | "fade_in"
  // ── Impact / Energy ─────────────────────────────────────────────────────
  | "burst"
  | "snap"
  | "punch_in"
  | "recoil"
  | "shockwave"
  | "flash"
  // ── Tension / Sustained ─────────────────────────────────────────────────
  | "heartbeat"
  | "tremble"
  | "breathe"
  | "rattle"
  // ── Directional slides (PanelFlow) ───────────────────────────────────────
  | "slam_left"
  | "slam_right"
  | "whip_left"
  | "whip_right"
  | "slide_left"
  | "slide_right"
  | "slide_top"
  | "slide_bottom"
  | "tilt_in"
  | "spin_in";

export type TransitionName = "none" | "fade" | "slide" | "wipe" | "flip" | "toss";
