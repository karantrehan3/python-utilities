import { Anchor, Group, Text } from '@mantine/core';
import { Link } from 'react-router-dom';

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Text size="xs" c="dimmed" truncate>
        © {year} Kiln
        <Text component="span" visibleFrom="sm">
          {' '}· most tools run entirely in your browser
        </Text>
      </Text>
      <Group gap="1rem" wrap="nowrap">
        <Anchor component={Link} to="/privacy" size="xs" c="dimmed">
          Privacy
        </Anchor>
        <Anchor component={Link} to="/terms" size="xs" c="dimmed">
          Terms
        </Anchor>
      </Group>
    </Group>
  );
}
