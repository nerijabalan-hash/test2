/**
 * Mock implementations of Templafy UI components
 *
 * These allow the prototype to run standalone without the full Templafy design system.
 * Replace with actual @templafy/ui imports when integrating into the monorepo.
 */

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../assets/fonts.css';
import {
  IconAiStar as FrontendPlatformIconAiStar,
  IconArrow as FrontendPlatformIconArrow,
  IconBin as FrontendPlatformIconBin,
  IconCheckmark as FrontendPlatformIconCheckmark,
  IconChevron as FrontendPlatformIconChevron,
  IconClose as FrontendPlatformIconClose,
  IconColumns as FrontendPlatformIconColumns,
  IconDots as FrontendPlatformIconDots,
  IconDuplicate as FrontendPlatformIconDuplicate,
  IconEdit as FrontendPlatformIconEdit,
  IconFolder as FrontendPlatformIconFolder,
  IconFolderDynamic as FrontendPlatformIconFolderDynamic,
  IconPlay as FrontendPlatformIconPlay,
  IconPlus as FrontendPlatformIconPlus,
  IconPresentation as FrontendPlatformIconPresentation,
  IconQuestionMark as FrontendPlatformIconQuestionMark,
  IconSearch as FrontendPlatformIconSearch,
  IconUpdates as FrontendPlatformIconUpdates,
  IconViewList as FrontendPlatformIconViewList,
} from '../icons';

// ============================================================================
// Layout Components
// ============================================================================

interface AdminLayoutProps {
  children: React.ReactNode;
  topBar?: React.ReactNode;
  menu?: React.ReactNode;
}

