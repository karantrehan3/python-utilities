import { useState, useMemo } from 'react';
import {
  Button,
  Stack,
  Text,
  Paper,
  LoadingOverlay,
  Image as MantineImage,
  Group,
  SimpleGrid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconInfoCircle } from '@tabler/icons-react';

import { FileDropzone } from '../shared/FileDropzone';
import { PageHeader } from '../shared/PageHeader';
import { apiPost } from '../../api/client';

interface ImageInfoResult {
  format: string;
  size: number;
  dimensions: string;
  width: number;
  height: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function ImageInfo() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageInfoResult | null>(null);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  function handleFilesSelected(files: FileWithPath[]): void {
    if (preview) URL.revokeObjectURL(preview);
    setFile(files[0] ?? null);
    setResult(null);
  }

  async function handleSubmit(): Promise<void> {
    if (!file) {
      notifications.show({ title: 'No file', message: 'Please select an image file.', color: 'red' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', 'json');

      const response = await apiPost('/image/info/file', formData);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `Request failed with status ${response.status}`);
      }

      const data: ImageInfoResult = await response.json();
      setResult(data);
      notifications.show({ title: 'Success', message: 'Image info retrieved.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack gap="1rem">
      <PageHeader title="Image Info" description="Get detailed information about an image file." />

      <Paper withBorder p="1.5rem" pos="relative">
        <LoadingOverlay visible={loading} />
        <Stack gap="1rem">
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            label="Upload an image"
            description="Drag an image here or click to browse"
            accept={['image/*']}
            maxFiles={1}
          />

          {file && preview && (
            <Paper withBorder p="0.75rem" bg="var(--mantine-color-gray-light)">
              <Group gap="0.75rem">
                <MantineImage
                  src={preview}
                  alt="Preview"
                  h="6rem"
                  w="auto"
                  fit="contain"
                  radius="sm"
                />
                <Stack gap="0.25rem">
                  <Text size="sm" fw={500}>{file.name}</Text>
                  <Text size="xs" c="dimmed">{(file.size / 1024).toFixed(1)} KB</Text>
                </Stack>
              </Group>
            </Paper>
          )}

          <Button onClick={handleSubmit} loading={loading} leftSection={<IconInfoCircle size={16} />}>
            Get Image Info
          </Button>
        </Stack>
      </Paper>

      {result && preview && (
        <Paper withBorder p="1.5rem">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="1.5rem">
            <MantineImage
              src={preview}
              alt="Image preview"
              mah="20rem"
              fit="contain"
              radius="sm"
              bg="var(--mantine-color-gray-light)"
            />
            <Stack gap="0.75rem">
              <Text fw={500} size="lg">Image Details</Text>
              <Group gap="0.5rem">
                <Text size="sm" c="dimmed" w="5.5rem">Format</Text>
                <Text size="sm" fw={500}>{result.format}</Text>
              </Group>
              <Group gap="0.5rem">
                <Text size="sm" c="dimmed" w="5.5rem">Dimensions</Text>
                <Text size="sm" fw={500}>
                  {result.width} x {result.height} px
                </Text>
              </Group>
              <Group gap="0.5rem">
                <Text size="sm" c="dimmed" w="5.5rem">File size</Text>
                <Text size="sm" fw={500}>{formatBytes(result.size)}</Text>
              </Group>
              <Group gap="0.5rem">
                <Text size="sm" c="dimmed" w="5.5rem">Pixels</Text>
                <Text size="sm" fw={500}>
                  {(result.width * result.height).toLocaleString()}
                </Text>
              </Group>
            </Stack>
          </SimpleGrid>
        </Paper>
      )}
    </Stack>
  );
}
