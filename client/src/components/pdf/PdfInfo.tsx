import { useState } from 'react';
import { Button, Stack, Switch } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { PdfFilePreview } from '../shared/PdfFilePreview';
import { ResultDisplay } from '../shared/ResultDisplay';
import { apiPost } from '../../api/client';

export function PdfInfo() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const handleFilesSelected = (files: FileWithPath[]) => {
    setFile(files[0] ?? null);
    setResult(null);
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
    formData.append('include_metadata', String(includeMetadata));

    setLoading(true);
    try {
      const response = await apiPost('/pdf/info', formData);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `Request failed with status ${response.status}`);
      }
      const data = await response.json();
      setResult(data);
      notifications.show({ title: 'Success', message: 'PDF info retrieved.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get PDF info.';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader
        title="PDF Info"
        description="Extract information and metadata from a PDF file."
      />

      <FileDropzone
        onFilesSelected={handleFilesSelected}
        label="Upload PDF"
        description={file ? file.name : 'Drag a PDF here or click to browse'}
        accept={['application/pdf']}
        maxFiles={1}
      />

      {file && <PdfFilePreview name={file.name} size={file.size} />}

      <Switch
        label="Include metadata"
        description="Extract additional metadata such as author, creation date, and keywords"
        checked={includeMetadata}
        onChange={(e) => setIncludeMetadata(e.currentTarget.checked)}
      />

      <Button onClick={handleSubmit} loading={loading} disabled={!file} mt="0.5rem">
        Get PDF Info
      </Button>

      <ResultDisplay data={result} label="PDF Information" />
    </Stack>
  );
}
