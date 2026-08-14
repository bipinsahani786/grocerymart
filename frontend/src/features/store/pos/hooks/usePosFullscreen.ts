import { useState, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Single Responsibility: Manages POS Kiosk Mode Fullscreen DOM API.
 */
export const usePosFullscreen = (elementId: string = 'pos-page-root') => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    const element = document.getElementById(elementId);
    if (!element) return;
    try {
      if (!document.fullscreenElement) {
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Failed to toggle fullscreen:', err);
      toast.error('Fullscreen kiosk mode is blocked or unsupported.');
    }
  };

  return {
    isFullscreen,
    toggleFullscreen,
  };
};
