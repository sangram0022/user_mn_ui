/**
 * Performance Overlay Component
 *
 * Development-only overlay that displays real-time performance metrics.
 * Shows FPS, render times, memory usage, and custom metrics.
 *
 * @example
 * ```tsx
 * import { PerformanceOverlay } from '@/components/common/PerformanceOverlay';
 *
 * function App() {
 *   return (
 *     <>
 *       <YourApp />
 *       {process.env.NODE_ENV === 'development' && <PerformanceOverlay />}
 *     </>
 *   );
 * }
 * ```
 */

import { Activity, Maximize2, Minimize2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PerformanceData {
  fps: number;
  memory: number;
  renderTime: number;
  domNodes: number;
  timestamp: number;
}

interface PerformanceOverlayProps {
  /** Initial position */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Show by default */
  defaultOpen?: boolean;
}

/**
 * Performance monitoring overlay for development
 */
export function PerformanceOverlay({
  position = 'bottom-right',
  defaultOpen = true,
}: PerformanceOverlayProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [data, setData] = useState<PerformanceData>({
    fps: 0,
    memory: 0,
    renderTime: 0,
    domNodes: 0,
    timestamp: 0, // Will be set in useEffect
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0); // Will be set in useEffect
  const rafIdRef = useRef<number | undefined>(undefined);

  // Calculate FPS
  useEffect(() => {
    if (!isOpen) return;

    // Initialize timing on first run - moved to separate useEffect
    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;

      // Update FPS every second
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / deltaTime);

        // Get memory info (Chrome only)
        const perfMemory = (performance as { memory?: { usedJSHeapSize: number } }).memory;
        const memory = perfMemory
          ? Math.round((perfMemory.usedJSHeapSize / 1048576) * 100) / 100
          : 0;

        // Get DOM node count
        const domNodes = document.getElementsByTagName('*').length;

        setData({
          fps,
          memory,
          renderTime: Math.round(deltaTime / frameCountRef.current),
          domNodes,
          timestamp: Date.now(),
        });

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      rafIdRef.current = requestAnimationFrame(measureFPS);
    };

    rafIdRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isOpen]);

  // Initialize timing on mount
  useEffect(() => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = performance.now();
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setData((prev) => ({ ...prev, timestamp: Date.now() })), 0);
    }
  }, []);

  // Keyboard shortcut to toggle (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full bg-blue-500 p-3 text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50"
        title="Show Performance Monitor (Ctrl+Shift+P)"
        aria-label="Show performance monitor"
      >
        <Activity className="h-5 w-5" />
      </button>
    );
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const fpsColor = getStatusColor(data.fps, { good: 55, warning: 30 });
  const renderColor = data.renderTime <= 16 ? 'text-green-600' : 'text-red-600';

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 w-80 rounded-lg border border-gray-200 bg-white shadow-2xl`}
      role="complementary"
      aria-label="Performance monitor"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 rounded-t-lg">
        <div className="flex items-center gap-2 text-white">
          <Activity className="h-5 w-5" />
          <span className="font-semibold">Performance Monitor</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded p-1 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close performance monitor"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 space-y-4">
          {/* FPS */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">FPS</span>
            <span className={`text-2xl font-bold ${fpsColor}`}>{data.fps}</span>
          </div>

          {/* Render Time */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Render Time</span>
            <div className="text-right">
              <span className={`text-lg font-semibold ${renderColor}`}>{data.renderTime}ms</span>
              <div className="text-xs text-gray-500">Target: &lt;16ms</div>
            </div>
          </div>

          {/* Memory Usage */}
          {data.memory > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Memory</span>
              <span className="text-lg font-semibold text-gray-900">{data.memory} MB</span>
            </div>
          )}

          {/* DOM Nodes */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">DOM Nodes</span>
            <span className="text-lg font-semibold text-gray-900">
              {data.domNodes.toLocaleString()}
            </span>
          </div>

          {/* Visual FPS Indicator */}
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-2">FPS History</div>
            <div className="performance-bar-container h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`performance-bar h-full transition-all duration-300 ${
                  data.fps >= 55
                    ? 'performance-bar-good'
                    : data.fps >= 30
                      ? 'performance-bar-warning'
                      : 'performance-bar-poor'
                }`}
                style={
                  {
                    '--performance-value': `${Math.min((data.fps / 60) * 100, 100)}%`,
                  } as React.CSSProperties
                }
                role="progressbar"
                aria-valuenow={Math.min((data.fps / 60) * 100, 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>30</span>
              <span>60 FPS</span>
            </div>
          </div>

          {/* Keyboard Shortcut */}
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Toggle:{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300">
                Ctrl+Shift+P
              </kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Performance stats widget (smaller, inline version)
 */
export function PerformanceStats() {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0); // Will be initialized in useEffect
  const rafIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Initialize timing on first run
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = performance.now();
    }

    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;

      if (deltaTime >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / deltaTime);
        setFps(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      rafIdRef.current = requestAnimationFrame(measureFPS);
    };

    rafIdRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const fpsColor = fps >= 55 ? 'bg-green-500' : fps >= 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white"
      role="status"
      aria-label={`Performance: ${fps} frames per second`}
    >
      <Activity className="h-3 w-3" />
      <span>{fps} FPS</span>
      <div className={`h-2 w-2 rounded-full ${fpsColor} animate-pulse`} />
    </div>
  );
}
