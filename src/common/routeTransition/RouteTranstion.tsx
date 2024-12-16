import {motion, Variants} from "framer-motion";
import React, {useEffect, ReactNode} from "react";

interface RouteTransitionProps {
  children: ReactNode;
  animationType: "slideRight" | "fadeIn" | "slideBottom" | "slideTop";
  disableScrollBar?: boolean;
}

const pageVariants: Record<string, Variants> = {
  slideRight: {
    initial: {opacity: 0, x: 100},
    in: {opacity: 1, x: 0},
    out: {opacity: 0, x: -100},
  },
  fadeIn: {
    initial: {opacity: 0},
    in: {opacity: 1},
    out: {opacity: 0},
  },
  slideBottom: {
    initial: {opacity: 0, y: 100},
    in: {opacity: 1, y: 0},
    out: {opacity: 0, y: -100},
  },
  slideTop: {
    initial: {opacity: 0, y: -100},
    in: {opacity: 1, y: 0},
    out: {opacity: 0, y: 100},
  },
};

const pageTransition = {
  type: "spring",
  ease: "easeOut",
  duration: 1,
};

const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  animationType,
  disableScrollBar,
}) => {
  const selectedVariants = pageVariants[animationType];

  useEffect(() => {
    if (!disableScrollBar) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "visible";
      };
    }
  }, []);

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={selectedVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default RouteTransition;
