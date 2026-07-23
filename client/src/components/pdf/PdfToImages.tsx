import { useState } from 'react';
import { Button, NumberInput, Select, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconPhoto } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { PdfFilePreview } from '../shared/PdfFilePreview';
import { ArchiveResultPreview } from '../shared/ArchiveResultPreview';
import { pdfToImages } from '../../lib/pdf/rasterize';
import { withSuffix } from '../../lib/download';

type ImageFormat = 'png' | 'jpeg';

export function PdfToImages() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [format, setFormat] = useState<ImageFormat>('png');
  const [dpi, setDpi] = useState<number>(150);
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

    setLoading(true);
    try {
      const blob = await pdfToImages(file, format, dpi);
      setResultBlob(blob);
      notifications.show({ title: 'Success', message: 'Pages rendered to images.', color: 'green' });
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

      {file && <PdfFilePreview file={file} />}

      <Select
        label="Image format"
        data={[
          { value: 'png', label: 'PNG' },
          { value: 'jpeg', label: 'JPEG' },
        ]}
        value={format}
        onChange={(value) => setFormat((value as ImageFormat) ?? 'png')}
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

      {resultBlob && file && (
        <ArchiveResultPreview blob={resultBlob} filename={withSuffix(file.name, 'images', 'zip')} />
      )}
    </Stack>
  );
}
