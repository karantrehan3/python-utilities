import { useState } from 'react';
import { Button, NumberInput, Select, Slider, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { FileWithPath } from '@mantine/dropzone';
import { IconDroplet } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { FileDropzone } from '../shared/FileDropzone';
import { PdfFilePreview } from '../shared/PdfFilePreview';
import { downloadFile } from '../../api/client';

export function WatermarkPdf() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState<number>(48);
  const [opacity, setOpacity] = useState(0.3);
  const [position, setPosition] = useState<string>('center');
  const [loading, setLoading] = useState(false);

  const handleFilesSelected = (files: FileWithPath[]) => {
    setFile(files[0] ?? null);
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
    if (!text.trim()) {
      notifications.show({
        title: 'Missing watermark text',
        message: 'Please enter watermark text.',
        color: 'red',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('text', text.trim());
    formData.append('font_size', String(fontSize));
    formData.append('opacity', String(opacity));
    formData.append('position', position);

    setLoading(true);
    try {
      const outputName = file.name.replace(/\.pdf$/i, '_watermarked.pdf');
      await downloadFile('/pdf/watermark', formData, outputName);
      notifications.show({ title: 'Success', message: 'Watermarked PDF downloaded.', color: 'green' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to watermark PDF.';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader title="Watermark PDF" description="Add a text watermark to every page of a PDF file." />

      <FileDropzone
        onFilesSelected={handleFilesSelected}
        label="Upload PDF"
        description={file ? file.name : 'Drag a PDF here or click to browse'}
        accept={['application/pdf']}
        maxFiles={1}
      />

      {file && <PdfFilePreview name={file.name} size={file.size} />}

      <TextInput
        label="Watermark text"
        placeholder="CONFIDENTIAL"
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        leftSection={<IconDroplet size={16} />}
      />

      <NumberInput
        label="Font size"
        value={fontSize}
        onChange={(value) => setFontSize(typeof value === 'number' ? value : 48)}
        min={8}
        max={200}
      />

      <Stack gap="0.25rem">
        <Text size="sm" fw={500}>
          Opacity: {opacity}
        </Text>
        <Slider
          value={opacity}
          onChange={setOpacity}
          min={0}
          max={1}
          step={0.05}
          marks={[
            { value: 0, label: '0' },
            { value: 0.25, label: '0.25' },
            { value: 0.5, label: '0.5' },
            { value: 0.75, label: '0.75' },
            { value: 1, label: '1' },
          ]}
          mb="1rem"
        />
      </Stack>

      <Select
        label="Position"
        data={[
          { value: 'center', label: 'Center' },
          { value: 'diagonal', label: 'Diagonal' },
        ]}
        value={position}
        onChange={(value) => setPosition(value ?? 'center')}
      />

      <Button onClick={handleSubmit} loading={loading} disabled={!file || !text.trim()} mt="0.5rem">
        Add Watermark
      </Button>
    </Stack>
  );
}
