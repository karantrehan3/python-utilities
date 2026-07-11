import { Title, Text, Stack } from '@mantine/core';

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <Stack gap="0.25rem" mb="lg">
      <Title order={2}>{title}</Title>
      <Text c="dimmed" size="sm">
        {description}
      </Text>
    </Stack>
  );
}
