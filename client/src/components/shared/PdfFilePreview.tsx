import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { formatBytes } from '../../lib/format';
import { PdfThumbnail } from './PdfThumbnail';
import { PdfPreviewModal } from './PdfPreviewModal';

interface PdfFilePreviewProps {
  file: File;
}

export function PdfFilePreview({ file }: PdfFilePreviewProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Paper withBorder p="0.75rem" bg="var(--mantine-color-gray-light)">
        <Group gap="0.75rem" wrap="nowrap">
          <PdfThumbnail file={file} width={56} height={72} onClick={open} />
          <Stack gap="0.25rem" style={{ overflow: 'hidden' }}>
            <Text size="sm" fw={500} truncate maw="20rem">
              {file.name}
            </Text>
            <Badge variant="light" size="sm" color="gray" w="fit-content">
              {formatBytes(file.size)}
            </Badge>
            <Text size="xs" c="dimmed">
              Click the thumbnail to preview
            </Text>
          </Stack>
        </Group>
      </Paper>
      <PdfPreviewModal file={file} title={file.name} opened={opened} onClose={close} />
    </>
  );
}
