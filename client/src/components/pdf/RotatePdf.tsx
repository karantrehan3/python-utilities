import { useState } from 'react';
import { Button, Select, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconRotate } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { PdfFilePreview } from '../shared/PdfFilePreview';
import { PdfResultPreview } from '../shared/PdfResultPreview';
import { rotatePdf } from '../../lib/pdf/operations';
import { withSuffix } from '../../lib/download';

export function RotatePdf() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [rotation, setRotation] = useState<string>('90');
  const [pages, setPages] = useState('');
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
      const blob = await rotatePdf(file, parseInt(rotation, 10), pages.trim() || undefined);
      setResultBlob(blob);
      notifications.show({ title: 'Success', message: 'PDF rotated successfully.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to rotate PDF.';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader title="Rotate PDF" description="Rotate all or specific pages in a PDF file." />

      <FileDropzone
        onFilesSelected={handleFilesSelected}
        label="Upload PDF"
        description={file ? file.name : 'Drag a PDF here or click to browse'}
        accept={['application/pdf']}
        maxFiles={1}
      />

      {file && <PdfFilePreview file={file} />}

      <Select
        label="Rotation"
        data={[
          { value: '90', label: '90°' },
          { value: '180', label: '180°' },
          { value: '270', label: '270°' },
        ]}
        value={rotation}
        onChange={(value) => setRotation(value ?? '90')}
        leftSection={<IconRotate size={16} />}
      />

      <TextInput
        label="Pages"
        placeholder="1,3,5 — leave empty for all pages"
        value={pages}
        onChange={(e) => setPages(e.currentTarget.value)}
      />

      <Button onClick={handleSubmit} loading={loading} disabled={!file} mt="0.5rem">
        Rotate PDF
      </Button>

      {resultBlob && file && (
        <PdfResultPreview blob={resultBlob} filename={withSuffix(file.name, 'rotated')} />
      )}
    </Stack>
  );
}