export function AdminLayout({ children, topBar }: AdminLayoutProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Open Sans', Arial, sans-serif" }}>
      {/* Dark sidebar — expanded width, no text or items */}
      <aside style={{
        width: 232,
        minWidth: 232,
        maxWidth: 232,
        background: '#232323',
        flexShrink: 0,
        height: '100%',
      }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {topBar}
        <div style={{ flex: 1, overflow: 'auto', background: 'rgb(252, 252, 253)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

AdminLayout.TopBar = function TopBar({
  content,
  icon: Icon,
  tabs
}: {
  content?: React.ReactNode;
  icon?: React.FC<any>;
  tabs?: React.ReactNode;
}) {
  return (
    <div style={{
      width: '100%',
      minHeight: 81,
      background: '#FFFFFF',
      borderBottom: '1px solid #DFDFDF',
      boxSizing: 'border-box',
    }}>
      <div style={{
        padding: tabs ? '20px 32px 0 32px' : '0 32px',
        height: tabs ? 'auto' : 81,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        {Icon && <Icon size="medium" />}
        {content}
      </div>
      {tabs && (
        <div style={{ padding: '0 32px' }}>
          {tabs}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Templafy Sidebar Navigation (expandable/collapsible)
// ============================================================================

// SVG Icons for sidebar (white color for dark background)
const SidebarIcons = {
  account: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" fill="currentColor"/></svg>,
  users: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 10a3 3 0 100-6 3 3 0 000 6zm6 0a3 3 0 100-6 3 3 0 000 6zM7 12c-3 0-5 1.5-5 3v1h10v-1c0-1.5-2-3-5-3zm6 0c-.5 0-1 .1-1.5.2.8.7 1.5 1.6 1.5 2.8v1h5v-1c0-1.5-2-3-5-3z" fill="currentColor"/></svg>,
  modules: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1" fill="currentColor"/><rect x="11" y="2" width="7" height="7" rx="1" fill="currentColor"/><rect x="2" y="11" width="7" height="7" rx="1" fill="currentColor"/><rect x="11" y="11" width="7" height="7" rx="1" fill="currentColor"/></svg>,
  spaces: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v4h4V6H5zm6 0v4h4V6h-4zm-6 6v4h4v-4H5zm6 0v4h4v-4h-4z" fill="currentColor"/></svg>,
  libraryConfig: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1.5l-8 4v9l8 4 8-4v-9l-8-4zm0 2.3l5.5 2.7L10 9.2 4.5 6.5 10 3.8zM4 8.3l5 2.5v5.4l-5-2.5V8.3zm12 5.4l-5 2.5V10.8l5-2.5v5.4z" fill="currentColor"/></svg>,
  insights: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 17h14v-2H3v2zm0-5h8v-2H3v2zm0-5h14V5H3v2z" fill="currentColor"/></svg>,
  aiAgents: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" fill="currentColor"/><path d="M15 12l.75 2.25L18 15l-2.25.75L15 18l-.75-2.25L12 15l2.25-.75L15 12z" fill="currentColor"/></svg>,
  libraries: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 4a2 2 0 012-2h5l2 2h5a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" fill="currentColor"/></svg>,
  email: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2 0l6 4 6-4H4zm0 2v8h12V7l-6 4-6-4z" fill="currentColor"/></svg>,
  productivity: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-6.4V6H9v5l3.5 2.1.8-1.4-2.3-1.1z" fill="currentColor"/></svg>,
  assistant: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2z" fill="currentColor"/></svg>,
  integrations: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M11 3a1 1 0 10-2 0v4H5a1 1 0 100 2h4v4a1 1 0 102 0V9h4a1 1 0 100-2h-4V3z" fill="currentColor"/></svg>,
  resources: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2v2h8V7H6zm0 4v2h5v-2H6z" fill="currentColor"/></svg>,
  addins: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M14 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2zM6 4h8v12H6V4zm2 2v2h4V6H8zm0 4v2h4v-2H8z" fill="currentColor"/></svg>,
  chevronDown: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  collapse: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  doubleChevronRight: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 6l4 4-4 4M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

function TemplafySidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const sidebarWidth = collapsed ? 92 : 260;

  const navItems = [
    { icon: SidebarIcons.account, label: 'Account', active: false },
    { icon: SidebarIcons.users, label: 'Users', active: false },
    { icon: SidebarIcons.modules, label: 'Modules', active: false },
    { icon: SidebarIcons.spaces, label: 'Spaces', active: false },
    { icon: SidebarIcons.libraryConfig, label: 'Library configuration', active: false },
    { icon: SidebarIcons.insights, label: 'Library content insights', active: false },
    { icon: SidebarIcons.aiAgents, label: 'AI Agents', active: true },
    { divider: true },
    { icon: SidebarIcons.libraries, label: 'Libraries', active: false },
    { icon: SidebarIcons.email, label: 'Email signatures', active: false },
    { icon: SidebarIcons.productivity, label: 'Productivity', active: false },
    { icon: SidebarIcons.assistant, label: 'Ai Assistant', active: false },
    { icon: SidebarIcons.integrations, label: 'Integrations', active: false },
    { icon: SidebarIcons.resources, label: 'Resources', active: false },
    { icon: SidebarIcons.addins, label: 'Office Add-ins', active: false },
  ];

  return (
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: sidebarWidth,
      minWidth: sidebarWidth,
      maxWidth: sidebarWidth,
      transition: 'width 0.2s ease',
      background: '#232323',
      alignSelf: 'stretch',
      flexGrow: 0,
      flexShrink: 0,
      height: '100%',
      color: '#737373',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      {collapsed ? (
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '10px 0',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
          boxSizing: 'border-box',
        }}>
          <div
            aria-label="Tenant"
            style={{
              width: 56,
              height: 56,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.45)',
              color: '#737373',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 300,
              lineHeight: 1,
            }}
          >
            T
          </div>
        </div>
      ) : (
        <div style={{
          padding: '16px',
          width: '100%',
          boxSizing: 'border-box',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}>
            <div>
              <div style={{ color: '#737373', fontWeight: 600, fontSize: 14, lineHeight: '20px' }}>Cranston</div>
              <div style={{ fontSize: 12, fontWeight: 400, color: '#737373', marginTop: 2 }}>
                cranston.templafy.com
              </div>
            </div>
            <span style={{ color: '#737373' }}>{SidebarIcons.chevronDown}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', width: '100%' }}>
        {navItems.map((item, index) =>
          item.divider ? (
            <div key={index} style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: collapsed ? '10px 0' : '8px 0' }} />
          ) : (
            <div
              key={index}
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: collapsed ? 'center' : 'stretch',
                alignItems: 'center',
                width: '100%',
                padding: collapsed ? '4px 0' : 0,
                boxSizing: 'border-box',
              }}
            >
              {item.active && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: collapsed ? 12 : 8,
                    bottom: collapsed ? 12 : 8,
                    width: 3,
                    borderRadius: '0 2px 2px 0',
                    background: '#4A61ED',
                  }}
                />
              )}
              <div
                title={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: collapsed ? 0 : 12,
                  padding: collapsed ? 0 : '0 16px',
                  height: collapsed ? 44 : 40,
                  width: collapsed ? 56 : '100%',
                  borderRadius: collapsed ? 8 : 0,
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  background: item.active ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  color: item.active ? '#737373' : '#737373',
                  fontSize: 14,
                  fontWeight: item.active ? 500 : 400,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#737373';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#737373';
                  }
                }}
              >
                <span style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </div>
            </div>
          )
        )}
      </nav>

      {/* Footer */}
      {collapsed ? (
        <div style={{
          width: '100%',
          borderTop: '1px solid rgba(255,255,255,0.15)',
          background: '#1B1B1B',
          boxSizing: 'border-box',
        }}>
          <button
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            style={{
              width: '100%',
              height: 46,
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {SidebarIcons.doubleChevronRight}
          </button>
        </div>
      ) : (
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 4h16v16H4V4z" fill="#232323"/>
              <path d="M7 8h10M7 12h10M7 16h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ color: '#737373', fontWeight: 500, fontSize: 14 }}>templafy</span>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            style={{
              background: 'none',
              border: 'none',
              color: '#737373',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {SidebarIcons.collapse}
          </button>
        </div>
      )}
    </aside>
  );
}

interface BoxProps {
  children?: React.ReactNode;
  display?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
  padding?: string;
  paddingX?: string;
  paddingTop?: string;
  margin?: string;
  marginTop?: string;
  marginBottom?: string;
  backgroundColor?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderTop?: string;
  borderStyle?: string;
  width?: string;
  height?: string;
  maxWidth?: string;
  minWidth?: string;
  flex?: string;
  overflow?: string;
  color?: string;
  fontSize?: string;
  textAlign?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  gridTemplateColumns?: string;
}

const spacingMap: Record<string, string> = {
  '0': '0',
  '50': '2px',
  '100': '4px',
  '200': '8px',
  '250': '12px',
  '300': '16px',
  '400': '24px',
  '500': '32px',
  '550': '40px',
  '600': '48px',
  '700': '64px',
  '800': '96px',
  '900': '128px',
  'full': '9999px',
};

const colorMap: Record<string, string> = {
  'white': '#ffffff',
  'gray-50': '#FDFDFD',
  'gray-100': '#FAFAFA',
  'gray-200': '#F1F1F1',
  'gray-300': '#EBEBEB',
  'gray-400': '#DFDFDF',
  'gray-500': '#BABABA',
  'gray-600': '#898989',
  'gray-700': '#737373',
  'gray-800': '#464646',
  'gray-900': '#323232',
  'gray-950': '#232323',
  'gray-975': '#1B1B1B',
  'primary-50': '#F9F9FE',
  'primary-100': '#F9F9FE',
  'primary-200': '#E8EAFC',
  'primary-300': '#D3DAF8',
  'primary-400': '#B6C0F6',
  'primary-500': '#95A3F4',
  'primary-600': '#6F81F1',
  'primary-700': '#4A61ED',
  'primary-800': '#244AB8',
  'primary-900': '#153075',
  'success-100': '#F6FAF5',
  'success-200': '#E5F2E1',
  'success-300': '#D1E0BD',
  'success-700': '#677848',
  'success-800': '#4B5A2E',
  'danger-100': '#FFF5F1',
  'danger-200': '#FDE4DA',
  'danger-300': '#F5D5C9',
  'danger-600': '#C87477',
  'danger-700': '#BC5257',
  'danger-800': '#9F2832',
  'alert-100': '#FAF8F2',
  'alert-200': '#F7ECD2',
  'alert-300': '#EDD69F',
  'alert-500': '#C7A65D',
  'alert-700': '#966C1D',
  'alert-800': '#704C0A',
  'purple-50': '#F5F3FF',
  'purple-100': '#EDE9FE',
  'purple-600': '#7C3AED',
  'purple-700': '#6D28D9',
  'orange-50': '#FFF7ED',
  'orange-100': '#FFEDD5',
  'orange-600': '#EA580C',
  'orange-700': '#C2410C',
  'blue-50': '#F9F9FE',
  'blue-100': '#E8EAFC',
  'blue-300': '#D3DAF8',
  'blue-600': '#4A61ED',
  'blue-700': '#244AB8',
  'inherit': 'inherit',
};

// ============================================================================
// Templafy Color Tokens
// ============================================================================
export const tokens = {
  colors: {
    // Brand / Primary (Pollen primary scale)
    primary: '#4A61ED',
    primaryHover: '#244AB8',
    primaryActive: '#153075',
    primaryLight: '#E8EAFC',
    primaryLighter: '#F9F9FE',
    primaryFocus: '#6F81F1',

    // Text
    textPrimary: '#232323',
    textSecondary: '#737373',
    textMuted: '#898989',
    textPlaceholder: '#737373',

    // Backgrounds
    bgWhite: '#FFFFFF',
    bgLight: '#FDFDFD',
    bgLighter: '#FAFAFA',
    bgMuted: '#F1F1F1',
    bgDark: '#232323',

    // Borders (gray scale)
    borderLight: '#EBEBEB',
    borderDefault: '#DFDFDF',
    borderMedium: '#DFDFDF',
    borderDark: '#898989',
    borderHover: '#464646',

    // Status - Success (Pollen success scale)
    success: '#677848',
    successDark: '#4B5A2E',
    successLight: '#D1E0BD',
    successLighter: '#E5F2E1',
    successBg: '#F6FAF5',
    successBorder: '#D1E0BD',
    successText: '#464646',

    // Status - Warning (Pollen alert scale)
    warning: '#966C1D',
    warningLight: '#EDD69F',
    warningBorder: '#EDD69F',
    warningText: '#966C1D',

    // Status - Error / Destructive (Pollen danger scale)
    error: '#BC5257',
    errorLight: '#FDE4DA',
    errorDark: '#9F2832',

    // AI / Sparkle (Primary Blue)
    ai: '#4A61ED',
    aiBg: '#F9F9FE',
    aiBorder: '#E8EAFC',

    // Library / Folder (Green)
    library: '#677848',
    libraryBg: '#F6FAF5',
    libraryBorder: '#D1E0BD',

    // Folder icon
    folderIcon: '#F59E0B',
    folderIconLight: '#FCD34D',
  },
  spacing: {
    100: 4,
    200: 8,
    250: 12,
    300: 16,
    400: 24,
    500: 32,
    550: 40,
    600: 48,
    700: 64,
  },
  radius: {
    50: 3,
    100: 6,
    200: 12,
    pill: '20em',
    circle: '50%',
  },
  shadow: {
    '100': '0 0 0 1px rgba(41, 48, 56, 0.06), 0 2px 4px 0 rgba(41, 48, 56, 0.03), 0 6px 12px 0 rgba(41, 48, 56, 0.03)',
    '200': '0 0 0 1px rgba(41, 48, 56, 0.04), 0 3px 6px 0 rgba(41, 48, 56, 0.04), 0 9px 18px 0 rgba(41, 48, 56, 0.04)',
    '300': '0 0 0 1px rgba(41, 48, 56, 0.02), 0 4px 8px 0 rgba(41, 48, 56, 0.05), 0 12px 24px 0 rgba(41, 48, 56, 0.05)',
  },
  fontSize: {
    100: 12,
    200: 14,
    300: 16,
    400: 20,
    500: 24,
    600: 30,
    700: 36,
    800: 48,
  },
};

export function Box({
  children,
  display,
  flexDirection,
  alignItems,
  justifyContent,
  gap,
  padding,
  paddingX,
  paddingTop,
  margin,
  marginTop,
  marginBottom,
  backgroundColor,
  borderRadius,
  borderWidth,
  borderColor,
  borderTop,
  borderStyle,
  width,
  height,
  maxWidth,
  minWidth,
  flex,
  overflow,
  color,
  fontSize,
  textAlign,
  style,
  onClick,
  gridTemplateColumns,
}: BoxProps) {
  const styles: React.CSSProperties = {
    display: display === 'grid' ? 'grid' : display || undefined,
    flexDirection: flexDirection as any,
    alignItems,
    justifyContent,
    gap: gap ? spacingMap[gap] || gap : undefined,
    padding: padding ? spacingMap[padding] || padding : undefined,
    paddingLeft: paddingX ? spacingMap[paddingX] : undefined,
    paddingRight: paddingX ? spacingMap[paddingX] : undefined,
    paddingTop: paddingTop ? spacingMap[paddingTop] || paddingTop : undefined,
    margin: margin || undefined,
    marginTop: marginTop ? spacingMap[marginTop] : undefined,
    marginBottom: marginBottom ? spacingMap[marginBottom] : undefined,
    backgroundColor: backgroundColor ? colorMap[backgroundColor] || backgroundColor : undefined,
    borderRadius: borderRadius ? spacingMap[borderRadius] || borderRadius : undefined,
    border: borderWidth ? `${spacingMap[borderWidth] || '1px'} ${borderStyle || 'solid'} ${colorMap[borderColor || 'gray-200']}` : undefined,
    borderTop: borderTop ? `${spacingMap[borderTop] || '1px'} solid ${colorMap[borderColor || 'gray-200']}` : undefined,
    width,
    height,
    maxWidth,
    minWidth,
    flex,
    overflow,
    color: color ? colorMap[color] || color : undefined,
    fontSize,
    textAlign: textAlign as any,
    gridTemplateColumns,
    cursor: onClick ? 'pointer' : undefined,
    ...style,
  };

  return <div style={styles} onClick={onClick}>{children}</div>;
}

interface StackProps {
  children: React.ReactNode;
  gap?: string;
  alignItems?: string;
  style?: React.CSSProperties;
}

export function Stack({ children, gap = '200', alignItems, style }: StackProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: spacingMap[gap] || gap,
      alignItems,
      ...style
    }}>
      {children}
    </div>
  );
}

