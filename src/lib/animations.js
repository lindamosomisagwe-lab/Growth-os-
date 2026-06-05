// Spring presets
export const spring = {
  snappy:  { type: 'spring', stiffness: 500, damping: 28 },
  bouncy:  { type: 'spring', stiffness: 400, damping: 17 },
  smooth:  { type: 'spring', stiffness: 300, damping: 30 },
  gentle:  { type: 'spring', stiffness: 200, damping: 25 },
}

// Easing presets
export const ease = {
  out:   [0.25, 0.46, 0.45, 0.94],
  in:    [0.55, 0.06, 0.68, 0.19],
  inOut: [0.76, 0.0, 0.24, 1.0],
}

// Page entrance — cards stagger up
export const pageCard = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.06,
      ease: ease.out,
    }
  })
}

// List item stagger
export const listItem = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay: i * 0.05,
      ease: ease.out,
    }
  })
}

// Expand/collapse (height)
export const expandCollapse = {
  hidden:  { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1,
    transition: { duration: 0.3, ease: ease.out } },
  exit:    { height: 0, opacity: 0,
    transition: { duration: 0.2, ease: ease.in } }
}

// Reward bounce
export const rewardBounce = {
  idle:    { scale: 1 },
  animate: { scale: [1, 1.35, 0.92, 1.05, 1],
    transition: { duration: 0.5, times: [0, 0.3, 0.6, 0.8, 1] } }
}

// Slide up (bottom sheet)
export const slideUp = {
  hidden:  { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1,
    transition: spring.smooth },
  exit:    { y: '100%', opacity: 0,
    transition: { duration: 0.25, ease: ease.in } }
}

// Fade in/out
export const fade = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } }
}

// Scale pop (modals, toasts)
export const scalePop = {
  hidden:  { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1,
    transition: spring.bouncy },
  exit:    { scale: 0.95, opacity: 0,
    transition: { duration: 0.15 } }
}
