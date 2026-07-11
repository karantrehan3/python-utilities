import { useState } from 'react';
import {
  Button,
  Textarea,
  TextInput,
  Stack,
  Group,
  Text,
  Paper,
  Badge,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { apiPostJson } from '../../api/client';
import { PageHeader } from '../shared/PageHeader';

interface MatchItem {
  match: string;
  start: number;
  end: number;
  groups: Record<string, string>;
}

interface RegexResponse {
  pattern: string;
  text: string;
  matches: MatchItem[];
  count: number;
}

export function RegexTester() {
  const [text, setText] = useState('');
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RegexResponse | null>(null);

  const handleSubmit = async () => {
    if (!text.trim() || !pattern.trim()) {
      notifications.show({
        title: 'Validation',
        message: 'Please enter both a pattern and text to test.',
        color: 'yellow',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiPostJson<RegexResponse>('/text/regex', { text, pattern, flags });
      setResult(response);
      notifications.show({
        title: 'Success',
        message: `Found ${response.count} match${response.count !== 1 ? 'es' : ''}.`,
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
        title="Regex Tester"
        description="Test regular expressions against your text and see all matches."
      />

      <Group grow>
        <TextInput
          label="Pattern"
          placeholder="Enter regex pattern..."
          value={pattern}
          onChange={(e) => setPattern(e.currentTarget.value)}
        />
        <TextInput
          label="Flags"
          placeholder="gi"
          value={flags}
          onChange={(e) => setFlags(e.currentTarget.value)}
          w="8rem"
          style={{ flex: 'none' }}
        />
      </Group>

      <Textarea
        label="Text"
        placeholder="Enter text to test against..."
        minRows={4}
        autosize
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
      />

      <Group>
        <Button loading={loading} onClick={handleSubmit}>
          Test Regex
        </Button>
      </Group>

      {result && (
        <Paper withBorder p="1rem">
          <Group mb="0.5rem">
            <Text size="sm" fw={500}>
              Matches
            </Text>
            <Badge color="blue" variant="light">
              {result.count} match{result.count !== 1 ? 'es' : ''}
            </Badge>
          </Group>
          {result.matches.length === 0 ? (
            <Text size="sm" c="dimmed">
              No matches found.
            </Text>
          ) : (
            <Stack gap="0.5rem">
              {result.matches.map((m, index) => (
                <Paper key={index} withBorder p="0.5rem">
                  <Group justify="space-between">
                    <Group gap="0.5rem">
                      <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                        {m.match}
                      </Text>
                      <Text size="xs" c="dimmed">
                        [{m.start}:{m.end}]
                      </Text>
                    </Group>
                    <CopyButton value={m.match}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied' : 'Copy match'}>
                          <ActionIcon
                            variant="subtle"
                            color={copied ? 'teal' : 'gray'}
                            size="sm"
                            onClick={copy}
                          >
                            {copied ? <IconCheck size="0.875rem" /> : <IconCopy size="0.875rem" />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                  {Object.keys(m.groups).length > 0 && (
                    <Text size="xs" c="dimmed" mt="0.25rem">
                      Groups: {JSON.stringify(m.groups)}
                    </Text>
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      )}
    </Stack>
  );
}
