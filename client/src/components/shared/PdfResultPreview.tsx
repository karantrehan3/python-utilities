import { useEffect, useState } from 'react';
import { Button, Group, Paper, Text, Badge } from '@mantine/core';
import { IconDownload, IconFileTypePdf } from '@tabler/icons-react';

interface PdfResultPreviewProps {
  blob: Blob;
  filename: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function PdfResultPreview({ blob, filename }: PdfResultPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const blobUrl = URL.createObjectURL(blob);
    setUrl(blobUrl);
    return () => URL.revokeObjectURL(blobUrl);
  }, [blob]);

  const handleDownload = () => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!url) return null;

  return (
    <Paper withBorder p="1rem" mt="1rem">
      <Group justify="space-between" mb="0.75rem">
        <Group gap="0.5rem">
          <IconFileTypePdf size={20} />
          <Text fw={500}>Result Preview</Text>
          <Badge variant="light" size="sm" color="gray">
            {formatBytes(blob.size)}
          </Badge>
        </Group>
        <Button
          variant="light"
          size="sm"
          leftSection={<IconDownload size={16} />}
          onClick={handleDownload}
        >
          Download {filename}
        </Button>
      </Group>
      <iframe
        src={url}
        title="PDF Preview"
        style={{
          width: '100%',
          height: '32rem',
          border: '1px solid var(--mantine-color-gray-4)',
          borderRadius: 'var(--mantine-radius-sm)',
          background: 'var(--mantine-color-gray-light)',
        }}
      />
    </Paper>
  );
}
