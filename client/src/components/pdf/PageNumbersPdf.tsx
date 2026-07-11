import { useState } from 'react';
import { Button, NumberInput, Select, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconHash } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { PdfFilePreview } from '../shared/PdfFilePreview';
import { apiPost } from '../../api/client';
import { PdfResultPreview } from '../shared/PdfResultPreview';

export function PageNumbersPdf() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [position, setPosition] = useState<string>('bottom-center');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(12);
  const [loading, setLoading] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFilesSelected = (files: FileWithPath[]) => {
    setFile(files[0] ?? null);
    setResultBlob(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      notifications.show({
        title: 'Missing file',
        message: 'Please select a PDF file.',
        color: 'red',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('position', position);
    formData.append('start_number', String(startNumber));
    formData.append('font_size', String(fontSize));

    setLoading(true);
    try {
      const response = await apiPost('/pdf/add-page-numbers', formData);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `Request failed with status ${response.status}`);
      }
      const blob = await response.blob();
      setResultBlob(blob);
      notifications.show({ title: 'Success', message: 'Page numbers added.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add page numbers.';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader title="Add Page Numbers" description="Insert page numbers on every page of a PDF file." />

      <FileDropzone
        onFilesSelected={handleFilesSelected}
        label="Upload PDF"
        description={file ? file.name : 'Drag a PDF here or click to browse'}
        accept={['application/pdf']}
        maxFiles={1}
      />

      {file && <PdfFilePreview name={file.name} size={file.size} />}

      <Select
        label="Position"
        data={[
          { value: 'bottom-center', label: 'Bottom Center' },
          { value: 'bottom-right', label: 'Bottom Right' },
          { value: 'bottom-left', label: 'Bottom Left' },
        ]}
        value={position}
        onChange={(value) => setPosition(value ?? 'bottom-center')}
        leftSection={<IconHash size={16} />}
      />

      <NumberInput
        label="Start number"
        value={startNumber}
        onChange={(value) => setStartNumber(typeof value === 'number' ? value : 1)}
        min={0}
      />

      <NumberInput
        label="Font size"
        value={fontSize}
        onChange={(value) => setFontSize(typeof value === 'number' ? value : 12)}
        min={6}
        max={72}
      />

      <Button onClick={handleSubmit} loading={loading} disabled={!file} mt="0.5rem">
        Add Page Numbers
      </Button>

      {resultBlob && <PdfResultPreview blob={resultBlob} filename="numbered.pdf" />}
    </Stack>
  );
}
