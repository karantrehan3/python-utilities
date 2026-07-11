import { useRef, useState, useCallback } from 'react';
import { Text, Group, Badge } from '@mantine/core';

interface ResizableImageProps {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  targetWidth: number;
  targetHeight: number;
  maintainAspectRatio: boolean;
  onResize: (width: number, height: number) => void;
}

const HANDLE_SIZE = 12;
const MIN_DIM = 10;
const MAX_PREVIEW = 400;

export function ResizableImage({
  src,
  naturalWidth,
  naturalHeight,
  targetWidth,
  targetHeight,
  maintainAspectRatio,
  onResize,
}: ResizableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const scale = Math.min(MAX_PREVIEW / naturalWidth, MAX_PREVIEW / naturalHeight, 1);
  const displayW = Math.round(targetWidth * scale);
  const displayH = Math.round(targetHeight * scale);
  const containerW = Math.round(naturalWidth * scale);
  const containerH = Math.round(naturalHeight * scale);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragStart.current = { x: e.clientX, y: e.clientY, w: targetWidth, h: targetHeight };
      setDragging(true);
    },
    [targetWidth, targetHeight],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      let newW = Math.max(MIN_DIM, Math.round(dragStart.current.w + dx / scale));
      let newH = Math.max(MIN_DIM, Math.round(dragStart.current.h + dy / scale));

      if (maintainAspectRatio) {
        const ratio = naturalWidth / naturalHeight;
        const distX = Math.abs(dx);
        const distY = Math.abs(dy);
        if (distX > distY) {
          newH = Math.round(newW / ratio);
        } else {
          newW = Math.round(newH * ratio);
        }
        newW = Math.max(MIN_DIM, newW);
        newH = Math.max(MIN_DIM, newH);
      }

      onResize(newW, newH);
    },
    [dragging, scale, maintainAspectRatio, naturalWidth, naturalHeight, onResize],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div style={{ userSelect: 'none' }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: containerW,
          height: containerH,
          background: 'var(--mantine-color-gray-light)',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          border: '1px solid var(--mantine-color-gray-4)',
        }}
      >
        <img
          src={src}
          alt="Preview"
          style={{
            width: displayW,
            height: displayH,
            objectFit: 'fill',
            display: 'block',
            borderRadius: '0.25rem',
          }}
          draggable={false}
        />

        <div
          style={{
            position: 'absolute',
            left: displayW - HANDLE_SIZE / 2,
            top: displayH - HANDLE_SIZE / 2,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            borderRadius: '50%',
            background: 'var(--mantine-primary-color-filled)',
            border: '2px solid white',
            cursor: 'nwse-resize',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            zIndex: 10,
            touchAction: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {displayW < containerW && (
          <div
            style={{
              position: 'absolute',
              left: displayW,
              top: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-conic-gradient(var(--mantine-color-gray-3) 0% 25%, transparent 0% 50%) 0 0 / 0.75rem 0.75rem',
              opacity: 0.5,
            }}
          />
        )}
        {displayH < containerH && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: displayH,
              width: displayW,
              bottom: 0,
              background: 'repeating-conic-gradient(var(--mantine-color-gray-3) 0% 25%, transparent 0% 50%) 0 0 / 0.75rem 0.75rem',
              opacity: 0.5,
            }}
          />
        )}
      </div>

      <Group mt="0.5rem" gap="0.5rem">
        <Badge variant="light" color="gray" size="sm">
          Original: {naturalWidth} x {naturalHeight}
        </Badge>
        <Text size="xs" c="dimmed">→</Text>
        <Badge variant="light" color="blue" size="sm">
          Target: {targetWidth} x {targetHeight}
        </Badge>
        {dragging && (
          <Badge variant="light" color="yellow" size="sm">
            Dragging...
          </Badge>
        )}
      </Group>
    </div>
  );
}
