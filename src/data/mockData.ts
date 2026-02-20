// Mock data for the Presentation Agent prototype

export type SlideType = 'ai' | 'library';
export type AgentStatus = 'draft' | 'active';
export type AgentType = 'universal' | 'custom';
export type OutlineType = 'fixed' | 'guided';  // fixed = all sections predefined, guided = AI can add sections
export type LibrarySelectionMode = 'all' | 'criteria';
export type LibrarySlideMode = 'direct' | 'search' | 'fixed';
export type AgentIcon = 'globe' | 'tag' | 'document' | 'chart' | 'education';
export type SectionType = 'fixed' | 'freeform'; // fixed = defined structure, freeform = AI determines structure

// Question configuration - scope is determined by where the question is stored
export interface QuestionConfig {
  id: string;
  question: string;
  required: boolean;
}

// Individual slide configuration within a section
export interface SlideConfig {
  id: string;
  type: SlideType;
  title?: string;
  // AI slide config
  aiInstructions?: string;
  layoutId?: string; // Legacy single layout
  selectedLayoutIds?: string[]; // Multiple layouts for AI to choose from
  slideCount?: number; // How many slides to generate
  // Library slide config
  selectedSlideIds?: string[];
  selectedFolderId?: string;
  selectionMode?: LibrarySelectionMode; // 'all' = add all selected, 'criteria' = AI picks based on criteria
  selectionCriteria?: string; // If mode is 'criteria', what criteria to use
  libraryMode?: LibrarySlideMode;
  limitedFolderIds?: string[];
  searchInstructions?: string;
  assetId?: string;
}

export interface Section {
  id: string;
  type?: 'section';  // Discriminator (optional for backwards compat)
  title: string;
  sectionType?: SectionType; // 'fixed' (default) or 'freeform'
  instructions?: string;
  freeformGuidance?: string; // For freeform sections: guidance for AI on how to structure
  slides: SlideConfig[];
  questions?: QuestionConfig[];  // Section-specific questions
  aiExpansion?: boolean;  // If true, AI can add sections after this one (for guided outline agents)
  aiExpansionGuidance?: string;  // Optional guidance for AI when expanding
}

// AI Gap marker - indicates where AI can add sections
export interface AIGap {
  id: string;
  type: 'ai-gap';  // Discriminator
  guidance?: string;  // Optional guidance for AI
}

// Outline can contain sections OR AI gaps
export type OutlineItem = Section | AIGap;

// Type guard helpers
export function isAIGap(item: OutlineItem): item is AIGap {
  return item.type === 'ai-gap';
}

export function isSection(item: OutlineItem): item is Section {
  return item.type !== 'ai-gap';
}

// Legacy types for backwards compatibility
export type SlideSource = 'ai' | 'library' | 'hybrid';

export interface PresentationAgent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  outlineType?: OutlineType;  // 'fixed' or 'guided' - determines if AI expansion points are allowed
  category?: string;
  description?: string;
  icon?: AgentIcon;
  targetUsers?: string;
  targetUserGroups?: string[]; // IDs of user groups that can access this agent (empty = all users)
  sections: Section[];  // Keep for backwards compat
  outline?: OutlineItem[];  // NEW: ordered list of sections + AI gaps
  globalQuestions?: QuestionConfig[];     // Questions that apply to all content
  knowledgeQuestions?: QuestionConfig[];  // Questions for knowledge source search
  documentLayoutId?: string;
  createdAt: string;
  updatedAt: string;
}

// Universal agent configuration
export interface UniversalAgentConfig {
  id: string;
  name: string;
  description: string;
  toneOfVoice?: string;
  knowledge?: string[];
  llmModel?: string;
  targetUsers: string;
  targetUserGroups?: string[];
  sections: Section[]; // Section configuration for universal agent
  outline?: OutlineItem[];  // NEW: ordered list of sections + AI gaps
  inheritingAgentsCount: number;
}

export interface DocumentLayout {
  id: string;
  name: string;
  layoutCount: number;
  description: string;
}

export interface LibraryFolder {
  id: string;
  name: string;
  slideCount: number;
  path: string;
}

export interface SlideLayout {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
}

