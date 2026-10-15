import { Transition, Variants } from "framer-motion";

/**
 * Curva di easing su misura per dare una fisica tattile, pesata e fluida,
 * priva di rimbalzi o oscillazioni artificiali.
 */
export const editorialEase = [0.22, 1, 0.36, 1] as const;

export const defaultTransition: Transition = {
  duration: 0.7,
  ease: editorialEase,
};

export const slowTransition: Transition = {
  duration: 0.9,
  ease: editorialEase,
};

/**
 * Varianti per la rivelazione progressiva delle linee di griglia svizzera (scaleX da 0 a 1)
 */
export const gridLineVariants: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    originX: 0,
    transition: {
      duration: 0.85,
      ease: editorialEase,
    },
  },
};

/**
 * Varianti per la maschera di testo (text mask reveal)
 */
export const textMaskVariants: Variants = {
  hidden: { y: "110%", opacity: 0 },
  visible: (customDelay: number = 0) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.75,
      delay: customDelay,
      ease: editorialEase,
    },
  }),
};

/**
 * Dissolvenza verticale morbida per blocchi di testo o schede
 */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: customDelay,
      ease: editorialEase,
    },
  }),
};

/**
 * Container per staggered children
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};
