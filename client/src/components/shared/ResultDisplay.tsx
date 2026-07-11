import { Code, Paper, ScrollArea, Text } from '@mantine/core';

interface ResultDisplayProps {
  data: unknown;
  label?: string;
}

export function ResultDisplay({ data, label = 'Result' }: ResultDisplayProps) {
  if (data === null || data === undefined) return null;

  const formatted = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  return (
    <Paper withBorder p="md" mt="md">
      <Text size="sm" fw={500} mb="xs">
        {label}
      </Text>
      <ScrollArea.Autosize mah="25rem">
        <Code block>{formatted}</Code>
      </ScrollArea.Autosize>
    </Paper>
  );
}
