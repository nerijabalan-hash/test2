import React, { useLayoutEffect, useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Drawer,
  DropdownMenu,
  Form,
  Modal,
  SortableList,
  Stack,
  Text,
  TextInput,
  TextArea,
  Switch,
  IconChevronDown,
  IconChevronRight,
  IconArrowLeft,
  IconMoreVertical,
  IconTrash,
  IconCopy,
  IconCheck,
  IconAdd,
  IconPresentation,
  IconSparkle,
  IconFolder,
  IconLayers,
  IconSearch,
  tokens,
} from '../ui';
import { Section, SlideConfig, SlideType, SectionType, mockLayouts, mockFolders, QuestionConfig, createQuestionConfig } from '../data/mockData';
import hierarchyLibrary from '../data/hierarchy-library-counts.json';
import { DrawerHeaderWithSubtitle, DrawerIntro, DrawerStatusChips } from './shared/DrawerCopyPattern';
import { drawerCopySpec } from './shared/drawerCopySpec';
import {
  accordionHeaderInteractive,
  accordionHeaderTriggerBase,
  baseInteractiveSurface,
  handleAccordionHeaderTriggerKeyDown,
  hoverInteractiveSurface,
  surfaceSpacing,
  surfaceText,
} from './shared/surfaceStyles';

// Library folders with slides (moved outside component for access by SlidePreviewCard)
const libraryFolders = [
  {
    id: 'intro',
    name: 'Introduction',
    slides: [
      { id: 'intro-1', name: 'Title Slide', thumbnail: 'Title' },
      { id: 'intro-2', name: 'Agenda', thumbnail: 'Agenda' },
      { id: 'intro-3', name: 'Company Overview', thumbnail: 'Overview' },
    ]
  },
  {
    id: 'product',
    name: 'Product',
    slides: [
      { id: 'product-1', name: 'Product Overview', thumbnail: 'Product' },
      { id: 'product-2', name: 'Features', thumbnail: 'Features' },
      { id: 'product-3', name: 'Benefits', thumbnail: 'Benefits' },
      { id: 'product-4', name: 'Comparison', thumbnail: 'Compare' },
      { id: 'product-5', name: 'Roadmap', thumbnail: 'Roadmap' },
    ]
  },
  {
    id: 'case-studies',
    name: 'Case Studies',
    slides: [
      { id: 'case-1', name: 'Customer Success Story', thumbnail: 'Story' },
      { id: 'case-2', name: 'ROI Analysis', thumbnail: 'ROI' },
      { id: 'case-3', name: 'Testimonial', thumbnail: 'Quote' },
      { id: 'case-4', name: 'Industry Example', thumbnail: 'Industry' },
    ]
  },
  {
    id: 'closing',
    name: 'Closing',
    slides: [
      { id: 'closing-1', name: 'Summary', thumbnail: 'Summary' },
      { id: 'closing-2', name: 'Next Steps', thumbnail: 'Next' },
      { id: 'closing-3', name: 'Q&A', thumbnail: 'Q&A' },
    ]
  },
  {
    id: 'team',
    name: 'Team',
    slides: [
      { id: 'team-1', name: 'Team Overview', thumbnail: 'Team' },
      { id: 'team-2', name: 'Leadership', thumbnail: 'Leaders' },
      { id: 'team-3', name: 'Contact Info', thumbnail: 'Contact' },
      { id: 'team-4', name: 'Office Locations', thumbnail: 'Offices' },
    ]
  },
];

// Helper to find slide name by ID
const findSlideName = (slideId: string): string | null => {
  for (const folder of libraryFolders) {
    const slide = folder.slides.find(s => s.id === slideId);
    if (slide) return slide.name;
  }
  return null;
};

interface FolderNode {
  id: string;
  name: string;
  assetCount: number;
  children?: FolderNode[];
}

interface HierarchyNode {
  name: string;
  assetCount?: number;
  folders?: HierarchyNode[];
  rootFolders?: HierarchyNode[];
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toFolderNodes = (nodes: HierarchyNode[], parentKey = 'root'): FolderNode[] =>
  nodes.map((node, index) => {
    const nodeKey = `${parentKey}-${index}-${slugify(node.name)}`;
    return {
      id: nodeKey,
      name: node.name,
      assetCount: node.assetCount || 0,
      children: node.folders ? toFolderNodes(node.folders, nodeKey) : undefined,
    };
  });

const hierarchyData = hierarchyLibrary as HierarchyNode[];
const slidesLibrary = hierarchyData.find((entry) => entry.name === 'Slides');
const slidesRoot =
  slidesLibrary?.rootFolders?.find((entry) => entry.name === 'Slides') ||
  slidesLibrary?.rootFolders?.[0];
const rootFolderOrder = [
  'Industries',
  'Capabilities',
  'Firm-wide GTM Themes',
  'Consultant .Bios',
  'Process, Pricing and Fees',
  'Brand Master',
  'Firm-wide Insights (CLI)',
  'Asia Pacific',
  'Consultant Bios',
  'Recess',
  'Marketing',
];

const formFieldSpacingStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  rowGap: 16,
};

const formFieldResetMarginStyle = {
  marginBottom: 0,
};

const orderRootFolders = (nodes: FolderNode[]): FolderNode[] => {
  const rank = new Map(rootFolderOrder.map((name, index) => [name, index]));
  return [...nodes].sort((a, b) => {
    const aIndex = rank.get(a.name);
    const bIndex = rank.get(b.name);
    if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
    if (aIndex !== undefined) return -1;
    if (bIndex !== undefined) return 1;
    return a.name.localeCompare(b.name);
  });
};

const folderTree: FolderNode[] = orderRootFolders(toFolderNodes(slidesRoot?.folders || []));

const findFolderNodeById = (nodes: FolderNode[], folderId: string): FolderNode | null => {
  for (const node of nodes) {
    if (node.id === folderId) return node;
    if (node.children) {
      const childMatch = findFolderNodeById(node.children, folderId);
      if (childMatch) return childMatch;
    }
  }
  return null;
};

const getFoldersAtPath = (nodes: FolderNode[], path: string[]): FolderNode[] => {
  if (path.length === 0) return nodes;
  let current: FolderNode | null = null;
  let children = nodes;
  for (const id of path) {
    current = children.find((item) => item.id === id) || null;
    if (!current) return [];
    children = current.children || [];
  }
  return current?.children || [];
};

const getFolderAtPath = (nodes: FolderNode[], path: string[]): FolderNode | null => {
  if (path.length === 0) return null;
  let current: FolderNode | null = null;
  let children = nodes;
  for (const id of path) {
    current = children.find((item) => item.id === id) || null;
    if (!current) return null;
    children = current.children || [];
  }
  return current;
};

const FOLDER_SELECTOR_HEADER_ROW_HEIGHT = 56;
const FOLDER_SELECTOR_ROW_HEIGHT = 56;
const FOLDER_SELECTOR_MIN_ROWS = 3;
const FOLDER_SELECTOR_MAX_ROWS = 6;
const FOLDER_SELECTOR_MIN_HEIGHT_PX = FOLDER_SELECTOR_HEADER_ROW_HEIGHT + (FOLDER_SELECTOR_ROW_HEIGHT * FOLDER_SELECTOR_MIN_ROWS);
const FOLDER_SELECTOR_MAX_HEIGHT_PX = FOLDER_SELECTOR_HEADER_ROW_HEIGHT + (FOLDER_SELECTOR_ROW_HEIGHT * FOLDER_SELECTOR_MAX_ROWS);
const FOLDER_SELECTOR_ABSOLUTE_MIN_HEIGHT_PX = 160;

