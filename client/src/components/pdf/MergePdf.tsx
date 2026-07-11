import { useState, useCallback } from 'react';
import { Button, Paper, Stack, Text } from '@mantine/core';
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
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { SortablePdfCard } from '../shared/SortablePdfCard';
import { downloadFile } from '../../api/client';

interface PdfItem {
  id: string;
  file: FileWithPath;
}

let nextId = 0;

export function MergePdf() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleFilesSelected = useCallback((newFiles: FileWithPath[]) => {
    const newItems = newFiles.map((file) => ({
      id: `pdf-${++nextId}`,
      file,
    }));
    setItems((prev) => [...prev, ...newItems].slice(0, 20));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
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
    if (items.length < 2) {
      notifications.show({
        title: 'Not enough files',
        message: 'Please select at least 2 PDF files to merge.',
        color: 'red',
      });
      return;
    }

    const formData = new FormData();
    for (const item of items) {
      formData.append('files', item.file);
    }

    setLoading(true);
    try {
      await downloadFile('/pdf/merge', formData, 'merged.pdf');
      notifications.show({ title: 'Success', message: 'Merged PDF downloaded.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to merge PDFs.';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader
        title="Merge PDF"
        description="Combine multiple PDF files into a single document. Drag to reorder."
      />

      <FileDropzone
        onFilesSelected={handleFilesSelected}
        label="Upload PDFs"
        description={`Drag PDF files here or click to browse (${items.length}/20)`}
        accept={['application/pdf']}
        maxFiles={20}
      />

      {items.length > 0 && (
        <Paper withBorder p="0.75rem">
          <Text size="sm" fw={500} mb="0.5rem">
            Drag to reorder — merge order top to bottom ({items.length} files)
          </Text>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <Stack gap="0.375rem">
                {items.map((item, index) => (
                  <SortablePdfCard
                    key={item.id}
                    id={item.id}
                    index={index}
                    name={item.file.name}
                    size={item.file.size}
                    onRemove={() => handleRemove(item.id)}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        </Paper>
      )}

      <Button onClick={handleSubmit} loading={loading} disabled={items.length < 2} mt="0.5rem">
        Merge PDFs
      </Button>
    </Stack>
  );
}
