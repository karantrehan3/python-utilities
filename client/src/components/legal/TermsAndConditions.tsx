import type { ReactNode } from 'react';
import { Anchor, List, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { PageHeader } from '../shared/PageHeader';
import { ComplianceBadges } from './ComplianceBadges';

const REPO_URL = 'https://github.com/karantrehan3/kiln';
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

export function TermsAndConditions() {
  return (
    <Stack gap="1.25rem" maw="52rem">
      <PageHeader title="Terms & Conditions" description="Last updated: July 2026" />

      <ComplianceBadges />

      <Text size="sm" c="dimmed">
        These Terms govern your use of Kiln (the "Service"). By accessing or using the Service you
        agree to these Terms. If you do not agree, please do not use the Service.
      </Text>

      <Section title="1. The service">
        <Text size="sm" c="dimmed">
          Kiln is a free collection of browser-based utilities for working with PDFs, images, and
          text. Most operations run entirely in your browser; a few are processed on our server, as
          described in the{' '}
          <Anchor component={Link} to="/privacy">
            Privacy Policy
          </Anchor>
          . The Service is provided at no charge.
        </Text>
      </Section>

      <Section title="2. Eligibility">
        <Text size="sm" c="dimmed">
          You may use the Service only if you can form a legally binding contract under applicable
          law. If you are a minor in your jurisdiction, you may use the Service only with the
          involvement and consent of a parent or legal guardian.
        </Text>
      </Section>

      <Section title="3. Acceptable use">
        <List size="sm" c="dimmed" spacing="0.25rem">
          <List.Item>Use the Service only for lawful purposes.</List.Item>
          <List.Item>
            You confirm that you own, or have the necessary rights and permissions to process, any
            file or content you use with the Service.
          </List.Item>
          <List.Item>
            Do not use the Service to process unlawful, infringing, or malicious content.
          </List.Item>
          <List.Item>
            Do not attempt to disrupt, overload, reverse engineer for abuse, or circumvent the
            security of the Service.
          </List.Item>
        </List>
      </Section>

      <Section title="4. Your content">
        <Text size="sm" c="dimmed">
          You retain all rights to the files and text you process. We claim no ownership over your
          content, and — as set out in the Privacy Policy — we do not store it.
        </Text>
      </Section>

      <Section title="5. Intellectual property and open source">
        <Text size="sm" c="dimmed">
          Kiln is open-source software. The source code is available on{' '}
          <Anchor href={REPO_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </Anchor>{' '}
          and is licensed under the terms stated in the repository. The Kiln name and branding
          remain the property of their respective owners.
        </Text>
      </Section>

      <Section title="6. Disclaimer of warranties">
        <Text size="sm" c="dimmed">
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND, WHETHER
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not warrant that the Service
          will be uninterrupted, error-free, secure, or that results (such as compression, format
          conversion, or extraction) will be accurate or fit for your purposes.
        </Text>
      </Section>

      <Section title="7. Limitation of liability">
        <Text size="sm" c="dimmed">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, the maintainers and contributors of Kiln
          shall not be liable for any indirect, incidental, special, consequential, or punitive
          damages, or for any loss of data, profits, or goodwill, arising out of or relating to your
          use of (or inability to use) the Service — even if advised of the possibility of such
          damages. Because you are responsible for your own files, always keep backups and work on
          copies of important documents.
        </Text>
      </Section>

      <Section title="8. Indemnification">
        <Text size="sm" c="dimmed">
          You agree to indemnify and hold harmless the maintainers and contributors of Kiln from any
          claims, damages, or expenses arising from your misuse of the Service or your violation of
          these Terms or of any law or third-party right.
        </Text>
      </Section>

      <Section title="9. Governing law">
        <Text size="sm" c="dimmed">
          These Terms are governed by and construed in accordance with the laws of India, without
          regard to its conflict-of-laws rules. Subject to applicable law, the courts located in
          India shall have jurisdiction over any dispute arising from these Terms or your use of the
          Service.
        </Text>
      </Section>

      <Section title="10. Changes to these terms">
        <Text size="sm" c="dimmed">
          We may update these Terms from time to time. The "last updated" date above reflects the
          latest version, and your continued use of the Service after an update constitutes
          acceptance of the revised Terms.
        </Text>
      </Section>

      <Section title="11. Contact">
        <Text size="sm" c="dimmed">
          Questions about these Terms can be raised via{' '}
          <Anchor href={REPO_ISSUES_URL} target="_blank" rel="noopener noreferrer">
            GitHub issues
          </Anchor>
          .
        </Text>
      </Section>

      <Text size="xs" c="dimmed" fs="italic">
        These Terms are provided in good faith. They are not legal advice.
      </Text>
    </Stack>
  );
}
