'use client';

import { useState, useEffect } from 'react';

export default function useWindowSize() {
  const getSize = () => {
    if (typeof window === 'undefined') {
      return {
        width: 0,
        height: 0,
      };
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(getSize());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowSize;
}
