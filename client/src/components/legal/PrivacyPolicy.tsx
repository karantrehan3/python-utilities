import type { ReactNode } from 'react';
import { Alert, Anchor, List, Stack, Text, Title } from '@mantine/core';
import { IconShieldCheck } from '@tabler/icons-react';
import { PageHeader } from '../shared/PageHeader';
import { ComplianceBadges } from './ComplianceBadges';

const REPO_ISSUES_URL = 'https://github.com/karantrehan3/kiln/issues';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <Title order={3} mb="0.5rem">
        {title}
      </Title>
      {children}
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <Stack gap="1.25rem" maw="52rem">
      <PageHeader title="Privacy Policy" description="Last updated: July 2026" />

      <ComplianceBadges />

      <Alert
        variant="light"
        color="teal"
        icon={<IconShieldCheck size={20} />}
        title="Kiln does not collect, store, or sell your personal data. Full stop."
      >
        There are no user accounts, no tracking pixels, no advertising cookies, and no analytics
        profiles. You can use every tool completely anonymously. This policy explains, in plain
        language, exactly how the service handles data.
      </Alert>

      <Section title="1. Who is responsible for this service">
        <Text size="sm" c="dimmed">
          Kiln is a free, open-source project maintained by its contributors ("we", "us"). Because
          Kiln does not collect personal data, it does not act as a "data controller" over any
          personal information in the ordinary course of use. For any privacy question or request,
          contact us via{' '}
          <Anchor href={REPO_ISSUES_URL} target="_blank" rel="noopener noreferrer">
            GitHub issues
          </Anchor>
          .
        </Text>
      </Section>

      <Section title="2. Information we collect">
        <Text size="sm" c="dimmed" mb="0.5rem">
          None that identifies you. Specifically, we do <b>not</b> collect:
        </Text>
        <List size="sm" c="dimmed" spacing="0.25rem">
          <List.Item>Names, email addresses, or account credentials (there are no accounts)</List.Item>
          <List.Item>Analytics, behavioural, or device-fingerprinting data</List.Item>
          <List.Item>Advertising identifiers or marketing data</List.Item>
          <List.Item>The contents of the files or text you process (see section 3)</List.Item>
        </List>
      </Section>

      <Section title="3. How your files and text are processed">
        <Text size="sm" c="dimmed" mb="0.5rem">
          Most of Kiln runs entirely inside your browser using native Web APIs — all text tools; PDF
          merge, split, rotate, watermark, page numbers, extract, info, and to-images; images-to-PDF;
          and image resize, crop, rotate, adjust, convert, and compress for PNG, JPEG, and WEBP. For
          these, your data <b>never leaves your device</b> and is never transmitted to any server.
        </Text>
        <Text size="sm" c="dimmed" mb="0.5rem">
          A small number of operations that browsers cannot perform are processed on our server:
        </Text>
        <List size="sm" c="dimmed" spacing="0.25rem">
          <List.Item>PDF compress, protect (encrypt), and unlock (decrypt)</List.Item>
          <List.Item>Image output to BMP, GIF, or TIFF, and TIFF input</List.Item>
        </List>
        <Text size="sm" c="dimmed" mt="0.5rem">
          For these, your file is held in memory only for the moment needed to produce your result.
          It is <b>never written to disk, never logged, and never retained</b> — it is discarded as
          soon as the response is returned to you. We do not build profiles, and we cannot associate
          a processed file with any individual.
        </Text>
      </Section>

      <Section title="4. Cookies and local storage">
        <Text size="sm" c="dimmed">
          Kiln sets <b>no cookies</b>. The only thing stored on your device is your theme preference
          (light or dark) in your browser's <code>localStorage</code>, so the app remembers your
          choice. This stays on your device and is never sent to us. Clearing your browser storage
          removes it.
        </Text>
      </Section>

      <Section title="5. Third-party services and hosting">
        <Text size="sm" c="dimmed">
          The site is served by a standard web host. As with any website, our hosting infrastructure
          may transiently process connection metadata (such as your IP address) at the network level
          purely to deliver responses and protect against abuse. We do not use this to identify you,
          combine it with other data, or retain it for analytics. Kiln embeds no third-party
          trackers, advertising SDKs, or social widgets.
        </Text>
      </Section>

      <Section title="6. Data retention">
        <Text size="sm" c="dimmed">
          We retain no personal data. Files sent to the server for the operations in section 3 are
          processed in memory and discarded immediately; there is no database, no file store, and no
          backup of user content.
        </Text>
      </Section>

      <Section title="7. International transfers">
        <Text size="sm" c="dimmed">
          Because no personal data is collected or stored, there is no personal-data transfer across
          borders. Server-side operations process your file transiently at our hosting location and
          return the result without storing it.
        </Text>
      </Section>

      <Section title="8. Your rights (GDPR & CCPA/CPRA)">
        <Text size="sm" c="dimmed" mb="0.5rem">
          Data-protection laws such as the EU/UK GDPR and the California CCPA/CPRA give you rights
          over your personal data — including the rights to access, correct, delete, restrict,
          port, and object to processing, and the rights to know about and opt out of the "sale" or
          "sharing" of personal information.
        </Text>
        <Text size="sm" c="dimmed">
          Kiln holds no personal data about you, so in practice there is nothing for us to disclose,
          delete, or export, and we never sell or share personal information. You are, of course,
          welcome to contact us via{' '}
          <Anchor href={REPO_ISSUES_URL} target="_blank" rel="noopener noreferrer">
            GitHub issues
          </Anchor>{' '}
          with any request or question, and we will not discriminate against you for exercising any
          right.
        </Text>
      </Section>

      <Section title="9. Children's privacy">
        <Text size="sm" c="dimmed">
          Kiln is a general-purpose utility not directed at children, and we do not knowingly collect
          personal information from anyone, including children under 16.
        </Text>
      </Section>

      <Section title="10. Regulatory compliance">
        <Text size="sm" c="dimmed">
          Kiln is designed to be aligned with the GDPR, UK GDPR, and CCPA/CPRA on a
          "compliant-by-design" basis: the strongest way to comply with data-protection law is not
          to collect personal data in the first place. Note that GDPR and CCPA have no official
          government "certification"; these badges reflect our own good-faith self-assessment of our
          practices, not a third-party audit.
        </Text>
      </Section>

      <Section title="11. Changes to this policy">
        <Text size="sm" c="dimmed">
          If this policy changes, the "last updated" date above will change with it. Because Kiln is
          open source, the actual behaviour described here is always independently verifiable in the
          source code.
        </Text>
      </Section>

      <Text size="xs" c="dimmed" fs="italic">
        This policy is provided in good faith and describes our current practices. It is not legal
        advice.
      </Text>
    </Stack>
  );
}
