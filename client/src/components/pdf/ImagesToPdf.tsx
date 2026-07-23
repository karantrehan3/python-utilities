import { useState, useCallback, useEffect, useRef } from 'react';
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
import { PdfResultPreview } from '../shared/PdfResultPreview';
import { imagesToPdf } from '../../lib/pdf/operations';

// Browser-decodable raster formats. TIFF is intentionally excluded — browsers
// can't decode it on a canvas, so it can't be embedded client-side.
const IMAGE_ACCEPT = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/bmp',
  'image/gif',
];

const MAX_FILES = 50;

interface FileItem {
  id: string;
  file: FileWithPath;
  preview: string;
}

let nextId = 0;

export function ImagesToPdf() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  // Track live object URLs so we can revoke them on unmount without leaking.
  const itemsRef = useRef<FileItem[]>([]);
  itemsRef.current = items;
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleFilesSelected = useCallback((newFiles: FileWithPath[]) => {
    setItems((prev) => {
      const remaining = MAX_FILES - prev.length;
      if (remaining <= 0) {
        notifications.show({
          title: 'File limit reached',
          message: `You can add at most ${MAX_FILES} images.`,
          color: 'yellow',
        });
        return prev;
      }
      const accepted = newFiles.slice(0, remaining);
      if (newFiles.length > accepted.length) {
        notifications.show({
          title: 'Some images skipped',
          message: `Only ${accepted.length} added; the ${MAX_FILES}-image limit was reached.`,
          color: 'yellow',
        });
      }
      const newItems = accepted.map((file) => ({
        id: `img-${++nextId}`,
        file,
        preview: URL.createObjectURL(file),
      }));
      return [...prev, ...newItems];
    });
    setResultBlob(null);
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

    setLoading(true);
    try {
      const blob = await imagesToPdf(items.map((i) => i.file));
      setResultBlob(blob);
      notifications.show({ title: 'Success', message: 'PDF created from images.', color: 'green' });
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
        description={`Drag images here or click to browse (${items.length}/${MAX_FILES})`}
        accept={IMAGE_ACCEPT}
        maxFiles={MAX_FILES}
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

      {resultBlob && <PdfResultPreview blob={resultBlob} filename="images.pdf" />}
    </Stack>
  );
}