interface PaperProps {
  children: React.ReactNode;
  padding?: string;
  shadow?: boolean | '100' | '200' | '300';
  hoverShadow?: '100' | '200' | '300';
  hoverBackgroundColor?: string;
  backgroundColor?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
  textAlign?: string;
  display?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
  overflow?: string;
  onClick?: (e: React.MouseEvent) => void;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function Paper({
  children,
  padding,
  shadow,
  hoverShadow,
  hoverBackgroundColor,
  backgroundColor,
  borderWidth,
  borderColor,
  borderStyle,
  textAlign,
  display,
  alignItems,
  justifyContent,
  gap,
  overflow,
  onClick,
  hover,
  style
}: PaperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const shadowLevel = shadow === true ? '100' : shadow;
  const baseShadow = shadowLevel ? tokens.shadow[shadowLevel] : undefined;
  const hoverShadowValue = hoverShadow ? tokens.shadow[hoverShadow] : (hover ? '0 4px 12px rgba(0,0,0,0.15)' : undefined);
  const baseBackground = colorMap[backgroundColor || 'white'];
  const hoverBackground = hoverBackgroundColor ? (colorMap[hoverBackgroundColor] || hoverBackgroundColor) : undefined;
  const resolvedBackground = isHovered && hoverBackground ? hoverBackground : baseBackground;
  const resolvedShadow = isHovered && hoverShadowValue ? hoverShadowValue : baseShadow;
  const hasHoverState = Boolean(hover || hoverShadow || hoverBackgroundColor);

  return (
    <div
      style={{
        background: resolvedBackground,
        padding: padding ? spacingMap[padding] : undefined,
        borderRadius: 12,
        boxShadow: resolvedShadow,
        border: shadowLevel ? 'none' : (borderWidth ? `${spacingMap[borderWidth] || '1px'} ${borderStyle || 'solid'} ${colorMap[borderColor || 'gray-400']}` : undefined),
        textAlign: textAlign as any,
        display,
        alignItems,
        justifyContent,
        gap: gap ? spacingMap[gap] : undefined,
        overflow,
        cursor: onClick ? 'pointer' : undefined,
        transition: hasHoverState ? 'background-color 0.15s ease, box-shadow 0.15s ease' : undefined,
        ...style
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Typography
// ============================================================================

interface TextProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  size?: string;
  bold?: boolean;
  fontFamily?: 'body' | 'heading' | 'inherit' | string;
  color?: string;
  truncate?: boolean;
  textAlign?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  padding?: string;
}

const textSizeMap: Record<string, string> = {
  '100': '12px',
  '200': '14px',
  '300': '16px',
  '400': '20px',
  '500': '24px',
  '600': '30px',
};

const bodyLineHeightMap: Record<string, string> = {
  '100': '16px',
  '200': '20px',
  '300': '20px',
  '400': '24px',
  '500': '32px',
  '600': '36px',
  '700': '48px',
  '800': '60px',
};

const headingLineHeightMap: Record<string, string> = {
  '200': '18px',
  '300': '20px',
  '400': '24px',
  '500': '28px',
  '600': '36px',
  '700': '42px',
  '800': '54px',
};

const headingLetterSpacingMap: Record<string, string> = {
  '200': '0.012em',
  '300': '0.01em',
  '400': '0.008em',
  '500': '0.006em',
  '600': '0.004em',
  '700': '0.002em',
  '800': 'normal',
};

export function Text({
  children,
  as: Component = 'span',
  size = '200',
  bold,
  fontFamily,
  color,
  truncate,
  textAlign,
  style,
  onClick,
  padding
}: TextProps) {
  const sizeKey = String(size);
  const isTokenSize = /^\d+$/.test(sizeKey);
  const tokenSize = isTokenSize ? Number.parseInt(sizeKey, 10) : null;
  const inferredFamily = isTokenSize && tokenSize !== null && tokenSize >= 300 ? 'heading' : 'body';
  const familyType = fontFamily ?? inferredFamily;
  const resolvedFontFamily =
    familyType === 'heading'
      ? "'Garant', 'Open Sans', Arial, sans-serif"
      : familyType === 'body'
        ? "'Open Sans', Arial, sans-serif"
        : familyType;
  const resolvedLineHeight =
    isTokenSize
      ? (familyType === 'heading'
          ? headingLineHeightMap[sizeKey]
          : bodyLineHeightMap[sizeKey])
      : undefined;
  const resolvedLetterSpacing =
    isTokenSize && familyType === 'heading'
      ? headingLetterSpacingMap[sizeKey]
      : undefined;

  return (
    <Component
      style={{
        fontSize: textSizeMap[size] || size,
        fontWeight: bold ? 600 : 400,
        fontFamily: resolvedFontFamily,
        color: color ? colorMap[color] || color : 'inherit',
        lineHeight: resolvedLineHeight,
        letterSpacing: resolvedLetterSpacing,
        margin: 0,
        overflow: truncate ? 'hidden' : undefined,
        textOverflow: truncate ? 'ellipsis' : undefined,
        whiteSpace: truncate ? 'nowrap' : undefined,
        textAlign: textAlign as any,
        cursor: onClick ? 'pointer' : undefined,
        padding: padding ? spacingMap[padding] : undefined,
        ...style
      }}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

// ============================================================================
// Form Components
// ============================================================================

interface ButtonProps {
  children?: React.ReactNode;
  action?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  startIcon?: React.FC<any>;
  endIcon?: React.FC<any>;
  icon?: React.FC<any>;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
  form?: string;
  'aria-label'?: string;
  'aria-expanded'?: boolean;
  testId?: string;
}

export function Button({
  children,
  action = 'secondary',
  size = 'medium',
  startIcon: StartIcon,
  endIcon: EndIcon,
  icon: Icon,
  onClick,
  disabled,
  fullWidth,
  type = 'button',
  form,
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  /* Templafy Button sizes - real design system: small=24, medium=32, large=40 */
  const sizeStyles: Record<string, React.CSSProperties> = {
    xsmall: { padding: '0px 8px', fontSize: 12, minHeight: 24 },
    small: { padding: '2px 8px', fontSize: 14, minHeight: 24 },
    medium: { padding: '4px 12px', fontSize: 14, minHeight: 32 },
    large: { padding: '8px 16px', fontSize: 14, minHeight: 40 },
  };

  /* Templafy button styles - Primary: #4A61ED (primary-700) */
  const actionStyles: Record<string, { base: React.CSSProperties; hover: React.CSSProperties; active: React.CSSProperties }> = {
    primary: {
      base: {
        background: '#4A61ED',
        color: 'white',
        border: '1px solid transparent',
      },
      hover: {
        background: '#244AB8',
      },
      active: {
        background: '#153075',
      },
    },
    secondary: {
      base: {
        background: 'rgba(70, 70, 70, 0.13)',
        color: '#232323',
        border: '1px solid transparent',
      },
      hover: {
        background: 'rgba(70, 70, 70, 0.20)',
      },
      active: {
        background: 'rgba(70, 70, 70, 0.28)',
      },
    },
    tertiary: {
      base: {
        background: 'transparent',
        color: '#898989',
        border: '1px solid transparent',
      },
      hover: {
        background: 'rgba(27, 27, 27, 0.05)',
        color: '#232323',
      },
      active: {
        background: 'rgba(27, 27, 27, 0.10)',
        color: '#232323',
      },
    },
    destructive: {
      base: {
        background: '#BC5257',
        color: 'white',
        border: '1px solid #BC5257',
      },
      hover: {
        background: '#9F2832',
        borderColor: '#9F2832',
      },
      active: {
        background: '#9F2832',
        borderColor: '#9F2832',
      },
    },
  };

  const currentAction = actionStyles[action] || actionStyles.secondary;
  const currentStyles = disabled
    ? { background: '#DFDFDF', color: '#BABABA', border: '1px solid #DFDFDF' }
    : isActive
      ? { ...currentAction.base, ...currentAction.active }
      : isHovered
        ? { ...currentAction.base, ...currentAction.hover }
        : currentAction.base;

  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      style={{
        /* Templafy Button - Auto layout per spec */
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        isolation: 'isolate',
        ...sizeStyles[size],
        ...currentStyles,
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : undefined,
        fontWeight: 600,
        fontFamily: 'inherit',
        transition: 'background 0.15s ease, border-color 0.15s ease',
        whiteSpace: 'nowrap',
        flex: 'none',
        flexGrow: 0,
        outline: 'none',
      }}
    >
      {StartIcon && <StartIcon size="small" color={action === 'primary' ? 'white' : 'currentColor'} />}
      {Icon && !children && <Icon size="small" color={action === 'primary' ? 'white' : 'currentColor'} />}
      {children}
      {EndIcon && <EndIcon size="small" color={action === 'primary' ? 'white' : 'currentColor'} />}
    </button>
  );
}

// ============================================================================
// ActionCard Component (Product component from Templafy design system)
// ============================================================================

interface ActionCardProps {
  title: string;
  description?: string;
  icon?: React.FC<any>;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'highlight';
  style?: React.CSSProperties;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  disabled,
  variant = 'default',
  style,
}: ActionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    background: variant === 'highlight' ? '#F0F9FF' : '#FFFFFF',
    border: `1px solid ${variant === 'highlight' ? '#BAE6FD' : '#DFDFDF'}`,
    borderRadius: 8,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  const hoverStyles: React.CSSProperties = isHovered && !disabled ? {
    borderColor: variant === 'highlight' ? '#0284C7' : '#BABABA',
    background: variant === 'highlight' ? '#E0F2FE' : '#F9FAFB',
  } : {};

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...baseStyles,
        ...hoverStyles,
        ...style,
      }}
    >
      {Icon && (
        <Icon size={18} color={variant === 'highlight' ? '#0284C7' : '#898989'} style={{ flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, textAlign: Icon ? 'left' : 'center' }}>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          color: '#464646',
          marginBottom: description ? 2 : 0,
        }}>
          {title}
        </div>
        {description && (
          <div style={{
            fontSize: 14,
            color: '#737373',
          }}>
            {description}
          </div>
        )}
      </div>
    </button>
  );
}

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'small' | 'medium' | 'large';
  prefix?: React.FC<any>;
  suffix?: any[];
  style?: React.CSSProperties;
}

export function TextInput({
  value,
  onChange,
  onBlur,
  onKeyDown,
  placeholder,
  autoFocus,
  size = 'medium',
  style,
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sizeStyles: Record<string, React.CSSProperties> = {
    small: { padding: '2px 8px', fontSize: 14, minHeight: 24 },
    medium: { padding: '4px 12px', fontSize: 14, minHeight: 32 },
    large: { padding: '8px 12px', fontSize: 14, minHeight: 40 },
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => { setIsFocused(false); onBlur?.(); }}
      onFocus={() => setIsFocused(true)}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      style={{
        ...sizeStyles[size],
        border: `1px solid ${isFocused ? '#4A61ED' : isHovered ? '#464646' : '#898989'}`,
        borderRadius: 6,
        outline: isFocused ? '2px solid #6F81F1' : 'none',
        outlineOffset: 1,
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        color: '#323232',
        background: 'white',
        transition: 'border-color 0.15s ease',
        ...style,
      }}
    />
  );
}

// ============================================================================
// Select
// ============================================================================

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

interface SelectProps<T = string> {
  options: SelectOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export function Select<T extends string = string>({
  options,
  value,
  onChange,
  placeholder,
  style,
}: SelectProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <select
      value={value ?? ''}
      onChange={(e) => {
        const val = e.target.value as T;
        onChange(val || null);
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '4px 12px',
        fontSize: 14,
        minHeight: 32,
        border: `1px solid ${isFocused ? '#4A61ED' : isHovered ? '#464646' : '#898989'}`,
        borderRadius: 6,
        outline: isFocused ? '2px solid #6F81F1' : 'none',
        outlineOffset: 1,
        width: '100%',
        boxSizing: 'border-box' as const,
        fontFamily: 'inherit',
        color: '#323232',
        background: 'white',
        transition: 'border-color 0.15s ease',
        cursor: 'pointer',
        appearance: 'none' as const,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23898989' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: 32,
        ...style,
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={String(opt.value)} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextArea({ value, onChange, placeholder, rows = 3 }: TextAreaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      placeholder={placeholder}
      rows={rows}
      style={{
        padding: '4px 12px',
        fontSize: 14,
        border: `1px solid ${isFocused ? '#4A61ED' : isHovered ? '#464646' : '#898989'}`,
        borderRadius: 6,
        outline: isFocused ? '2px solid #6F81F1' : 'none',
        outlineOffset: 1,
        width: '100%',
        boxSizing: 'border-box',
        resize: 'vertical',
        fontFamily: 'inherit',
        color: '#323232',
        transition: 'border-color 0.15s ease',
      }}
    />
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute',
        left: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#737373',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        placeholder={placeholder}
        style={{
          padding: '4px 12px 4px 38px',
          fontSize: 14,
          minHeight: 32,
          border: `1px solid ${isFocused ? '#4A61ED' : isHovered ? '#464646' : '#898989'}`,
          borderRadius: 6,
          outline: isFocused ? '2px solid #6F81F1' : 'none',
          outlineOffset: 1,
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          color: '#323232',
          background: 'white',
          transition: 'border-color 0.15s ease',
        }}
      />
    </div>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Switch({ checked, onChange }: SwitchProps) {
  const [isHovered, setIsHovered] = useState(false);

  const bgColor = checked
    ? (isHovered ? '#244AB8' : '#4A61ED')
    : (isHovered ? '#FAFAFA' : '#FFFFFF');
  const borderColor = checked
    ? (isHovered ? '#244AB8' : '#4A61ED')
    : (isHovered ? '#464646' : '#898989');
  const bulletColor = checked
    ? '#FFFFFF'
    : (isHovered ? '#464646' : '#898989');

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: 32,
        height: 16,
        borderRadius: '20em',
        border: `1.5px solid ${borderColor}`,
        background: bgColor,
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s, border-color 0.2s',
        flexShrink: 0,
        boxSizing: 'border-box',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 1,
          left: checked ? 16 : 1,
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: bulletColor,
          transition: 'left 0.2s, background 0.2s',
        }}
      />
    </button>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 3,
          border: checked ? `1.5px solid ${isHovered ? '#244AB8' : '#4A61ED'}` : `1.5px solid ${isHovered ? '#464646' : '#898989'}`,
          background: checked ? (isHovered ? '#244AB8' : '#4A61ED') : (isHovered ? '#FAFAFA' : '#FFFFFF'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.15s ease',
          boxSizing: 'border-box',
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {label && (
        <span style={{ fontSize: 14, color: '#323232', lineHeight: '20px' }}>
          {label}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// RadioGroup
// ============================================================================

interface RadioGroupContextValue {
  value: string | undefined;
  onChange: (value: string) => void;
  name: string;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

interface RadioGroupProps {
  children: React.ReactNode;
  value: string | undefined;
  onChange: (value: string) => void;
  name: string;
  disabled?: boolean;
  direction?: 'column' | 'row';
}

export function RadioGroup({ children, value, onChange, name, disabled, direction = 'column' }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onChange, name, disabled }}>
      <div style={{ display: 'flex', flexDirection: direction, gap: 8 }}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioProps {
  value: string;
  label: React.ReactNode;
  helpMessage?: string;
  status?: string;
  size?: string;
  tooltip?: string;
}

RadioGroup.Radio = function Radio({ value, label }: RadioProps) {
  const context = useContext(RadioGroupContext);
  if (!context) return null;

  const isSelected = context.value === value;

  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
      <input
        type="radio"
        name={context.name}
        value={value}
        checked={isSelected}
        onChange={() => context.onChange(value)}
        disabled={context.disabled}
        style={{ marginTop: 3, width: 16, height: 16 }}
      />
      <span style={{ flex: 1 }}>{label}</span>
    </label>
  );
};

// ============================================================================
// Form
// ============================================================================

interface FormProps {
  children: React.ReactNode;
  id?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

export function Form({ children, id, onSubmit }: FormProps) {
  return (
    <form id={id} onSubmit={(e) => { e.preventDefault(); onSubmit?.(e); }}>
      {children}
    </form>
  );
}

Form.Field = function Field({ children, direction, gap, style }: { children: React.ReactNode; direction?: string; gap?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: direction === 'row' ? 'row' : 'column',
      gap: gap ? spacingMap[gap] : 4,
      marginBottom: 16,
      alignItems: direction === 'row' ? 'center' : undefined,
      ...style
    }}>
      {children}
    </div>
  );
};

Form.Label = function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <label style={{ fontWeight: 500, fontSize: 14, ...style }}>{children}</label>;
};

Form.HelpMessage = function HelpMessage({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 12, color: '#737373' }}>{children}</span>;
};

Form.ValidationMessage = function ValidationMessage({ children }: { children: React.ReactNode }) {
  return children ? <span style={{ fontSize: 12, color: '#464646' }}>{children}</span> : null;
};

Form.FieldSet = function FieldSet({ children, title, description }: { children: React.ReactNode; title?: string; description?: string }) {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px 0' }}>
      {title && <legend style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{title}</legend>}
      {description && <p style={{ fontSize: 14, color: '#737373', margin: '0 0 16px 0' }}>{description}</p>}
      {children}
    </fieldset>
  );
};

// ============================================================================
// Tag
// ============================================================================

interface TagProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'default' | 'subtle';
  onRemove?: () => void;
}

const tagColorMap: Record<string, { bg: string; text: string }> = {
  neutral: { bg: '#EBEBEB', text: '#464646' },
  success: { bg: '#D1E0BD', text: '#464646' },
  purple: { bg: '#EDE9FE', text: '#6D28D9' },
  blue: { bg: '#E8EAFC', text: '#4A61ED' },
  orange: { bg: '#FFEDD5', text: '#C2410C' },
  gray: { bg: '#EBEBEB', text: '#464646' },
  danger: { bg: '#F5D5C9', text: '#464646' },
  warning: { bg: '#EDD69F', text: '#464646' },
};

export function Tag({ children, color = 'neutral', variant = 'default' }: TagProps) {
  const colors = tagColorMap[color] || tagColorMap.neutral;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0 8px',
      borderRadius: '20em',
      fontSize: 12,
      fontWeight: 600,
      minHeight: 20,
      gap: 2,
      boxSizing: 'border-box',
      backgroundColor: colors.bg,
      color: colors.text,
    }}>
      {children}
    </span>
  );
}

