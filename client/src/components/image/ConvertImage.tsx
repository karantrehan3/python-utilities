import { useState } from 'react';
import {
  Button,
  Select,
  Stack,
  Group,
  Text,
  Paper,
  Badge,
  LoadingOverlay,
  Image as MantineImage,
  SimpleGrid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconTransform, IconDownload } from '@tabler/icons-react';

import { FileDropzone } from '../shared/FileDropzone';
import { PageHeader } from '../shared/PageHeader';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { canRunClientSide, convertImage, type ImageResult } from '../../lib/image/canvas';
import { imageViaBackend } from '../../lib/image/backend';
import { downloadBlob, withSuffix } from '../../lib/download';
import { formatBytes } from '../../lib/format';

const FORMAT_OPTIONS = [
  { value: 'PNG', label: 'PNG' },
  { value: 'JPEG', label: 'JPEG' },
  { value: 'WEBP', label: 'WEBP' },
  { value: 'BMP', label: 'BMP' },
  { value: 'GIF', label: 'GIF' },
  { value: 'TIFF', label: 'TIFF' },
];

export function ConvertImage() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [targetFormat, setTargetFormat] = useState<string | null>('PNG');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageResult | null>(null);

  const originalPreview = useObjectUrl(file);
  const resultUrl = useObjectUrl(result?.blob ?? null);

  function handleFilesSelected(files: FileWithPath[]): void {
    setFile(files[0] ?? null);
    setResult(null);
  }

  async function handleSubmit(): Promise<void> {
    if (!file) {
      notifications.show({ title: 'No file', message: 'Please select an image file.', color: 'red' });
      return;
    }
    if (!targetFormat) {
      notifications.show({ title: 'No format', message: 'Please select a target format.', color: 'red' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const output = canRunClientSide(file, targetFormat)
        ? await convertImage(file, targetFormat)
        : await imageViaBackend('/image/convert/file', file, {
            target_format: targetFormat,
            format: targetFormat,
          });
      setResult(output);
      notifications.show({ title: 'Success', message: 'Image converted successfully.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  function handleDownload(): void {
    if (!result || !file) return;
    downloadBlob(result.blob, withSuffix(file.name, 'converted', result.format.toLowerCase()));
  }

  return (
    <Stack gap="1rem">
      <PageHeader title="Convert Image" description="Convert an image between different formats." />

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

          {file && originalPreview && (
            <Paper withBorder p="0.75rem" bg="var(--mantine-color-gray-light)">
              <Group gap="0.75rem">
                <MantineImage
                  src={originalPreview}
                  alt="Original preview"
                  h="6rem"
                  w="auto"
                  fit="contain"
                  radius="sm"
                />
                <Stack gap="0.25rem">
                  <Text size="sm" fw={500}>{file.name}</Text>
                  <Text size="xs" c="dimmed">{formatBytes(file.size)}</Text>
                </Stack>
              </Group>
            </Paper>
          )}

          <Select
            label="Target format"
            data={FORMAT_OPTIONS}
            value={targetFormat}
            onChange={setTargetFormat}
            placeholder="Select target format"
          />

          <Button onClick={handleSubmit} loading={loading} leftSection={<IconTransform size={16} />}>
            Convert Image
          </Button>
        </Stack>
      </Paper>

      {result && resultUrl && originalPreview && (
        <Paper withBorder p="1.5rem">
          <Text fw={500} mb="0.75rem">Before / After</Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="1rem">
            <Stack gap="0.5rem" align="center">
              <Group gap="0.5rem">
                <Text size="sm" c="dimmed">Original</Text>
                <Badge variant="light" size="sm" color="gray">{file?.name.split('.').pop()?.toUpperCase()}</Badge>
              </Group>
              <MantineImage
                src={originalPreview}
                alt="Original"
                mah="16rem"
                fit="contain"
                radius="sm"
                bg="var(--mantine-color-gray-light)"
              />
            </Stack>
            <Stack gap="0.5rem" align="center">
              <Group gap="0.5rem">
                <Text size="sm" c="dimmed">Converted</Text>
                <Badge variant="light" size="sm" color="green">{result.format}</Badge>
              </Group>
              <MantineImage
                src={resultUrl}
                alt="Converted"
                mah="16rem"
                fit="contain"
                radius="sm"
                bg="var(--mantine-color-gray-light)"
              />
            </Stack>
          </SimpleGrid>
          <Button
            variant="light"
            leftSection={<IconDownload size={16} />}
            mt="1rem"
            onClick={handleDownload}
          >
            Download Converted Image
          </Button>
        </Paper>
      )}
    </Stack>
  );
}
