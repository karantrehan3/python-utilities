import { useEffect, useState } from 'react';
import { Modal } from '@mantine/core';

interface PdfPreviewModalProps {
  file: File | Blob | null;
  title: string;
  opened: boolean;
  onClose: () => void;
}

/**
 * Read-only preview of a PDF in a modal so users can confirm they picked the
 * right file. The iframe has no toolbar interactions beyond the built-in viewer.
 */
export function PdfPreviewModal({ file, title, opened, onClose }: PdfPreviewModalProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!opened || !file) {
      setUrl(null);
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    setUrl(blobUrl);
    return () => URL.revokeObjectURL(blobUrl);
  }, [opened, file]);

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="xl" centered>
      {url && (
        <iframe
          src={url}
          title={title}
          style={{
            width: '100%',
            height: '75vh',
            border: '1px solid var(--mantine-color-gray-4)',
            borderRadius: 'var(--mantine-radius-sm)',
            background: 'var(--mantine-color-gray-light)',
          }}
        />
      )}
    </Modal>
  );
}
