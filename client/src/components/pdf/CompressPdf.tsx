import { useState } from 'react';
import { Button, Group, Paper, Progress, Slider, Stack, Switch, Text, ThemeIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconArrowDown } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { PdfFilePreview } from '../shared/PdfFilePreview';
import { apiPost } from '../../api/client';
import { PdfResultPreview } from '../shared/PdfResultPreview';
import { formatBytes } from '../../lib/format';
import { filenameFromResponse, withSuffix } from '../../lib/download';

interface CompressionStats {
  originalSize: string;
  compressedSize: string;
  reduction: string;
  reductionPercent: number;
}

export function CompressPdf() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [imageQuality, setImageQuality] = useState(80);
  const [garbageCollect, setGarbageCollect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CompressionStats | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFilename, setResultFilename] = useState('compressed.pdf');

  const handleFilesSelected = (files: FileWithPath[]) => {
    setFile(files[0] ?? null);
    setStats(null);
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

    const formData = new FormData();
    formData.append('file', file);
    formData.append('image_quality', String(imageQuality));
    formData.append('garbage_collect', String(garbageCollect));

    setLoading(true);
    try {
      const response = await apiPost('/pdf/compress', formData);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `Request failed with status ${response.status}`);
      }

      const originalSize = response.headers.get('X-Original-Size');
      const compressedSize = response.headers.get('X-Compressed-Size');

      const blob = await response.blob();
      setResultBlob(blob);
      setResultFilename(filenameFromResponse(response, withSuffix(file.name, 'compressed')));

      if (originalSize && compressedSize) {
        const origBytes = parseInt(originalSize, 10);
        const compBytes = parseInt(compressedSize, 10);
        const reduction = origBytes > 0 ? ((1 - compBytes / origBytes) * 100).toFixed(1) : '0';
        setStats({
          originalSize: formatBytes(origBytes),
          compressedSize: formatBytes(compBytes),
          reduction: `${reduction}%`,
          reductionPercent: parseFloat(reduction),
        });
      }

      notifications.show({
        title: 'Success',
        message: 'PDF compressed successfully.',
        color: 'green',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to compress PDF.';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader
        title="Compress PDF"
        description="Reduce the file size of a PDF by compressing images and removing unused objects."
      />

      <FileDropzone
        onFilesSelected={handleFilesSelected}
        label="Upload PDF"
        description={file ? file.name : 'Drag a PDF here or click to browse'}
        accept={['application/pdf']}
        maxFiles={1}
      />

      {file && <PdfFilePreview file={file} />}

      <Stack gap="0.25rem">
        <Text size="sm" fw={500}>
          Image quality: {imageQuality}
        </Text>
        <Slider
          value={imageQuality}
          onChange={setImageQuality}
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

      <Switch
        label="Garbage collect"
        description="Remove unused objects and clean up the PDF structure"
        checked={garbageCollect}
        onChange={(e) => setGarbageCollect(e.currentTarget.checked)}
      />

      <Button onClick={handleSubmit} loading={loading} disabled={!file} mt="0.5rem">
        Compress PDF
      </Button>

      {resultBlob && <PdfResultPreview blob={resultBlob} filename={resultFilename} />}

      {stats && (
        <Paper withBorder p="1rem" mt="0.5rem">
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
    </Stack>
  );
}
