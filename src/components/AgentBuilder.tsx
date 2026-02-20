import { CSSProperties, useState } from 'react';
import {
  AdminLayout,
  Box,
  Button,
  Form,
  Modal,
  Paper,
  SortableList,
  Stack,
  Tag,
  Text,
  TextArea,
  TextInput,
  VisuallyHidden,
  IconChevronDown,
  IconSparkle,
  IconAdd,
  IconMoreVertical,
} from '../ui';
import { PresentationAgent, Section, isAIGap, isSection } from '../data/mockData';
import { useAgentBuilder } from '../hooks/useAgentState';
import { SectionItem } from './SectionItem';
import { AIGapItem } from './AIGapItem';
import {
  accordionHeaderInteractive,
  accordionHeaderTriggerBase,
  handleAccordionHeaderTriggerKeyDown,
  surfaceSpacing,
} from './shared/surfaceStyles';

interface AgentBuilderProps {
  initialAgent: PresentationAgent;
  initialInstructions?: string | null;
  onBack: () => void;
  onSave: (agent: PresentationAgent) => void;
  isV2Enabled?: boolean;
}

/**
 * AgentBuilder - Outline-focused configuration screen for a Presentation Agent.
 * Stripped down to only Agent Details and Outline sections.
 */
export function AgentBuilder({
  initialAgent,
  onBack,
  onSave,
  isV2Enabled = false,
}: AgentBuilderProps) {
  const {
    agent,
    isDirty,
    activeId,
    setActiveId,
    updateName,
    updateDescription,
    reorderOutline,
    addSection,
    addAIGap,
    deleteSection,
    deleteAIGap,
    duplicateSection,
    updateSectionTitle,
    updateSectionInstructions,
    updateSectionFreeformGuidance,
    updateAIGapGuidance,
    updateSectionSlides,
    updateSectionAIExpansion,
    updateSectionAIExpansionGuidance,
    updateSectionQuestions,
    saveChanges,
  } = useAgentBuilder(initialAgent);

  const [newSectionId, setNewSectionId] = useState<string | null>(null);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [isNameDescriptionOpen, setIsNameDescriptionOpen] = useState(true);
  const [isOutlineOpen, setIsOutlineOpen] = useState(true);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);

  const nameDescriptionContentId = 'agent-builder-name-description-content';
  const outlineContentId = 'agent-builder-outline-content';
  const questionsContentId = 'agent-builder-questions-content';
  const configurationContentId = 'agent-builder-configuration-content';

  const handleSave = () => {
    saveChanges();
    onSave(agent);
  };

  return (
    <AdminLayout
      topBar={
        <AdminLayout.TopBar
          icon={IconSparkle}
          content={
            <Box display="flex" alignItems="center" gap="300" width="100%">
              <VisuallyHidden as="h1">Presentation</VisuallyHidden>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Text size="300" bold fontFamily="heading" color="gray-900" style={{ whiteSpace: 'nowrap' }}>
                  {agent.name || 'Untitled Agent'}
                </Text>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  height: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  borderRadius: 10,
                  background: agent.status === 'active' ? '#D1E0BD' : '#F1F1F1',
                  color: agent.status === 'active' ? '#464646' : '#737373',
                  boxSizing: 'border-box',
                  whiteSpace: 'nowrap',
                }}>
                  {agent.status === 'active' ? 'Active' : 'Draft'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                <Button
                  action={isDirty ? 'primary' : 'secondary'}
                  onClick={handleSave}
                  disabled={!isDirty}
                >
                  Save changes
                </Button>
              </div>
            </Box>
          }
        />
      }
    >
      <Box paddingTop="40px" maxWidth="900px" margin="0 auto" style={{ paddingBottom: 20 }}>
        <Stack gap="400">

          {/* Name & Description section */}
          <Paper shadow="100" padding="0" overflow="hidden">
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isNameDescriptionOpen}
              aria-controls={nameDescriptionContentId}
              onClick={() => setIsNameDescriptionOpen((prev) => !prev)}
              onKeyDown={(event) => handleAccordionHeaderTriggerKeyDown(event, () => setIsNameDescriptionOpen((prev) => !prev))}
              style={{
                ...accordionHeaderTriggerBase,
                ...accordionHeaderInteractive.base,
                padding: surfaceSpacing.accordion.header,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = accordionHeaderInteractive.hover.background;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = accordionHeaderInteractive.base.background;
              }}
            >
              <IconChevronDown
                size="small"
                color="#898989"
                style={{
                  transform: isNameDescriptionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text size="300" bold fontFamily="heading">Presentation details</Text>
                <Text size="200" color="gray-700" style={{ marginTop: 2, display: 'block' }}>
                  Define the presentation type and purpose
                </Text>
              </div>
            </div>
            {isNameDescriptionOpen && (
              <div id={nameDescriptionContentId} style={{ padding: surfaceSpacing.accordion.body, borderTop: '1px solid #DFDFDF' }}>
                <Stack gap="0" style={{ paddingTop: 16 }}>
                  <Form.Field>
                    <Form.Label>Document type</Form.Label>
                    <TextInput
                      value={agent.name}
                      onChange={(value) => updateName(value)}
                      placeholder="Enter document type name"
                    />
                  </Form.Field>

                  <Form.Field>
                    <Form.Label>User-facing description</Form.Label>
                    <TextInput
                      value={agent.description || ''}
                      onChange={(value) => updateDescription(value)}
                      placeholder="Describe what this document does"
                    />
                  </Form.Field>
                </Stack>
              </div>
            )}
          </Paper>

          {/* Outline / Sections configuration */}
          <Paper shadow="100" padding="0" overflow="hidden">
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isOutlineOpen}
              aria-controls={outlineContentId}
              onClick={() => setIsOutlineOpen((prev) => !prev)}
              onKeyDown={(event) => handleAccordionHeaderTriggerKeyDown(event, () => setIsOutlineOpen((prev) => !prev))}
              style={{
                ...accordionHeaderTriggerBase,
                ...accordionHeaderInteractive.base,
                padding: surfaceSpacing.accordion.header,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = accordionHeaderInteractive.hover.background;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = accordionHeaderInteractive.base.background;
              }}
            >
              <IconChevronDown
                size="small"
                color="#898989"
                style={{
                  transform: isOutlineOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Text size="300" bold fontFamily="heading">Outline</Text>
                  <Tag color="neutral">Optional</Tag>
                </div>
                <Text size="200" color="gray-700" style={{ marginTop: 2, display: 'block' }}>
                  Define structure of presentation with sections and slides
                </Text>
              </div>
            </div>

            {isOutlineOpen && (
              <div id={outlineContentId} style={{ padding: surfaceSpacing.accordion.body, borderTop: '1px solid #DFDFDF' }}>
                <Stack gap="200" style={{ paddingTop: 16 }}>
                  {/* Empty state callout */}
                  {(!agent.outline || agent.outline.length === 0) && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px 16px',
                      gap: 8,
                      background: '#FAFAFA',
                      border: '1.5px dashed #DFDFDF',
                      borderRadius: 10,
                    }}>
                      <span style={{ fontSize: 13, color: '#737373' }}>No sections yet — add one to define your outline</span>
                    </div>
                  )}

                  <SortableList
                    activeId={activeId}
                    items={agent.outline || []}
                    onActiveId={setActiveId}
                    onSortUpdate={reorderOutline}
                    dragActivation="handle"
                  >
                    {(agent.outline || []).map((item, index) => {
                      if (isAIGap(item)) {
                        return (
                          <AIGapItem
                            key={item.id}
                            gap={item}
                            isExpanded={expandedSectionId === item.id}
                            onToggleExpand={() => setExpandedSectionId(
                              expandedSectionId === item.id ? null : item.id
                            )}
                            onUpdateGuidance={(guidance) => {
                              updateAIGapGuidance(item.id, guidance);
                            }}
                            onDelete={() => {
                              deleteAIGap(item.id);
                            }}
                          />
                        );
                      }
                      const sectionIndex = (agent.outline || [])
                        .slice(0, index)
                        .filter(isSection).length;
                      return (
                        <SectionItem
                          key={item.id}
                          section={item}
                          index={sectionIndex}
                          isFirst={sectionIndex === 0}
                          isV2Enabled={isV2Enabled}
                          isNew={item.id === newSectionId}
                          isExpanded={expandedSectionId === item.id}
                          showAIExpansionToggle={agent.outlineType === 'guided'}
                          onToggleExpand={() => setExpandedSectionId(
                            expandedSectionId === item.id ? null : item.id
                          )}
                          onUpdateTitle={(title) => {
                            updateSectionTitle(item.id, title);
                          }}
                          onUpdateFreeformGuidance={(guidance) => {
                            updateSectionFreeformGuidance(item.id, guidance);
                          }}
                          onUpdateAIExpansion={(enabled) => {
                            updateSectionAIExpansion(item.id, enabled);
                          }}
                          onUpdateAIExpansionGuidance={(guidance) => {
                            updateSectionAIExpansionGuidance(item.id, guidance);
                          }}
                          onUpdateSlides={(slides) => {
                            updateSectionSlides(item.id, slides);
                          }}
                          onUpdateQuestions={(questions) => {
                            updateSectionQuestions(item.id, questions);
                          }}
                          onDuplicate={() => duplicateSection(item.id)}
                          onDelete={() => deleteSection(item.id)}
                          onNewSectionEdited={() => setNewSectionId(null)}
                        />
                      );
                    })}

                    <SortableList.DragOverlay>
                      {activeId && (
                        <SortableList.BaseItem clone>
                          <Box padding="300">
                            <Text>
                              {(() => {
                                const item = (agent.outline || []).find((i) => i.id === activeId);
                                if (!item) return '';
                                return isAIGap(item) ? 'AI Expansion Point' : item.title;
                              })()}
                            </Text>
                          </Box>
                        </SortableList.BaseItem>
                      )}
                    </SortableList.DragOverlay>
                  </SortableList>

                  {/* Add Section placeholder */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      const newId = addSection();
                      setNewSectionId(newId);
                      setExpandedSectionId(newId);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        const newId = addSection();
                        setNewSectionId(newId);
                        setExpandedSectionId(newId);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 16px',
                      minHeight: 44,
                      cursor: 'pointer',
                      background: '#FAFAFA',
                      border: '1.5px dashed #DFDFDF',
                      borderRadius: 10,
                      boxShadow: 'none',
                      marginTop: 8,
                      transition: 'background 0.15s ease, border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#BABABA';
                      e.currentTarget.style.background = '#F5F5F5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#DFDFDF';
                      e.currentTarget.style.background = '#FAFAFA';
                    }}
                  >
                    <IconAdd size="small" color="#898989" />
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#898989' }}>Add section</span>
                  </div>
                </Stack>
              </div>
            )}
          </Paper>

          {/* Questions - Collapsible Card (empty state, no actions) */}
          <Paper shadow="100" padding="0" overflow="hidden">
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isQuestionsOpen}
              aria-controls={questionsContentId}
              onClick={() => setIsQuestionsOpen((prev) => !prev)}
              onKeyDown={(event) => handleAccordionHeaderTriggerKeyDown(event, () => setIsQuestionsOpen((prev) => !prev))}
              style={{
                ...accordionHeaderTriggerBase,
                ...accordionHeaderInteractive.base,
                padding: surfaceSpacing.accordion.header,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = accordionHeaderInteractive.hover.background;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = accordionHeaderInteractive.base.background;
              }}
            >
              <IconChevronDown
                size="small"
                color="#898989"
                style={{
                  transform: isQuestionsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Text size="300" bold fontFamily="heading">Questions</Text>
                  <Tag color="neutral">Optional</Tag>
                </div>
                <Text size="200" color="gray-700" style={{ marginTop: 2, display: 'block' }}>
                  Add questions to gather context from the user
                </Text>
              </div>
            </div>

            {isQuestionsOpen && (
              <div id={questionsContentId} style={{ padding: surfaceSpacing.accordion.body, borderTop: '1px solid #DFDFDF' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px 16px',
                  gap: 8,
                  background: '#FAFAFA',
                  border: '1.5px dashed #DFDFDF',
                  borderRadius: 10,
                  marginTop: 16,
                }}>
                  <span style={{ fontSize: 13, color: '#737373' }}>No questions added — the agent will come up with its own</span>
                </div>
              </div>
            )}
          </Paper>

          {/* Configuration - Collapsible Card (empty state, no actions) */}
          <Paper shadow="100" padding="0" overflow="hidden">
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isConfigurationOpen}
              aria-controls={configurationContentId}
              onClick={() => setIsConfigurationOpen((prev) => !prev)}
              onKeyDown={(event) => handleAccordionHeaderTriggerKeyDown(event, () => setIsConfigurationOpen((prev) => !prev))}
              style={{
                ...accordionHeaderTriggerBase,
                ...accordionHeaderInteractive.base,
                padding: surfaceSpacing.accordion.header,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = accordionHeaderInteractive.hover.background;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = accordionHeaderInteractive.base.background;
              }}
            >
              <IconChevronDown
                size="small"
                color="#898989"
                style={{
                  transform: isConfigurationOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Text size="300" bold fontFamily="heading">Configuration</Text>
                  <Tag color="neutral">Optional</Tag>
                </div>
                <Text size="200" color="gray-700" style={{ marginTop: 2, display: 'block' }}>
                  Knowledge, tone of voice, layout and advanced settings
                </Text>
              </div>
            </div>

            {isConfigurationOpen && (
              <div id={configurationContentId} style={{ padding: surfaceSpacing.accordion.body, borderTop: '1px solid #DFDFDF' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px 16px',
                  gap: 8,
                  background: '#FAFAFA',
                  border: '1.5px dashed #DFDFDF',
                  borderRadius: 10,
                  marginTop: 16,
                }}>
                  <span style={{ fontSize: 13, color: '#737373' }}>No configuration added yet</span>
                </div>
              </div>
            )}
          </Paper>

        </Stack>
      </Box>
    </AdminLayout>
  );
}
