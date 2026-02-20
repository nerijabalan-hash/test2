/**
 * Self-contained icon components.
 * Extracted SVG paths from FrontendPlatform icons — no external dependency needed.
 */

import React, { forwardRef } from 'react';

// ============================================================================
// Icon infrastructure
// ============================================================================

const ICON_SIZE_TO_PX: Record<string, string> = {
  'extra-small': '12px',
  small: '16px',
  normal: '24px',
  large: '32px',
};

interface IconContainerProps {
  size?: 'extra-small' | 'small' | 'normal' | 'large';
  rotation?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  viewBox?: string;
  children: React.ReactNode;
}

const IconContainer = forwardRef<SVGSVGElement, IconContainerProps>(
  ({ children, size = 'normal', rotation = 0, color, className = '', style, viewBox = '0 0 24 24' }, ref) => {
    const px = ICON_SIZE_TO_PX[size] ?? '24px';
    const gridSize = viewBox.startsWith('0 0 16') ? 16 : viewBox.startsWith('-2 -2 16') ? 6 : 24;
    return (
      <svg
        ref={ref}
        width={px}
        height={px}
        viewBox={viewBox}
        className={className}
        style={{ color: color ?? 'currentColor', ...style }}
        aria-hidden
      >
        <g transform={`rotate(${rotation} ${gridSize / 2} ${gridSize / 2})`}>
          {children}
        </g>
      </svg>
    );
  },
);
IconContainer.displayName = 'IconContainer';

function iconFactory(
  displayName: string,
  children: React.ReactNode,
  defaultProps?: { viewBox?: string; size?: IconContainerProps['size']; className?: string },
) {
  const IconComponent = forwardRef<SVGSVGElement, Omit<IconContainerProps, 'children'>>((props, ref) => (
    <IconContainer
      {...defaultProps}
      {...props}
      className={[defaultProps?.className, props.className].filter(Boolean).join(' ')}
      ref={ref}
    >
      {children}
    </IconContainer>
  ));
  IconComponent.displayName = displayName;
  return IconComponent;
}

// ============================================================================
// Icon components
// ============================================================================

export const IconAiStar = iconFactory('IconAiStar', (
  <>
    <path
      d="M13.8 12.3C12.8452 12.3 11.9295 11.9207 11.2544 11.2456C10.5793 10.5705 10.2 9.65478 10.2 8.7C10.2 8.38174 10.0736 8.07652 9.84853 7.85147C9.62349 7.62643 9.31826 7.5 9 7.5C8.68174 7.5 8.37651 7.62643 8.15147 7.85147C7.92643 8.07652 7.8 8.38174 7.8 8.7C7.8 9.65478 7.42072 10.5705 6.74558 11.2456C6.07045 11.9207 5.15478 12.3 4.2 12.3C3.88174 12.3 3.57651 12.4264 3.35147 12.6515C3.12643 12.8765 3 13.1817 3 13.5C3 13.8183 3.12643 14.1235 3.35147 14.3485C3.57651 14.5736 3.88174 14.7 4.2 14.7C5.15478 14.7 6.07045 15.0793 6.74558 15.7544C7.42072 16.4295 7.8 17.3452 7.8 18.3C7.8 18.6183 7.92643 18.9235 8.15147 19.1485C8.37651 19.3736 8.68174 19.5 9 19.5C9.31826 19.5 9.62349 19.3736 9.84853 19.1485C10.0736 18.9235 10.2 18.6183 10.2 18.3C10.2 17.3452 10.5793 16.4295 11.2544 15.7544C11.9295 15.0793 12.8452 14.7 13.8 14.7C14.1183 14.7 14.4235 14.5736 14.6485 14.3485C14.8736 14.1235 15 13.8183 15 13.5C15 13.1817 14.8736 12.8765 14.6485 12.6515C14.4235 12.4264 14.1183 12.3 13.8 12.3Z"
      fill="currentColor"
    />
    <path
      d="M20.25 6C19.6533 6 19.081 5.76295 18.659 5.34099C18.2371 4.91903 18 4.34674 18 3.75C18 3.55109 17.921 3.36032 17.7803 3.21967C17.6397 3.07902 17.4489 3 17.25 3C17.0511 3 16.8603 3.07902 16.7197 3.21967C16.579 3.36032 16.5 3.55109 16.5 3.75C16.5 4.34674 16.2629 4.91903 15.841 5.34099C15.419 5.76295 14.8467 6 14.25 6C14.0511 6 13.8603 6.07902 13.7197 6.21967C13.579 6.36032 13.5 6.55109 13.5 6.75C13.5 6.94891 13.579 7.13968 13.7197 7.28033C13.8603 7.42098 14.0511 7.5 14.25 7.5C14.8467 7.5 15.419 7.73705 15.841 8.15901C16.2629 8.58097 16.5 9.15326 16.5 9.75C16.5 9.94891 16.579 10.1397 16.7197 10.2803C16.8603 10.421 17.0511 10.5 17.25 10.5C17.4489 10.5 17.6397 10.421 17.7803 10.2803C17.921 10.1397 18 9.94891 18 9.75C18 9.15326 18.2371 8.58097 18.659 8.15901C19.081 7.73705 19.6533 7.5 20.25 7.5C20.4489 7.5 20.6397 7.42098 20.7803 7.28033C20.921 7.13968 21 6.94891 21 6.75C21 6.55109 20.921 6.36032 20.7803 6.21967C20.6397 6.07902 20.4489 6 20.25 6Z"
      fill="currentColor"
    />
  </>
));

