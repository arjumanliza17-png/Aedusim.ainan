/**
 * Page Transition Wrapper
 * Wraps any page in the standard entrance/exit animation
 */
import { motion, Variants } from "framer-motion";
import { pageVariants } from "@/lib/motion";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "page" | "drill" | "back";
}

const variants: Record<string, Variants> = {
  page: pageVariants,
  drill: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 280, damping: 25 } },
    exit: { opacity: 0, x: -16, transition: { duration: 0.2 } },
  },
  back: {
    initial: { opacity: 0, x: -24 },
    animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 280, damping: 25 } },
    exit: { opacity: 0, x: 16, transition: { duration: 0.2 } },
  },
};

export function PageTransition({ children, className = "", variant = "page" }: PageTransitionProps) {
  return (
    <motion.div
      className={`h-full w-full ${className}`}
      variants={variants[variant]}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
