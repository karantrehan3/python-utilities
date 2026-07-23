import { Group, Paper, Progress, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconArrowDown, IconAlertTriangle } from '@tabler/icons-react';
import { formatBytes } from '../../lib/format';

interface CompressionResultProps {
  originalBytes: number;
  compressedBytes: number;
}

/**
 * Shows compression results honestly. When the re-encoded output is not smaller
 * (common for already-optimized files), it reports an increase rather than a
 * misleading "saved" figure.
 */
export function CompressionResult({ originalBytes, compressedBytes }: CompressionResultProps) {
  const reductionPercent = originalBytes > 0 ? (1 - compressedBytes / originalBytes) * 100 : 0;
  const grew = compressedBytes > originalBytes;
  const savedPct = Math.max(0, Math.min(100, reductionPercent));

  return (
    <Paper withBorder p="1rem">
      <Text size="sm" fw={500} mb="0.75rem">
        Compression Results
      </Text>
      <Group gap="2rem" mb="1rem">
        <Stack gap="0.125rem">
          <Text size="xs" c="dimmed">
            Original
          </Text>
          <Text size="sm" fw={500}>
            {formatBytes(originalBytes)}
          </Text>
        </Stack>
        <ThemeIcon variant="light" color={grew ? 'yellow' : 'green'} size="sm">
          {grew ? <IconAlertTriangle size={14} /> : <IconArrowDown size={14} />}
        </ThemeIcon>
        <Stack gap="0.125rem">
          <Text size="xs" c="dimmed">
            Result
          </Text>
          <Text size="sm" fw={500}>
            {formatBytes(compressedBytes)}
          </Text>
        </Stack>
        <Stack gap="0.125rem">
          <Text size="xs" c="dimmed">
            {grew ? 'Increased' : 'Saved'}
          </Text>
          <Text size="sm" fw={700} c={grew ? 'yellow' : 'green'}>
            {grew ? '+' : ''}
            {Math.abs(reductionPercent).toFixed(1)}%
          </Text>
        </Stack>
      </Group>

      {grew ? (
        <Text size="xs" c="dimmed">
          This file is already well-optimized — re-encoding it at this quality made it slightly
          larger. Keep your original, or try a lower quality.
        </Text>
      ) : (
        <Progress.Root size="xl">
          <Progress.Section value={100 - savedPct} color="blue">
            <Progress.Label>Result</Progress.Label>
          </Progress.Section>
          <Progress.Section value={savedPct} color="green">
            <Progress.Label>Saved</Progress.Label>
          </Progress.Section>
        </Progress.Root>
      )}
    </Paper>
  );
}