// ============================================================================
// Breadcrumbs
// ============================================================================

interface BreadcrumbsProps {
  children: React.ReactNode;
}

export function Breadcrumbs({ children }: BreadcrumbsProps) {
  const items = React.Children.toArray(children);

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {items.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < items.length - 1 && <span style={{ color: '#737373' }}>/</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

Breadcrumbs.Item = function Item({
  children,
  href,
  onClick
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void
}) {
  const isClickable = href || onClick;

  return (
    <span
      onClick={onClick}
      style={{
        fontSize: 14,
        color: '#323232',
        fontWeight: isClickable ? 400 : 600,
        cursor: isClickable ? 'pointer' : 'default',
        textDecoration: 'none',
      }}
    >
      {children}
    </span>
  );
};

// ============================================================================
// DropdownMenu
// ============================================================================

interface DropdownMenuContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  triggerRef: React.RefObject<HTMLDivElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) {
        return;
      }
      if (contentRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    // Use 'click' instead of 'mousedown' to allow menu items to handle their clicks first
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, containerRef, triggerRef, contentRef }}>
      <div ref={containerRef} style={{ position: 'relative' }}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

DropdownMenu.Trigger = function Trigger({ children, fullWidth }: { children: React.ReactNode; fullWidth?: boolean }) {
  const context = useContext(DropdownMenuContext);
  if (!context) return null;

  return (
    <div
      ref={context.triggerRef}
      style={{ display: fullWidth ? 'flex' : 'inline-flex' }}
      onClick={() => context.setIsOpen(!context.isOpen)}
    >
      {children}
    </div>
  );
};

