import { useState } from 'react';
import {
  Button,
  Textarea,
  TextInput,
  Stack,
  Group,
  Text,
  Paper,
  Code,
  Badge,
  SegmentedControl,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { convertCsvJson, type CsvDirection } from '../../lib/text/csv';

interface CsvJsonResponse {
  result: string;
  rows: number;
}

export function CsvJson() {
  const [text, setText] = useState('');
  const [direction, setDirection] = useState('csv_to_json');
  const [delimiter, setDelimiter] = useState(',');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CsvJsonResponse | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) {
      notifications.show({
        title: 'Validation',
        message: 'Please enter input to convert.',
        color: 'yellow',
      });
      return;
    }

    setLoading(true);
    try {
      const response = convertCsvJson(text, direction as CsvDirection, delimiter);
      setResult(response);
      notifications.show({
        title: 'Success',
        message: 'Conversion completed successfully.',
        color: 'green',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Conversion failed. Check that the input is valid.';
      notifications.show({ title: 'Error', message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="1rem">
      <PageHeader
        title="CSV / JSON Converter"
        description="Convert between CSV and JSON formats."
      />

      <SegmentedControl
        value={direction}
        onChange={setDirection}
        data={[
          { value: 'csv_to_json', label: 'CSV to JSON' },
          { value: 'json_to_csv', label: 'JSON to CSV' },
        ]}
      />

      <Textarea
        label={direction === 'csv_to_json' ? 'CSV Input' : 'JSON Input'}
        placeholder={
          direction === 'csv_to_json'
            ? 'name,age\nAlice,30\nBob,25'
            : '[{"name": "Alice", "age": 30}]'
        }
        minRows={6}
        autosize
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
      />

      <TextInput
        label="Delimiter"
        value={delimiter}
        onChange={(e) => setDelimiter(e.currentTarget.value)}
        w="8rem"
      />

      <Group>
        <Button loading={loading} onClick={handleSubmit}>
          Convert
        </Button>
      </Group>

      {result && (
        <Paper withBorder p="1rem">
          <Group justify="space-between" mb="0.5rem">
            <Group gap="0.5rem">
              <Text size="sm" fw={500}>
                Result
              </Text>
              <Badge color="blue" variant="light">
                {result.rows} row{result.rows !== 1 ? 's' : ''}
              </Badge>
            </Group>
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
