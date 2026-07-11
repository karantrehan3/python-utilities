import { Center, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconTools } from '@tabler/icons-react';

export function WelcomePage() {
  return (
    <Center h="70vh">
      <Stack align="center" gap="md">
        <ThemeIcon size="4rem" radius="xl" variant="light">
          <IconTools size={32} />
        </ThemeIcon>
        <Text size="xl" fw={600}>
          Python Utilities
        </Text>
        <Text c="dimmed" ta="center" maw="25rem">
          Select a tool from the sidebar to get started. Upload files, process text, and transform
          images — all from your browser.
        </Text>
      </Stack>
    </Center>
  );
}
