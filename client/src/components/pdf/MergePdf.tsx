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
import { PdfResultPreview } from '../shared/PdfResultPreview';
import { mergePdfs } from '../../lib/pdf/operations';

interface PdfItem {
  id: string;
  file: FileWithPath;
}

const MAX_FILES = 20;
let nextId = 0;

export function MergePdf() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleFilesSelected = useCallback((newFiles: FileWithPath[]) => {
    setItems((prev) => {
      const combined = [...prev, ...newFiles.map((file) => ({ id: `pdf-${++nextId}`, file }))];
      if (combined.length > MAX_FILES) {
        notifications.show({
          title: 'File limit reached',
          message: `Only the first ${MAX_FILES} files are kept; ${combined.length - MAX_FILES} were dropped.`,
          color: 'yellow',
        });
      }
      return combined.slice(0, MAX_FILES);
    });
    setResultBlob(null);
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

    setLoading(true);
    try {
      const blob = await mergePdfs(items.map((i) => i.file));
      setResultBlob(blob);
      notifications.show({ title: 'Success', message: 'PDFs merged.', color: 'green' });
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
        description={`Drag PDF files here or click to browse (${items.length}/${MAX_FILES})`}
        accept={['application/pdf']}
        maxFiles={MAX_FILES}
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
                    file={item.file}
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

      {resultBlob && <PdfResultPreview blob={resultBlob} filename="merged.pdf" />}
    </Stack>
  );
}
