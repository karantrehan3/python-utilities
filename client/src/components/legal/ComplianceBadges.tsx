import { Badge, Group, Tooltip } from '@mantine/core';
import {
  IconShieldLock,
  IconEyeOff,
  IconDeviceDesktop,
  IconGavel,
  type IconProps,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

interface ComplianceBadge {
  label: string;
  detail: string;
  icon: ComponentType<IconProps>;
  color: string;
}

// Only self-assertable, fact-backed badges — no third-party certifications.
const BADGES: ComplianceBadge[] = [
  {
    label: 'Privacy by Design',
    detail: 'Data minimization is the default — Kiln is built to need as little as possible.',
    icon: IconShieldLock,
    color: 'teal',
  },
  {
    label: 'No Tracking · No Ads',
    detail: 'No analytics, no advertising networks, and no tracking cookies.',
    icon: IconEyeOff,
    color: 'grape',
  },
  {
    label: 'Client-Side Processing',
    detail: 'Most tools run entirely in your browser; your files are not uploaded.',
    icon: IconDeviceDesktop,
    color: 'blue',
  },
  {
    label: 'GDPR & CCPA Aligned',
    detail:
      'Compliant by design: no personal data is collected, stored, or sold. Self-assessed, not a third-party certification.',
    icon: IconGavel,
    color: 'indigo',
  },
];

export function ComplianceBadges() {
  return (
    <Group gap="0.5rem">
      {BADGES.map(({ label, detail, icon: Icon, color }) => (
        <Tooltip key={label} label={detail} withArrow multiline w={260} events={{ hover: true, focus: true, touch: true }}>
          <Badge
            variant="light"
            color={color}
            size="lg"
            radius="sm"
            leftSection={<Icon size={14} />}
            style={{ cursor: 'help' }}
            tabIndex={0}
          >
            {label}
          </Badge>
        </Tooltip>
      ))}
    </Group>
  );
}
