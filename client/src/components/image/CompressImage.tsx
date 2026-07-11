import { useState, useMemo, useEffect } from 'react';
import {
  Button,
  Select,
  Slider,
  Stack,
  Group,
  Text,
  Paper,
  Badge,
  LoadingOverlay,
  Image as MantineImage,
  Progress,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconFileZip, IconDownload, IconArrowDown } from '@tabler/icons-react';

import { FileDropzone } from '../shared/FileDropzone';
import { PageHeader } from '../shared/PageHeader';
import { apiPost } from '../../api/client';

interface ImageCompressResponse {
  result: string;
  format: string;
  size: number;
  original_size: number;
  compressed_size: number;
}

interface CompressionStats {
  originalSize: string;
  compressedSize: string;
  reduction: string;
  reductionPercent: number;
}

const FORMAT_OPTIONS = [
  { value: 'JPEG', label: 'JPEG' },
  { value: 'WEBP', label: 'WEBP' },
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

export function CompressImage() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [naturalDims, setNaturalDims] = useState<{ w: number; h: number } | null>(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<string | null>('JPEG');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageCompressResponse | null>(null);
  const [stats, setStats] = useState<CompressionStats | null>(null);

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
    setStats(null);
  }

  async function handleSubmit(): Promise<void> {
    if (!file) {
      notifications.show({ title: 'No file', message: 'Please select an image file.', color: 'red' });
      return;
    }

    setLoading(true);
    setResult(null);
    setStats(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quality', String(quality));
      formData.append('format', format ?? 'JPEG');

      const response = await apiPost('/image/compress/file', formData);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `Request failed with status ${response.status}`);
      }

      const data: ImageCompressResponse = await response.json();
      setResult(data);

      const origBytes = data.original_size;
      const compBytes = data.compressed_size;
      const reduction = origBytes > 0 ? ((1 - compBytes / origBytes) * 100).toFixed(1) : '0';
      setStats({
        originalSize: formatBytes(origBytes),
        compressedSize: formatBytes(compBytes),
        reduction: `${reduction}%`,
        reductionPercent: parseFloat(reduction),
      });

      notifications.show({ title: 'Success', message: 'Image compressed successfully.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  const resultDataUri = result
    ? `data:image/${(result.format ?? 'jpeg').toLowerCase()};base64,${result.result}`
    : null;

  return (
    <Stack gap="1rem">
      <PageHeader
        title="Compress Image"
        description="Reduce the file size of an image by adjusting quality. Supports JPEG and WEBP output."
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

          <Stack gap="0.25rem">
            <Text size="sm" fw={500}>
              Quality: {quality}
            </Text>
            <Slider
              value={quality}
              onChange={setQuality}
              min={1}
              max={100}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: 25, label: '25' },
                { value: 50, label: '50' },
                { value: 75, label: '75' },
                { value: 100, label: '100' },
              ]}
              mb="1rem"
            />
          </Stack>

          <Select label="Output format" data={FORMAT_OPTIONS} value={format} onChange={setFormat} />

          <Button onClick={handleSubmit} loading={loading} leftSection={<IconFileZip size={16} />}>
            Compress Image
          </Button>
        </Stack>
      </Paper>

      {stats && (
        <Paper withBorder p="1rem">
          <Text size="sm" fw={500} mb="0.75rem">
            Compression Results
          </Text>
          <Group gap="2rem" mb="1rem">
            <Stack gap="0.125rem">
              <Text size="xs" c="dimmed">Original</Text>
              <Text size="sm" fw={500}>{stats.originalSize}</Text>
            </Stack>
            <ThemeIcon variant="light" color="green" size="sm">
              <IconArrowDown size={14} />
            </ThemeIcon>
            <Stack gap="0.125rem">
              <Text size="xs" c="dimmed">Compressed</Text>
              <Text size="sm" fw={500}>{stats.compressedSize}</Text>
            </Stack>
            <Stack gap="0.125rem">
              <Text size="xs" c="dimmed">Saved</Text>
              <Text size="sm" fw={700} c="green">{stats.reduction}</Text>
            </Stack>
          </Group>
          <Progress.Root size="xl">
            <Progress.Section
              value={100 - stats.reductionPercent}
              color="blue"
            >
              <Progress.Label>Compressed</Progress.Label>
            </Progress.Section>
            <Progress.Section
              value={stats.reductionPercent}
              color="green"
            >
              <Progress.Label>Saved</Progress.Label>
            </Progress.Section>
          </Progress.Root>
        </Paper>
      )}

      {result && resultDataUri && (
        <Paper withBorder p="1.5rem">
          <Text fw={500} mb="0.75rem">Compressed Image</Text>
          <MantineImage
            src={resultDataUri}
            alt="Compressed"
            mah="20rem"
            fit="contain"
            radius="sm"
            bg="var(--mantine-color-gray-light)"
          />
          <Button
            variant="light"
            leftSection={<IconDownload size={16} />}
            mt="1rem"
            onClick={() =>
              downloadBase64Image(result.result, result.format, `compressed.${result.format.toLowerCase()}`)
            }
          >
            Download Compressed Image
          </Button>
        </Paper>
      )}
    </Stack>
  );
}
