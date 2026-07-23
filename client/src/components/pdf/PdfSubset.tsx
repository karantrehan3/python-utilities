import { useState } from 'react';
import { Button, Group, NumberInput, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { PdfFilePreview } from '../shared/PdfFilePreview';
import { PdfResultPreview } from '../shared/PdfResultPreview';
import { extractPages } from '../../lib/pdf/operations';
import { withSuffix } from '../../lib/download';

export function PdfSubset() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [startPage, setStartPage] = useState<number | string>(1);
  const [endPage, setEndPage] = useState<number | string>(1);
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
    if (typeof startPage !== 'number' || typeof endPage !== 'number') {
      notifications.show({
        title: 'Invalid pages',
        message: 'Please enter valid page numbers.',
        color: 'red',
      });
      return;
    }
    if (startPage > endPage) {
      notifications.show({
        title: 'Invalid range',
        message: 'Start page must be less than or equal to end page.',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const blob = await extractPages(file, startPage, endPage);
      setResultBlob(blob);
      notifications.show({ title: 'Success', message: 'PDF subset extracted successfully.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to extract PDF subset.';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader title="PDF Subset" description="Extract a range of pages from a PDF file." />

      <FileDropzone
        onFilesSelected={handleFilesSelected}
        label="Upload PDF"
        description={file ? file.name : 'Drag a PDF here or click to browse'}
        accept={['application/pdf']}
        maxFiles={1}
      />

      {file && <PdfFilePreview file={file} />}

      <Group grow>
        <NumberInput
          label="Start page"
          placeholder="1"
          min={1}
          value={startPage}
          onChange={setStartPage}
        />
        <NumberInput
          label="End page"
          placeholder="1"
          min={1}
          value={endPage}
          onChange={setEndPage}
        />
      </Group>

      <Button onClick={handleSubmit} loading={loading} disabled={!file} mt="0.5rem">
        Extract Pages
      </Button>

      {resultBlob && file && (
        <PdfResultPreview
          blob={resultBlob}
          filename={withSuffix(file.name, `pages_${startPage}-${endPage}`)}
        />
      )}
    </Stack>
  );
}
