import { useState, useMemo, useEffect } from 'react';
import {
  Button,
  Select,
  NumberInput,
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
import { IconCrop, IconDownload } from '@tabler/icons-react';

import { FileDropzone } from '../shared/FileDropzone';
import { PageHeader } from '../shared/PageHeader';
import { apiPost } from '../../api/client';

interface ImageResponse {
  result: string;
  format: string;
  size: number;
}

const FORMAT_OPTIONS = [
  { value: 'PNG', label: 'PNG' },
  { value: 'JPEG', label: 'JPEG' },
  { value: 'WEBP', label: 'WEBP' },
  { value: 'BMP', label: 'BMP' },
  { value: 'GIF', label: 'GIF' },
  { value: 'TIFF', label: 'TIFF' },
];

function downloadBase64Image(base64: string, format: string, filename: string): void {
  const mimeMap: Record<string, string> = {
    PNG: 'image/png',
    JPEG: 'image/jpeg',
    WEBP: 'image/webp',
    BMP: 'image/bmp',
    GIF: 'image/gif',
    TIFF: 'image/tiff',
  };
  const mime = mimeMap[format.toUpperCase()] ?? 'application/octet-stream';
  const byteString = atob(base64);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

export function CropImage() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [naturalDims, setNaturalDims] = useState<{ w: number; h: number } | null>(null);
  const [left, setLeft] = useState<number | string>(0);
  const [top, setTop] = useState<number | string>(0);
  const [right, setRight] = useState<number | string>(0);
  const [bottom, setBottom] = useState<number | string>(0);
  const [format, setFormat] = useState<string | null>('PNG');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageResponse | null>(null);

  const originalPreview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!originalPreview) {
      setNaturalDims(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setNaturalDims({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = originalPreview;
  }, [originalPreview]);

  function handleFilesSelected(files: FileWithPath[]): void {
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    setFile(files[0] ?? null);
    setResult(null);
    setLeft(0);
    setTop(0);
    setRight(0);
    setBottom(0);
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
      formData.append('left', String(left));
      formData.append('top', String(top));
      formData.append('right', String(right));
      formData.append('bottom', String(bottom));
      formData.append('format', format ?? 'PNG');

      const response = await apiPost('/image/crop/file', formData);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `Request failed with status ${response.status}`);
      }

      const data: ImageResponse = await response.json();
      setResult(data);
      notifications.show({ title: 'Success', message: 'Image cropped successfully.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  const resultDataUri = result
    ? `data:image/${(result.format ?? 'png').toLowerCase()};base64,${result.result}`
    : null;

  return (
    <Stack gap="1rem">
      <PageHeader
        title="Crop Image"
        description="Crop an image by specifying pixel offsets from each edge."
      />

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
            <Paper withBorder p="1rem">
              <Group gap="1rem" align="flex-start">
                <MantineImage
                  src={originalPreview}
                  alt="Original preview"
                  maw="8rem"
                  mah="8rem"
                  fit="contain"
                  radius="sm"
                  bg="var(--mantine-color-gray-light)"
                />
                <Stack gap="0.25rem">
                  <Text size="sm" fw={500}>{file.name}</Text>
                  <Text size="xs" c="dimmed">{formatBytes(file.size)}</Text>
                  {naturalDims && (
                    <Badge variant="light" color="gray" size="sm">
                      {naturalDims.w} x {naturalDims.h}
                    </Badge>
                  )}
                </Stack>
              </Group>
            </Paper>
          )}

          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <NumberInput
              label="Left (px)"
              value={left}
              onChange={setLeft}
              min={0}
              max={naturalDims ? naturalDims.w : 10000}
              placeholder="0"
            />
            <NumberInput
              label="Top (px)"
              value={top}
              onChange={setTop}
              min={0}
              max={naturalDims ? naturalDims.h : 10000}
              placeholder="0"
            />
            <NumberInput
              label="Right (px)"
              value={right}
              onChange={setRight}
              min={0}
              max={naturalDims ? naturalDims.w : 10000}
              placeholder="0"
            />
            <NumberInput
              label="Bottom (px)"
              value={bottom}
              onChange={setBottom}
              min={0}
              max={naturalDims ? naturalDims.h : 10000}
              placeholder="0"
            />
          </SimpleGrid>

          <Select label="Output format" data={FORMAT_OPTIONS} value={format} onChange={setFormat} />

          <Button onClick={handleSubmit} loading={loading} leftSection={<IconCrop size={16} />}>
            Crop Image
          </Button>
        </Stack>
      </Paper>

      {result && resultDataUri && originalPreview && (
        <Paper withBorder p="1.5rem">
          <Text fw={500} mb="0.75rem">Before / After</Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="1rem">
            <Stack gap="0.5rem" align="center">
              <Text size="sm" c="dimmed">Original</Text>
              <MantineImage
                src={originalPreview}
                alt="Original"
                mah="16rem"
                fit="contain"
                radius="sm"
                bg="var(--mantine-color-gray-light)"
              />
              {naturalDims && (
                <Badge variant="light" color="gray" size="sm">
                  {naturalDims.w} x {naturalDims.h}
                </Badge>
              )}
            </Stack>
            <Stack gap="0.5rem" align="center">
              <Text size="sm" c="dimmed">Cropped</Text>
              <MantineImage
                src={resultDataUri}
                alt="Cropped"
                mah="16rem"
                fit="contain"
                radius="sm"
                bg="var(--mantine-color-gray-light)"
              />
              <Group gap="0.5rem">
                <Badge variant="light" size="sm">{result.format}</Badge>
                <Badge variant="light" size="sm" color="blue">
                  {formatBytes(result.size)}
                </Badge>
              </Group>
            </Stack>
          </SimpleGrid>
          <Button
            variant="light"
            leftSection={<IconDownload size={16} />}
            mt="1rem"
            onClick={() =>
              downloadBase64Image(result.result, result.format, `cropped.${result.format.toLowerCase()}`)
            }
          >
            Download Cropped Image
          </Button>
        </Paper>
      )}
    </Stack>
  );
}