export const IconArrow = iconFactory('IconArrow', (
  <path
    fill="currentColor"
    fillRule="evenodd"
    clipRule="evenodd"
    d="M5.25 11.1889L7.39173 13.3102L10.5032 10.2285L10.5032 19.5032L13.5032 19.5032L13.5032 10.2348L16.6083 13.3102L18.75 11.1889L12 4.5032L5.25 11.1889Z"
  />
));

export const IconBin = iconFactory('IconBin', (
  <path
    fillRule="evenodd"
    clipRule="evenodd"
    d="M9 4h6v1.5h4.5V7h-15V5.5H9V4Zm9 4.5H6L7.5 19h9L18 8.5Z"
    fill="currentColor"
  />
));

export const IconCheckmark = iconFactory('IconCheckmark', (
  <g stroke="none" strokeWidth="1" fill="currentColor" fillRule="evenodd">
    <path
      d="M16.5,15 L16.5,18 L7.5,18 L7.5,15 L16.5,15 Z M16.5,3 L16.5,15 L13.5,15 L13.5,3 L16.5,3 Z"
      transform="rotate(45 12 10.5)"
    />
  </g>
));

export const IconChevron = iconFactory('IconChevron', (
  <g stroke="none" strokeWidth="1" fill="currentColor" fillRule="evenodd">
    <path
      d="M9.7496212,4.5 L9.7496212,11.999 L17.2496212,12 L17.2496212,15 L9.7496212,14.999 L9.7496212,15 L6.7496212,15 L6.7496212,4.5 L9.7496212,4.5 Z"
      transform="rotate(-45 12 9.75)"
    />
  </g>
));

export const IconClose = iconFactory('IconClose', (
  <g stroke="none" strokeWidth="1" fill="currentColor" fillRule="evenodd">
    <path d="M18.3655 7.75596L16.2442 5.63464L12 9.87884L7.75489 5.63372L5.63357 7.75504L9.87869 12.0002L5.63484 16.244L7.75616 18.3653L12 14.1215L16.245 18.3665L18.3664 16.2452L14.1213 12.0002L18.3655 7.75596Z" />
  </g>
));

