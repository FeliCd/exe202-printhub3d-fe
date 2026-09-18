import { Suspense, type ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import ErrorBoundary from './ErrorBoundary';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0, 0, 0.2, 1], // ease-out cubic-bezier
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 1, 1], // ease-in cubic-bezier
    },
  },
};

export default function PageTransition({ children }: PageTransitionProps) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      variants={reducedMotion ? undefined : pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-w-0 flex-1 flex flex-col"
    >
      <ErrorBoundary>
        <Suspense fallback={<p role="status" className="p-6 text-slate-300">Đang tải nội dung…</p>}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </motion.div>
  );
}
