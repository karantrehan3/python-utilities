import { Badge, Button, Group, Paper, Stack, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconDownload, IconFileZip } from '@tabler/icons-react';
import { formatBytes } from '../../lib/format';
import { downloadBlob } from '../../lib/download';

interface ArchiveResultPreviewProps {
  blob: Blob;
  filename: string;
  /** Optional detail line, e.g. "12 pages". */
  detail?: string;
}

/**
 * Result card for non-previewable downloads (ZIP archives). Gives ZIP-producing
 * tools the same explicit result step as PDF tools instead of an instant download.
 */
export function ArchiveResultPreview({ blob, filename, detail }: ArchiveResultPreviewProps) {
  return (
    <Paper withBorder p="1rem" mt="1rem">
      <Group justify="space-between" wrap="nowrap">
        <Group gap="0.75rem" wrap="nowrap" style={{ overflow: 'hidden' }}>
          <ThemeIcon size="2.5rem" variant="light" color="yellow" radius="md">
            <IconFileZip size={20} />
          </ThemeIcon>
          <Stack gap="0.125rem" style={{ overflow: 'hidden' }}>
            <Text size="sm" fw={500} truncate maw="18rem">
              {filename}
            </Text>
            <Group gap="0.5rem">
              <Badge variant="light" size="sm" color="gray">
                {formatBytes(blob.size)}
              </Badge>
              {detail && (
                <Text size="xs" c="dimmed">
                  {detail}
                </Text>
              )}
            </Group>
          </Stack>
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
    </Paper>
  );
}
