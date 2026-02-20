import { Drawer, Text } from '../../ui';
import type { DrawerIntroLines } from './drawerCopySpec';

interface DrawerHeaderWithSubtitleProps {
  title: string;
  subtitle?: string;
}

export function DrawerHeaderWithSubtitle({ title, subtitle }: DrawerHeaderWithSubtitleProps) {
  return (
    <Drawer.Header title={title}>
      {subtitle && (
        <Text size="100" color="gray-700" style={{ marginTop: 4, display: 'block' }}>
          {subtitle}
        </Text>
      )}
    </Drawer.Header>
  );
}

interface DrawerIntroProps {
  lines: DrawerIntroLines;
}

export function DrawerIntro({ lines }: DrawerIntroProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lines.map((line, index) => (
        <Text key={`${line}-${index}`} size="200" color="gray-800">
          {line}
        </Text>
      ))}
    </div>
  );
}

interface DrawerStatusChipsProps {
  chips: string[];
}

export function DrawerStatusChips({ chips }: DrawerStatusChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {chips.map((chip, index) => (
        <span
          key={`${chip}-${index}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 20,
            padding: '2px 8px',
            fontSize: 12,
            fontWeight: 500,
            color: '#737373',
            background: '#F1F1F1',
            borderRadius: 4,
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
          }}
        >
          {chip}
        </span>
      ))}
    </div>
  );
}