DropdownMenu.Content = function Content({ children, matchTriggerWidth }: { children: React.ReactNode; matchTriggerWidth?: boolean }) {
  const context = useContext(DropdownMenuContext);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!context?.isOpen) {
      return;
    }

    const updatePosition = () => {
      const triggerNode = context.triggerRef.current;
      const contentNode = context.contentRef.current;
      if (!triggerNode || !contentNode) {
        return;
      }

      const rect = triggerNode.getBoundingClientRect();
      const menuRect = contentNode.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const edgePadding = 8;

      if (matchTriggerWidth) {
        setTriggerWidth(rect.width);
      }

      const menuWidth = matchTriggerWidth ? rect.width : menuRect.width;
      const left = Math.min(
        Math.max(rect.left, edgePadding),
        Math.max(edgePadding, viewportWidth - menuWidth - edgePadding),
      );

      const belowTop = rect.bottom + 4;
      const aboveTop = rect.top - menuRect.height - 4;
      const fitsBelow = belowTop + menuRect.height <= viewportHeight - edgePadding;
      const top = fitsBelow ? belowTop : Math.max(edgePadding, aboveTop);

      setPosition({
        top,
        left,
      });
    };

    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [context?.isOpen, matchTriggerWidth]);

  if (!context) return null;

  return (
    <>
      {context.isOpen && ReactDOM.createPortal(
        <div
          ref={context.contentRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '8px 0px',
            minWidth: matchTriggerWidth ? triggerWidth : 128,
            maxWidth: matchTriggerWidth ? undefined : 384,
            width: matchTriggerWidth ? triggerWidth : 'auto',
            background: '#FFFFFF',
            boxShadow: '0px 0px 0px 1px rgba(41, 48, 56, 0.06), 0px 2px 4px rgba(41, 48, 56, 0.03), 0px 6px 12px rgba(41, 48, 56, 0.03)',
            borderRadius: 6,
            zIndex: 10000,
          }}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
};

DropdownMenu.Item = function Item({
  children,
  onClick,
  destructive,
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  destructive?: boolean;
  icon?: React.FC<any>;
}) {
  const context = useContext(DropdownMenuContext);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
        context?.setIsOpen(false);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 4,
        width: '100%',
        padding: '8px 8px',
        border: 'none',
        background: isHovered ? '#F1F1F1' : 'transparent',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 400,
        color: '#464646',
        transition: 'background 0.1s ease',
        fontFamily: 'inherit',
      }}
    >
      {Icon && <Icon size="small" color={destructive ? '#BC5257' : '#898989'} style={{ marginTop: 2, flexShrink: 0 }} />}
      {children}
    </button>
  );
};

