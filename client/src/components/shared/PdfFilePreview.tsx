import { Group, Paper, Stack, Text, Badge, ThemeIcon } from '@mantine/core';
import { IconFileTypePdf } from '@tabler/icons-react';

interface PdfFilePreviewProps {
  name: string;
  size: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function PdfFilePreview({ name, size }: PdfFilePreviewProps) {
  return (
    <Paper withBorder p="0.75rem" bg="var(--mantine-color-gray-light)">
      <Group gap="0.75rem">
        <ThemeIcon size="2.5rem" variant="light" color="red" radius="md">
          <IconFileTypePdf size={20} />
        </ThemeIcon>
        <Stack gap="0.125rem">
          <Text size="sm" fw={500} truncate maw="20rem">
            {name}
          </Text>
          <Badge variant="light" size="sm" color="gray" w="fit-content">
            {formatBytes(size)}
          </Badge>
        </Stack>
      </Group>
    </Paper>
  );
}
