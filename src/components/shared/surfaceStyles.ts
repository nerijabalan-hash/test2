import type { CSSProperties, KeyboardEvent } from 'react';
import { tokens } from '../../ui';

const toPx = (value: number | string): string => (
  typeof value === 'number' ? `${value}px` : value
);

export const baseInteractiveSurface: CSSProperties = {
  background: tokens.colors.bgWhite,
  border: 'none',
  borderRadius: toPx(tokens.radius[200]),
  boxShadow: tokens.shadow['100'],
  transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
};

export const hoverInteractiveSurface: CSSProperties = {
  background: tokens.colors.bgLighter,
  boxShadow: tokens.shadow['200'],
};

export const surfaceText = {
  title: '#323232',
  body: '#737373',
  meta: '#737373',
} as const;

export const surfaceSpacing = {
  accordion: {
    header: `${toPx(tokens.spacing[300])} ${toPx(tokens.spacing[400])}`,
    body: `0 ${toPx(tokens.spacing[400])} ${toPx(tokens.spacing[400])}`,
  },
  card: {
    padding: `${toPx(tokens.spacing[250])} ${toPx(tokens.spacing[300])}`,
    gap: toPx(tokens.spacing[250]),
  },
  gap: {
    default: toPx(tokens.spacing[250]),
    compact: toPx(tokens.spacing[200]),
  },
} as const;

export const accordionHeaderInteractive = {
  base: {
    background: 'transparent',
    transition: 'background-color 0.15s ease',
  } as const,
  hover: {
    background: tokens.colors.bgLighter,
  } as const,
};

export const accordionHeaderTriggerBase: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: toPx(tokens.spacing[200]),
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  userSelect: 'none',
};

export const handleAccordionHeaderTriggerKeyDown = (
  event: KeyboardEvent<HTMLElement>,
  onToggle: () => void,
): void => {
  if (event.target !== event.currentTarget) return;
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  onToggle();
};
