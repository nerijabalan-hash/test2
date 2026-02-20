import {
  SortableList,
  Text,
  TextArea,
  IconChevronDown,
  IconHelp,
  IconSparkle,
  IconTrash,
} from '../ui';
import { AIGap } from '../data/mockData';

interface AIGapItemProps {
  gap: AIGap;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateGuidance: (guidance: string) => void;
  onDelete: () => void;
}

/**
 * AIGapItem - Renders an AI gap marker in the outline
 * Visual style: dashed border, robot icon, distinct from regular sections
 */
export function AIGapItem({
  gap,
  isExpanded,
  onToggleExpand,
  onUpdateGuidance,
  onDelete,
}: AIGapItemProps) {
  return (
    <SortableList.Item id={gap.id} style={{ border: 0, padding: 0 }}>
      {({ isDragging }) => (
        <div
          style={{
            background: isExpanded ? '#FEFCE8' : '#FFFEF5',
            border: isExpanded ? '2px dashed #EAB308' : '2px dashed #FDE047',
            borderRadius: 12,
            overflow: 'hidden',
            transition: 'border-color 0.15s ease, background 0.15s ease',
            opacity: isDragging ? 0.8 : 1,
          }}
        >
          {/* Header - clickable to expand/collapse */}
          <div
            onClick={onToggleExpand}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              cursor: 'pointer',
            }}
          >
            {/* Drag handle */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'grab', color: '#464646' }}
            >
              <SortableList.DragHandle />
            </div>

            {/* Expand/collapse chevron */}
            <div
              style={{
                color: '#464646',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <IconChevronDown size="small" />
            </div>

            {/* Robot icon */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: '#FEF9C3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconSparkle size="small" color="#CA8A04" />
            </div>

            {/* Title and guidance preview */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="200" bold fontFamily="heading" style={{ color: '#464646' }}>
                AI Expansion Point
              </Text>
              {!isExpanded && gap.guidance && (
                <div style={{ fontSize: 12, color: '#464646', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {gap.guidance.length > 50 ? gap.guidance.substring(0, 50) + '...' : gap.guidance}
                </div>
              )}
              {!isExpanded && !gap.guidance && (
                <div style={{ fontSize: 12, color: '#464646', marginTop: 2 }}>
                  AI can add sections here based on user input
                </div>
              )}
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 6,
                cursor: 'pointer',
                color: '#737373',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FEF9C3';
                e.currentTarget.style.color = '#737373';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#737373';
              }}
              aria-label="Remove AI gap"
            >
              <IconTrash size="small" />
            </button>
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div
              style={{
                padding: '0 16px 16px 16px',
                borderTop: '1px dashed #FDE047',
              }}
            >
              <div style={{ paddingTop: 16 }}>
                {/* Info banner */}
                <div
                  style={{
                    padding: '12px 14px',
                    background: '#FEF9C3',
                    border: '1px solid #FDE047',
                    borderRadius: 8,
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <IconHelp size={18} color="#CA8A04" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ fontSize: 14, color: '#464646', lineHeight: 1.4 }}>
                    AI can insert additional sections here based on the end user's input. Use the guidance below to control what types of sections the AI should add.
                  </div>
                </div>

                {/* Guidance textarea */}
                <div>
                  <label
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#464646',
                      marginBottom: 8,
                      display: 'block',
                    }}
                  >
                    Guidance for AI{' '}
                    <span style={{ fontWeight: 400, color: '#464646' }}>(optional)</span>
                  </label>
                  <TextArea
                    value={gap.guidance || ''}
                    onChange={onUpdateGuidance}
                    placeholder="E.g., 'Add case studies or testimonials if user mentions customer success stories'"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </SortableList.Item>
  );
}
