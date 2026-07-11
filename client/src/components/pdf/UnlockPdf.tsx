import { useState } from 'react';
import { Button, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconLock } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { PdfFilePreview } from '../shared/PdfFilePreview';
import { downloadFile } from '../../api/client';

export function UnlockPdf() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [password, setPassword] = useState('');
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
    if (!password) {
      notifications.show({
        title: 'Missing password',
        message: 'Please enter the PDF password.',
        color: 'red',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    setLoading(true);
    try {
      const outputName = file.name.replace(/\.pdf$/i, '_unlocked.pdf');
      await downloadFile('/pdf/unlock', formData, outputName);
      notifications.show({ title: 'Success', message: 'Unlocked PDF downloaded.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to unlock PDF.';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader title="Unlock PDF" description="Remove password protection from a PDF file." />

      <FileDropzone
        onFilesSelected={handleFilesSelected}
        label="Upload PDF"
        description={file ? file.name : 'Drag a password-protected PDF here or click to browse'}
        accept={['application/pdf']}
        maxFiles={1}
      />

      {file && <PdfFilePreview name={file.name} size={file.size} />}

      <TextInput
        label="Password"
        placeholder="Enter PDF password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        leftSection={<IconLock size={16} />}
      />

      <Button onClick={handleSubmit} loading={loading} disabled={!file || !password} mt="0.5rem">
        Unlock PDF
      </Button>
    </Stack>
  );
}
