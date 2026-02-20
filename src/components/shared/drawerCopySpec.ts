export type DrawerIntroLines = [string] | [string, string];

export type DrawerCopySpec = {
  title: string;
  subtitle?: string;
  intro: DrawerIntroLines;
};

export type DrawerCopyKey =
  | 'agent.knowledge'
  | 'agent.userInput.add'
  | 'agent.userInput.edit'
  | 'agent.customDocument'
  | 'agent.advanced'
  | 'agent.customInstructions'
  | 'agent.externalDataBriefTemplate'
  | 'agent.tone'
  | 'universal.llm'
  | 'universal.knowledge'
  | 'universal.tone'
  | 'universal.targetUsers'
  | 'universal.layouts'
  | 'section.addSlideInstruction'
  | 'section.editSlideInstruction'
  | 'library.selectFolders';

export const drawerCopySpec: Record<DrawerCopyKey, DrawerCopySpec> = {
  'agent.knowledge': {
    title: 'Knowledge Source',
    subtitle: 'Ground the agent in accurate information',
    intro: ['Select collections and define how the agent should use them.'],
  },
  'agent.userInput.add': {
    title: 'Add Question',
    intro: ['Add a question users answer before generation.'],
  },
  'agent.userInput.edit': {
    title: 'Edit Question',
    intro: ['Update wording, guidance, and required status for this question.'],
  },
  'agent.customDocument': {
    title: 'Custom document instructions',
    intro: ['Choose what to generate, then provide instructions or upload a source document.'],
  },
  'agent.advanced': {
    title: 'Advanced',
    subtitle: 'Configure custom instructions and external data',
    intro: ['Manage advanced generation behavior for this agent.'],
  },
  'agent.customInstructions': {
    title: 'Custom instructions',
    intro: ['Add rules the agent should follow every time it generates content.'],
  },
  'agent.externalDataBriefTemplate': {
    title: 'External data with brief template',
    intro: ['Upload a reference document to ground generation with external context.'],
  },
  'agent.tone': {
    title: 'Tone of Voice',
    subtitle: 'Ensure that content is always brand-compliant',
    intro: ['Set tone behavior for this agent using the default voice or a custom style.'],
  },
  'universal.llm': {
    title: 'LLM Model',
    intro: ['Select the default model used for document generation.'],
  },
  'universal.knowledge': {
    title: 'Knowledge Source',
    subtitle: 'Ground the agent in accurate information',
    intro: ['Add collections, files, or SharePoint folders and define usage instructions.'],
  },
  'universal.tone': {
    title: 'Tone of Voice',
    intro: ['Choose default company tone or configure a custom tone for this agent.'],
  },
  'universal.targetUsers': {
    title: 'Target Users',
    intro: ['Allow access to all users or restrict access to selected groups.'],
  },
  'universal.layouts': {
    title: 'Layouts',
    intro: ['Use all layouts or limit generation to a specific layout collection.'],
  },
  'section.addSlideInstruction': {
    title: 'Add instruction',
    intro: ['Create an instruction by generating content or selecting from the library.'],
  },
  'section.editSlideInstruction': {
    title: 'Edit instruction',
    intro: ['Refine title, instruction details, and slide count.'],
  },
  'library.selectFolders': {
    title: 'Select Library Folders',
    intro: ['Select folders whose slides should be available in this section.'],
  },
};
