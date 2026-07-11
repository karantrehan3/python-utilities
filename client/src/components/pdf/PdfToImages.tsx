import { useState } from 'react';
import { Button, NumberInput, Select, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconPhoto } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { PdfFilePreview } from '../shared/PdfFilePreview';
import { apiPost } from '../../api/client';

export function PdfToImages() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [format, setFormat] = useState<string>('png');
  const [dpi, setDpi] = useState<number>(150);
  const [loading, setLoading] = useState(false);

  const handleFilesSelected = (files: FileWithPath[]) => {
    setFile(files[0] ?? null);
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
    formData.append('format', format);
    formData.append('dpi', String(dpi));

    setLoading(true);
    try {
      const response = await apiPost('/pdf/to-images', formData);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `Request failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pdf_pages.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notifications.show({ title: 'Success', message: 'Page images downloaded as ZIP.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to convert PDF to images.';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader title="PDF to Images" description="Convert each page of a PDF into an image file." />

      <FileDropzone
        onFilesSelected={handleFilesSelected}
        label="Upload PDF"
        description={file ? file.name : 'Drag a PDF here or click to browse'}
        accept={['application/pdf']}
        maxFiles={1}
      />

      {file && <PdfFilePreview name={file.name} size={file.size} />}

      <Select
        label="Image format"
        data={[
          { value: 'png', label: 'PNG' },
          { value: 'jpeg', label: 'JPEG' },
        ]}
        value={format}
        onChange={(value) => setFormat(value ?? 'png')}
        leftSection={<IconPhoto size={16} />}
      />

      <NumberInput
        label="DPI"
        description="Higher DPI produces larger, sharper images"
        value={dpi}
        onChange={(value) => setDpi(typeof value === 'number' ? value : 150)}
        min={72}
        max={600}
      />

      <Button onClick={handleSubmit} loading={loading} disabled={!file} mt="0.5rem">
        Convert to Images
      </Button>
    </Stack>
  );
}