const findScrollableAncestor = (element: HTMLElement | null): HTMLElement | null => {
  if (!element || typeof window === 'undefined') return null;
  let current = element.parentElement;
  while (current) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    const overflow = style.overflow;
    if (/(auto|scroll)/.test(overflowY) || /(auto|scroll)/.test(overflow)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
};

const getResponsiveSelectorHeight = (
  selectorElement: HTMLElement | null,
  belowContentElement: HTMLElement | null,
  fallbackHeightPx: number
) => {
  const scrollContainer = findScrollableAncestor(selectorElement);
  if (!selectorElement || !scrollContainer) return fallbackHeightPx;

  const scrollRect = scrollContainer.getBoundingClientRect();
  const selectorRect = selectorElement.getBoundingClientRect();
  const belowContentHeight = belowContentElement?.getBoundingClientRect().height || 0;
  const spacingBelowSelector = 16;
  const bottomBuffer = 20;

  const availableHeight = scrollRect.bottom - selectorRect.top - belowContentHeight - spacingBelowSelector - bottomBuffer;
  const roundedAvailableHeight = Math.floor(availableHeight) - 1;

  if (!Number.isFinite(roundedAvailableHeight)) return fallbackHeightPx;
  if (roundedAvailableHeight <= 0) return FOLDER_SELECTOR_ABSOLUTE_MIN_HEIGHT_PX;
  if (roundedAvailableHeight < FOLDER_SELECTOR_MIN_HEIGHT_PX) {
    return Math.max(FOLDER_SELECTOR_ABSOLUTE_MIN_HEIGHT_PX, roundedAvailableHeight);
  }

  return Math.min(FOLDER_SELECTOR_MAX_HEIGHT_PX, roundedAvailableHeight);
};

interface PlaceholderSlide {
  assetId: string;
  name: string;
}

const getPlaceholderSlidesForFolder = (folder: FolderNode): PlaceholderSlide[] =>
  Array.from({ length: folder.assetCount }, (_, index) => ({
    assetId: `${folder.id}-asset-${index + 1}`,
    name: `${folder.name} Slide ${index + 1}`,
  }));

interface FixedSlideSelection {
  assetId: string;
  name: string;
  folderId: string;
  folderName: string;
}

interface SectionItemProps {
  section: Section;
  index: number;
  isFirst: boolean;
  isNew?: boolean;
  isExpanded: boolean;
  showAIExpansionToggle?: boolean;  // Show AI expansion toggle for guided outline agents
  onToggleExpand: () => void;
  onUpdateTitle: (title: string) => void;
  onUpdateSlides: (slides: SlideConfig[]) => void;
  onUpdateFreeformGuidance?: (guidance: string) => void;
  onUpdateAIExpansion?: (enabled: boolean) => void;
  onUpdateAIExpansionGuidance?: (guidance: string) => void;
  onUpdateQuestions?: (questions: QuestionConfig[]) => void;  // Section-specific questions
  onDuplicate?: () => void;
  onDelete?: () => void;
  onNewSectionEdited?: () => void;
  isV2Enabled?: boolean;
}

/**
 * SectionItem - Individual section card in the builder
 * Matches the design from the screenshot with section instructions and slide previews
 */
export function SectionItem({
  section,
  index,
  isFirst,
  isNew,
  isExpanded,
  showAIExpansionToggle,
  onToggleExpand,
  onUpdateTitle,
  onUpdateSlides,
  onUpdateFreeformGuidance,
  onUpdateAIExpansion,
  onUpdateAIExpansionGuidance,
  onUpdateQuestions,
  onDuplicate,
  onDelete,
  onNewSectionEdited,
  isV2Enabled = false,
}: SectionItemProps) {
  const [activeSectionDrawer, setActiveSectionDrawer] = useState<'add-slide' | 'edit-slide' | null>(null);
  const [addSlideModalStep, setAddSlideModalStep] = useState<1 | 2>(1);
  const [drawerMode, setDrawerMode] = useState<'ai' | 'library' | 'library-search' | 'library-fixed'>('ai');
  const [aiSlideInstructions, setAiSlideInstructions] = useState('');
  const [aiSlideSelectedLayouts, setAiSlideSelectedLayouts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlides, setSelectedSlides] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [librarySlideCount, setLibrarySlideCount] = useState<string>('1');
  const [inclusionCriteria, setInclusionCriteria] = useState('');
  const [limitedFolders, setLimitedFolders] = useState<string[]>([]);
  const [searchInstructions, setSearchInstructions] = useState('');
  const [searchSlidesCount, setSearchSlidesCount] = useState('');
  const [folderRootSearch, setFolderRootSearch] = useState('');
  const [folderPath, setFolderPath] = useState<string[]>([]);
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);
  const [fixedFolderPath, setFixedFolderPath] = useState<string[]>([]);
  const [fixedHoveredFolderId, setFixedHoveredFolderId] = useState<string | null>(null);
  const [fixedRootSearch, setFixedRootSearch] = useState('');
  const [selectedFixedSlides, setSelectedFixedSlides] = useState<FixedSlideSelection[]>([]);
  const [activeFixedSlideId, setActiveFixedSlideId] = useState<string | null>(null);
  const [searchFolderSelectorHeight, setSearchFolderSelectorHeight] = useState<number>(FOLDER_SELECTOR_MAX_HEIGHT_PX);
  const [fixedFolderSelectorHeight, setFixedFolderSelectorHeight] = useState<number>(FOLDER_SELECTOR_MAX_HEIGHT_PX);
  const searchFolderSelectorRef = useRef<HTMLDivElement | null>(null);
  const searchSlidesBelowFieldsRef = useRef<HTMLDivElement | null>(null);
  const fixedFolderSelectorRef = useRef<HTMLDivElement | null>(null);
  const fixedSlidesBelowFieldsRef = useRef<HTMLDivElement | null>(null);

  // Section questions state
  const [isSectionQuestionModalOpen, setIsSectionQuestionModalOpen] = useState(false);
  const [editingSectionQuestion, setEditingSectionQuestion] = useState<QuestionConfig | null>(null);
  const [sectionQuestionInput, setSectionQuestionInput] = useState('');
  const [sectionQuestionRequired, setSectionQuestionRequired] = useState(true);

  // Slide edit state
  const [editingSlide, setEditingSlide] = useState<SlideConfig | null>(null);
  const [hoveredSlideId, setHoveredSlideId] = useState<string | null>(null);
  const [editDrawerTab, setEditDrawerTab] = useState<'ai' | 'library' | 'library-search' | 'library-fixed'>('ai');
  const [editSlideInstructions, setEditSlideInstructions] = useState('');
  const [editSelectedSlides, setEditSelectedSlides] = useState<string[]>([]);
  const [editInclusionCriteria, setEditInclusionCriteria] = useState('');
  const [editExpandedFolders, setEditExpandedFolders] = useState<string[]>([]);
  const [editSearchInstructions, setEditSearchInstructions] = useState('');
  const [editLimitedFolders, setEditLimitedFolders] = useState<string[]>([]);


  // Slide title for the add slide drawer
  const [aiSlideTitle, setAiSlideTitle] = useState('');
  const [editSlideTitle, setEditSlideTitle] = useState('');
  const [editSlideCount, setEditSlideCount] = useState('');
  const isAddSlideDrawerOpen = activeSectionDrawer === 'add-slide';


  const openSlideTypeDialog = () => {
    openAddSlideDrawer('ai');
  };

  const openAddSlideDrawer = (mode: 'ai' | 'library' | 'library-search' | 'library-fixed', skipToForm = false) => {
    setEditingSlide(null);
    setDrawerMode(mode);
    setAddSlideModalStep(skipToForm ? 2 : 1);
    setAiSlideTitle('');
    setAiSlideInstructions('');
    setAiSlideSelectedLayouts([]);
    setSelectedSlides([]);
    setInclusionCriteria('');
    setSearchQuery('');
    setExpandedFolders([]);
    setLimitedFolders([]);
    setSearchInstructions('');
    setSearchSlidesCount('');
    setFolderRootSearch('');
    setFolderPath([]);
    setHoveredFolderId(null);
    setFixedFolderPath([]);
    setFixedHoveredFolderId(null);
    setFixedRootSearch('');
    setSelectedFixedSlides([]);
    setActiveFixedSlideId(null);
    setActiveSectionDrawer('add-slide');
  };

  const closeAddSlideDrawer = () => {
    setActiveSectionDrawer(null);
    setAddSlideModalStep(1);
  };


  const addAiSlide = () => {
    const newSlide: SlideConfig = {
      id: `slide-${Date.now()}`,
      type: 'ai',
      title: aiSlideTitle,
      aiInstructions: aiSlideInstructions,
      slideCount: parseInt(librarySlideCount) || undefined,
      selectedLayoutIds: aiSlideSelectedLayouts.length > 0 ? aiSlideSelectedLayouts : undefined,
    };
    onUpdateSlides([...section.slides, newSlide]);
    closeAddSlideDrawer();
  };

  const addLibrarySlides = () => {
    // Get the folder ID from the first selected slide
    const firstSelectedSlide = selectedSlides[0];
    let selectedFolderId: string | undefined;

    // Find which folder contains the selected slide
    for (const folder of libraryFolders) {
      if (folder.slides.some(s => s.id === firstSelectedSlide)) {
        selectedFolderId = folder.id;
        break;
      }
    }

    const count = parseInt(librarySlideCount) || selectedSlides.length || 1;

    // Create placeholder slides based on the count
    const newSlides: SlideConfig[] = Array.from({ length: count }, (_, index) => ({
      id: `slide-${Date.now()}-${index}`,
      type: 'library' as const,
      libraryMode: 'direct' as const,
      selectedFolderId: selectedFolderId,
      selectedSlideIds: selectedSlides,
      slideCount: count,
      selectionMode: inclusionCriteria ? 'criteria' : 'all',
      selectionCriteria: inclusionCriteria || undefined,
    }));

    onUpdateSlides([...section.slides, ...newSlides]);
    setSelectedSlides([]);
    setInclusionCriteria('');
    setLibrarySlideCount('');
    closeAddSlideDrawer();
  };

  const addSearchLibrarySlide = () => {
    const parsedCount = Number.parseInt(searchSlidesCount, 10);
    const newSlide: SlideConfig = {
      id: `slide-${Date.now()}`,
      type: 'library',
      title: 'Search slides in Library',
      libraryMode: 'search',
      limitedFolderIds: limitedFolders.length > 0 ? limitedFolders : undefined,
      searchInstructions: searchInstructions.trim() || undefined,
      slideCount: Number.isNaN(parsedCount) ? undefined : parsedCount,
      selectionMode: 'criteria',
      selectionCriteria: searchInstructions.trim() || undefined,
    };

    onUpdateSlides([...section.slides, newSlide]);
    closeAddSlideDrawer();
  };

  const addFixedLibrarySlide = () => {
    if (selectedFixedSlides.length === 0) return;

    const newSlides: SlideConfig[] = selectedFixedSlides.map((selection, index) => ({
      id: `slide-${Date.now()}-${index}`,
      type: 'library',
      title: selection.name,
      libraryMode: 'fixed',
      assetId: selection.assetId,
      selectedFolderId: selection.folderId,
      selectedSlideIds: [selection.assetId],
      slideCount: 1,
    }));

    onUpdateSlides([...section.slides, ...newSlides]);
    closeAddSlideDrawer();
  };

  const handleAddSlideFromDrawer = () => {
    if (drawerMode === 'ai') {
      addAiSlide();
      return;
    }
    if (drawerMode === 'library') {
      addLibrarySlides();
      return;
    }
    if (drawerMode === 'library-search') {
      addSearchLibrarySlide();
      return;
    }
    addFixedLibrarySlide();
  };

  const toggleLimitedFolder = (folderId: string) => {
    if (limitedFolders.includes(folderId)) {
      setLimitedFolders(limitedFolders.filter((id) => id !== folderId));
      return;
    }
    setLimitedFolders([...limitedFolders, folderId]);
  };

  const toggleFixedSlideSelection = (slide: PlaceholderSlide, folder: FolderNode) => {
    if (selectedFixedSlides.some((item) => item.assetId === slide.assetId)) {
      setSelectedFixedSlides(selectedFixedSlides.filter((item) => item.assetId !== slide.assetId));
      return;
    }
    setSelectedFixedSlides([
      ...selectedFixedSlides,
      {
        assetId: slide.assetId,
        name: slide.name,
        folderId: folder.id,
        folderName: folder.name,
      },
    ]);
  };

  const reorderSelectedFixedSlides = (reorderedIds: string[]) => {
    setSelectedFixedSlides((previous) =>
      reorderedIds
        .map((assetId) => previous.find((item) => item.assetId === assetId))
        .filter((item): item is FixedSlideSelection => Boolean(item))
    );
  };

  const removeSelectedFixedSlide = (assetId: string) => {
    setSelectedFixedSlides(selectedFixedSlides.filter((item) => item.assetId !== assetId));
  };

  const visibleFolders = getFoldersAtPath(folderTree, folderPath);
  const breadcrumbNodes = folderPath
    .map((id) => findFolderNodeById(folderTree, id))
    .filter((node): node is FolderNode => Boolean(node));
  const showFolderBreadcrumb = folderPath.length > 0;
  const folderRootSearchValue = folderRootSearch.trim().toLowerCase();
  const filteredVisibleFolders = !showFolderBreadcrumb && folderRootSearchValue
    ? visibleFolders.filter((folder) => folder.name.toLowerCase().includes(folderRootSearchValue))
    : visibleFolders;
  const folderScopeChip = limitedFolders.length === 0
    ? 'All folders'
    : `${limitedFolders.length} folder${limitedFolders.length === 1 ? '' : 's'} selected`;

  const fixedVisibleFolders = getFoldersAtPath(folderTree, fixedFolderPath);
  const fixedBreadcrumbNodes = fixedFolderPath
    .map((id) => findFolderNodeById(folderTree, id))
    .filter((node): node is FolderNode => Boolean(node));
  const fixedCurrentFolder = getFolderAtPath(folderTree, fixedFolderPath);
  const fixedCurrentFolderSlides = fixedCurrentFolder ? getPlaceholderSlidesForFolder(fixedCurrentFolder) : [];
  const showFixedFolderBreadcrumb = fixedFolderPath.length > 0;
  const fixedRootSearchValue = fixedRootSearch.trim().toLowerCase();
  const filteredFixedFolders = !showFixedFolderBreadcrumb && fixedRootSearchValue
    ? fixedVisibleFolders.filter((folder) => folder.name.toLowerCase().includes(fixedRootSearchValue))
    : fixedVisibleFolders;
  const fixedSelectedOrderMaxHeight = 'min(220px, 24vh)';

  useLayoutEffect(() => {
    if (!isAddSlideDrawerOpen || drawerMode !== 'library-search') return;

    const recalculateSearchSelectorHeight = () => {
      const scrollContainer = findScrollableAncestor(searchFolderSelectorRef.current);
      let nextHeight = getResponsiveSelectorHeight(
        searchFolderSelectorRef.current,
        searchSlidesBelowFieldsRef.current,
        FOLDER_SELECTOR_MAX_HEIGHT_PX
      );

      if (scrollContainer) {
        const overflowAmount = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
        if (overflowAmount > 0) {
          nextHeight = Math.max(FOLDER_SELECTOR_ABSOLUTE_MIN_HEIGHT_PX, nextHeight - overflowAmount - 2);
        }
      }

      setSearchFolderSelectorHeight((previous) => (previous === nextHeight ? previous : nextHeight));
    };

    recalculateSearchSelectorHeight();

    const scrollContainer = findScrollableAncestor(searchFolderSelectorRef.current);
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
      recalculateSearchSelectorHeight();
    });

    if (scrollContainer) resizeObserver?.observe(scrollContainer);
    if (searchSlidesBelowFieldsRef.current) resizeObserver?.observe(searchSlidesBelowFieldsRef.current);

    window.addEventListener('resize', recalculateSearchSelectorHeight);

    return () => {
      window.removeEventListener('resize', recalculateSearchSelectorHeight);
      resizeObserver?.disconnect();
    };
  }, [
    isAddSlideDrawerOpen,
    drawerMode,
    limitedFolders.length,
    showFolderBreadcrumb,
    folderRootSearchValue,
    folderPath,
    filteredVisibleFolders.length,
    searchInstructions,
    searchSlidesCount,
  ]);

  useLayoutEffect(() => {
    if (!isAddSlideDrawerOpen || drawerMode !== 'library-fixed') return;

    const recalculateFixedSelectorHeight = () => {
      const scrollContainer = findScrollableAncestor(fixedFolderSelectorRef.current);
      let nextHeight = getResponsiveSelectorHeight(
        fixedFolderSelectorRef.current,
        fixedSlidesBelowFieldsRef.current,
        FOLDER_SELECTOR_MAX_HEIGHT_PX
      );

      if (scrollContainer) {
        const overflowAmount = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
        if (overflowAmount > 0) {
          nextHeight = Math.max(FOLDER_SELECTOR_ABSOLUTE_MIN_HEIGHT_PX, nextHeight - overflowAmount - 2);
        }
      }

      setFixedFolderSelectorHeight((previous) => (previous === nextHeight ? previous : nextHeight));
    };

    recalculateFixedSelectorHeight();

    const scrollContainer = findScrollableAncestor(fixedFolderSelectorRef.current);
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
      recalculateFixedSelectorHeight();
    });

    if (scrollContainer) resizeObserver?.observe(scrollContainer);
    if (fixedSlidesBelowFieldsRef.current) resizeObserver?.observe(fixedSlidesBelowFieldsRef.current);

    window.addEventListener('resize', recalculateFixedSelectorHeight);

    return () => {
      window.removeEventListener('resize', recalculateFixedSelectorHeight);
      resizeObserver?.disconnect();
    };
  }, [
    isAddSlideDrawerOpen,
    drawerMode,
    showFixedFolderBreadcrumb,
    fixedFolderPath,
    filteredFixedFolders.length,
    fixedCurrentFolderSlides.length,
    selectedFixedSlides.length,
  ]);

  // Clear new section highlight after a short delay
  useEffect(() => {
    if (!isNew) return;
    const timer = setTimeout(() => {
      onNewSectionEdited?.();
    }, 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew]);

  const removeSlide = (slideId: string) => {
    onUpdateSlides(section.slides.filter(s => s.id !== slideId));
  };

  const reorderSlides = (reorderedIds: string[]) => {
    const reorderedSlides = reorderedIds
      .map(id => section.slides.find(s => s.id === id))
      .filter((s): s is SlideConfig => s !== undefined);
    onUpdateSlides(reorderedSlides);
  };

  const openEditSlide = (slide: SlideConfig) => {
    setEditingSlide(slide);
    setActiveSectionDrawer('edit-slide');
    const tab = slide.type === 'ai' ? 'ai'
      : slide.libraryMode === 'search' ? 'library-search'
      : slide.libraryMode === 'fixed' ? 'library-fixed'
      : 'library';
    setEditDrawerTab(tab);
    setEditSlideTitle(slide.title || '');
    setEditSlideInstructions(slide.aiInstructions || '');
    setEditSlideCount(String(slide.slideCount || ''));
    setEditSelectedSlides(slide.selectedSlideIds || []);
    setEditInclusionCriteria(slide.selectionCriteria || '');
    setEditExpandedFolders([]);
    setEditSearchInstructions(slide.searchInstructions || '');
    setEditLimitedFolders(slide.limitedFolderIds || []);
  };

  const closeEditSlide = () => {
    setEditingSlide(null);
    setActiveSectionDrawer(null);
    setEditSlideTitle('');
    setEditSlideInstructions('');
    setEditSlideCount('');
    setEditSelectedSlides([]);
    setEditInclusionCriteria('');
    setEditExpandedFolders([]);
    setEditSearchInstructions('');
    setEditLimitedFolders([]);
  };

  const saveEditSlide = () => {
    if (!editingSlide) return;

    const updatedSlides: SlideConfig[] = section.slides.map(s => {
      if (s.id !== editingSlide.id) return s;

      if (editDrawerTab === 'ai') {
        return {
          ...s,
          type: 'ai' as const,
          libraryMode: undefined,
          title: editSlideTitle,
          aiInstructions: editSlideInstructions,
          slideCount: parseInt(editSlideCount) || undefined,
          selectedSlideIds: undefined,
          selectionCriteria: undefined,
          searchInstructions: undefined,
          limitedFolderIds: undefined,
        };
      } else if (editDrawerTab === 'library-search') {
        return {
          ...s,
          type: 'library' as const,
          libraryMode: 'search' as const,
          aiInstructions: undefined,
          title: undefined,
          searchInstructions: editSearchInstructions,
          slideCount: parseInt(editSlideCount) || undefined,
          limitedFolderIds: editLimitedFolders.length > 0 ? editLimitedFolders : undefined,
          selectedSlideIds: undefined,
          selectionCriteria: undefined,
        };
      } else if (editDrawerTab === 'library-fixed') {
        return {
          ...s,
          type: 'library' as const,
          libraryMode: 'fixed' as const,
          aiInstructions: undefined,
          selectedSlideIds: editSelectedSlides,
          selectionMode: editInclusionCriteria ? 'criteria' : 'all',
          selectionCriteria: editInclusionCriteria || undefined,
          searchInstructions: undefined,
          limitedFolderIds: undefined,
        };
      } else {
        return {
          ...s,
          type: 'library' as const,
          aiInstructions: undefined,
          selectedSlideIds: editSelectedSlides,
          selectionMode: editInclusionCriteria ? 'criteria' : 'all',
          selectionCriteria: editInclusionCriteria || undefined,
        };
      }
    });

    onUpdateSlides(updatedSlides);
    closeEditSlide();
  };

  const toggleEditSlide = (slideId: string) => {
    if (editSelectedSlides.includes(slideId)) {
      setEditSelectedSlides(editSelectedSlides.filter(id => id !== slideId));
    } else {
      setEditSelectedSlides([...editSelectedSlides, slideId]);
    }
  };

  const toggleEditExpandFolder = (folderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (editExpandedFolders.includes(folderId)) {
      setEditExpandedFolders(editExpandedFolders.filter(id => id !== folderId));
    } else {
      setEditExpandedFolders([...editExpandedFolders, folderId]);
    }
  };

  const toggleEditSelectAllInFolder = (folderId: string, slides: { id: string }[]) => {
    const slideIds = slides.map(s => s.id);
    const allSelected = slideIds.every(id => editSelectedSlides.includes(id));
    if (allSelected) {
      setEditSelectedSlides(editSelectedSlides.filter(id => !slideIds.includes(id)));
    } else {
      setEditSelectedSlides([...new Set([...editSelectedSlides, ...slideIds])]);
    }
  };

  const toggleSlide = (slideId: string) => {
    if (selectedSlides.includes(slideId)) {
      setSelectedSlides(selectedSlides.filter(id => id !== slideId));
    } else {
      setSelectedSlides([...selectedSlides, slideId]);
    }
  };

  const toggleExpandFolder = (folderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (expandedFolders.includes(folderId)) {
      setExpandedFolders(expandedFolders.filter(id => id !== folderId));
    } else {
      setExpandedFolders([...expandedFolders, folderId]);
    }
  };

  const toggleSelectAllInFolder = (folderId: string, slides: { id: string }[]) => {
    const slideIds = slides.map(s => s.id);
    const allSelected = slideIds.every(id => selectedSlides.includes(id));
    if (allSelected) {
      setSelectedSlides(selectedSlides.filter(id => !slideIds.includes(id)));
    } else {
      setSelectedSlides([...new Set([...selectedSlides, ...slideIds])]);
    }
  };

  const filteredFolders = libraryFolders.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.slides.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const isExpandableSection = section.sectionType !== 'freeform';
  const sectionBodyId = `section-item-body-${section.id}`;

  return (
    <>
      <SortableList.Item id={section.id} style={{ border: 0, padding: 0 }}>
        {({ isDragging }) => (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            {/* Card container */}
            <div
              style={{
                ...baseInteractiveSurface,
                flex: 1,
                overflow: 'hidden',
                ...(isExpanded || isNew ? {
                  boxShadow: '0 0 0 2px #4A61ED, ' + (baseInteractiveSurface.boxShadow || ''),
                } : {}),
              }}
            >
            {/* Expandable-card trigger row (not for freeform) */}
            <div
              role={isExpandableSection ? 'button' : undefined}
              tabIndex={isExpandableSection ? 0 : undefined}
              aria-expanded={isExpandableSection ? isExpanded : undefined}
              aria-controls={isExpandableSection ? sectionBodyId : undefined}
              onClick={isExpandableSection ? onToggleExpand : undefined}
              onKeyDown={isExpandableSection ? (event) => handleAccordionHeaderTriggerKeyDown(event, onToggleExpand) : undefined}
              style={{
                ...accordionHeaderTriggerBase,
                ...accordionHeaderInteractive.base,
                alignItems: 'center',
                gap: surfaceSpacing.card.gap,
                padding: surfaceSpacing.card.padding,
                borderBottom: isExpanded && isExpandableSection ? '1px solid #DFDFDF' : 'none',
                cursor: isExpandableSection ? 'pointer' : 'default',
              }}
              onMouseEnter={(e) => {
                if (isExpandableSection) {
                  e.currentTarget.style.background = accordionHeaderInteractive.hover.background;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = accordionHeaderInteractive.base.background;
              }}
            >
              {/* Drag handle */}
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: 'grab', color: '#737373' }}
              >
                <SortableList.DragHandle />
              </div>

              {/* Expand/collapse chevron - not for freeform */}
              {section.sectionType !== 'freeform' && (
                <div
                  style={{
                    color: '#737373',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <IconChevronDown size="small" />
                </div>
              )}

              {/* Title - input field for regular sections, static text for freeform */}
              {section.sectionType === 'freeform' ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text size="200" bold fontFamily="heading" color="gray-900">
                    Free Form Section
                  </Text>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#464646',
                    background: '#E0F2FE',
                    borderRadius: 4,
                    height: 20,
                    boxSizing: 'border-box',
                    whiteSpace: 'nowrap',
                  }}>
                    AI Generated
                  </span>
                </div>
              ) : (
                <Text
                  size="200"
                  bold
                  fontFamily="heading"
                  color="gray-900"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {section.title || 'New section'}
                </Text>
              )}

              {/* Slide count tags - only when collapsed and has slides (for fixed sections) */}
              {!isExpanded && section.sectionType !== 'freeform' && section.slides.length > 0 && (() => {
                const aiCount = section.slides.filter(s => s.type === 'ai').length;
                const libraryCount = section.slides.filter(s => s.type === 'library' && s.libraryMode !== 'search').length;
                const searchCount = section.slides.filter(s => s.libraryMode === 'search').length;
                return (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {aiCount > 0 && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px', fontSize: 12, fontWeight: 500,
                        color: '#737373', background: '#F1F1F1', borderRadius: 4,
                        height: 20, boxSizing: 'border-box', whiteSpace: 'nowrap',
                      }}>
                        <IconSparkle size={12} color="#4A61ED" />
                        {aiCount}x AI
                      </span>
                    )}
                    {libraryCount > 0 && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px', fontSize: 12, fontWeight: 500,
                        color: '#737373', background: '#F1F1F1', borderRadius: 4,
                        height: 20, boxSizing: 'border-box', whiteSpace: 'nowrap',
                      }}>
                        <IconPresentation size={12} color="#677848" />
                        {libraryCount}x Library
                      </span>
                    )}
                    {searchCount > 0 && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px', fontSize: 12, fontWeight: 500,
                        color: '#737373', background: '#F1F1F1', borderRadius: 4,
                        height: 20, boxSizing: 'border-box', whiteSpace: 'nowrap',
                      }}>
                        <IconSearch size={12} color="#F59E0B" />
                        {searchCount}x Search
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* AI Expansion toggle - only for guided outline agents, not for freeform sections */}
              {showAIExpansionToggle && section.sectionType !== 'freeform' && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 8px',
                    background: section.aiExpansion ? '#FEF9C3' : 'transparent',
                    borderRadius: 6,
                    marginLeft: 'auto',
                  }}
                >
                  <span style={{
                    fontSize: 12,
                    color: section.aiExpansion ? '#464646' : '#737373',
                    whiteSpace: 'nowrap',
                  }}>
                    AI can expand
                  </span>
                  <Switch
                    checked={section.aiExpansion || false}
                    onChange={(checked) => onUpdateAIExpansion?.(checked)}
                  />
                </div>
              )}

              {/* Actions menu - pushed to far right */}
              {(onDelete || onDuplicate) && (
                <div onClick={(e) => e.stopPropagation()} style={{ marginLeft: 'auto' }}>
                  {section.sectionType === 'freeform' ? (
                    onDelete && (
                      <Button
                        action="tertiary"
                        size="small"
                        icon={IconTrash}
                        aria-label="Delete section"
                        onClick={onDelete}
                      />
                    )
                  ) : (
                    <DropdownMenu>
                      <DropdownMenu.Trigger>
                        <button
                          aria-label="Section actions"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            padding: 4,
                            borderRadius: 6,
                            color: '#737373',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconMoreVertical size="small" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        {onDuplicate && (
                          <DropdownMenu.Item onClick={onDuplicate} icon={IconCopy}>
                            Duplicate
                          </DropdownMenu.Item>
                        )}
                        {onDuplicate && onDelete && <DropdownMenu.Separator />}
                        {onDelete && (
                          <DropdownMenu.Item onClick={onDelete} destructive icon={IconTrash}>
                            Delete section
                          </DropdownMenu.Item>
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>


            {/* Instructions preview - shown when collapsed and section has instructions */}
            {!isExpanded && section.sectionType !== 'freeform' && section.instructions && (
              <div style={{
                padding: '0 16px 12px 16px',
              }}>
                <div style={{
                  fontSize: 13,
                  color: '#737373',
                  lineHeight: 1.45,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {section.instructions}
                </div>
              </div>
            )}

            {/* Freeform section callout - always visible, not in expandable body */}
            {section.sectionType === 'freeform' && (
              <div style={{ padding: '0 16px 16px 16px' }}>
                <div style={{
                  padding: '12px 16px',
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: 14, color: '#464646', lineHeight: 1.5 }}>
                    This is a flexible area where AI will create one or more sections based on the user's input and requirements when generating the presentation.
                  </div>
                </div>
              </div>
            )}

            {/* Card body - only visible when expanded (not for freeform sections) */}
            {isExpanded && section.sectionType !== 'freeform' && (
            <div id={sectionBodyId} style={{ padding: 16 }}>
                {/* Inline section title */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#464646', marginBottom: 6 }}>Section title <span style={{ color: '#C53030' }}>*</span></div>
                  <TextInput value={section.title} onChange={onUpdateTitle} placeholder="Add section name" />
                </div>

                {/* Section content */}
                <div>
                  {/* Header: label + slide count */}
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#464646' }}>Section content</div>
                    <div style={{ fontSize: 12, color: '#898989' }}>
                      {(() => {
                        const totalSlides = section.slides.reduce((sum, s) => {
                          if (s.type === 'ai') return sum + (s.slideCount || 1);
                          if (s.libraryMode === 'search') return sum + (s.slideCount || 1);
                          return sum + 1;
                        }, 0);
                        if (section.slides.length === 0) return '0 slides';
                        if (totalSlides === section.slides.length) return `${totalSlides} ${totalSlides === 1 ? 'slide' : 'slides'}`;
                        return `${section.slides.length} ${section.slides.length === 1 ? 'instruction' : 'instructions'} · ~${totalSlides} slides`;
                      })()}
                    </div>
                  </div>

                  {/* Content area - always visible gray background */}
                  <div style={{
                    background: '#ECECEC',
                    borderRadius: 10,
                    padding: 12,
                    minHeight: section.slides.length === 0 ? 120 : 'auto',
                  }}>
                    {section.slides.length > 0 && (
                      <SortableList
                        items={section.slides.map(s => s.id)}
                        onReorder={reorderSlides}
                        gap={10}
                        direction="horizontal"
                      >
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 10,
                        }}>
                          {section.slides.map((slide) => (
                            <SortableList.Item key={slide.id} id={slide.id} style={{ border: 0, padding: 0, background: 'transparent', boxShadow: 'none', width: 132, flexShrink: 0, flexGrow: 0 }}>
                              <SlidePlaceholder
                                slide={slide}
                                onRemove={() => removeSlide(slide.id)}
                                onEdit={() => openEditSlide(slide)}
                              />
                            </SortableList.Item>
                          ))}
                        </div>
                      </SortableList>
                    )}
                  </div>

                  {/* Content type popover button group */}
                  <div style={{ position: 'relative', marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                    {/* Content type button group with popover tab */}
                    <div
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      style={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'stretch',
                        border: '1px solid #E5E5E5',
                        borderRadius: 999,
                        overflow: 'visible',
                        background: '#FFFFFF',
                        padding: 4,
                        gap: 4,
                        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                      }}
                    >
                      {/* Popover tab connector */}
                        <div style={{
                          position: 'absolute',
                          top: -10,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 24,
                          height: 11,
                          overflow: 'hidden',
                          pointerEvents: 'none',
                        }}>
                          <div style={{
                            width: 24,
                            height: 24,
                            background: '#FFFFFF',
                            border: '1px solid #E5E5E5',
                            borderRadius: 4,
                            transform: 'rotate(45deg)',
                            position: 'absolute',
                            top: 5,
                            left: 0,
                          }} />
                        </div>
                      {[
                        { mode: 'ai' as const, label: 'AI generated content', icon: IconSparkle, iconColor: '#4A61ED' },
                        { mode: 'library-fixed' as const, label: 'Specific slides', icon: IconPresentation, iconColor: '#677848' },
                      ].map(({ mode, label, icon: Icon, iconColor }) => (
                        <ContentTypeButton
                          key={mode}
                          label={label}
                          icon={Icon}
                          onClick={() => openAddSlideDrawer(mode, true)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              {/* AI Expansion Guidance - shown when aiExpansion is enabled */}
              {showAIExpansionToggle && section.aiExpansion && (
                <div style={{
                  marginTop: 16,
                  padding: 16,
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                    <IconSparkle size={18} color="#D97706" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#464646' }}>
                        AI Expansion Point
                      </div>
                      <div style={{ fontSize: 12, color: '#464646' }}>
                        The AI may add sections after this one based on user input.
                      </div>
                    </div>
                  </div>
                  <Form.Label style={{ color: '#464646' }}>Guidance for AI <span style={{ fontWeight: 400, color: '#464646' }}>(optional)</span></Form.Label>
                  <TextArea
                    value={section.aiExpansionGuidance || ''}
                    onChange={(value) => onUpdateAIExpansionGuidance?.(value)}
                    placeholder="E.g., 'Add case studies if user mentions customer success' or 'Include detailed feature breakdowns based on user requirements'"
                    rows={3}
                  />
                </div>
              )}

            </div>
            )}
            </div>
          </div>
        )}
      </SortableList.Item>

      {/* Add Slide Modal */}
      <Modal open={activeSectionDrawer === 'add-slide'} onClose={closeAddSlideDrawer} size="large">
        {addSlideModalStep === 1 ? (
          <>
            <Modal.Header title="Add content" onClose={closeAddSlideDrawer} />
            <Modal.Body>
              <Stack gap="400">
                {/* Section title */}
                <Form.Field style={formFieldResetMarginStyle}>
                  <Form.Label>Section title</Form.Label>
                  <TextInput
                    value={section.title}
                    onChange={(value) => onUpdateTitle(value)}
                    placeholder="Add section name"
                  />
                </Form.Field>

                {/* Content type selection */}
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#464646' }}>Choose content type</div>
                    <div style={{ fontSize: 12, color: '#898989', marginTop: 2 }}>You can add more content of different types later</div>
                  </div>
                  <Stack gap="200">
                {[
                  { mode: 'ai' as const, title: 'AI slides', description: 'Let AI generate slides based on your instructions', icon: IconSparkle, iconColor: '#4A61ED', iconBg: '#F9F9FE' },
                  { mode: 'library-fixed' as const, title: 'Premade slides', description: 'Pick specific slides from the library', icon: IconPresentation, iconColor: '#677848', iconBg: '#F6FAF5' },
                ].map(({ mode, title, description, icon: Icon, iconColor, iconBg }) => (
                  <div
                    key={mode}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setDrawerMode(mode);
                      setAddSlideModalStep(2);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setDrawerMode(mode);
                        setAddSlideModalStep(2);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '16px 20px',
                      border: '1px solid #DFDFDF',
                      borderRadius: 10,
                      background: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F8F9FC';
                      e.currentTarget.style.borderColor = '#BABABA';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#DFDFDF';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size="small" color={iconColor} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#323232', marginBottom: 2 }}>
                        {title}
                      </div>
                      <div style={{ fontSize: 13, color: '#737373' }}>
                        {description}
                      </div>
                    </div>
                  </div>
                ))}
                  </Stack>
                </div>
              </Stack>
            </Modal.Body>
          </>
        ) : (
          <>
            <Modal.Header
              title={
                drawerMode === 'ai' ? 'AI content' :
                drawerMode === 'library-fixed' ? 'Library slide' :
                'Find slides in folder'
              }
              onClose={closeAddSlideDrawer}
            >
              <button
                type="button"
                onClick={() => setAddSlideModalStep(1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: 'none',
                  background: '#F1F1F1',
                  color: '#464646',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginRight: 8,
                }}
                aria-label="Back to content type selection"
              >
                <IconArrowLeft size="small" />
              </button>
            </Modal.Header>
            <Modal.Body>
              <Stack gap="400">
                {/* AI Slide mode */}
                {drawerMode === 'ai' && (
                  <div style={formFieldSpacingStyle}>
                    <Form.Field style={formFieldResetMarginStyle}>
                      <Form.Label>Title *</Form.Label>
                      <TextInput
                        value={aiSlideTitle}
                        onChange={(value) => setAiSlideTitle(value)}
                        placeholder="Enter slide title"
                      />
                    </Form.Field>

                    <Form.Field style={formFieldResetMarginStyle}>
                      <Form.Label>Instructions *</Form.Label>
                      <TextArea
                        value={aiSlideInstructions}
                        onChange={setAiSlideInstructions}
                        placeholder="Describe what the AI should generate for this slide..."
                        rows={6}
                      />
                    </Form.Field>

                    <Form.Field style={formFieldResetMarginStyle}>
                      <Form.Label>Number of slides</Form.Label>
                      <TextInput
                        value={librarySlideCount}
                        onChange={(value) => setLibrarySlideCount(value)}
                        placeholder="eg., 3 or 3-4"
                      />
                    </Form.Field>
                  </div>
                )}

                {/* Library Slides mode */}
                {drawerMode === 'library' && (
                  <Stack gap="300">
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: tokens.spacing[250],
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: tokens.colors.textPlaceholder,
                      }}>
                        <IconSearch size="small" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search folders and slides"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 40px',
                          border: '1px solid #DFDFDF',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {/* Browse library */}
                    <div>
                      <div style={{
                        background: '#FFFFFF',
                        border: '1px solid #DFDFDF',
                        borderRadius: 8,
                        maxHeight: 400,
                        overflow: 'auto',
                      }}>
                        {filteredFolders.map((folder) => {
                          const isExpanded = expandedFolders.includes(folder.id);
                          const folderSlideIds = folder.slides.map(s => s.id);
                          const selectedInFolder = folderSlideIds.filter(id => selectedSlides.includes(id)).length;
                          const allSelected = selectedInFolder === folder.slides.length;
                          const someSelected = selectedInFolder > 0 && !allSelected;

                          return (
                            <div key={folder.id}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '10px 12px',
                                  borderBottom: '1px solid #F1F1F1',
                                  cursor: 'pointer',
                                  background: isExpanded ? '#FAFAFA' : 'transparent',
                                }}
                                onClick={() => toggleExpandFolder(folder.id)}
                              >
                                <div
                                  style={{
                                    padding: 4,
                                    color: '#737373',
                                    display: 'flex',
                                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  }}
                                >
                                  <IconChevronDown size="small" />
                                </div>

                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelectAllInFolder(folder.id, folder.slides);
                                  }}
                                  style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: 4,
                                    border: allSelected || someSelected ? 'none' : '1.5px solid #DFDFDF',
                                    background: allSelected ? '#4A61ED' : someSelected ? '#4A61ED' : '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 10,
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                    boxSizing: 'border-box',
                                  }}
                                >
                                  {allSelected && (
                                    <IconCheck size="xsmall" color="white" />
                                  )}
                                  {someSelected && !allSelected && (
                                    <span
                                      style={{
                                        width: 6,
                                        height: 2,
                                        borderRadius: 999,
                                        background: '#FFFFFF',
                                      }}
                                    />
                                  )}
                                </div>

                                <IconFolder size="medium" color="#F59E0B" style={{ marginRight: 8 }} />

                                <span style={{ flex: 1, fontSize: 14, color: '#323232', fontWeight: 500 }}>
                                  {folder.name}
                                </span>

                                <span style={{ fontSize: 14, color: selectedInFolder > 0 ? '#464646' : '#737373' }}>
                                  {selectedInFolder > 0 ? `${selectedInFolder} selected` : `${folder.slides.length} slides`}
                                </span>
                              </div>

                              {isExpanded && (
                                <div style={{ background: '#FAFAFA' }}>
                                  {folder.slides.map((slide) => {
                                    const isSelected = selectedSlides.includes(slide.id);
                                    return (
                                      <div
                                        key={slide.id}
                                        onClick={() => toggleSlide(slide.id)}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          padding: '8px 12px 8px 48px',
                                          borderBottom: '1px solid #F0F0F0',
                                          cursor: 'pointer',
                                          background: isSelected ? '#F9F9FE' : 'transparent',
                                          transition: 'background 0.1s ease',
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: 4,
                                            border: isSelected ? 'none' : '1.5px solid #DFDFDF',
                                            background: isSelected ? '#4A61ED' : '#FFFFFF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 10,
                                            flexShrink: 0,
                                            boxSizing: 'border-box',
                                          }}
                                        >
                                          {isSelected && (
                                            <IconCheck size="xsmall" color="white" />
                                          )}
                                        </div>

                                        <div style={{
                                          width: 48,
                                          height: 32,
                                          background: '#FFFFFF',
                                          border: '1px solid #DFDFDF',
                                          borderRadius: 4,
                                          marginRight: 10,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: 9,
                                          color: '#737373',
                                          fontWeight: 500,
                                        }}>
                                          {slide.thumbnail}
                                        </div>

                                        <span style={{ fontSize: 14, color: '#464646' }}>
                                          {slide.name}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {selectedSlides.length === 1 && (
                      <div
                        style={{
                          ...baseInteractiveSurface,
                          padding: surfaceSpacing.card.padding,
                          display: 'flex',
                          alignItems: 'center',
                          gap: surfaceSpacing.card.gap,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = hoverInteractiveSurface.background as string;
                          e.currentTarget.style.boxShadow = hoverInteractiveSurface.boxShadow as string;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = baseInteractiveSurface.background as string;
                          e.currentTarget.style.boxShadow = baseInteractiveSurface.boxShadow as string;
                        }}
                      >
                        <IconCheck size="small" color="#22C55E" />
                        <span style={{ fontSize: 14, color: surfaceText.body }}>
                          1 slide selected — will be added directly
                        </span>
                      </div>
                    )}

                    {selectedSlides.length > 1 && (
                      <Stack gap="300">
                        <div
                          style={{
                            ...baseInteractiveSurface,
                            padding: surfaceSpacing.card.padding,
                            fontSize: tokens.fontSize[200],
                            color: surfaceText.body,
                            fontWeight: 500,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = hoverInteractiveSurface.background as string;
                            e.currentTarget.style.boxShadow = hoverInteractiveSurface.boxShadow as string;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = baseInteractiveSurface.background as string;
                            e.currentTarget.style.boxShadow = baseInteractiveSurface.boxShadow as string;
                          }}
                        >
                          {selectedSlides.length} slides selected from library
                        </div>

                        <div style={formFieldSpacingStyle}>
                          <Form.Field style={formFieldResetMarginStyle}>
                            <Form.Label>Number of slides to include</Form.Label>
                            <TextInput
                              value={librarySlideCount}
                              onChange={(value) => setLibrarySlideCount(value)}
                              placeholder="e.g., 3 or 2-5"
                            />
                          </Form.Field>

                          <Form.Field style={formFieldResetMarginStyle}>
                            <Form.Label>Selection instructions</Form.Label>
                            <TextArea
                              value={inclusionCriteria}
                              onChange={setInclusionCriteria}
                              placeholder="e.g., Select the most relevant slides based on the presentation topic. Prioritize slides with recent data..."
                              rows={3}
                            />
                          </Form.Field>
                        </div>
                      </Stack>
                    )}
                  </Stack>
                )}

                {/* V2: Search slides in Library mode */}
                {drawerMode === 'library-search' && (
                  <Stack gap="300">
                    <DrawerStatusChips chips={[folderScopeChip]} />
                    <div>
                      <div
                        ref={searchFolderSelectorRef}
                        style={{
                          border: '1px solid #DFDFDF',
                          borderRadius: 8,
                          background: '#FFFFFF',
                          overflow: 'hidden',
                          height: searchFolderSelectorHeight,
                          maxHeight: searchFolderSelectorHeight,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {!showFolderBreadcrumb && (
                          <div
                            style={{
                              padding: 12,
                              borderBottom: '1px solid #F1F1F1',
                              flexShrink: 0,
                            }}
                          >
                            <TextInput
                              value={folderRootSearch}
                              onChange={setFolderRootSearch}
                              placeholder="Search folders"
                            />
                          </div>
                        )}

                        {showFolderBreadcrumb && (
                          <div
                            style={{
                              padding: '10px 12px',
                              borderBottom: '1px solid #F1F1F1',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              minHeight: 52,
                              flexShrink: 0,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setFolderPath((prev) => prev.slice(0, -1))}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                border: 'none',
                                background: '#F1F1F1',
                                color: '#737373',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                              aria-label="Navigate up"
                            >
                              <IconArrowLeft size="small" />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                              <button
                                type="button"
                                onClick={() => setFolderPath([])}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  padding: 0,
                                  width: 16,
                                  height: 16,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                }}
                                aria-label="Go to root folder"
                              >
                                <IconLayers size="small" color="#737373" />
                              </button>

                              <span style={{ color: '#737373' }}>/</span>

                              {breadcrumbNodes.map((folder, index) => (
                                <React.Fragment key={folder.id}>
                                  {index > 0 && <span style={{ color: '#737373' }}>/</span>}
                                  <button
                                    type="button"
                                    onClick={() => setFolderPath(folderPath.slice(0, index + 1))}
                                    style={{
                                      border: 'none',
                                      background: 'transparent',
                                      padding: 0,
                                      fontSize: 14,
                                      color: index === breadcrumbNodes.length - 1 ? '#323232' : '#464646',
                                      fontWeight: index === breadcrumbNodes.length - 1 ? 600 : 400,
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {folder.name}
                                  </button>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                          {filteredVisibleFolders.length === 0 && (
                            <div style={{ padding: '14px 12px', fontSize: 14, color: '#737373' }}>
                              {!showFolderBreadcrumb && folderRootSearchValue
                                ? 'No folders match your search.'
                                : 'This folder has no subfolders.'}
                            </div>
                          )}

                          {filteredVisibleFolders.map((folder, index) => {
                            const isSelected = limitedFolders.includes(folder.id);
                            const isHovered = hoveredFolderId === folder.id;
                            return (
                              <div
                                key={folder.id}
                                onClick={() => toggleLimitedFolder(folder.id)}
                                onMouseEnter={() => setHoveredFolderId(folder.id)}
                                onMouseLeave={() => setHoveredFolderId((current) => (current === folder.id ? null : current))}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 12,
                                  padding: '10px 12px',
                                  borderBottom: index === filteredVisibleFolders.length - 1 ? 'none' : '1px solid #F1F1F1',
                                  borderLeft: isSelected ? '4px solid #4A61ED' : '4px solid transparent',
                                  background: isHovered ? '#F8F9FC' : '#FFFFFF',
                                  cursor: 'pointer',
                                  minHeight: 56,
                                  transition: 'background-color 0.15s ease',
                                }}
                              >
                                <div
                                  style={{
                                    width: 44,
                                    height: 36,
                                    borderRadius: 10,
                                    background: '#F1F1F1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <IconFolder size="medium" color="#898989" />
                                </div>

                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                  <span
                                    style={{
                                      fontSize: 14,
                                      color: '#323232',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {folder.name}
                                  </span>
                                  {isSelected && (
                                    <IconCheck size="small" color="#4A61ED" style={{ flexShrink: 0 }} />
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setFolderPath([...folderPath, folder.id]);
                                  }}
                                  style={{
                                    border: `1px solid ${isHovered ? '#BABABA' : '#DFDFDF'}`,
                                    background: isHovered ? '#F8F9FC' : '#FFFFFF',
                                    color: '#464646',
                                    borderRadius: 6,
                                    padding: '4px 10px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                  }}
                                >
                                  Open
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div ref={searchSlidesBelowFieldsRef} style={formFieldSpacingStyle}>
                      <Form.Field style={formFieldResetMarginStyle}>
                        <Form.Label>Search instructions</Form.Label>
                        <TextArea
                          value={searchInstructions}
                          onChange={setSearchInstructions}
                          placeholder="Describe the kinds of slides to find in the selected folders..."
                          rows={4}
                        />
                      </Form.Field>

                      <Form.Field style={formFieldResetMarginStyle}>
                        <Form.Label>Number of slides</Form.Label>
                        <TextInput
                          value={searchSlidesCount}
                          onChange={setSearchSlidesCount}
                          placeholder="e.g., 3 or 3-5"
                        />
                      </Form.Field>
                    </div>
                  </Stack>
                )}

                {/* Premade slides - simple flat folder list */}
                {drawerMode === 'library-fixed' && (
                  <Stack gap="300">
                    <DrawerStatusChips chips={[`${selectedFixedSlides.length} selected`]} />
                    <div
                      style={{
                        border: '1px solid #DFDFDF',
                        borderRadius: 8,
                        background: '#FFFFFF',
                        overflow: 'hidden',
                        maxHeight: 420,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                        {libraryFolders.map((folder) => (
                          <div key={folder.id}>
                            {/* Folder header */}
                            <div
                              onClick={() => setExpandedFolders(
                                expandedFolders.includes(folder.id)
                                  ? expandedFolders.filter((id) => id !== folder.id)
                                  : [...expandedFolders, folder.id]
                              )}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderBottom: '1px solid #F1F1F1',
                                background: '#FAFAFA',
                                cursor: 'pointer',
                                minHeight: 44,
                                transition: 'background-color 0.15s ease',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F5F5'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#FAFAFA'; }}
                            >
                              <IconChevronDown
                                size="small"
                                color="#898989"
                                style={{
                                  transform: expandedFolders.includes(folder.id) ? 'rotate(0deg)' : 'rotate(-90deg)',
                                  transition: 'transform 0.2s ease',
                                  flexShrink: 0,
                                }}
                              />
                              <IconFolder size="small" color="#898989" />
                              <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#323232' }}>
                                {folder.name}
                              </div>
                              <span style={{ fontSize: 12, color: '#737373' }}>
                                {folder.slides.length} slides
                              </span>
                            </div>

                            {/* Slides in folder */}
                            {expandedFolders.includes(folder.id) && folder.slides.map((slide, slideIndex) => {
                              const isSelected = selectedFixedSlides.some((item) => item.assetId === slide.id);
                              return (
                                <div
                                  key={slide.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '8px 12px 8px 42px',
                                    borderBottom: '1px solid #F1F1F1',
                                    borderLeft: isSelected ? '3px solid #4A61ED' : '3px solid transparent',
                                    background: isSelected ? '#F9F9FE' : '#FFFFFF',
                                    minHeight: 42,
                                  }}
                                >
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, color: '#323232' }}>{slide.name}</div>
                                  </div>
                                  <Button
                                    action={isSelected ? 'secondary' : 'primary'}
                                    size="xsmall"
                                    onClick={() => {
                                      if (isSelected) return;
                                      setSelectedFixedSlides([
                                        ...selectedFixedSlides,
                                        { assetId: slide.id, name: slide.name, folderId: folder.id, folderName: folder.name },
                                      ]);
                                    }}
                                    disabled={isSelected}
                                  >
                                    {isSelected ? 'Added' : 'Add'}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selected slides list */}
                    {selectedFixedSlides.length > 0 && (
                      <Form.Field>
                        <Form.Label>Selected slides ({selectedFixedSlides.length})</Form.Label>
                        <div
                          style={{
                            border: '1px solid #DFDFDF',
                            borderRadius: 8,
                            background: '#FFFFFF',
                            maxHeight: 200,
                            overflowY: 'auto',
                          }}
                        >
                          {selectedFixedSlides.map((slide, index) => (
                            <div
                              key={slide.assetId}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '8px 10px',
                                borderBottom: index === selectedFixedSlides.length - 1 ? 'none' : '1px solid #F1F1F1',
                              }}
                            >
                              <div style={{ fontSize: 12, color: '#737373', width: 20, textAlign: 'center', flexShrink: 0 }}>
                                {index + 1}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, color: '#323232', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {slide.name}
                                </div>
                                <div style={{ fontSize: 11, color: '#737373' }}>{slide.folderName}</div>
                              </div>
                              <Button action="secondary" size="xsmall" onClick={() => removeSelectedFixedSlide(slide.assetId)}>
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </Form.Field>
                    )}
                  </Stack>
                )}
              </Stack>
            </Modal.Body>
            <Modal.Footer>
              <Box display="flex" justifyContent="flex-end" gap="200">
                <Button action="secondary" onClick={closeAddSlideDrawer}>
                  Cancel
                </Button>
                <Button
                  action="primary"
                  onClick={handleAddSlideFromDrawer}
                  disabled={
                    (drawerMode === 'library' && selectedSlides.length === 0) ||
                    (drawerMode === 'library-fixed' && selectedFixedSlides.length === 0)
                  }
                >
                  {drawerMode === 'library' && selectedSlides.length > 0
                    ? selectedSlides.length === 1
                      ? 'Add instruction'
                      : `Add ${librarySlideCount || selectedSlides.length} slides`
                    : drawerMode === 'library-fixed' && selectedFixedSlides.length > 0
                      ? `Add ${selectedFixedSlides.length} fixed slide${selectedFixedSlides.length === 1 ? '' : 's'}`
                    : 'Add instruction'}
                </Button>
              </Box>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* Edit Slide Modal */}
      <Modal open={activeSectionDrawer === 'edit-slide' && editingSlide !== null} onClose={closeEditSlide} size="large">
        <Modal.Header
          title={
            editDrawerTab === 'ai' ? 'Edit AI content' :
            editDrawerTab === 'library-fixed' ? 'Edit library slide' :
            editDrawerTab === 'library-search' ? 'Edit search slides' :
            'Edit content'
          }
          onClose={closeEditSlide}
        />
        <Modal.Body>
          <Stack gap="400">
            {/* Content type selector */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#464646', marginBottom: 8 }}>Content type</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {([
                  { mode: 'ai' as const, label: 'AI content', icon: IconSparkle, iconColor: '#4A61ED', iconBg: '#F9F9FE' },
                  { mode: 'library-fixed' as const, label: 'Library slide', icon: IconPresentation, iconColor: '#677848', iconBg: '#F6FAF5' },
                  { mode: 'library-search' as const, label: 'Find in folder', icon: IconSearch, iconColor: '#F59E0B', iconBg: '#FFFBEB' },
                ] as const).map(({ mode, label, icon: TypeIcon, iconColor, iconBg }) => {
                  const isActive = editDrawerTab === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setEditDrawerTab(mode)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 12px',
                        border: isActive ? `1.5px solid ${iconColor}` : '1.5px solid #DFDFDF',
                        borderRadius: 8,
                        background: isActive ? iconBg : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <TypeIcon size={16} color={iconColor} />
                      <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? iconColor : '#464646' }}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI content fields */}
            {editDrawerTab === 'ai' && (
              <div style={formFieldSpacingStyle}>
                <Form.Field style={formFieldResetMarginStyle}>
                  <Form.Label>Title *</Form.Label>
                  <TextInput
                    value={editSlideTitle}
                    onChange={(value) => setEditSlideTitle(value)}
                    placeholder="Enter slide title"
                  />
                </Form.Field>

                <Form.Field style={formFieldResetMarginStyle}>
                  <Form.Label>Instructions *</Form.Label>
                  <TextArea
                    value={editSlideInstructions}
                    onChange={setEditSlideInstructions}
                    placeholder="Describe what the AI should generate for this slide..."
                    rows={6}
                  />
                </Form.Field>

                <Form.Field style={formFieldResetMarginStyle}>
                  <Form.Label>Number of slides</Form.Label>
                  <TextInput
                    value={editSlideCount}
                    onChange={(value) => setEditSlideCount(value)}
                    placeholder="eg., 3 or 3-4"
                  />
                </Form.Field>
              </div>
            )}

            {/* Library fixed fields */}
            {editDrawerTab === 'library-fixed' && (
              <div style={formFieldSpacingStyle}>
                <Form.Field style={formFieldResetMarginStyle}>
                  <Form.Label>Selected slides</Form.Label>
                  {editSelectedSlides.length === 0 ? (
                    <div style={{ fontSize: 13, color: '#737373', padding: '12px 0' }}>
                      No slides selected. Save and use "Add content" to pick slides from the library.
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: '#464646' }}>
                      {editSelectedSlides.length} slide{editSelectedSlides.length === 1 ? '' : 's'} selected
                    </div>
                  )}
                </Form.Field>

                <Form.Field style={formFieldResetMarginStyle}>
                  <Form.Label>Selection instructions</Form.Label>
                  <TextArea
                    value={editInclusionCriteria}
                    onChange={setEditInclusionCriteria}
                    placeholder="e.g., Select the most relevant slides based on the presentation topic..."
                    rows={3}
                  />
                </Form.Field>
              </div>
            )}

            {/* Library search fields */}
            {editDrawerTab === 'library-search' && (
              <div style={formFieldSpacingStyle}>
                <Form.Field style={formFieldResetMarginStyle}>
                  <Form.Label>Search instructions</Form.Label>
                  <TextArea
                    value={editSearchInstructions}
                    onChange={setEditSearchInstructions}
                    placeholder="Describe the kinds of slides to find in the selected folders..."
                    rows={4}
                  />
                </Form.Field>

                <Form.Field style={formFieldResetMarginStyle}>
                  <Form.Label>Number of slides</Form.Label>
                  <TextInput
                    value={editSlideCount}
                    onChange={(value) => setEditSlideCount(value)}
                    placeholder="e.g., 3 or 3-5"
                  />
                </Form.Field>

                {editLimitedFolders.length > 0 && (
                  <div style={{ fontSize: 13, color: '#464646' }}>
                    Searching in {editLimitedFolders.length} folder{editLimitedFolders.length === 1 ? '' : 's'}
                  </div>
                )}
              </div>
            )}
          </Stack>
        </Modal.Body>
        <Modal.Footer>
          <Box display="flex" justifyContent="space-between">
            <Button action="secondary" icon={IconTrash} onClick={() => { removeSlide(editingSlide!.id); closeEditSlide(); }}>
              Delete
            </Button>
            <Box display="flex" gap="200">
              <Button action="secondary" onClick={closeEditSlide}>
                Cancel
              </Button>
              <Button action="primary" onClick={saveEditSlide}>
                Apply changes
              </Button>
            </Box>
          </Box>
        </Modal.Footer>
      </Modal>

      {/* Section Question Modal */}
      <Modal
        open={isSectionQuestionModalOpen}
        onClose={() => {
          setIsSectionQuestionModalOpen(false);
          setEditingSectionQuestion(null);
          setSectionQuestionInput('');
          setSectionQuestionRequired(true);
        }}
        size="medium"
      >
        <Modal.Header
          title={editingSectionQuestion ? 'Edit question' : 'Add question'}
          onClose={() => {
            setIsSectionQuestionModalOpen(false);
            setEditingSectionQuestion(null);
            setSectionQuestionInput('');
            setSectionQuestionRequired(true);
          }}
        />
        <Modal.Body>
          <div style={formFieldSpacingStyle}>
            <Form.Field style={formFieldResetMarginStyle}>
              <Form.Label>Question</Form.Label>
              <TextInput
                placeholder="E.g., What is the budget range?"
                value={sectionQuestionInput}
                onChange={setSectionQuestionInput}
              />
            </Form.Field>

            {/* Required checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: sectionQuestionRequired ? 'none' : '1.5px solid #DFDFDF',
                background: sectionQuestionRequired ? '#4A61ED' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setSectionQuestionRequired(!sectionQuestionRequired)}
              >
                {sectionQuestionRequired && (
                  <IconCheck size="xsmall" color="white" />
                )}
              </div>
              <span style={{ fontSize: 14, color: '#464646' }}>Required question</span>
            </label>

            <div style={{
              padding: '12px 16px',
              background: '#F9FAFB',
              border: '1px solid #DFDFDF',
              borderRadius: 8,
              fontSize: 13,
              color: '#737373',
            }}>
              This question applies to the "{section.title || 'Untitled'}" section only.
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Box display="flex" justifyContent="space-between" style={{ width: '100%' }}>
            {editingSectionQuestion ? (
              <Button
                action="secondary"
                icon={IconTrash}
                onClick={() => {
                  if (onUpdateQuestions) {
                    const currentQuestions = section.questions || [];
                    onUpdateQuestions(currentQuestions.filter(q => q.id !== editingSectionQuestion.id));
                  }
                  setIsSectionQuestionModalOpen(false);
                  setEditingSectionQuestion(null);
                  setSectionQuestionInput('');
                  setSectionQuestionRequired(true);
                }}
              >
                Delete
              </Button>
            ) : <div />}
            <Box display="flex" gap="200">
              <Button
                action="secondary"
                onClick={() => {
                  setIsSectionQuestionModalOpen(false);
                  setEditingSectionQuestion(null);
                  setSectionQuestionInput('');
                  setSectionQuestionRequired(true);
                }}
              >
                Cancel
              </Button>
              <Button
                action="primary"
                disabled={!sectionQuestionInput.trim()}
                onClick={() => {
                  if (sectionQuestionInput.trim() && onUpdateQuestions) {
                    const currentQuestions = section.questions || [];
                    if (editingSectionQuestion) {
                      const updatedQuestions = currentQuestions.map(q =>
                        q.id === editingSectionQuestion.id
                          ? { ...q, question: sectionQuestionInput.trim(), required: sectionQuestionRequired }
                          : q
                      );
                      onUpdateQuestions(updatedQuestions);
                    } else {
                      onUpdateQuestions([
                        ...currentQuestions,
                        createQuestionConfig(sectionQuestionInput.trim(), sectionQuestionRequired)
                      ]);
                    }
                    setIsSectionQuestionModalOpen(false);
                    setEditingSectionQuestion(null);
                    setSectionQuestionInput('');
                    setSectionQuestionRequired(true);
                  }
                }}
              >
                {editingSectionQuestion ? 'Save' : 'Add question'}
              </Button>
            </Box>
          </Box>
        </Modal.Footer>
      </Modal>
    </>
  );
}

// Slide preview card for the section
/**
 * ContentItemRow — compact row for section content list
 */
function ContentTypeButton({ label, icon: Icon, onClick }: { label: string; icon: React.ComponentType<any>; onClick: () => void }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '10px 14px',
        fontSize: 13,
        fontWeight: 500,
        fontFamily: 'inherit',
        color: isHovered ? '#FFFFFF' : '#464646',
        background: isHovered ? '#323232' : 'transparent',
        border: 'none',
        borderRadius: 999,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s ease, color 0.15s ease',
      }}
    >
      {isHovered ? <IconAdd size={16} color="#FFFFFF" /> : <Icon size={16} color="currentColor" />}
      {label}
    </button>
  );
}

function SlidePlaceholder({ slide, onRemove, onEdit }: { slide: SlideConfig; onRemove: () => void; onEdit: () => void }) {
  const [isHovered, setIsHovered] = React.useState(false);

  const TypeIcon = slide.type === 'ai' ? IconSparkle : IconPresentation;
  const typeLabel = slide.type === 'ai' ? 'AI' : 'Library';
  const title = slide.title || (slide.type === 'ai' ? 'AI slides' : 'Library slide');
  const typeColor = slide.type === 'ai' ? '#4A61ED' : '#677848';
  const typeBg = slide.type === 'ai' ? '#F0F0FF' : '#F0F5EC';
  const count = slide.type === 'ai' ? (slide.slideCount || 1)
    : slide.libraryMode === 'search' ? (slide.slideCount || 1)
    : 1;
  const countLabel = `${count} ${count === 1 ? 'slide' : 'slides'}`;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onEdit}
      style={{
        position: 'relative',
        width: 132,
        aspectRatio: '16 / 10',
        borderRadius: 6,
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        boxShadow: isHovered
          ? '0 2px 8px rgba(0,0,0,0.10)'
          : '0 0.5px 2px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        padding: 8,
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        borderColor: isHovered ? '#BABABA' : '#E5E5E5',
      }}
    >
      {/* Drag handle + Delete button on hover */}
      {isHovered && (
        <>
          <div style={{
            position: 'absolute',
            top: 4,
            left: 4,
            zIndex: 1,
            opacity: 0.5,
          }}>
            <SortableList.DragHandle />
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.55)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              padding: 0,
              zIndex: 1,
            }}
          >
            <IconTrash size={11} color="#FFFFFF" />
          </button>
        </>
      )}

      {/* Type + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
        <TypeIcon size={12} color={typeColor} />
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#323232',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {title}
        </span>
      </div>

      {/* Slide count badge */}
      <span style={{
        display: 'inline-block',
        fontSize: 10,
        fontWeight: 500,
        color: '#6B6B9E',
        background: '#F0F0F8',
        padding: '1px 6px',
        borderRadius: 999,
        alignSelf: 'flex-start',
      }}>
        {countLabel}
      </span>
    </div>
  );
}

function ContentItemRow({ slide, onRemove, onEdit }: { slide: SlideConfig; onRemove: () => void; onEdit: () => void }) {
  const [isHovered, setIsHovered] = React.useState(false);

  // Type indicator
  const TypeIcon = slide.type === 'ai' ? IconSparkle
    : slide.libraryMode === 'search' ? IconSearch
    : IconPresentation;
  const typeLabel = slide.type === 'ai' ? 'AI'
    : slide.libraryMode === 'search' ? 'Search'
    : 'Library';
  const typeColor = slide.type === 'ai' ? '#4A61ED' : slide.libraryMode === 'search' ? '#F59E0B' : '#677848';
  const typeBg = slide.type === 'ai' ? '#F9F9FE' : slide.libraryMode === 'search' ? '#FFFBEB' : '#F6FAF5';

  // Content text
  const contentText = slide.type === 'ai'
    ? (slide.title || slide.aiInstructions || 'AI Generated')
    : slide.libraryMode === 'search'
    ? (slide.searchInstructions || 'Search in Library')
    : (slide.title || 'Library Slide');

  // Slide count
  const count = slide.type === 'ai' ? (slide.slideCount || 1)
    : slide.libraryMode === 'search' ? (slide.slideCount || 1)
    : 1;

  return (
    <div
      onClick={onEdit}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 8px',
        borderRadius: 6,
        background: '#FFFFFF',
        boxShadow: isHovered
          ? '0 0 0 1px rgba(41, 48, 56, 0.02), 0 4px 8px 0 rgba(41, 48, 56, 0.05), 0 12px 24px 0 rgba(41, 48, 56, 0.05)'
          : '0 0.5px 1px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'box-shadow 0.12s ease',
        minHeight: 36,
      }}
    >
      {/* Drag handle */}
      <div style={{ flexShrink: 0, opacity: isHovered ? 0.7 : 0.35, transition: 'opacity 0.12s' }}>
        <SortableList.DragHandle />
      </div>

      {/* Type indicator chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, background: typeBg, padding: '2px 8px', borderRadius: 4 }}>
        <TypeIcon size={14} color={typeColor} />
        <span style={{ fontSize: 11, color: typeColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          {typeLabel}
        </span>
      </div>

      {/* Content text */}
      <div style={{
        flex: 1,
        minWidth: 0,
        fontSize: 13,
        fontWeight: 500,
        color: '#323232',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {contentText}
      </div>

      {/* Slide count badge */}
      {count > 1 && (
        <div style={{
          flexShrink: 0,
          fontSize: 11,
          fontWeight: 500,
          color: '#737373',
          background: '#DFDFDF',
          padding: '1px 7px',
          borderRadius: 10,
        }}>
          ×{count}
        </div>
      )}

      {/* Delete button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          padding: 2,
          cursor: 'pointer',
          color: '#737373',
          display: 'flex',
          opacity: 0.7,
          transition: 'color 0.12s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#BC5257'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#737373'; }}
      >
        <IconTrash size="xsmall" />
      </button>
    </div>
  );
}

interface SlidePreviewCardProps {
  slide: SlideConfig;
  onRemove: () => void;
  onEdit?: () => void;
  showDragHandle?: boolean;
}

function SlidePreviewCard({ slide, onRemove, onEdit, showDragHandle }: SlidePreviewCardProps) {
  const folder = slide.type === 'library' && slide.selectedFolderId
    ? mockFolders.find(f => f.id === slide.selectedFolderId)
    : null;

  // Determine slide category
  // - AI slide: type is 'ai'
  // - Folder slide: library slide with criteria-based selection (AI picks from folder)
  // - Direct slides: library slide with direct selection (specific slides picked)
  const isAiSlide = slide.type === 'ai';
  const isFolderSlide = slide.type === 'library' && slide.selectionMode === 'criteria';
  const isDirectSlide = slide.type === 'library' && slide.selectionMode !== 'criteria';

  // Get slide count for display
  const directSlideCount = slide.selectedSlideIds?.length || 1;
  const slideCount = isAiSlide
    ? (slide.slideCount || 1)
    : isFolderSlide
      ? (slide.slideCount || 1)
      : directSlideCount;

  // For direct slides: single (1 slide) vs multiple (2+ slides)
  const isSingleDirectSlide = isDirectSlide && directSlideCount === 1;
  const isMultipleDirectSlides = isDirectSlide && directSlideCount > 1;

  // Theme colors based on slide type
  const theme = isAiSlide
    ? { bg: '#F5F3FF', border: '#DDD6FE', accent: '#7C3AED', label: 'AI Slide' }
    : isFolderSlide
      ? { bg: '#FEF3C7', border: '#FDE68A', accent: '#D97706', label: folder?.name || 'Folder' }
      : { bg: '#F0F9FF', border: '#BAE6FD', accent: '#0284C7', label: 'Library Slide' };

  return (
    <div
      onClick={onEdit}
      style={{
        width: 140,
        height: 96,
        background: '#FFFFFF',
        borderRadius: 8,
        border: `1px solid ${theme.border}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        cursor: onEdit ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onEdit) {
          e.currentTarget.style.borderColor = '#4A61ED';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(74, 97, 237, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.border;
        e.currentTarget.style.boxShadow = 'none';
      }}>

      {/* Slide thumbnail area */}
      <div style={{
        flex: 1,
        background: theme.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: 8,
      }}>
        {/* Drag handle */}
        {showDragHandle && (
          <div
            style={{
              position: 'absolute',
              top: 4,
              left: 4,
              cursor: 'grab',
              color: '#737373',
              display: 'flex',
            }}
          >
            <SortableList.DragHandle />
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: 4,
            padding: 2,
            cursor: 'pointer',
            color: '#737373',
            display: 'flex',
            opacity: 0.7,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          <IconTrash size="xsmall" />
        </button>

        {/* Visual thumbnail based on type */}
        {isAiSlide && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {/* Mini slide preview */}
            <div style={{
              width: 48,
              height: 32,
              background: '#FFFFFF',
              border: '1px solid #DFDFDF',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              padding: 4,
              gap: 2,
            }}>
              <div style={{ width: '70%', height: 3, background: '#7C3AED', borderRadius: 1 }} />
              <div style={{ width: '90%', height: 2, background: '#DFDFDF', borderRadius: 1 }} />
              <div style={{ width: '60%', height: 2, background: '#DFDFDF', borderRadius: 1 }} />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              background: '#7C3AED',
              padding: '2px 6px',
              borderRadius: 4,
            }}>
              <IconSparkle size="xsmall" color="#FFFFFF" />
              <span style={{ fontSize: 9, color: '#737373', fontWeight: 600 }}>AI</span>
            </div>
          </div>
        )}

        {/* Folder with criteria - AI picks from folder */}
        {isFolderSlide && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {/* Large folder icon */}
            <div style={{
              width: 48,
              height: 36,
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <IconFolder size={28} color="#D97706" />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              background: '#D97706',
              padding: '2px 6px',
              borderRadius: 4,
            }}>
              <IconSparkle size="xsmall" color="#FFFFFF" />
              <span style={{ fontSize: 9, color: '#737373', fontWeight: 600 }}>AI Picks</span>
            </div>
          </div>
        )}

        {/* Single direct slide - one specific slide selected */}
        {isSingleDirectSlide && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {/* Single slide thumbnail */}
            <div style={{
              width: 48,
              height: 32,
              background: '#FFFFFF',
              border: '1px solid #BAE6FD',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              padding: 4,
              gap: 2,
            }}>
              <div style={{ width: '50%', height: 3, background: '#0284C7', borderRadius: 1 }} />
              <div style={{ width: '80%', height: 2, background: '#E0F2FE', borderRadius: 1 }} />
              <div style={{ width: '65%', height: 2, background: '#E0F2FE', borderRadius: 1 }} />
            </div>
            <span style={{
              fontSize: 9,
              color: '#464646',
              fontWeight: 500,
            }}>
              1 slide
            </span>
          </div>
        )}

        {/* Multiple direct slides - specific slides selected */}
        {isMultipleDirectSlides && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {/* Stacked slides effect */}
            <div style={{ position: 'relative', width: 52, height: 40 }}>
              <div style={{
                position: 'absolute',
                top: 6,
                left: 6,
                width: 44,
                height: 28,
                background: '#E0F2FE',
                border: '1px solid #BAE6FD',
                borderRadius: 2,
              }} />
              <div style={{
                position: 'absolute',
                top: 3,
                left: 3,
                width: 44,
                height: 28,
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: 2,
              }} />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 44,
                height: 28,
                background: '#FFFFFF',
                border: '1px solid #BAE6FD',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                padding: 3,
                gap: 1,
              }}>
                <div style={{ width: '50%', height: 2, background: '#0284C7', borderRadius: 1 }} />
                <div style={{ width: '70%', height: 1.5, background: '#BAE6FD', borderRadius: 1 }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Label area */}
      <div style={{
        padding: '6px 8px',
        borderTop: `1px solid ${theme.border}`,
        background: '#FAFAFA',
      }}>
        {isAiSlide && (
          <div style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#464646',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {slide.aiInstructions ? slide.aiInstructions.substring(0, 18) + '...' : 'AI Generated'}
          </div>
        )}
        {isFolderSlide && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 500,
            color: '#464646',
            overflow: 'hidden',
          }}>
            <IconFolder size="xsmall" color="#D97706" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {folder?.name || 'Folder'}
            </span>
          </div>
        )}
        {isSingleDirectSlide && (
          <div style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#464646',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {slide.selectedSlideIds?.[0] ? (findSlideName(slide.selectedSlideIds[0]) || 'Slide') : 'Slide'}
          </div>
        )}
        {isMultipleDirectSlides && (
          <div style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#464646',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {folder?.name || 'Library'}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * LayoutPreview - Mini slide layout preview like PowerPoint
 */
function LayoutPreview({ type, size = 'small' }: { type: string; size?: 'small' | 'medium' }) {
  const dimensions = size === 'small' ? { width: 32, height: 20 } : { width: 48, height: 30 };
  const baseStyle: React.CSSProperties = {
    width: dimensions.width,
    height: dimensions.height,
    background: '#FFFFFF',
    border: '1px solid #DFDFDF',
    borderRadius: 2,
    display: 'flex',
    flexDirection: 'column',
    padding: 2,
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const titleBar: React.CSSProperties = {
    width: '60%',
    height: 3,
    background: '#464646',
    borderRadius: 1,
    marginBottom: 2,
  };

  const contentBar: React.CSSProperties = {
    width: '80%',
    height: 2,
    background: '#DFDFDF',
    borderRadius: 1,
    marginBottom: 1,
  };

  const halfColumn: React.CSSProperties = {
    flex: 1,
    background: '#F1F1F1',
    borderRadius: 1,
    margin: 1,
  };

  switch (type) {
    case 'title':
      return (
        <div style={{ ...baseStyle, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ ...titleBar, width: '70%', height: 4 }} />
          <div style={{ ...contentBar, width: '50%', marginTop: 2 }} />
        </div>
      );
    case 'title-content':
      return (
        <div style={baseStyle}>
          <div style={titleBar} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2 }}>
            <div style={contentBar} />
            <div style={{ ...contentBar, width: '70%' }} />
            <div style={{ ...contentBar, width: '60%' }} />
          </div>
        </div>
      );
    case 'two-column':
      return (
        <div style={baseStyle}>
          <div style={titleBar} />
          <div style={{ flex: 1, display: 'flex', gap: 2, marginTop: 2 }}>
            <div style={halfColumn} />
            <div style={halfColumn} />
          </div>
        </div>
      );
    case 'title-only':
      return (
        <div style={{ ...baseStyle, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ ...titleBar, width: '80%', height: 5 }} />
        </div>
      );
    case 'blank':
      return <div style={baseStyle} />;
    default:
      return (
        <div style={{ ...baseStyle, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ ...titleBar, width: '60%' }} />
        </div>
      );
  }
}

export default SectionItem;
