import { useState, useEffect } from 'react';
import {
  Button,
  Select,
  NumberInput,
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
import { IconResize, IconDownload } from '@tabler/icons-react';

import { FileDropzone } from '../shared/FileDropzone';
import { PageHeader } from '../shared/PageHeader';
import { ResizableImage } from '../shared/ResizableImage';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { canRunClientSide, resizeImage, type ImageResult } from '../../lib/image/canvas';
import { imageViaBackend } from '../../lib/image/backend';
import { downloadBlob, withSuffix } from '../../lib/download';

const FORMAT_OPTIONS = [
  { value: 'PNG', label: 'PNG' },
  { value: 'JPEG', label: 'JPEG' },
  { value: 'WEBP', label: 'WEBP' },
  { value: 'BMP', label: 'BMP' },
  { value: 'GIF', label: 'GIF' },
  { value: 'TIFF', label: 'TIFF' },
];

export function ResizeImage() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [naturalDims, setNaturalDims] = useState<{ w: number; h: number } | null>(null);
  const [width, setWidth] = useState<number | string>(800);
  const [height, setHeight] = useState<number | string>(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
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
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = originalPreview;
  }, [originalPreview]);

  function handleFilesSelected(files: FileWithPath[]): void {
    setFile(files[0] ?? null);
    setResult(null);
  }

  function handleVisualResize(w: number, h: number): void {
    setWidth(w);
    setHeight(h);
  }

  function handleWidthChange(val: number | string): void {
    setWidth(val);
    if (maintainAspectRatio && naturalDims && typeof val === 'number') {
      setHeight(Math.round(val / (naturalDims.w / naturalDims.h)));
    }
  }

  function handleHeightChange(val: number | string): void {
    setHeight(val);
    if (maintainAspectRatio && naturalDims && typeof val === 'number') {
      setWidth(Math.round(val * (naturalDims.w / naturalDims.h)));
    }
  }

  async function handleSubmit(): Promise<void> {
    if (!file) {
      notifications.show({ title: 'No file', message: 'Please select an image file.', color: 'red' });
      return;
    }
    if (!width || !height) {
      notifications.show({ title: 'Missing dimensions', message: 'Provide both width and height.', color: 'red' });
      return;
    }

    const outFormat = format ?? 'PNG';
    setLoading(true);
    setResult(null);

    try {
      const output = canRunClientSide(file, outFormat)
        ? await resizeImage(file, Number(width), Number(height), outFormat)
        : await imageViaBackend('/image/resize/file', file, {
            width: Number(width),
            height: Number(height),
            maintain_aspect_ratio: maintainAspectRatio,
            format: outFormat,
          });
      setResult(output);
      notifications.show({ title: 'Success', message: 'Image resized successfully.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  function handleDownload(): void {
    if (!result || !file) return;
    downloadBlob(result.blob, withSuffix(file.name, 'resized', result.format.toLowerCase()));
  }

  return (
    <Stack gap="1rem">
      <PageHeader
        title="Resize Image"
        description="Resize an image — type dimensions or drag the corner handle to resize visually."
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

          {file && originalPreview && naturalDims && (
            <Paper withBorder p="1rem">
              <Text size="sm" fw={500} mb="0.75rem">
                Drag the blue corner handle to set target size
              </Text>
              <ResizableImage
                src={originalPreview}
                naturalWidth={naturalDims.w}
                naturalHeight={naturalDims.h}
                targetWidth={typeof width === 'number' ? width : naturalDims.w}
                targetHeight={typeof height === 'number' ? height : naturalDims.h}
                maintainAspectRatio={maintainAspectRatio}
                onResize={handleVisualResize}
              />
            </Paper>
          )}

          <Group grow>
            <NumberInput
              label="Width (px)"
              value={width}
              onChange={handleWidthChange}
              min={1}
              max={10000}
              placeholder="Width"
            />
            <NumberInput
              label="Height (px)"
              value={height}
              onChange={handleHeightChange}
              min={1}
              max={10000}
              placeholder="Height"
            />
          </Group>

          <Switch
            label="Maintain aspect ratio"
            checked={maintainAspectRatio}
            onChange={(event) => setMaintainAspectRatio(event.currentTarget.checked)}
          />

          <Select label="Output format" data={FORMAT_OPTIONS} value={format} onChange={setFormat} />

          <Button onClick={handleSubmit} loading={loading} leftSection={<IconResize size={16} />}>
            Resize Image
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
              <Text size="sm" c="dimmed">Resized</Text>
              <MantineImage
                src={resultUrl}
                alt="Resized"
                mah="16rem"
                fit="contain"
                radius="sm"
                bg="var(--mantine-color-gray-light)"
              />
              <Group gap="0.5rem">
                <Badge variant="light" size="sm">{result.format}</Badge>
                <Badge variant="light" size="sm" color="blue">
                  {result.width} x {result.height}
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
            Download Resized Image
          </Button>
        </Paper>
      )}
    </Stack>
  );
}
