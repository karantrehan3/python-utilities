import { useState } from 'react';
import {
  Button,
  Textarea,
  Stack,
  Group,
  Text,
  Paper,
  Code,
  Badge,
  SimpleGrid,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { diffText, type DiffResult } from '../../lib/text/diff';

type DiffResponse = DiffResult;

export function DiffText() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiffResponse | null>(null);

  const handleSubmit = async () => {
    if (!text1.trim() || !text2.trim()) {
      notifications.show({
        title: 'Validation',
        message: 'Please enter text in both fields.',
        color: 'yellow',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await diffText(text1, text2);
      setResult(response);
      notifications.show({
        title: 'Success',
        message: 'Diff computed successfully.',
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
        title="Diff Text"
        description="Compare two texts and see the differences between them."
      />

      <SimpleGrid cols={2}>
        <Textarea
          label="Text 1"
          placeholder="Enter first text..."
          minRows={6}
          autosize
          value={text1}
          onChange={(e) => setText1(e.currentTarget.value)}
        />
        <Textarea
          label="Text 2"
          placeholder="Enter second text..."
          minRows={6}
          autosize
          value={text2}
          onChange={(e) => setText2(e.currentTarget.value)}
        />
      </SimpleGrid>

      <Group>
        <Button loading={loading} onClick={handleSubmit}>
          Compare
        </Button>
      </Group>

      {result && (
        <Paper withBorder p="1rem">
          <Group justify="space-between" mb="0.5rem">
            <Group gap="0.5rem">
              <Text size="sm" fw={500}>
                Diff Result
              </Text>
              <Badge color="green" variant="light">
                +{result.additions} additions
              </Badge>
              <Badge color="red" variant="light">
                -{result.deletions} deletions
              </Badge>
            </Group>
            <CopyButton value={result.diff}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy diff'}>
                  <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                    {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <Code block style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {result.diff}
          </Code>
        </Paper>
      )}
    </Stack>
  );
}
