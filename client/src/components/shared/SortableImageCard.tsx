import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionIcon,
  Badge,
  Image as MantineImage,
  Paper,
  Text,
} from '@mantine/core';
import { IconGripVertical, IconX } from '@tabler/icons-react';

interface SortableImageCardProps {
  id: string;
  index: number;
  src: string;
  name: string;
  onRemove: () => void;
}

export function SortableImageCard({ id, index, src, name, onRemove }: SortableImageCardProps) {
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
    overflow: 'hidden' as const,
  };

  return (
    <Paper ref={setNodeRef} style={style} withBorder p="0.25rem" pos="relative">
      <div
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '1.5rem',
          zIndex: 3,
          cursor: 'grab',
        }}
      />
      <MantineImage
        src={src}
        alt={name}
        h="8rem"
        fit="contain"
        radius="sm"
        bg="var(--mantine-color-gray-light)"
      />
      <Badge
        size="lg"
        circle
        variant="filled"
        pos="absolute"
        top="0.5rem"
        left="0.5rem"
        style={{ zIndex: 4 }}
      >
        {index + 1}
      </Badge>
      <IconGripVertical
        size={16}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '2rem',
          zIndex: 4,
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />
      <ActionIcon
        size="xs"
        variant="filled"
        color="red"
        pos="absolute"
        top="0.5rem"
        right="0.5rem"
        style={{ zIndex: 5 }}
        onClick={onRemove}
        aria-label={`Remove ${name}`}
      >
        <IconX size={12} />
      </ActionIcon>
      <Text size="xs" c="dimmed" ta="center" mt="0.25rem" truncate>
        {name}
      </Text>
    </Paper>
  );
}