export const IconColumns = iconFactory('IconColumns', (
  <g fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 16.5V7.5H10.5V16.5H6ZM11.25 19.5H3.75C3.33579 19.5 3 19.1642 3 18.75V5.25C3 4.83579 3.33579 4.5 3.75 4.5H11.25H12.75H20.25C20.6642 4.5 21 4.83579 21 5.25V18.75C21 19.1642 20.6642 19.5 20.25 19.5H12.75H11.25ZM13.5 16.5H18V7.5H13.5V16.5Z"
    />
  </g>
));

const IconDotsInner = (props: any) => (
  <IconContainer {...props}>
    <g stroke="none" strokeWidth="1" fill="currentColor" fillRule="evenodd">
      <path d="M5.25,9.75 C6.49264069,9.75 7.5,10.7573593 7.5,12 C7.5,13.2426407 6.49264069,14.25 5.25,14.25 C4.00735931,14.25 3,13.2426407 3,12 C3,10.7573593 4.00735931,9.75 5.25,9.75 Z M12,9.75 C13.2426407,9.75 14.25,10.7573593 14.25,12 C14.25,13.2426407 13.2426407,14.25 12,14.25 C10.7573593,14.25 9.75,13.2426407 9.75,12 C9.75,10.7573593 10.7573593,9.75 12,9.75 Z M18.75,9.75 C19.9926407,9.75 21,10.7573593 21,12 C21,13.2426407 19.9926407,14.25 18.75,14.25 C17.5073593,14.25 16.5,13.2426407 16.5,12 C16.5,10.7573593 17.5073593,9.75 18.75,9.75 Z" />
    </g>
  </IconContainer>
);
IconDotsInner.displayName = 'IconDots';
export { IconDotsInner as IconDots };

const IconDuplicateInner = (props: any) => (
  <IconContainer {...props}>
    <g stroke="none" strokeWidth="1" fill="currentColor" fillRule="evenodd">
      <path d="M15 4.5H7.5H4.5V7.5V15H7.5V7.5H15V4.5ZM9 9H19.5V19.5H9V9ZM13.5 10.5H15V13.5H18V15H15V18H13.5V15H10.5V13.5H13.5V10.5Z" />
    </g>
  </IconContainer>
);
IconDuplicateInner.displayName = 'IconDuplicate';
export { IconDuplicateInner as IconDuplicate };

export const IconEdit = iconFactory('IconEdit', (
  <g stroke="none" strokeWidth="1" fill="currentColor" fillRule="evenodd">
    <path
      d="M9,7.4446861 L13.5,7.4446861 L13.3713199,18.0187159 L11.25,22.3804666 L9.12867922,18.0187159 L9,7.4446861 Z M9,2.9446861 L13.5,2.9446861 L13.5,5.9446861 L9,5.9446861 L9,2.9446861 Z"
      transform="rotate(45 11.25 12.663)"
    />
  </g>
));

export const IconFolder = iconFactory('IconFolder', (
  <g>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14 3C15.1046 3 16 3.89543 16 5L16 12C16 13.1046 15.1046 14 14 14L2 14C0.895431 14 0 13.1046 0 12V3L14 3Z"
      fill="#BABABA"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.92702 1C6.40448 1 6.86619 1.17081 7.22869 1.48156L9 3L0 3C0 1.89543 0.895431 1 2 1L5.92702 1Z"
      fill="#737373"
    />
  </g>
), { viewBox: '0 0 16 16', size: 'small' });

const IconFolderDynamicInner = (props: any) => (
  <IconContainer {...props}>
    <g stroke="none" strokeWidth="1" fill="currentColor" fillRule="evenodd">
      <path d="M19.875 6H10.5L9.4125 4.8375C9.1875 4.6125 8.9625 4.5 8.625 4.5L4.125 4.5C3.45 4.5 3 4.95 3 5.625V18.375C3 19.05 3.45 19.5 4.125 19.5H19.875C20.55 19.5 21 19.05 21 18.375V7.125C21 6.45 20.55 6 19.875 6Z" />
    </g>
  </IconContainer>
);
IconFolderDynamicInner.displayName = 'IconFolderDynamic';
export { IconFolderDynamicInner as IconFolderDynamic };

