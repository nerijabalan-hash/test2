import { useState, useCallback, useEffect } from 'react';
import {
  PresentationAgent,
  Section,
  SlideSource,
  SlideConfig,
  AIGap,
  OutlineItem,
  OutlineType,
  QuestionConfig,
  mockAgents,
  createNewAgent,
  createNewSection,
  createFreeformSection,
  createAIGap,
  isAIGap,
  isSection,
  getOutlineFromSections,
  getSectionsFromOutline,
} from '../data/mockData';

/**
 * Hook for managing the list of presentation agents (Overview screen)
 */
export function useAgentList() {
  const [agents, setAgents] = useState<PresentationAgent[]>(mockAgents);

  const addAgent = useCallback((outlineType: OutlineType = 'fixed') => {
    const newAgent = createNewAgent(outlineType);
    setAgents(prev => [newAgent, ...prev]);
    return newAgent;
  }, []);

  const deleteAgent = useCallback((agentId: string) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
  }, []);

  const duplicateAgent = useCallback((agentId: string) => {
    setAgents(prev => {
      const original = prev.find(a => a.id === agentId);
      if (!original) return prev;

      const duplicate: PresentationAgent = {
        ...original,
        id: `agent-${Date.now()}`,
        name: `${original.name} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      const index = prev.findIndex(a => a.id === agentId);
      const newList = [...prev];
      newList.splice(index + 1, 0, duplicate);
      return newList;
    });
  }, []);

  const toggleAgentStatus = useCallback((agentId: string) => {
    const today = new Date().toISOString().split('T')[0];

    setAgents(prev =>
      prev.map(agent =>
        agent.id === agentId
          ? {
            ...agent,
            status: agent.status === 'active' ? 'draft' : 'active',
            updatedAt: today,
          }
          : agent
      )
    );
  }, []);

  return { agents, addAgent, deleteAgent, duplicateAgent, toggleAgentStatus };
}

/**
 * Hook for managing a single agent's state (Builder screen)
 */
export function useAgentBuilder(initialAgent: PresentationAgent) {
  const [agent, setAgent] = useState<PresentationAgent>(() => {
    // Initialize outline from sections if not present
    if (!initialAgent.outline) {
      return {
        ...initialAgent,
        outline: getOutlineFromSections(initialAgent.sections),
      };
    }
    return initialAgent;
  });
  const [isDirty, setIsDirty] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync state when initialAgent changes (e.g., navigating to a different agent)
  useEffect(() => {
    // Initialize outline from sections if not present
    const agentWithOutline = !initialAgent.outline
      ? { ...initialAgent, outline: getOutlineFromSections(initialAgent.sections) }
      : initialAgent;
    setAgent(agentWithOutline);
    setIsDirty(false);
    setActiveId(null);
  }, [initialAgent.id]);

  // Update agent name
  const updateName = useCallback((name: string) => {
    setAgent(prev => ({ ...prev, name }));
    setIsDirty(true);
  }, []);

  // Update agent description
  const updateDescription = useCallback((description: string) => {
    setAgent(prev => ({ ...prev, description }));
    setIsDirty(true);
  }, []);

  // Update document layout
  const updateDocumentLayout = useCallback((documentLayoutId: string) => {
    setAgent(prev => ({ ...prev, documentLayoutId: documentLayoutId || undefined }));
    setIsDirty(true);
  }, []);

  // Update agent status
  const updateStatus = useCallback((status: 'draft' | 'active') => {
    setAgent(prev => ({ ...prev, status }));
    setIsDirty(true);
  }, []);

  // Update target user groups
  const updateTargetUserGroups = useCallback((targetUserGroups: string[]) => {
    setAgent(prev => ({ ...prev, targetUserGroups }));
    setIsDirty(true);
  }, []);

  // Reorder sections (for drag & drop) - legacy, kept for backwards compatibility
  const reorderSections = useCallback((newSections: Section[]) => {
    setAgent(prev => ({
      ...prev,
      sections: newSections,
      outline: getOutlineFromSections(newSections),
    }));
    setIsDirty(true);
  }, []);

  // Reorder outline items (sections + AI gaps)
  const reorderOutline = useCallback((newOutline: OutlineItem[]) => {
    setAgent(prev => ({
      ...prev,
      outline: newOutline,
      sections: getSectionsFromOutline(newOutline),
    }));
    setIsDirty(true);
  }, []);

  // Add a new fixed section - returns the new section's ID
  const addSection = useCallback((title?: string): string => {
    const newSection = createNewSection(0);
    setAgent(prev => {
      const updatedSection: Section = {
        ...newSection,
        type: 'section',
        title: title?.trim() || '',
      };
      const newOutline = [...(prev.outline || []), updatedSection];
      return {
        ...prev,
        sections: [...prev.sections, updatedSection],
        outline: newOutline,
      };
    });
    setIsDirty(true);
    return newSection.id;
  }, []);

  // Add a new freeform section - returns the new section's ID
  const addFreeformSection = useCallback((): string => {
    const newSection: Section = { ...createFreeformSection(), type: 'section' };
    setAgent(prev => {
      const newOutline = [...(prev.outline || []), newSection];
      return {
        ...prev,
        sections: [...prev.sections, newSection],
        outline: newOutline,
      };
    });
    setIsDirty(true);
    return newSection.id;
  }, []);

  // Add a new AI gap - returns the new gap's ID
  const addAIGap = useCallback((): string => {
    const newGap = createAIGap();
    setAgent(prev => ({
      ...prev,
      outline: [...(prev.outline || []), newGap],
    }));
    setIsDirty(true);
    return newGap.id;
  }, []);

  // Delete an AI gap
  const deleteAIGap = useCallback((gapId: string) => {
    setAgent(prev => ({
      ...prev,
      outline: (prev.outline || []).filter(item => item.id !== gapId),
    }));
    setIsDirty(true);
  }, []);

  // Update AI gap guidance
  const updateAIGapGuidance = useCallback((gapId: string, guidance: string) => {
    setAgent(prev => ({
      ...prev,
      outline: (prev.outline || []).map(item =>
        item.id === gapId && isAIGap(item) ? { ...item, guidance } : item
      ),
    }));
    setIsDirty(true);
  }, []);

  // Update section freeform guidance
  const updateSectionFreeformGuidance = useCallback((sectionId: string, freeformGuidance: string) => {
    setAgent(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, freeformGuidance } : s
      ),
      outline: (prev.outline || []).map(item =>
        item.id === sectionId && isSection(item) ? { ...item, freeformGuidance } : item
      ),
    }));
    setIsDirty(true);
  }, []);

  // Delete a section
  const deleteSection = useCallback((sectionId: string) => {
    setAgent(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId),
      outline: (prev.outline || []).filter(item => item.id !== sectionId),
    }));
    setIsDirty(true);
  }, []);

  // Duplicate a section
  const duplicateSection = useCallback((sectionId: string) => {
    setAgent(prev => {
      const sectionIndex = prev.sections.findIndex(s => s.id === sectionId);
      if (sectionIndex === -1) return prev;

      const original = prev.sections[sectionIndex];
      const duplicate: Section = {
        ...original,
        id: `section-${Date.now()}`,
        title: `${original.title} (Copy)`,
        type: 'section',
      };

      const newSections = [...prev.sections];
      newSections.splice(sectionIndex + 1, 0, duplicate);

      // Also update outline
      const outlineIndex = (prev.outline || []).findIndex(item => item.id === sectionId);
      const newOutline = [...(prev.outline || [])];
      if (outlineIndex !== -1) {
        newOutline.splice(outlineIndex + 1, 0, duplicate);
      } else {
        newOutline.push(duplicate);
      }

      return {
        ...prev,
        sections: newSections,
        outline: newOutline,
      };
    });
    setIsDirty(true);
  }, []);

  // Update section title
  const updateSectionTitle = useCallback((sectionId: string, title: string) => {
    setAgent(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, title } : s
      ),
      outline: (prev.outline || []).map(item =>
        item.id === sectionId && isSection(item) ? { ...item, title } : item
      ),
    }));
    setIsDirty(true);
  }, []);

  // Update section instructions
  const updateSectionInstructions = useCallback((sectionId: string, instructions: string) => {
    setAgent(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, instructions } : s
      ),
      outline: (prev.outline || []).map(item =>
        item.id === sectionId && isSection(item) ? { ...item, instructions } : item
      ),
    }));
    setIsDirty(true);
  }, []);

  // Update section slide source
  const updateSlideSource = useCallback((sectionId: string, slideSource: SlideSource) => {
    setAgent(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, slideSource } : s
      ),
    }));
    setIsDirty(true);
  }, []);

  // Update section AI guidance
  const updateAiGuidance = useCallback((sectionId: string, aiGuidance: string) => {
    setAgent(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, aiGuidance } : s
      ),
    }));
    setIsDirty(true);
  }, []);

  // Update section layout
  const updateLayout = useCallback((sectionId: string, layoutId: string) => {
    setAgent(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, layoutId } : s
      ),
    }));
    setIsDirty(true);
  }, []);

  // Update section selected folders (legacy)
  const updateSelectedFolders = useCallback((sectionId: string, selectedFolders: string[]) => {
    setAgent(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, selectedFolders } : s
      ),
    }));
    setIsDirty(true);
  }, []);

  // Update section slides
  const updateSectionSlides = useCallback((sectionId: string, slides: SlideConfig[]) => {
    setAgent(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, slides } : s
      ),
      outline: (prev.outline || []).map(item =>
        item.id === sectionId && isSection(item) ? { ...item, slides } : item
      ),
    }));
    setIsDirty(true);
  }, []);

  // Update section AI expansion toggle (for guided outline agents)
  const updateSectionAIExpansion = useCallback((sectionId: string, aiExpansion: boolean) => {
    setAgent(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, aiExpansion } : s
      ),
      outline: (prev.outline || []).map(item =>
        item.id === sectionId && isSection(item) ? { ...item, aiExpansion } : item
      ),
    }));
    setIsDirty(true);
  }, []);

  // Update section AI expansion guidance
  const updateSectionAIExpansionGuidance = useCallback((sectionId: string, aiExpansionGuidance: string) => {
    setAgent(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, aiExpansionGuidance } : s
      ),
      outline: (prev.outline || []).map(item =>
        item.id === sectionId && isSection(item) ? { ...item, aiExpansionGuidance } : item
      ),
    }));
    setIsDirty(true);
  }, []);

  // Update section questions
  const updateSectionQuestions = useCallback((sectionId: string, questions: QuestionConfig[]) => {
    setAgent(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, questions } : s
      ),
      outline: (prev.outline || []).map(item =>
        item.id === sectionId && isSection(item) ? { ...item, questions } : item
      ),
    }));
    setIsDirty(true);
  }, []);

  // Save changes (mock - just resets dirty state)
  const saveChanges = useCallback(() => {
    setAgent(prev => ({
      ...prev,
      updatedAt: new Date().toISOString().split('T')[0],
    }));
    setIsDirty(false);
  }, []);

  return {
    agent,
    isDirty,
    activeId,
    setActiveId,
    updateName,
    updateDescription,
    updateDocumentLayout,
    updateStatus,
    updateTargetUserGroups,
    reorderSections,
    reorderOutline,
    addSection,
    addFreeformSection,
    addAIGap,
    deleteSection,
    deleteAIGap,
    duplicateSection,
    updateSectionTitle,
    updateSectionInstructions,
    updateSectionFreeformGuidance,
    updateAIGapGuidance,
    updateSlideSource,
    updateAiGuidance,
    updateLayout,
    updateSelectedFolders,
    updateSectionSlides,
    updateSectionAIExpansion,
    updateSectionAIExpansionGuidance,
    updateSectionQuestions,
    saveChanges,
  };
}
