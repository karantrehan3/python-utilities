import { useEffect, useState } from 'react';
import { Image, Skeleton, ThemeIcon, Tooltip } from '@mantine/core';
import { IconFileTypePdf } from '@tabler/icons-react';
import { renderFirstPageThumbnail } from '../../lib/pdf/pdfjs';

interface PdfThumbnailProps {
  file: File;
  width: number;
  height: number;
  onClick?: () => void;
}

/**
 * Renders the first page of a PDF as a thumbnail. Falls back to a PDF icon
 * while loading or when the file can't be rendered (e.g. encrypted).
 */
export function PdfThumbnail({ file, width, height, onClick }: PdfThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setThumbnail(null);

    file
      .arrayBuffer()
      .then((bytes) => renderFirstPageThumbnail(bytes, width * 2))
      .then((dataUrl) => {
        if (cancelled) return;
        if (dataUrl) {
          setThumbnail(dataUrl);
          setStatus('ready');
        } else {
          setStatus('failed');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('failed');
      });

    return () => {
      cancelled = true;
    };
  }, [file, width]);

  const interactive = onClick
    ? { onClick, style: { cursor: 'pointer' as const }, role: 'button', tabIndex: 0 }
    : {};

  if (status === 'loading') {
    return <Skeleton width={width} height={height} radius="md" />;
  }

  if (status === 'failed' || !thumbnail) {
    return (
      <ThemeIcon
        variant="light"
        color="red"
        radius="md"
        style={{ width, height }}
        {...interactive}
      >
        <IconFileTypePdf size={Math.min(width, height) * 0.5} />
      </ThemeIcon>
    );
  }

  return (
    <Tooltip label="Click to preview" disabled={!onClick} withArrow>
      <Image
        src={thumbnail}
        alt={`Preview of ${file.name}`}
        w={width}
        h={height}
        fit="contain"
        radius="md"
        bg="var(--mantine-color-gray-light)"
        style={{ border: '1px solid var(--mantine-color-gray-3)' }}
        {...interactive}
      />
    </Tooltip>
  );
}