export const IconPlay = iconFactory('IconPlay', (
  <path
    d="M1 1.33c0-.38.4-.62.73-.45l8.92 4.68a.5.5 0 0 1 0 .88l-8.92 4.68a.5.5 0 0 1-.73-.45V1.33Z"
    fill="currentColor"
  />
), { viewBox: '-2 -2 16 16' });

export const IconPlus = iconFactory('IconPlus', (
  <g stroke="none" strokeWidth="1" fill="currentColor" fillRule="evenodd">
    <path d="M13.5,4.5 L13.5,10.5 L19.5,10.5 L19.5,13.5 L13.5,13.5 L13.5,19.5 L10.5,19.5 L10.5,13.5 L4.5,13.5 L4.5,10.5 L10.5,10.5 L10.5,4.5 L13.5,4.5 Z" />
  </g>
));

export const IconPresentation = iconFactory('IconPresentation', (
  <>
    <path
      d="M18 6C19.6569 6 21 7.34315 21 9V15C21 16.6569 19.6569 18 18 18H6C4.34315 18 3 16.6569 3 15V9C3 7.34315 4.34315 6 6 6H18ZM8.5 11.125C8.5 11.6773 8.05228 12.125 7.5 12.125H5C5 14.058 6.567 15.625 8.5 15.625C10.433 15.625 12 14.058 12 12.125C12 10.192 10.433 8.625 8.5 8.625V11.125ZM14 13C13.4477 13 13 13.4477 13 14C13 14.5523 13.4477 15 14 15H18C18.5523 15 19 14.5523 19 14C19 13.4477 18.5523 13 18 13H14ZM14 9C13.4477 9 13 9.44772 13 10C13 10.5523 13.4477 11 14 11H18C18.5523 11 19 10.5523 19 10C19 9.44772 18.5523 9 18 9H14Z"
      fill="currentColor"
    />
    <rect x="10" y="3" width="5" height="2" rx="1" fill="currentColor" />
    <rect x="13" y="19" width="5" height="2" rx="1" fill="currentColor" />
    <rect x="6" y="19" width="5" height="2" rx="1" fill="currentColor" />
  </>
));

export const IconQuestionMark = iconFactory('IconQuestionMark', (
  <>
    <circle cx="8" cy="8" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path
      fill="currentColor"
      d="M5.484 4.651A4.959 4.959 0 0 1 7.951 4a2.62 2.62 0 0 1 1.705.515 1.686 1.686 0 0 1 .633 1.376 1.83 1.83 0 0 1-.26.989c-.27.37-.604.689-.99.938a3.087 3.087 0 0 0-.632.562.88.88 0 0 0-.134.505V9.2h-1.38v-.387a1.707 1.707 0 0 1 .214-.87 2.8 2.8 0 0 1 .78-.787c.27-.175.514-.39.722-.635a.922.922 0 0 0 .174-.547.59.59 0 0 0-.25-.515 1.193 1.193 0 0 0-.7-.178 4.004 4.004 0 0 0-1.781.511l-.568-1.14ZM8.667 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
    />
  </>
), { viewBox: '0 0 16 16', size: 'small' });

