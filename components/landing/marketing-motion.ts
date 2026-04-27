export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const HEADER_ENTER_DURATION = 1.15;
export const HERO_ENTER_DURATION = 1.35;
export const SECTION_ENTER_DURATION = 1.15;
export const CARD_REVEAL_DURATION = 0.85;
export const LOGO_MARQUEE_DURATION = 40;

export const HOVER_SPRING = {
  type: "spring",
  stiffness: 135,
  damping: 18,
  mass: 0.9,
} as const;

export const HOVER_CARD_SHADOW = "0 24px 60px -32px hsl(var(--primary) / 0.35)";
export const HOVER_SOFT_SHADOW = "0 18px 40px -28px hsl(var(--primary) / 0.28)";

export const CTA_HOVER = {
  y: -3,
  scale: 1.02,
  boxShadow: "0 22px 48px -24px hsl(var(--primary) / 0.55)",
} as const;

export const METRIC_CARD_HOVER = {
  y: -6,
  scale: 1.014,
  boxShadow: HOVER_CARD_SHADOW,
} as const;

export const LIST_CARD_HOVER = {
  y: -3,
  scale: 1.008,
  boxShadow: HOVER_SOFT_SHADOW,
} as const;

export const LOGO_CARD_HOVER = {
  y: -6,
  scale: 1.035,
  rotate: -0.45,
  boxShadow: HOVER_SOFT_SHADOW,
} as const;

export const COLLABORATION_CARD_HOVER = {
  y: -10,
  scale: 1.012,
  rotateX: 1.8,
  boxShadow: HOVER_CARD_SHADOW,
} as const;

export const HERO_STAGGER_CONTAINER = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

export const HERO_ITEM = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: HERO_ENTER_DURATION * 0.66, ease: EASE_OUT },
  },
};

export const STAGGER_CONTAINER = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.14,
    },
  },
};

export const REVEAL_ITEM = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: CARD_REVEAL_DURATION, ease: EASE_OUT },
  },
};
