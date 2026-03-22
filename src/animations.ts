import { AnimationName } from "./types";

export interface BaseAnimationProps {
  // ── Zoom ────────────────────────────────────────────────────────────────
  zoomStart?: number;
  zoomEnd?: number;
  zoomSettleFraction?: number;
  // ── Pan ─────────────────────────────────────────────────────────────────
  panXStart?: number;
  panXEnd?: number;
  panYStart?: number;
  panYEnd?: number;
  // ── Rotate (tilt_in / spin_in) ───────────────────────────────────────────
  rotateStart?: number;
  rotateEnd?: number;
  rotateSettleFraction?: number;
  // ── Slide (slam_*, whip_*, slide_*) ─────────────────────────────────────
  slideFrom?: "left" | "right" | "top" | "bottom" | null;
  slideCompleteFraction?: number;
  // ── Effects ──────────────────────────────────────────────────────────────
  shake?: boolean;
  fadeIn?: boolean;
  flashEffect?: boolean;
  punchIn?: boolean;
  recoilEffect?: boolean;
  heartbeatEffect?: boolean;
  trembleEffect?: boolean;
  rattleEffect?: boolean;
  shockwaveEffect?: boolean;
  breatheEffect?: boolean;
  // ── SFX ──────────────────────────────────────────────────────────────────
  sfx?: string;
  sfxVolume?: number;
}

export function getAnimationProps(animation: AnimationName): BaseAnimationProps {
  switch (animation) {

    // ── Impact / Energy ─────────────────────────────────────────────────────
    case "burst":
      return { zoomStart: 1.15, zoomEnd: 1.0, zoomSettleFraction: 0.25, shake: true, sfx: "sfx_impact.mp3", sfxVolume: 0.50 };
    case "snap":
      return { zoomStart: 1.2, zoomEnd: 1.0, zoomSettleFraction: 0.04, shake: true, sfx: "sfx_pop.mp3", sfxVolume: 0.55 };
    case "punch_in":
      return { punchIn: true, sfx: "sfx_slap.mp3", sfxVolume: 0.48 };
    case "recoil":
      return { recoilEffect: true, sfx: "sfx_boing.mp3", sfxVolume: 0.35 };
    case "shockwave":
      return { shockwaveEffect: true, sfx: "sfx_boxing.mp3", sfxVolume: 0.40 };
    case "flash":
      return { flashEffect: true, zoomStart: 1.0, zoomEnd: 1.04, sfx: "sfx_flash.mp3", sfxVolume: 0.32 };

    // ── Tension / Sustained ─────────────────────────────────────────────────
    case "heartbeat":
      return { heartbeatEffect: true, sfx: "sfx_heartbeat.mp3", sfxVolume: 0.25 };
    case "tremble":
      return { trembleEffect: true, zoomStart: 1.0, zoomEnd: 1.02, sfx: "sfx_foliage.mp3", sfxVolume: 0.22 };
    case "rattle":
      return { rattleEffect: true, zoomStart: 1.0, zoomEnd: 1.02, sfx: "sfx_rumble.mp3", sfxVolume: 0.40 };
    case "breathe":
      return { breatheEffect: true, sfx: "sfx_breath.mp3", sfxVolume: 0.18 };

    // ── Directional slides ───────────────────────────────────────────────────
    case "slam_left":
      return { slideFrom: "left", slideCompleteFraction: 0.06, zoomStart: 1.02, zoomEnd: 1.0, sfx: "sfx_sandbag.mp3", sfxVolume: 0.45 };
    case "slam_right":
      return { slideFrom: "right", slideCompleteFraction: 0.06, zoomStart: 1.02, zoomEnd: 1.0, sfx: "sfx_sandbag.mp3", sfxVolume: 0.45 };
    case "whip_left":
      return { slideFrom: "left", slideCompleteFraction: 0.03, sfx: "sfx_whip.mp3", sfxVolume: 0.32 };
    case "whip_right":
      return { slideFrom: "right", slideCompleteFraction: 0.03, sfx: "sfx_whip.mp3", sfxVolume: 0.32 };
    case "slide_left":
      return { slideFrom: "left", slideCompleteFraction: 0.2, sfx: "sfx_paper_slide.mp3", sfxVolume: 0.50 };
    case "slide_right":
      return { slideFrom: "right", slideCompleteFraction: 0.2, sfx: "sfx_paper_slide.mp3", sfxVolume: 0.50 };
    case "slide_bottom":
      return { slideFrom: "bottom", slideCompleteFraction: 0.2, sfx: "sfx_paper_slide.mp3", sfxVolume: 0.50 };
    case "slide_top":
      return { slideFrom: "top", slideCompleteFraction: 0.2, sfx: "sfx_paper_slide.mp3", sfxVolume: 0.50 };

    // ── Rotation ─────────────────────────────────────────────────────────────
    case "tilt_in":
      return { rotateStart: 4, rotateEnd: 0, rotateSettleFraction: 0.25, zoomStart: 1.0, zoomEnd: 1.02, sfx: "sfx_page_turn2.mp3", sfxVolume: 0.28 };
    case "spin_in":
      return { rotateStart: 15, rotateEnd: 0, rotateSettleFraction: 0.2, zoomStart: 1.05, zoomEnd: 1.0, sfx: "sfx_boing.mp3", sfxVolume: 0.32 };

    // ── Camera ────────────────────────────────────────────────────────────────
    case "ken_burns":
      return { zoomStart: 1.0, zoomEnd: 1.08, panXStart: -15, panXEnd: 15 };
    case "zoom_out":
      return { zoomStart: 1.12, zoomEnd: 1.0, zoomSettleFraction: 0.5 };
    case "zoom_in":
      return { zoomStart: 1.0, zoomEnd: 1.12 };
    case "pan_up":
      return { zoomStart: 1.05, zoomEnd: 1.05, panYStart: 20, panYEnd: -20 };
    case "pan_down":
      return { zoomStart: 1.05, zoomEnd: 1.05, panYStart: -20, panYEnd: 20 };
    case "creep":
      return { zoomStart: 1.0, zoomEnd: 1.03 };
    case "fade_in":
      return { zoomStart: 1.0, zoomEnd: 1.04, fadeIn: true };

    default:
      return { zoomStart: 1.0, zoomEnd: 1.08 };
  }
}