export const IconSearch = iconFactory('IconSearch', (
  <g stroke="none" strokeWidth="1" fill="currentColor" fillRule="evenodd">
    <path d="M9.75,3 C13.4779221,3 16.5,6.02207794 16.5,9.75 C16.5,11.0709737 16.1205449,12.303321 15.4646886,13.3439879 L20.7426407,18.6213203 L18.6213203,20.7426407 L13.3439879,15.4646886 C12.303321,16.1205449 11.0709737,16.5 9.75,16.5 C6.02207794,16.5 3,13.4779221 3,9.75 C3,6.02207794 6.02207794,3 9.75,3 Z M9.75,6 C7.67893219,6 6,7.67893219 6,9.75 C6,11.8210678 7.67893219,13.5 9.75,13.5 C11.8210678,13.5 13.5,11.8210678 13.5,9.75 C13.5,7.67893219 11.8210678,6 9.75,6 Z" />
  </g>
));

export const IconUpdates = iconFactory('IconUpdates', (
  <g stroke="none" strokeWidth="1" fill="currentColor" fillRule="evenodd">
    <path d="M10.5,13.5 L10.5,15.75 L7.31668135,15.750885 C8.41628937,17.1220715 10.1056191,18 12,18 C14.4507312,18 16.5582848,16.5306816 17.4897967,14.4249088 L20.5154235,14.9209019 C19.3025242,18.4577352 15.948151,21 12,21 C9.3114972,21 6.89832685,19.8211616 5.24918174,17.9521777 L5.25,21 L3,21 L3,13.5 L10.5,13.5 Z M21,3 L21,10.5 L13.5,10.5 L13.5,8.25 L16.6841185,8.25011257 C15.5845299,6.87835433 13.8948403,6 12,6 C9.54888057,6 7.44104756,7.46978388 6.50976069,9.57609192 L3.48423429,9.08009622 C4.69684476,5.54274306 8.05147765,3 12,3 C14.6889476,3 17.1024716,4.17922843 18.7516366,6.04874992 L18.75,3 L21,3 Z" />
  </g>
));

export const IconViewList = iconFactory('IconViewList', (
  <>
    <path d="M7.125 4.5H4.875C4.66789 4.5 4.5 4.66789 4.5 4.875V7.125C4.5 7.33211 4.66789 7.5 7.125 7.5H7.125C7.33211 7.5 7.5 7.33211 7.5 7.125V4.875C7.5 4.66789 7.33211 4.5 7.125 4.5Z" fill="currentColor" />
    <path d="M7.125 10.5H4.875C4.66789 10.5 4.5 10.6679 4.5 10.875V13.125C4.5 13.3321 4.66789 13.5 7.125 13.5H7.125C7.33211 13.5 7.5 13.3321 7.5 13.125V10.875C7.5 10.6679 7.33211 10.5 7.125 10.5Z" fill="currentColor" />
    <path d="M7.125 16.5H4.875C4.66789 16.5 4.5 16.6679 4.5 16.875V19.125C4.5 19.3321 4.66789 19.5 7.125 19.5H7.125C7.33211 19.5 7.5 19.3321 7.5 19.125V16.875C7.5 16.6679 7.33211 16.5 7.125 16.5Z" fill="currentColor" />
    <path d="M19.125 4.5H9.375C9.16789 4.5 9 4.66789 9 4.875V7.125C9 7.33211 9.16789 7.5 9.375 7.5H19.125C19.3321 7.5 19.5 7.33211 19.5 7.125V4.875C19.5 4.66789 19.3321 4.5 19.125 4.5Z" fill="currentColor" />
    <path d="M19.125 10.5H9.375C9.16789 10.5 9 10.6679 9 10.875V13.125C9 13.3321 9.16789 13.5 9.375 13.5H19.125C19.3321 13.5 19.5 13.3321 19.5 13.125V10.875C19.5 10.6679 19.3321 10.5 19.125 10.5Z" fill="currentColor" />
    <path d="M19.125 16.5H9.375C9.16789 16.5 9 16.6679 9 16.875V19.125C9 19.3321 9.16789 19.5 9.375 19.5H19.125C19.3321 19.5 19.5 19.3321 19.5 19.125V16.875C19.5 16.6679 19.3321 16.5 19.125 16.5Z" fill="currentColor" />
  </>
));
