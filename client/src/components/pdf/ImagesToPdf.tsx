import { useState, useCallback } from 'react';
import { Button, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';

import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { SortableImageCard } from '../shared/SortableImageCard';
import { downloadFile } from '../../api/client';

const IMAGE_ACCEPT = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/bmp',
  'image/tiff',
];

interface FileItem {
  id: string;
  file: FileWithPath;
  preview: string;
}

let nextId = 0;

export function ImagesToPdf() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleFilesSelected = useCallback((newFiles: FileWithPath[]) => {
    const newItems = newFiles.map((file) => ({
      id: `img-${++nextId}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setItems((prev) => [...prev, ...newItems].slice(0, 50));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const handleSubmit = async () => {
    if (items.length === 0) {
      notifications.show({ title: 'No images', message: 'Please select at least one image.', color: 'red' });
      return;
    }

    const formData = new FormData();
    for (const item of items) {
      formData.append('files', item.file);
    }

    setLoading(true);
    try {
      await downloadFile('/pdf/from-images', formData, 'images.pdf');
      notifications.show({ title: 'Success', message: 'PDF from images downloaded.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create PDF from images.';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader
        title="Images to PDF"
        description="Convert multiple images into a single PDF document. Drag thumbnails to reorder pages."
      />

      <FileDropzone
        onFilesSelected={handleFilesSelected}
        label="Upload Images"
        description={`Drag images here or click to browse (${items.length}/50)`}
        accept={IMAGE_ACCEPT}
        maxFiles={50}
      />

      {items.length > 0 && (
        <Paper withBorder p="1rem">
          <Text size="sm" fw={500} mb="0.75rem">
            Drag to reorder — order determines page order ({items.length} images)
          </Text>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="0.75rem">
                {items.map((item, index) => (
                  <SortableImageCard
                    key={item.id}
                    id={item.id}
                    index={index}
                    src={item.preview}
                    name={item.file.name}
                    onRemove={() => handleRemove(item.id)}
                  />
                ))}
              </SimpleGrid>
            </SortableContext>
          </DndContext>
        </Paper>
      )}

      <Button onClick={handleSubmit} loading={loading} disabled={items.length === 0} mt="0.5rem">
        Create PDF
      </Button>
    </Stack>
  );
}
