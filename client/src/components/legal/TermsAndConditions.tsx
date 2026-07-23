import { List, Stack, Text, Title } from '@mantine/core';
import { PageHeader } from '../shared/PageHeader';

export function TermsAndConditions() {
  return (
    <Stack gap="1.25rem" maw="48rem">
      <PageHeader title="Terms & Conditions" description="Last updated: July 2026" />

      <Text size="sm" c="dimmed">
        By using Kiln you agree to these terms. They're intentionally short.
      </Text>

      <div>
        <Title order={3} mb="0.5rem">
          Free and as-is
        </Title>
        <Text size="sm" c="dimmed">
          Kiln is provided free of charge, "as is", without warranties of any kind. We don't
          guarantee that it will always be available, error-free, or fit for a particular purpose.
        </Text>
      </div>

      <div>
        <Title order={3} mb="0.5rem">
          Your responsibility
        </Title>
        <List size="sm" c="dimmed" spacing="0.25rem">
          <List.Item>Use Kiln only for lawful purposes.</List.Item>
          <List.Item>
            You are responsible for the files you process and confirm you have the right to
            process them.
          </List.Item>
          <List.Item>Keep your own backups — always work on copies of important files.</List.Item>
        </List>
      </div>

      <div>
        <Title order={3} mb="0.5rem">
          Limitation of liability
        </Title>
        <Text size="sm" c="dimmed">
          To the maximum extent permitted by law, Kiln and its maintainers are not liable for any
          loss or damage — including data loss — arising from your use of the tools.
        </Text>
      </div>

      <div>
        <Title order={3} mb="0.5rem">
          Data handling
        </Title>
        <Text size="sm" c="dimmed">
          Most operations run entirely in your browser. The few server-side operations process
          your file in memory only and never store it. See the{' '}
          <b>Privacy Policy</b> for details.
        </Text>
      </div>

      <div>
        <Title order={3} mb="0.5rem">
          Changes
        </Title>
        <Text size="sm" c="dimmed">
          We may update these terms; continued use after an update means you accept the revised
          terms.
        </Text>
      </div>
    </Stack>
  );
}
