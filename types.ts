
export interface SkillData {
  name: string;
  tag: string;
  url: string;
  attribute?: string;
}

export interface ClassData {
  class: string;
  ascendancy: string;
}

export interface PobLink {
  id: string;
  name: string;
  url: string;
}

export interface RandomizedResult {
  name?: string;
  mainSkill: SkillData;
  supportSkills: SkillData[];
  selectedClass?: ClassData;
  timestamp: number;
  pobLinks?: PobLink[];
  // Array of all skills unlocked via progression
  unlockedSkills?: SkillData[]; 
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface RandomizedClassOption {
  data: ClassData;
  id: string;
}

export interface RandomizedSkillOption {
  main: SkillData;
  supports: SkillData[];
  id: string;
}
