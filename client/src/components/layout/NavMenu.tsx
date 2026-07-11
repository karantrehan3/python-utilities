import { NavLink } from '@mantine/core';
import {
  IconFileTypePdf,
  IconPhoto,
  IconTypography,
  IconLock,
  IconInfoCircle,
  IconCut,
  IconFiles,
  IconPhotoPlus,
  IconFileZip,
  IconResize,
  IconTransform,
  IconPhotoSearch,
  IconHash,
  IconCode,
  IconCodeDots,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';

const ICON_SIZE = 18;
const STROKE = 1.5;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  basePath: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'PDF',
    icon: <IconFileTypePdf size={ICON_SIZE} stroke={STROKE} />,
    basePath: '/pdf',
    items: [
      { label: 'Unlock', path: '/pdf/unlock', icon: <IconLock size={ICON_SIZE} stroke={STROKE} /> },
      {
        label: 'Info',
        path: '/pdf/info',
        icon: <IconInfoCircle size={ICON_SIZE} stroke={STROKE} />,
      },
      {
        label: 'Extract Pages',
        path: '/pdf/subset',
        icon: <IconCut size={ICON_SIZE} stroke={STROKE} />,
      },
      { label: 'Merge', path: '/pdf/merge', icon: <IconFiles size={ICON_SIZE} stroke={STROKE} /> },
      {
        label: 'Images to PDF',
        path: '/pdf/from-images',
        icon: <IconPhotoPlus size={ICON_SIZE} stroke={STROKE} />,
      },
      {
        label: 'Compress',
        path: '/pdf/compress',
        icon: <IconFileZip size={ICON_SIZE} stroke={STROKE} />,
      },
    ],
  },
  {
    label: 'Images',
    icon: <IconPhoto size={ICON_SIZE} stroke={STROKE} />,
    basePath: '/image',
    items: [
      {
        label: 'Resize',
        path: '/image/resize',
        icon: <IconResize size={ICON_SIZE} stroke={STROKE} />,
      },
      {
        label: 'Convert',
        path: '/image/convert',
        icon: <IconTransform size={ICON_SIZE} stroke={STROKE} />,
      },
      {
        label: 'Info',
        path: '/image/info',
        icon: <IconPhotoSearch size={ICON_SIZE} stroke={STROKE} />,
      },
    ],
  },
  {
    label: 'Text',
    icon: <IconTypography size={ICON_SIZE} stroke={STROKE} />,
    basePath: '/text',
    items: [
      { label: 'Hash', path: '/text/hash', icon: <IconHash size={ICON_SIZE} stroke={STROKE} /> },
      {
        label: 'Encode',
        path: '/text/encode',
        icon: <IconCode size={ICON_SIZE} stroke={STROKE} />,
      },
      {
        label: 'Decode',
        path: '/text/decode',
        icon: <IconCodeDots size={ICON_SIZE} stroke={STROKE} />,
      },
    ],
  },
];

export function NavMenu() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {NAV_GROUPS.map((group) => (
        <NavLink
          key={group.basePath}
          label={group.label}
          leftSection={group.icon}
          defaultOpened={location.pathname.startsWith(group.basePath)}
          childrenOffset="1.5rem"
        >
          {group.items.map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={item.icon}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </NavLink>
      ))}
    </>
  );
}
