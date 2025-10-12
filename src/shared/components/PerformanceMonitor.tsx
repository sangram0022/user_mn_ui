/**
 * Performance Monitor Component
 *
 * Real-time performance monitoring overlay for development
 * Shows FPS, memory usage, and navigation metrics
 */

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  navigationTime: number;
  renderCount: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    navigationTime: 0,
    renderCount: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (import.meta.env.PROD) return;

    // Toggle visibility with Ctrl+Shift+P
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        setMetrics((prev) => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime)),
          renderCount: prev.renderCount + 1,
        }));
        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    // Memory monitoring
    const memoryInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as Performance & { memory: { usedJSHeapSize: number } }).memory;
        setMetrics((prev) => ({
          ...prev,
          memory: Math.round(memory.usedJSHeapSize / 1048576), // Convert to MB
        }));
      }
    }, 1000);

    // Navigation timing
    const navigationEntry = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      setMetrics((prev) => ({
        ...prev,
        navigationTime: Math.round(navigationEntry.loadEventEnd - navigationEntry.fetchStart),
      }));
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(memoryInterval);
    };
  }, [isVisible]);

  if (!isVisible || import.meta.env.PROD) return null;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-black/90 text-white px-4 py-3 rounded-lg font-mono text-xs shadow-lg border border-gray-700">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center gap-4 border-b border-gray-700 pb-2 mb-2">
          <span className="font-bold text-blue-400">Performance Monitor</span>
          <span className="text-gray-400 text-[10px]">Ctrl+Shift+P to toggle</span>
        </div>

        <div className="flex justify-between gap-8">
          <span className="text-gray-400">FPS:</span>
          <span className={`font-bold ${getFPSColor(metrics.fps)}`}>{metrics.fps}</span>
        </div>

        {metrics.memory > 0 && (
          <div className="flex justify-between gap-8">
            <span className="text-gray-400">Memory:</span>
            <span className="font-bold">{metrics.memory} MB</span>
          </div>
        )}

        <div className="flex justify-between gap-8">
          <span className="text-gray-400">Load Time:</span>
          <span className="font-bold">{metrics.navigationTime}ms</span>
        </div>

        <div className="flex justify-between gap-8">
          <span className="text-gray-400">Renders:</span>
          <span className="font-bold">{metrics.renderCount}</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
