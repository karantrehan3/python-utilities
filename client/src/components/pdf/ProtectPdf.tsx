import { useState } from 'react';
import { Button, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconLock, IconShieldLock } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { PdfFilePreview } from '../shared/PdfFilePreview';
import { apiPost } from '../../api/client';
import { PdfResultPreview } from '../shared/PdfResultPreview';
import { apiErrorMessage, filenameFromResponse, withSuffix } from '../../lib/download';

export function ProtectPdf() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFilename, setResultFilename] = useState('protected.pdf');

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
      const response = await apiPost('/pdf/protect', formData);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(apiErrorMessage(body, `Request failed with status ${response.status}`));
      }
      const blob = await response.blob();
      setResultBlob(blob);
      setResultFilename(filenameFromResponse(response, withSuffix(file.name, 'protected')));
      notifications.show({ title: 'Success', message: 'PDF protected successfully.', color: 'green' });
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

      {file && <PdfFilePreview file={file} />}

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

      {resultBlob && <PdfResultPreview blob={resultBlob} filename={resultFilename} />}
    </Stack>
  );
}
