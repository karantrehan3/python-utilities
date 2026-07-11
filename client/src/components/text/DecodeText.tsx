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

interface DecodeResponse {
  original: string;
  encoding: string;
  result: string;
}

const ENCODING_OPTIONS = [
  { value: 'base64', label: 'Base64' },
  { value: 'url', label: 'URL' },
  { value: 'html', label: 'HTML' },
];

export function DecodeText() {
  const [text, setText] = useState('');
  const [encoding, setEncoding] = useState('base64');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecodeResponse | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) {
      notifications.show({
        title: 'Validation',
        message: 'Please enter some text to decode.',
        color: 'yellow',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiPostJson<DecodeResponse>('/text/decode', { text, encoding });
      setResult(response);
      notifications.show({
        title: 'Success',
        message: 'Text decoded successfully.',
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
        title="Decode Text"
        description="Decode encoded text from Base64, URL, or HTML encoding."
      />

      <Textarea
        label="Encoded Text"
        placeholder="Enter encoded text to decode..."
        minRows={4}
        autosize
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
      />

      <Select
        label="Encoding"
        data={ENCODING_OPTIONS}
        value={encoding}
        onChange={(value) => setEncoding(value ?? 'base64')}
        allowDeselect={false}
        w="15rem"
      />

      <Group>
        <Button loading={loading} onClick={handleSubmit}>
          Decode Text
        </Button>
      </Group>

      {result && (
        <Paper withBorder p="1rem">
          <Group justify="space-between" mb="0.5rem">
            <Text size="sm" fw={500}>
              Decoded Result ({result.encoding.toUpperCase()})
            </Text>
            <CopyButton value={result.result}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy result'}>
                  <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                    {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <Text size="sm" style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {result.result}
          </Text>
        </Paper>
      )}
    </Stack>
  );
}
