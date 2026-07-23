import { useState, useEffect } from 'react';
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconFileZip, IconDownload } from '@tabler/icons-react';

import { FileDropzone } from '../shared/FileDropzone';
import { PageHeader } from '../shared/PageHeader';
import { CompressionResult } from '../shared/CompressionResult';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { canRunClientSide, compressImage, type ImageResult } from '../../lib/image/canvas';
import { imageViaBackend } from '../../lib/image/backend';
import { downloadBlob, withSuffix } from '../../lib/download';
import { formatBytes } from '../../lib/format';

interface CompressionSizes {
  original: number;
  compressed: number;
}

const FORMAT_OPTIONS = [
  { value: 'JPEG', label: 'JPEG' },
  { value: 'WEBP', label: 'WEBP' },
];

export function CompressImage() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [naturalDims, setNaturalDims] = useState<{ w: number; h: number } | null>(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<string | null>('JPEG');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [sizes, setSizes] = useState<CompressionSizes | null>(null);

  const originalPreview = useObjectUrl(file);
  const resultUrl = useObjectUrl(result?.blob ?? null);

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
    setFile(files[0] ?? null);
    setResult(null);
    setSizes(null);
  }

  async function handleSubmit(): Promise<void> {
    if (!file) {
      notifications.show({ title: 'No file', message: 'Please select an image file.', color: 'red' });
      return;
    }

    const outFormat = format ?? 'JPEG';
    setLoading(true);
    setResult(null);
    setSizes(null);

    try {
      let output: ImageResult;
      let origBytes = file.size;
      let compBytes: number;

      if (canRunClientSide(file, outFormat)) {
        output = await compressImage(file, quality, outFormat);
        compBytes = output.size;
      } else {
        const backend = await imageViaBackend('/image/compress/file', file, {
          quality,
          format: outFormat,
        });
        output = backend;
        origBytes = backend.originalSize ?? file.size;
        compBytes = backend.compressedSize ?? backend.size;
      }
      setResult(output);
      setSizes({ original: origBytes, compressed: compBytes });

      notifications.show({ title: 'Success', message: 'Image compressed successfully.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  function handleDownload(): void {
    if (!result || !file) return;
    downloadBlob(result.blob, withSuffix(file.name, 'compressed', result.format.toLowerCase()));
  }

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

      {sizes && (
        <CompressionResult originalBytes={sizes.original} compressedBytes={sizes.compressed} />
      )}

      {result && resultUrl && (
        <Paper withBorder p="1.5rem">
          <Text fw={500} mb="0.75rem">Compressed Image</Text>
          <MantineImage
            src={resultUrl}
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
            onClick={handleDownload}
          >
            Download Compressed Image
          </Button>
        </Paper>
      )}
    </Stack>
  );
}