DropdownMenu.Separator = function Separator() {
  return <div style={{ height: 1, background: '#DFDFDF', margin: '4px 0' }} />;
};

// ============================================================================
// Drawer
// ============================================================================

interface DrawerProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}

export function Drawer({ children, open, onClose }: DrawerProps) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 1000,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 480,
          background: 'white',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </>
  );
}

Drawer.Header = function Header({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid #DFDFDF' }}>
      <h2 style={{ margin: 0, fontSize: 18, fontFamily: "'Garant', 'Open Sans', Arial, sans-serif" }}>{title}</h2>
      {children}
    </div>
  );
};

Drawer.Body = function Body({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24, scrollbarGutter: 'stable' } as React.CSSProperties}>
      {children}
    </div>
  );
};

Drawer.Footer = function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 16, borderTop: '1px solid #DFDFDF' }}>
      {children}
    </div>
  );
};

// ============================================================================
// Modal (centered dialog)
// ============================================================================

interface ModalProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

export function Modal({ children, open, onClose, size = 'medium' }: ModalProps) {
  if (!open) return null;

  const widths = {
    small: 384,
    medium: 512,
    large: 614,
    fullscreen: '100%',
  };

  const isFullscreen = size === 'fullscreen';

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: isFullscreen ? 'white' : 'rgba(0,0,0,0.4)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={isFullscreen ? undefined : onClose}
      >
        <div
          style={{
            width: widths[size],
            height: isFullscreen ? '100vh' : '64vh',
            maxHeight: isFullscreen ? '100vh' : '90vh',
            background: 'white',
            borderRadius: isFullscreen ? 0 : 12,
            boxShadow: isFullscreen ? 'none' : '0 8px 32px rgba(0,0,0,0.2)',
            zIndex: 1101,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
}

Modal.Header = function Header({ title, onClose, children }: { title: string; onClose?: () => void; children?: React.ReactNode }) {
  return (
    <div style={{
      padding: '20px 24px',
      borderBottom: '1px solid #DFDFDF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {children}
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, fontFamily: "'Garant', 'Open Sans', Arial, sans-serif" }}>{title}</h2>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            color: '#737373',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
};

Modal.Body = function Body({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
      {children}
    </div>
  );
};

Modal.Footer = function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '16px 24px', borderTop: '1px solid #DFDFDF' }}>
      {children}
    </div>
  );
};

