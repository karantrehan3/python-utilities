import { Group, Text, rem } from '@mantine/core';
import { Dropzone, type DropzoneProps, type FileWithPath } from '@mantine/dropzone';
import { IconUpload, IconX, IconFile } from '@tabler/icons-react';

interface FileDropzoneProps extends Partial<DropzoneProps> {
  onFilesSelected: (files: FileWithPath[]) => void;
  label?: string;
  description?: string;
  accept?: string[];
  maxFiles?: number;
}

export function FileDropzone({
  onFilesSelected,
  label = 'Upload files',
  description = 'Drag files here or click to browse',
  accept,
  maxFiles = 1,
  ...rest
}: FileDropzoneProps) {
  return (
    <Dropzone
      onDrop={onFilesSelected}
      maxSize={50 * 1024 * 1024}
      accept={accept}
      maxFiles={maxFiles}
      multiple={maxFiles > 1}
      {...rest}
    >
      <Group justify="center" gap="xl" mih={rem('8rem')} style={{ pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <IconUpload size={40} stroke={1.5} />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX size={40} stroke={1.5} />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconFile size={40} stroke={1.5} />
        </Dropzone.Idle>

        <div>
          <Text size="lg" inline fw={500}>
            {label}
          </Text>
          <Text size="sm" c="dimmed" inline mt="0.5rem">
            {description}
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}
