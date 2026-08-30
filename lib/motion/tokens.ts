/**
 * JS motion tokens — keep in lockstep with --duration-* and --ease-* in globals.css.
 */
export const MOTION = {
  reduced: 0.12,
  hover: 0.16,
  hub: 0.35,
  zoom: 0.22,
  backdrop: 0.24,
  sheetIn: 0.42,
  sheetOut: 0.32,
  easeOut: [0.22, 1, 0.36, 1] as const,
} as const;
