'use client';

import { useEffect } from 'react';

export default function ClientScript() {
  useEffect(() => {
    // Update screen resolution and language on client side
    if (typeof window !== 'undefined') {
      const screenResolution = `${window.screen.width}x${window.screen.height}`;
      const language = navigator.language;

      // You can dispatch custom events or update state here if needed
      console.log('Client info:', { screenResolution, language });
    }
  }, []);

  return null;
}