// ============================================================================
// Collapse
// ============================================================================

interface CollapseProps {
  children: React.ReactNode;
  open: boolean;
  direction?: 'vertical' | 'horizontal';
}

export function Collapse({ children, open }: CollapseProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(open ? undefined : 0);

  useEffect(() => {
    if (open) {
      setHeight(ref.current?.scrollHeight);
      const timeout = setTimeout(() => setHeight(undefined), 200);
      return () => clearTimeout(timeout);
    } else {
      setHeight(ref.current?.scrollHeight);
      requestAnimationFrame(() => setHeight(0));
    }
  }, [open]);

  return (
    <div
      ref={ref}
      style={{
        height: height === undefined ? 'auto' : height,
        overflow: 'hidden',
        transition: 'height 0.2s ease',
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Tooltip
// ============================================================================

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - 8;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 8;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 8;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 8;
          break;
      }

      setCoords({ top, left });
    }
    setIsVisible(true);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </div>
      {isVisible && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            top: position === 'top' ? coords.top : position === 'bottom' ? coords.top : coords.top,
            left: coords.left,
            transform: position === 'top'
              ? 'translate(-50%, -100%)'
              : position === 'bottom'
                ? 'translate(-50%, 0)'
                : position === 'left'
                  ? 'translate(-100%, -50%)'
                  : 'translate(0, -50%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '4px 8px',
            gap: 10,
            background: '#232323',
            color: '#737373',
            borderRadius: 3,
            fontSize: 12,
            lineHeight: 1.5,
            zIndex: 10001,
            maxWidth: 320,
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}

// ============================================================================
// SortableList (simplified mock)
// ============================================================================

interface SortableListContextValue {
  activeId: string | null;
  draggedId: string | null;
  dragOverId: string | null;
  direction: 'vertical' | 'horizontal';
  dragActivation: 'item' | 'handle';
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}

const SortableListContext = createContext<SortableListContextValue | null>(null);

interface SortableListProps {
  children: React.ReactNode;
  items: Array<{ id: string } | string>;
  activeId?: string | null;
  onActiveId?: (id: string | null) => void;
  onSortUpdate?: (items: any[]) => void;
  onReorder?: (ids: string[]) => void;
  enableGrouping?: boolean;
  direction?: 'vertical' | 'horizontal';
  dragActivation?: 'item' | 'handle';
  gap?: number | string;
}

export function SortableList({
  children,
  items,
  activeId: externalActiveId,
  onActiveId: externalOnActiveId,
  onSortUpdate,
  onReorder,
  direction = 'vertical',
  dragActivation = 'item',
  gap = 12,
}: SortableListProps) {
  const [internalActiveId, setInternalActiveId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const activeId = externalActiveId ?? internalActiveId;
  const onActiveId = externalOnActiveId ?? setInternalActiveId;

  // Normalize items to get IDs
  const getItemId = (item: { id: string } | string) => typeof item === 'string' ? item : item.id;

  const handleDragStart = (id: string) => {
    setDraggedId(id);
    onActiveId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      onActiveId(null);
      return;
    }

    const itemIds = items.map(getItemId);
    const draggedIndex = itemIds.indexOf(draggedId);
    const targetIndex = itemIds.indexOf(targetId);

    const newIds = [...itemIds];
    const [removed] = newIds.splice(draggedIndex, 1);
    newIds.splice(targetIndex, 0, removed);

    // Call onReorder if provided (simpler API)
    if (onReorder) {
      onReorder(newIds);
    }
    // Also call onSortUpdate for backwards compatibility
    if (onSortUpdate) {
      const newItems = newIds.map(id => items.find(item => getItemId(item) === id)!);
      onSortUpdate(newItems);
    }

    setDraggedId(null);
    setDragOverId(null);
    onActiveId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    onActiveId(null);
  };

  const contextValue: SortableListContextValue = {
    activeId,
    draggedId,
    dragOverId,
    direction,
    dragActivation,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    onDragEnd: handleDragEnd,
  };

  return (
    <SortableListContext.Provider value={contextValue}>
      <div
        style={{
          display: 'flex',
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
          flexWrap: direction === 'horizontal' ? 'wrap' : 'nowrap',
          gap,
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        {children}
      </div>
    </SortableListContext.Provider>
  );
}

interface SortableItemProps {
  children: React.ReactNode | ((props: { isDragging: boolean }) => React.ReactNode);
  id: string;
  style?: React.CSSProperties;
}

SortableList.Item = function Item({
  children,
  id,
  style,
}: SortableItemProps) {
  const context = useContext(SortableListContext);
  if (!context) return <div style={style}>{typeof children === 'function' ? children({ isDragging: false }) : children}</div>;

  const { draggedId, dragOverId, direction, dragActivation, onDragStart, onDragOver, onDrop, onDragEnd } = context;
  const isDragging = draggedId === id;
  const isDragOver = dragOverId === id && draggedId !== id;
  const isHorizontal = direction === 'horizontal';
  const dragHandleArmedRef = useRef(false);

  const isEventFromDragHandle = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest('[data-sortable-drag-handle="true"]'));
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        if (dragActivation === 'handle' && !dragHandleArmedRef.current) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        onDragStart(id);
      }}
      onDragOver={(e) => onDragOver(e, id)}
      onDrop={(e) => onDrop(e, id)}
      onDragEnd={() => {
        dragHandleArmedRef.current = false;
        onDragEnd();
      }}
      onMouseDownCapture={(e) => {
        if (dragActivation !== 'handle') return;
        dragHandleArmedRef.current = isEventFromDragHandle(e.target);
      }}
      onMouseUp={() => {
        dragHandleArmedRef.current = false;
      }}
      onTouchStartCapture={(e) => {
        if (dragActivation !== 'handle') return;
        dragHandleArmedRef.current = isEventFromDragHandle(e.target);
      }}
      onTouchEnd={() => {
        dragHandleArmedRef.current = false;
      }}
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.01)' : 'scale(1)',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        position: 'relative',
        cursor: dragActivation === 'handle' ? 'default' : 'grab',
        ...style,
      }}
    >
      {/* Drop indicator line - vertical for horizontal lists, horizontal for vertical lists */}
      {isDragOver && (
        <div style={isHorizontal ? {
          position: 'absolute',
          left: -6,
          top: 0,
          bottom: 0,
          width: 3,
          background: '#4A61ED',
          borderRadius: 2,
          zIndex: 10,
        } : {
          position: 'absolute',
          top: -6,
          left: 40,
          right: 0,
          height: 3,
          background: '#4A61ED',
          borderRadius: 2,
          zIndex: 10,
        }} />
      )}
      {typeof children === 'function' ? children({ isDragging }) : children}
    </div>
  );
};

