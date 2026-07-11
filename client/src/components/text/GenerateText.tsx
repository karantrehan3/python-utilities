import { useState } from 'react';
import {
  Button,
  Stack,
  Group,
  Text,
  Paper,
  Code,
  Select,
  NumberInput,
  SegmentedControl,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { apiPostJson } from '../../api/client';
import { PageHeader } from '../shared/PageHeader';

interface GenerateResponse {
  type: string;
  count: number;
  result: string;
}

const LOREM_TYPE_OPTIONS = [
  { value: 'words', label: 'Words' },
  { value: 'sentences', label: 'Sentences' },
  { value: 'paragraphs', label: 'Paragraphs' },
];

export function GenerateText() {
  const [type, setType] = useState('uuid');
  const [count, setCount] = useState<number>(1);
  const [loremType, setLoremType] = useState('sentences');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const body: Record<string, unknown> = { type, count };
      if (type === 'lorem') {
        body.lorem_type = loremType;
      }
      const response = await apiPostJson<GenerateResponse>('/text/generate', body);
      setResult(response);
      notifications.show({
        title: 'Success',
        message: 'Text generated successfully.',
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
        title="Generate Text"
        description="Generate UUIDs or Lorem Ipsum placeholder text."
      />

      <SegmentedControl
        value={type}
        onChange={setType}
        data={[
          { value: 'uuid', label: 'UUID' },
          { value: 'lorem', label: 'Lorem Ipsum' },
        ]}
      />

      <Group>
        <NumberInput
          label="Count"
          value={count}
          onChange={(value) => setCount(typeof value === 'number' ? value : 1)}
          min={1}
          max={100}
          w="8rem"
        />
        {type === 'lorem' && (
          <Select
            label="Lorem Type"
            data={LOREM_TYPE_OPTIONS}
            value={loremType}
            onChange={(value) => setLoremType(value ?? 'sentences')}
            allowDeselect={false}
            w="12rem"
          />
        )}
      </Group>

      <Group>
        <Button loading={loading} onClick={handleSubmit}>
          Generate
        </Button>
      </Group>

      {result && (
        <Paper withBorder p="1rem">
          <Group justify="space-between" mb="0.5rem">
            <Text size="sm" fw={500}>
              Generated {result.type === 'uuid' ? 'UUIDs' : 'Lorem Ipsum'}
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
          <Code block style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            {result.result}
          </Code>
        </Paper>
      )}
    </Stack>
  );
}
