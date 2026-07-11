import { useState } from 'react';
import {
  Button,
  Textarea,
  Select,
  Stack,
  Group,
  Text,
  Paper,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { apiPostJson } from '../../api/client';
import { PageHeader } from '../shared/PageHeader';

interface HashResponse {
  text: string;
  algorithm: string;
  hash: string;
}

const ALGORITHM_OPTIONS = [
  { value: 'md5', label: 'MD5' },
  { value: 'sha1', label: 'SHA-1' },
  { value: 'sha224', label: 'SHA-224' },
  { value: 'sha256', label: 'SHA-256' },
  { value: 'sha384', label: 'SHA-384' },
  { value: 'sha512', label: 'SHA-512' },
];

export function HashText() {
  const [text, setText] = useState('');
  const [algorithm, setAlgorithm] = useState('sha256');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HashResponse | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) {
      notifications.show({
        title: 'Validation',
        message: 'Please enter some text to hash.',
        color: 'yellow',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiPostJson<HashResponse>('/text/hash', { text, algorithm });
      setResult(response);
      notifications.show({
        title: 'Success',
        message: 'Text hashed successfully.',
        color: 'green',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader
        title="Hash Text"
        description="Generate a cryptographic hash of your text using various algorithms."
      />

      <Textarea
        label="Text"
        placeholder="Enter text to hash..."
        minRows={4}
        autosize
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
      />

      <Select
        label="Algorithm"
        data={ALGORITHM_OPTIONS}
        value={algorithm}
        onChange={(value) => setAlgorithm(value ?? 'sha256')}
        allowDeselect={false}
        w="15rem"
      />

      <Group>
        <Button loading={loading} onClick={handleSubmit}>
          Hash Text
        </Button>
      </Group>

      {result && (
        <Paper withBorder p="1rem">
          <Group justify="space-between" mb="0.5rem">
            <Text size="sm" fw={500}>
              {result.algorithm.toUpperCase()} Hash
            </Text>
            <CopyButton value={result.hash}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy hash'}>
                  <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                    {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <Text size="sm" style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {result.hash}
          </Text>
        </Paper>
      )}
    </Stack>
  );
}
