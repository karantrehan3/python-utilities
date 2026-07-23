import { Alert, List, Stack, Text, Title } from '@mantine/core';
import { IconShieldCheck } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';

export function PrivacyPolicy() {
  return (
    <Stack gap="1.25rem" maw="48rem">
      <PageHeader title="Privacy Policy" description="Last updated: July 2026" />

      <Alert
        variant="light"
        color="teal"
        icon={<IconShieldCheck size={20} />}
        title="Kiln does not collect, store, or sell your data. Full stop."
      >
        There are no accounts, no tracking pixels, no advertising cookies, and no analytics
        profiles. You can use every tool completely anonymously.
      </Alert>

      <div>
        <Title order={3} mb="0.5rem">
          Most tools never touch a server
        </Title>
        <Text size="sm" c="dimmed">
          The majority of Kiln runs entirely inside your browser using native Web APIs — all text
          tools, PDF merge/split/rotate/watermark/page-numbers/extract/info/to-images, images-to-PDF,
          and image resize/crop/rotate/adjust/convert/compress for PNG, JPEG, and WEBP. For these,
          your files are processed on your own device and are <b>never uploaded anywhere</b>.
        </Text>
      </div>

      <div>
        <Title order={3} mb="0.5rem">
          The few server-side operations are ephemeral
        </Title>
        <Text size="sm" c="dimmed" mb="0.5rem">
          A small number of operations that browsers can't perform are sent to our server:
        </Text>
        <List size="sm" c="dimmed" spacing="0.25rem">
          <List.Item>PDF compress, protect (encrypt), and unlock (decrypt)</List.Item>
          <List.Item>Image output to BMP, GIF, or TIFF, and TIFF input</List.Item>
        </List>
        <Text size="sm" c="dimmed" mt="0.5rem">
          For these, your file is processed in memory only to produce your result. It is{' '}
          <b>never written to disk, never logged, and never retained</b> — it is discarded the
          moment the response is returned to you.
        </Text>
      </div>

      <div>
        <Title order={3} mb="0.5rem">
          What is stored on your device
        </Title>
        <Text size="sm" c="dimmed">
          Your theme preference (light or dark) is saved in your browser's local storage so the app
          remembers it. This stays on your device and is never transmitted to us.
        </Text>
      </div>

      <div>
        <Title order={3} mb="0.5rem">
          Changes
        </Title>
        <Text size="sm" c="dimmed">
          If this policy ever changes, the updated date above will reflect it. Kiln is open source,
          so the exact behavior is always verifiable in the code.
        </Text>
      </div>
    </Stack>
  );
}