// Mock universal agent configuration
export const mockUniversalAgent: UniversalAgentConfig = {
  id: 'universal-agent',
  name: 'Universal Document Agent',
  description: 'Used as the default way to create documents when no custom agent is selected.',
  toneOfVoice: 'Professional and clear',
  knowledge: ['Company guidelines', 'Brand voice'],
  llmModel: 'GPT-4',
  targetUsers: 'All users',
  targetUserGroups: [],
  sections: [
    {
      id: 'universal-freeform',
      title: 'Free Form',
      sectionType: 'freeform',
      freeformGuidance: 'Create sections based on user instructions and document purpose',
      slides: [],
    }
  ],
  inheritingAgentsCount: 8,
};

// Mock presentation agents
export const mockAgents: PresentationAgent[] = [
  {
    id: 'agent-1',
    name: 'Sales Proposal Agent',
    type: 'custom',
    status: 'active',
    category: 'Proposals & Quotes',
    description: 'Creates compelling sales proposals with product highlights, case studies, and pricing information.',
    icon: 'tag',
    targetUsers: 'Sales team',
    targetUserGroups: ['group-2'], // Sales
    documentLayoutId: 'doc-layout-1',
    sections: [
      {
        id: 's1',
        title: 'Title Slide',
        slides: [
          { id: 'slide-1', type: 'ai', aiInstructions: 'Create a professional title slide', layoutId: 'layout-1', slideCount: 1 }
        ]
      },
      {
        id: 's2',
        title: 'Executive Summary',
        slides: [
          { id: 'slide-2', type: 'ai', aiInstructions: 'Focus on key metrics and achievements', slideCount: 2 }
        ]
      },
      {
        id: 's3',
        title: 'Pricing',
        slides: [
          { id: 'slide-3', type: 'library', selectedFolderId: 'folder-6', selectionMode: 'all' }
        ]
      },
      {
        id: 's4',
        title: 'Case Studies',
        slides: [
          { id: 'slide-4', type: 'library', selectedFolderId: 'folder-5', selectionMode: 'criteria', selectionCriteria: 'Select relevant case studies' }
        ]
      },
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-02-01',
  },
  {
    id: 'agent-2',
    name: 'Legal Contracts Agent',
    type: 'custom',
    status: 'active',
    category: 'Legal Documents',
    description: 'Generates legal contracts and agreements with proper terminology and compliance language.',
    icon: 'document',
    targetUsers: 'Legal dept',
    targetUserGroups: ['group-5'], // Executive Team (as proxy for Legal)
    documentLayoutId: 'doc-layout-4',
    sections: [
      { id: 's1', title: 'Introduction', slides: [] },
      { id: 's2', title: 'Terms & Conditions', slides: [] },
      { id: 's3', title: 'Compliance', slides: [] },
      { id: 's4', title: 'Signatures', slides: [] },
      { id: 's5', title: 'Appendix A', slides: [] },
      { id: 's6', title: 'Appendix B', slides: [] },
    ],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-25',
  },
  {
    id: 'agent-3',
    name: 'Marketing Report Agent',
    type: 'custom',
    status: 'active',
    category: 'Reports & Analytics',
    description: 'Generates marketing reports with campaign analytics, performance metrics, and insights.',
    icon: 'chart',
    targetUsers: 'Marketing',
    targetUserGroups: ['group-1'], // Marketing
    documentLayoutId: 'doc-layout-4',
    sections: [
      {
        id: 's1',
        title: 'Overview',
        slides: [
          { id: 'slide-5', type: 'ai', aiInstructions: 'Marketing overview slide', layoutId: 'layout-2', slideCount: 1 }
        ]
      },
      {
        id: 's2',
        title: 'Campaign Performance',
        slides: [
          { id: 'slide-6', type: 'ai', aiInstructions: 'Campaign metrics and KPIs', slideCount: 3 }
        ]
      },
      {
        id: 's3',
        title: 'Channel Analysis',
        slides: [
          { id: 'slide-7', type: 'library', selectedFolderId: 'folder-1', selectionMode: 'all' }
        ]
      },
      {
        id: 's4',
        title: 'Recommendations',
        slides: [
          { id: 'slide-8', type: 'ai', aiInstructions: 'Strategic recommendations', slideCount: 2 }
        ]
      },
      {
        id: 's5',
        title: 'Next Steps',
        slides: [
          { id: 'slide-9', type: 'ai', aiInstructions: 'Action items and timeline', slideCount: 1 }
        ]
      },
    ],
    createdAt: '2024-02-01',
    updatedAt: '2024-02-10',
  },
  {
    id: 'agent-4',
    name: 'Training Materials Agent',
    type: 'custom',
    status: 'active',
    category: 'Training & Onboarding',
    description: 'Creates training materials with learning objectives, exercises, and assessment content.',
    icon: 'education',
    targetUsers: 'All users',
    targetUserGroups: [], // All users
    documentLayoutId: 'doc-layout-4',
    sections: [
      {
        id: 's1',
        title: 'Introduction',
        slides: [
          { id: 'slide-10', type: 'ai', aiInstructions: 'Course introduction', slideCount: 1 }
        ]
      },
      {
        id: 's2',
        title: 'Learning Objectives',
        slides: [
          { id: 'slide-11', type: 'ai', aiInstructions: 'Define learning goals', slideCount: 1 }
        ]
      },
      {
        id: 's3',
        title: 'Module 1',
        slides: [
          { id: 'slide-12', type: 'ai', aiInstructions: 'First module content', slideCount: 5 }
        ]
      },
      {
        id: 's4',
        title: 'Module 2',
        slides: [
          { id: 'slide-13', type: 'ai', aiInstructions: 'Second module content', slideCount: 5 }
        ]
      },
      {
        id: 's5',
        title: 'Exercises',
        slides: [
          { id: 'slide-14', type: 'library', selectedFolderId: 'folder-9', selectionMode: 'all' }
        ]
      },
      {
        id: 's6',
        title: 'Assessment',
        slides: [
          { id: 'slide-15', type: 'ai', aiInstructions: 'Quiz and assessment', slideCount: 3 }
        ]
      },
      {
        id: 's7',
        title: 'Summary',
        slides: [
          { id: 'slide-16', type: 'ai', aiInstructions: 'Course summary', slideCount: 1 }
        ]
      },
    ],
    createdAt: '2024-02-05',
    updatedAt: '2024-02-12',
  },
];

// Mock library folders
export const mockFolders: LibraryFolder[] = [
  { id: 'folder-1', name: 'Financial Charts', slideCount: 24, path: '/Library/Finance/Charts' },
  { id: 'folder-2', name: 'KPI Dashboards', slideCount: 18, path: '/Library/Finance/KPIs' },
  { id: 'folder-3', name: 'Q&A Templates', slideCount: 8, path: '/Library/General/Q&A' },
  { id: 'folder-4', name: 'Product Screenshots', slideCount: 32, path: '/Library/Product/Screenshots' },
  { id: 'folder-5', name: 'Case Studies', slideCount: 15, path: '/Library/Sales/Cases' },
  { id: 'folder-6', name: 'Pricing Tables', slideCount: 6, path: '/Library/Sales/Pricing' },
  { id: 'folder-7', name: 'Team Photos', slideCount: 12, path: '/Library/HR/Team' },
  { id: 'folder-8', name: 'Brand Assets', slideCount: 28, path: '/Library/Brand/Assets' },
  { id: 'folder-9', name: 'Infographics', slideCount: 20, path: '/Library/General/Infographics' },
];

// Mock slide layouts for title slides
export const mockLayouts: SlideLayout[] = [
  { id: 'layout-1', name: 'Title Slide', thumbnail: 'title', description: 'Title with subtitle' },
  { id: 'layout-2', name: 'Title and Content', thumbnail: 'title-content', description: 'Title with body text' },
  { id: 'layout-3', name: 'Two Column', thumbnail: 'two-column', description: 'Side by side content' },
  { id: 'layout-4', name: 'Title Only', thumbnail: 'title-only', description: 'Large centered title' },
  { id: 'layout-5', name: 'Blank', thumbnail: 'blank', description: 'Empty slide' },
];

// Mock document layouts (presentation templates by brand/type)
export const mockDocumentLayouts: DocumentLayout[] = [
  { id: 'doc-layout-1', name: 'CBRE Proposal', layoutCount: 12, description: 'Standard CBRE branded proposal template' },
  { id: 'doc-layout-2', name: 'Investor Deck', layoutCount: 8, description: 'Investor-focused presentation template' },
  { id: 'doc-layout-3', name: 'Sales Presentation', layoutCount: 15, description: 'Sales-oriented presentation template' },
  { id: 'doc-layout-4', name: 'Corporate Template', layoutCount: 10, description: 'General corporate presentation template' },
];

// Helper to get slide source summary
export function getSlideSourceSummary(sections: Section[]): string {
  const allSlides = sections.flatMap(s => s.slides);
  if (allSlides.length === 0) return 'Not configured';

  const types = new Set(allSlides.map(s => s.type));
  if (types.size === 1) {
    return types.has('ai') ? 'AI' : 'Library';
  }
  return 'Mixed';
}

let generatedIdCounter = 0;

function createGeneratedId(prefix: string): string {
  return `${prefix}-${Date.now()}-${generatedIdCounter++}`;
}

// Helper to create a new fixed section
export function createNewSection(index: number): Section {
  return {
    id: createGeneratedId('section'),
    title: `New Section ${index + 1}`,
    sectionType: 'fixed',
    slides: [],
  };
}

// Helper to create a new freeform section
export function createFreeformSection(): Section {
  return {
    id: createGeneratedId('section-freeform'),
    title: 'Free Form',
    sectionType: 'freeform',
    freeformGuidance: '',
    slides: [],
  };
}

// Helper to create a new AI gap marker
export function createAIGap(): AIGap {
  return {
    id: createGeneratedId('ai-gap'),
    type: 'ai-gap',
    guidance: '',
  };
}

// Helper to create a new question config
export function createQuestionConfig(question: string = '', required: boolean = true): QuestionConfig {
  return {
    id: createGeneratedId('question'),
    question,
    required,
  };
}

// Helper to get outline from sections (for backwards compatibility)
export function getOutlineFromSections(sections: Section[], outline?: OutlineItem[]): OutlineItem[] {
  if (outline && outline.length > 0) {
    return outline;
  }
  // Convert sections to outline items
  return sections.map(section => ({ ...section, type: 'section' as const }));
}

// Helper to extract sections from outline (for backwards compatibility)
export function getSectionsFromOutline(outline: OutlineItem[]): Section[] {
  return outline.filter(isSection);
}

// Helper to create a new slide config
export function createNewSlideConfig(type: SlideType): SlideConfig {
  return {
    id: createGeneratedId('slide'),
    type,
    ...(type === 'ai' ? { aiInstructions: '', slideCount: 1 } : { selectionMode: 'all' as LibrarySelectionMode }),
  };
}

// Helper to create a new agent
// Mock user groups for targeting
export interface UserGroup {
  id: string;
  name: string;
  userCount: number;
}

export const mockUserGroups: UserGroup[] = [
  { id: 'group-1', name: 'Marketing', userCount: 45 },
  { id: 'group-2', name: 'Sales', userCount: 120 },
  { id: 'group-3', name: 'Product', userCount: 38 },
  { id: 'group-4', name: 'Engineering', userCount: 85 },
  { id: 'group-5', name: 'Executive Team', userCount: 12 },
];

// Helper to get target users display text
export function getTargetUsersDisplay(targetUserGroups?: string[]): string {
  if (!targetUserGroups || targetUserGroups.length === 0) {
    return 'All users';
  }
  const groupNames = targetUserGroups
    .map(id => mockUserGroups.find(g => g.id === id)?.name)
    .filter(Boolean);
  if (groupNames.length === 1) {
    return groupNames[0]!;
  }
  return `${groupNames.length} groups`;
}

// Mock AI parsing: takes pasted instructions and returns pre-filled agent fields
export function parseInstructionsToAgent(instructions: string): Partial<PresentationAgent> {
  const lines = instructions.trim().split('\n').filter(l => l.trim());
  const firstLine = lines[0]?.trim() || 'Custom Document';

  return {
    name: firstLine.length > 60 ? firstLine.slice(0, 60) : firstLine,
    description: `AI-generated agent based on pasted instructions (${lines.length} lines)`,
    sections: [
      {
        id: createGeneratedId('section'),
        type: 'section',
        title: 'Introduction',
        sectionType: 'fixed',
        instructions: 'Set the stage and introduce the topic',
        slides: [],
      },
      {
        id: createGeneratedId('section'),
        type: 'section',
        title: 'Main Content',
        sectionType: 'fixed',
        instructions: instructions.slice(0, 500),
        slides: [],
      },
      {
        id: createGeneratedId('section'),
        type: 'section',
        title: 'Summary & Next Steps',
        sectionType: 'fixed',
        instructions: 'Wrap up with key takeaways and action items',
        slides: [],
      },
    ],
  };
}

export function createNewAgent(outlineType: OutlineType = 'fixed'): PresentationAgent {
  const now = new Date().toISOString().split('T')[0];
  const timestamp = Date.now();
  return {
    id: `agent-${timestamp}`,
    name: '',
    type: 'custom',
    status: 'draft',
    outlineType,
    category: '',
    description: '',
    icon: 'document',
    targetUsers: 'All users',
    targetUserGroups: [], // Empty = all users
    documentLayoutId: 'doc-layout-4', // Corporate Template by default
    sections: [],
    createdAt: now,
    updatedAt: now,
  };
}
