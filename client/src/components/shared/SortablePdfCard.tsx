import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconGripVertical, IconX } from '@tabler/icons-react';
import { formatBytes } from '../../lib/format';
import { PdfThumbnail } from './PdfThumbnail';
import { PdfPreviewModal } from './PdfPreviewModal';

interface SortablePdfCardProps {
  id: string;
  index: number;
  file: File;
  onRemove: () => void;
}

export function SortablePdfCard({ id, index, file, onRemove }: SortablePdfCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const [opened, { open, close }] = useDisclosure(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper ref={setNodeRef} style={style} withBorder p="0.5rem">
      <Group justify="space-between" wrap="nowrap">
        <Group gap="0.5rem" wrap="nowrap" style={{ overflow: 'hidden' }}>
          <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex' }}>
            <IconGripVertical size={16} style={{ opacity: 0.5 }} />
          </div>
          <Badge variant="filled" size="sm" circle>
            {index + 1}
          </Badge>
          <PdfThumbnail file={file} width={32} height={40} onClick={open} />
          <Stack gap={0} style={{ overflow: 'hidden' }}>
            <Text size="sm" truncate style={{ maxWidth: '13rem' }}>
              {file.name}
            </Text>
            <Badge variant="light" size="xs" color="gray" w="fit-content">
              {formatBytes(file.size)}
            </Badge>
          </Stack>
        </Group>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="red"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
        >
          <IconX size={14} />
        </ActionIcon>
      </Group>
      <PdfPreviewModal file={file} title={file.name} opened={opened} onClose={close} />
    </Paper>
  );
}
