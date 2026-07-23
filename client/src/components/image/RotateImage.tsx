import { useState, useEffect } from 'react';
import {
  Button,
  Select,
  Switch,
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
import { IconRotate, IconDownload } from '@tabler/icons-react';

import { FileDropzone } from '../shared/FileDropzone';
import { PageHeader } from '../shared/PageHeader';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { canRunClientSide, rotateImage, type ImageResult } from '../../lib/image/canvas';
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

const ANGLE_OPTIONS = [
  { value: '90', label: '90 degrees' },
  { value: '180', label: '180 degrees' },
  { value: '270', label: '270 degrees' },
];

export function RotateImage() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [naturalDims, setNaturalDims] = useState<{ w: number; h: number } | null>(null);
  const [angle, setAngle] = useState<string | null>('90');
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [format, setFormat] = useState<string | null>('PNG');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageResult | null>(null);

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
  }

  async function handleSubmit(): Promise<void> {
    if (!file) {
      notifications.show({ title: 'No file', message: 'Please select an image file.', color: 'red' });
      return;
    }

    const outFormat = format ?? 'PNG';
    setLoading(true);
    setResult(null);

    try {
      const output = canRunClientSide(file, outFormat)
        ? await rotateImage(file, Number(angle ?? '90'), flipHorizontal, flipVertical, outFormat)
        : await imageViaBackend('/image/rotate/file', file, {
            angle: angle ?? '90',
            flip_horizontal: flipHorizontal,
            flip_vertical: flipVertical,
            format: outFormat,
          });
      setResult(output);
      notifications.show({ title: 'Success', message: 'Image rotated successfully.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  function handleDownload(): void {
    if (!result || !file) return;
    downloadBlob(result.blob, withSuffix(file.name, 'rotated', result.format.toLowerCase()));
  }

  return (
    <Stack gap="1rem">
      <PageHeader
        title="Rotate Image"
        description="Rotate an image by a fixed angle and optionally flip it horizontally or vertically."
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

          <Select
            label="Rotation angle"
            data={ANGLE_OPTIONS}
            value={angle}
            onChange={setAngle}
          />

          <Switch
            label="Flip horizontal"
            checked={flipHorizontal}
            onChange={(event) => setFlipHorizontal(event.currentTarget.checked)}
          />

          <Switch
            label="Flip vertical"
            checked={flipVertical}
            onChange={(event) => setFlipVertical(event.currentTarget.checked)}
          />

          <Select label="Output format" data={FORMAT_OPTIONS} value={format} onChange={setFormat} />

          <Button onClick={handleSubmit} loading={loading} leftSection={<IconRotate size={16} />}>
            Rotate Image
          </Button>
        </Stack>
      </Paper>

      {result && resultUrl && originalPreview && (
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
              <Text size="sm" c="dimmed">Rotated</Text>
              <MantineImage
                src={resultUrl}
                alt="Rotated"
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
            onClick={handleDownload}
          >
            Download Rotated Image
          </Button>
        </Paper>
      )}
    </Stack>
  );
}
