import { Group, Text, rem } from '@mantine/core';
import { Dropzone, type DropzoneProps, type FileWithPath, type FileRejection } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { IconUpload, IconX, IconFile } from '@tabler/icons-react';
import { formatBytes } from '../../lib/format';

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024;

interface FileDropzoneProps extends Partial<DropzoneProps> {
  onFilesSelected: (files: FileWithPath[]) => void;
  label?: string;
  description?: string;
  accept?: string[];
  maxFiles?: number;
  maxSize?: number;
}

function describeRejection(rejection: FileRejection, maxSize: number): string {
  const code = rejection.errors[0]?.code;
  if (code === 'file-too-large') {
    return `${rejection.file.name} is larger than ${formatBytes(maxSize)}`;
  }
  if (code === 'file-invalid-type') {
    return `${rejection.file.name} is not a supported file type`;
  }
  return rejection.errors[0]?.message ?? `${rejection.file.name} was rejected`;
}

export function FileDropzone({
  onFilesSelected,
  label = 'Upload files',
  description = 'Drag files here or click to browse',
  accept,
  maxFiles = 1,
  maxSize = DEFAULT_MAX_SIZE,
  onReject,
  ...rest
}: FileDropzoneProps) {
  const handleReject = (rejections: FileRejection[]) => {
    if (rejections.length > 0) {
      notifications.show({
        title: rejections.length === 1 ? 'File rejected' : `${rejections.length} files rejected`,
        message: rejections.map((r) => describeRejection(r, maxSize)).join('\n'),
        color: 'red',
      });
    }
    onReject?.(rejections);
  };

  return (
    <Dropzone
      onDrop={onFilesSelected}
      onReject={handleReject}
      maxSize={maxSize}
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
