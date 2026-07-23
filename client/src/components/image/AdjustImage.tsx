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
  SimpleGrid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconAdjustments, IconDownload } from '@tabler/icons-react';

import { FileDropzone } from '../shared/FileDropzone';
import { PageHeader } from '../shared/PageHeader';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { canRunClientSide, adjustImage, type ImageResult } from '../../lib/image/canvas';
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

export function AdjustImage() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [naturalDims, setNaturalDims] = useState<{ w: number; h: number } | null>(null);
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [saturation, setSaturation] = useState(1.0);
  const [sharpness, setSharpness] = useState(1.0);
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
        ? await adjustImage(file, { brightness, contrast, saturation, sharpness }, outFormat)
        : await imageViaBackend('/image/adjust/file', file, {
            brightness,
            contrast,
            saturation,
            sharpness,
            format: outFormat,
          });
      setResult(output);
      notifications.show({ title: 'Success', message: 'Image adjusted successfully.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  function handleDownload(): void {
    if (!result || !file) return;
    downloadBlob(result.blob, withSuffix(file.name, 'adjusted', result.format.toLowerCase()));
  }

  const sliderMarks = [
    { value: 0.1, label: '0.1' },
    { value: 1.0, label: '1.0' },
    { value: 2.0, label: '2.0' },
    { value: 3.0, label: '3.0' },
  ];

  return (
    <Stack gap="1rem">
      <PageHeader
        title="Adjust Image"
        description="Fine-tune brightness, contrast, saturation, and sharpness of an image."
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
            <Text size="sm" fw={500}>Brightness: {brightness.toFixed(1)}</Text>
            <Slider
              value={brightness}
              onChange={setBrightness}
              min={0.1}
              max={3.0}
              step={0.1}
              marks={sliderMarks}
              mb="1rem"
            />
          </Stack>

          <Stack gap="0.25rem">
            <Text size="sm" fw={500}>Contrast: {contrast.toFixed(1)}</Text>
            <Slider
              value={contrast}
              onChange={setContrast}
              min={0.1}
              max={3.0}
              step={0.1}
              marks={sliderMarks}
              mb="1rem"
            />
          </Stack>

          <Stack gap="0.25rem">
            <Text size="sm" fw={500}>Saturation: {saturation.toFixed(1)}</Text>
            <Slider
              value={saturation}
              onChange={setSaturation}
              min={0.1}
              max={3.0}
              step={0.1}
              marks={sliderMarks}
              mb="1rem"
            />
          </Stack>

          <Stack gap="0.25rem">
            <Text size="sm" fw={500}>Sharpness: {sharpness.toFixed(1)}</Text>
            <Slider
              value={sharpness}
              onChange={setSharpness}
              min={0.1}
              max={3.0}
              step={0.1}
              marks={sliderMarks}
              mb="1rem"
            />
          </Stack>

          <Select label="Output format" data={FORMAT_OPTIONS} value={format} onChange={setFormat} />

          <Button onClick={handleSubmit} loading={loading} leftSection={<IconAdjustments size={16} />}>
            Adjust Image
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
              <Text size="sm" c="dimmed">Adjusted</Text>
              <MantineImage
                src={resultUrl}
                alt="Adjusted"
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
            Download Adjusted Image
          </Button>
        </Paper>
      )}
    </Stack>
  );
}
