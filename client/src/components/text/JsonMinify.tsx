import { useState } from 'react';
import {
  Button,
  Textarea,
  Stack,
  Group,
  Text,
  Paper,
  Code,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { minifyJson } from '../../lib/text/json';

interface JsonMinifyResponse {
  minified: string;
  valid: boolean;
  error: string | null;
}

export function JsonMinify() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JsonMinifyResponse | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) {
      notifications.show({
        title: 'Validation',
        message: 'Please enter JSON to minify.',
        color: 'yellow',
      });
      return;
    }

    setLoading(true);
    try {
      const { valid, result: minified, error } = minifyJson(text);
      const response: JsonMinifyResponse = { minified, valid, error };
      setResult(response);
      if (response.valid) {
        notifications.show({
          title: 'Success',
          message: 'JSON minified successfully.',
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
        title="JSON Minify"
        description="Minify JSON by removing all unnecessary whitespace."
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
        <Button loading={loading} onClick={handleSubmit}>
          Minify JSON
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
              Minified JSON
            </Text>
            <CopyButton value={result.minified}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy minified JSON'}>
                  <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                    {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <Code block style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {result.minified}
          </Code>
        </Paper>
      )}
    </Stack>
  );
}
