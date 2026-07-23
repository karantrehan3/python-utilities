import { useEffect, useState } from 'react';
import { Badge, Button, Group, Paper, Text, Tooltip } from '@mantine/core';
import { IconDownload, IconFileTypePdf } from '@tabler/icons-react';
import { formatBytes } from '../../lib/format';
import { downloadBlob } from '../../lib/download';

interface PdfResultPreviewProps {
  blob: Blob;
  filename: string;
}

export function PdfResultPreview({ blob, filename }: PdfResultPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const blobUrl = URL.createObjectURL(blob);
    setUrl(blobUrl);
    return () => URL.revokeObjectURL(blobUrl);
  }, [blob]);

  if (!url) return null;

  return (
    <Paper withBorder p="1rem" mt="1rem">
      <Group justify="space-between" mb="0.75rem" wrap="nowrap">
        <Group gap="0.5rem" wrap="nowrap" style={{ overflow: 'hidden' }}>
          <IconFileTypePdf size={20} />
          <Text fw={500}>Result</Text>
          <Text size="sm" c="dimmed" truncate maw="16rem">
            {filename}
          </Text>
          <Badge variant="light" size="sm" color="gray">
            {formatBytes(blob.size)}
          </Badge>
        </Group>
        <Tooltip label={`Download ${filename}`} withArrow>
          <Button
            variant="light"
            size="sm"
            leftSection={<IconDownload size={16} />}
            onClick={() => downloadBlob(blob, filename)}
            style={{ flexShrink: 0 }}
          >
            Download
          </Button>
        </Tooltip>
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