SortableList.DragHandle = function DragHandle() {
  return (
    <span
      data-sortable-drag-handle="true"
      style={{
        cursor: 'grab',
        padding: '8px',
        color: '#737373',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        transition: 'background 0.15s ease, color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#F1F1F1';
        e.currentTarget.style.color = '#464646';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#737373';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="5" cy="3" r="1.5" />
        <circle cx="11" cy="3" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="13" r="1.5" />
        <circle cx="11" cy="13" r="1.5" />
      </svg>
    </span>
  );
};

SortableList.BaseItem = function BaseItem({ children, clone }: { children: React.ReactNode; clone?: boolean }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #DFDFDF',
      borderRadius: 12,
      boxShadow: clone ? '0 8px 24px rgba(0,0,0,0.2)' : undefined,
    }}>
      {children}
    </div>
  );
};

SortableList.DragOverlay = function DragOverlay({ children }: { children: React.ReactNode }) {
  const context = useContext(SortableListContext);
  if (!context?.activeId) return null;
  return null;
};

// ============================================================================
// Tabs (simplified)
// ============================================================================

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export const Tabs = {
  Provider: function Provider({
    children,
    value,
    onChange
  }: {
    children: React.ReactNode;
    value: string;
    onChange: (value: string) => void;
  }) {
    return (
      <TabsContext.Provider value={{ value, onChange }}>
        {children}
      </TabsContext.Provider>
    );
  },

  List: function List({ children }: { children: React.ReactNode }) {
    return (
      <div style={{ display: 'flex', gap: 0, marginTop: 12 }}>
        {children}
      </div>
    );
  },

  Tab: function Tab({ children, value }: { children: React.ReactNode; value: string }) {
    const context = useContext(TabsContext);
    if (!context) return null;

    const isSelected = context.value === value;

    return (
      <button
        onClick={() => context.onChange(value)}
        style={{
          padding: '8px 16px',
          border: 'none',
          background: 'none',
          borderBottom: isSelected ? '2px solid #232323' : '2px solid transparent',
          color: isSelected ? '#323232' : '#737373',
          cursor: 'pointer',
          fontWeight: isSelected ? 500 : 400,
          fontSize: 14,
          marginBottom: -1,
        }}
      >
        {children}
      </button>
    );
  },

  Panel: function Panel({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
};

// ============================================================================
// Utility Components
// ============================================================================

export function VisuallyHidden({ children, as: Component = 'span' }: { children: React.ReactNode; as?: any }) {
  return (
    <Component style={{
      position: 'absolute',
      width: 1,
      height: 1,
      padding: 0,
      margin: -1,
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0,
    }}>
      {children}
    </Component>
  );
}

export function SideMenuPlaceholder() {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ color: '#737373', fontWeight: 600, marginBottom: 24 }}>Templafy</div>
      <div style={{ color: '#737373', fontSize: 12 }}>Menu placeholder</div>
    </div>
  );
}

// ============================================================================
// Icons (FrontendPlatform adapters)
// ============================================================================

type LocalIconSize = 'xsmall' | 'small' | 'medium' | 'large';
type FrontendPlatformIconSize = 'extra-small' | 'small' | 'normal' | 'large';

interface IconProps {
  size?: LocalIconSize | number;
  color?: string;
  rotation?: number;
  className?: string;
  style?: React.CSSProperties;
}

type FrontendPlatformIconComponent = React.ComponentType<any>;

const iconSizeMap: Record<LocalIconSize, FrontendPlatformIconSize> = {
  xsmall: 'extra-small',
  small: 'small',
  medium: 'normal',
  large: 'large',
};

function normalizeIconSize(size: IconProps['size']) {
  if (typeof size === 'number') {
    return {
      size: 'normal' as FrontendPlatformIconSize,
      style: { width: `${size}px`, height: `${size}px` } as React.CSSProperties,
    };
  }

  return {
    size: iconSizeMap[size ?? 'medium'],
    style: undefined,
  };
}

function createFrontendPlatformIcon(
  IconComponent: FrontendPlatformIconComponent,
  options?: { rotation?: number },
) {
  return function Icon({
    size = 'medium',
    color,
    rotation,
    className,
    style,
  }: IconProps) {
    const normalizedSize = normalizeIconSize(size);

    return (
      <IconComponent
        size={normalizedSize.size}
        color={color}
        className={className}
        style={{
          ...style,
          ...normalizedSize.style,
        }}
        rotation={rotation ?? options?.rotation}
      />
    );
  };
}

export const IconAdd = createFrontendPlatformIcon(FrontendPlatformIconPlus);
export const IconMoreVertical = createFrontendPlatformIcon(FrontendPlatformIconDots, { rotation: 90 });
export const IconPresentation = createFrontendPlatformIcon(FrontendPlatformIconPresentation);
export const IconChevronDown = createFrontendPlatformIcon(FrontendPlatformIconChevron, { rotation: 0 });
export const IconChevronRight = createFrontendPlatformIcon(FrontendPlatformIconChevron, { rotation: 270 });
export const IconClose = createFrontendPlatformIcon(FrontendPlatformIconClose);
export const IconTrash = createFrontendPlatformIcon(FrontendPlatformIconBin);
export const IconSparkle = createFrontendPlatformIcon(FrontendPlatformIconAiStar);
export const IconFolder = createFrontendPlatformIcon(FrontendPlatformIconFolder);
export const IconFolderOpen = createFrontendPlatformIcon(FrontendPlatformIconFolderDynamic);
export const IconSearch = createFrontendPlatformIcon(FrontendPlatformIconSearch);
export const IconLayers = createFrontendPlatformIcon(FrontendPlatformIconColumns);
export const IconList = createFrontendPlatformIcon(FrontendPlatformIconViewList);
export const IconArrowLeft = createFrontendPlatformIcon(FrontendPlatformIconArrow, { rotation: -90 });
export const IconArrow = createFrontendPlatformIcon(FrontendPlatformIconArrow);
export const IconCheck = createFrontendPlatformIcon(FrontendPlatformIconCheckmark);
export const IconHelp = createFrontendPlatformIcon(FrontendPlatformIconQuestionMark);
export const IconEdit = createFrontendPlatformIcon(FrontendPlatformIconEdit);
export const IconCopy = createFrontendPlatformIcon(FrontendPlatformIconDuplicate);
export const IconDuplicate = createFrontendPlatformIcon(FrontendPlatformIconDuplicate);
export const IconPlay = createFrontendPlatformIcon(FrontendPlatformIconPlay);
export const IconUpdates = createFrontendPlatformIcon(FrontendPlatformIconUpdates);
