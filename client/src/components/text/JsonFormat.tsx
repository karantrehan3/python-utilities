import { useState } from 'react';
import {
  Button,
  Textarea,
  Stack,
  Group,
  Text,
  Paper,
  Code,
  Switch,
  NumberInput,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { apiPostJson } from '../../api/client';
import { PageHeader } from '../shared/PageHeader';

interface JsonFormatResponse {
  original: string;
  formatted: string;
  valid: boolean;
  error: string | null;
}

export function JsonFormat() {
  const [text, setText] = useState('');
  const [indent, setIndent] = useState<number>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JsonFormatResponse | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) {
      notifications.show({
        title: 'Validation',
        message: 'Please enter JSON to format.',
        color: 'yellow',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiPostJson<JsonFormatResponse>('/text/json/format', {
        text,
        indent,
        sort_keys: sortKeys,
      });
      setResult(response);
      if (response.valid) {
        notifications.show({
          title: 'Success',
          message: 'JSON formatted successfully.',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Invalid JSON',
          message: response.error ?? 'The input is not valid JSON.',
          color: 'red',
        });
      }
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
        title="JSON Format"
        description="Format and pretty-print JSON with configurable indentation."
      />

      <Textarea
        label="JSON Input"
        placeholder='{"key": "value"}'
        minRows={6}
        autosize
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
      />

      <Group>
        <NumberInput
          label="Indent"
          value={indent}
          onChange={(value) => setIndent(typeof value === 'number' ? value : 2)}
          min={1}
          max={8}
          w="8rem"
        />
        <Switch
          label="Sort keys"
          checked={sortKeys}
          onChange={(e) => setSortKeys(e.currentTarget.checked)}
          mt="1.5rem"
        />
      </Group>

      <Group>
        <Button loading={loading} onClick={handleSubmit}>
          Format JSON
        </Button>
      </Group>

      {result && !result.valid && result.error && (
        <Paper withBorder p="1rem" style={{ borderColor: 'var(--mantine-color-red-6)' }}>
          <Text size="sm" c="red" fw={500}>
            {result.error}
          </Text>
        </Paper>
      )}

      {result && result.valid && (
        <Paper withBorder p="1rem">
          <Group justify="space-between" mb="0.5rem">
            <Text size="sm" fw={500}>
              Formatted JSON
            </Text>
            <CopyButton value={result.formatted}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy formatted JSON'}>
                  <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                    {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <Code block style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {result.formatted}
          </Code>
        </Paper>
      )}
    </Stack>
  );
}
