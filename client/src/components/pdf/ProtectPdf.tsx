import { useState } from 'react';
import { Button, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconLock, IconShieldLock } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { PdfFilePreview } from '../shared/PdfFilePreview';
import { downloadFile } from '../../api/client';

export function ProtectPdf() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
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
    if (!userPassword) {
      notifications.show({
        title: 'Missing password',
        message: 'Please enter a user password.',
        color: 'red',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_password', userPassword);
    if (ownerPassword.trim()) {
      formData.append('owner_password', ownerPassword.trim());
    }

    setLoading(true);
    try {
      const outputName = file.name.replace(/\.pdf$/i, '_protected.pdf');
      await downloadFile('/pdf/protect', formData, outputName);
      notifications.show({ title: 'Success', message: 'Protected PDF downloaded.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to protect PDF.';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader title="Protect PDF" description="Add password protection to a PDF file." />

      <FileDropzone
        onFilesSelected={handleFilesSelected}
        label="Upload PDF"
        description={file ? file.name : 'Drag a PDF here or click to browse'}
        accept={['application/pdf']}
        maxFiles={1}
      />

      {file && <PdfFilePreview name={file.name} size={file.size} />}

      <TextInput
        label="User password"
        placeholder="Required — password to open the PDF"
        type="password"
        value={userPassword}
        onChange={(e) => setUserPassword(e.currentTarget.value)}
        leftSection={<IconLock size={16} />}
        required
      />

      <TextInput
        label="Owner password"
        placeholder="Same as user password if empty"
        type="password"
        value={ownerPassword}
        onChange={(e) => setOwnerPassword(e.currentTarget.value)}
        leftSection={<IconShieldLock size={16} />}
      />

      <Button onClick={handleSubmit} loading={loading} disabled={!file || !userPassword} mt="0.5rem">
        Protect PDF
      </Button>
    </Stack>
  );
}
