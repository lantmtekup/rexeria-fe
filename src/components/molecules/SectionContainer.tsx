'use client';

import { motion, type Variants, type ViewportOptions } from 'framer-motion';
import { cn } from '@/lib/cn';

interface SectionContainerProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  enableAnimation?: boolean;
  customAnimation?: Variants;
  customViewport?: ViewportOptions;
}

const animationVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function SectionContainer({
  children,
  id,
  className,
  enableAnimation = true,
  customAnimation,
  customViewport,
}: SectionContainerProps) {
  const viewportOptions: ViewportOptions = customViewport || {
    once: true,
    margin: '-80px',
  };

  if (!enableAnimation) {
    return (
      <div id={id} className={cn(className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      className={cn(className)}
      initial='hidden'
      whileInView='visible'
      viewport={viewportOptions}
      variants={customAnimation ?? animationVariants}
    >
      {children}
    </motion.div>
  );
}
