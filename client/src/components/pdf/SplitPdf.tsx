import { useState } from 'react';
import { Button, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconScissors } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { PdfFilePreview } from '../shared/PdfFilePreview';
import { ArchiveResultPreview } from '../shared/ArchiveResultPreview';
import { splitPdf } from '../../lib/pdf/operations';
import { withSuffix } from '../../lib/download';

export function SplitPdf() {
  const [file, setFile] = useState<FileWithPath | null>(null);
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
      const blob = await splitPdf(file);
      setResultBlob(blob);
      notifications.show({ title: 'Success', message: 'PDF split into individual pages.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to split PDF.';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader title="Split PDF" description="Split a PDF into individual pages, downloaded as a ZIP file." />

      <FileDropzone
        onFilesSelected={handleFilesSelected}
        label="Upload PDF"
        description={file ? file.name : 'Drag a PDF here or click to browse'}
        accept={['application/pdf']}
        maxFiles={1}
      />

      {file && <PdfFilePreview file={file} />}

      <Button
        onClick={handleSubmit}
        loading={loading}
        disabled={!file}
        leftSection={<IconScissors size={16} />}
        mt="0.5rem"
      >
        Split PDF
      </Button>

      {resultBlob && file && (
        <ArchiveResultPreview blob={resultBlob} filename={withSuffix(file.name, 'split', 'zip')} />
      )}
    </Stack>
  );
}
