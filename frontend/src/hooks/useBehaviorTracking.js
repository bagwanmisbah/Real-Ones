import { useEffect, useRef } from 'react';

/**
 * Custom Hook: useBehaviorTracking
 * Purpose: Silently records mouse/keyboard physics for bot detection.
 * Logic Source: Your original index.html
 */
export const useBehaviorTracking = () => {
  // Refs are used to store data without triggering re-renders (performance optimization)
  const mousePath = useRef([]);
  const clickTimestamps = useRef([]);
  const keystrokeTimestamps = useRef([]);

  useEffect(() => {
    // --- 1. Mouse Movement (Path & Speed) ---
    const handleMouseMove = (e) => {
      mousePath.current.push([
        e.clientX, // X Coordinate
        e.clientY, // Y Coordinate
        Date.now() // Timestamp
      ]);
    };

    // --- 2. Click Mechanics (Dwell Time) ---
    const handleMouseDown = () => clickTimestamps.current.push(Date.now());
    const handleMouseUp = () => clickTimestamps.current.push(Date.now());

    // --- 3. Typing Rhythm (Flight Time) ---
    const handleKeyDown = () => keystrokeTimestamps.current.push(Date.now());

    // Attach listeners to the global window object
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup: Remove listeners when component unmounts
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Return the exact payload structure your Python backend expects
  const getPayload = () => {
    return {
      mouse_path: mousePath.current,
      click_timestamps: clickTimestamps.current,
      keystroke_timestamps: keystrokeTimestamps.current
    };
  };

  return { getPayload };
};