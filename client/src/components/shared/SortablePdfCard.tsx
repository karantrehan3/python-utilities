import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionIcon,
  Badge,
  Group,
  Paper,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconFileTypePdf, IconGripVertical, IconX } from '@tabler/icons-react';

interface SortablePdfCardProps {
  id: string;
  index: number;
  name: string;
  size: number;
  onRemove: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function SortablePdfCard({ id, index, name, size, onRemove }: SortablePdfCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
          <ThemeIcon size="sm" variant="light" color="red">
            <IconFileTypePdf size={14} />
          </ThemeIcon>
          <Text size="sm" truncate style={{ maxWidth: '14rem' }}>
            {name}
          </Text>
          <Badge variant="light" size="xs" color="gray">
            {formatBytes(size)}
          </Badge>
        </Group>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="red"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          <IconX size={14} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}
