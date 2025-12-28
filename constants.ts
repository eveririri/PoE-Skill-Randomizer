import playable_skills from './data/playable_skills.json';
import { SkillData, ClassData, ChecklistItem } from './types';

// JSON 1: Skills/Gems - "Playable" (Curated List)
// We cast the imported JSON to match our interface, assuming structure is correct
export const PLAYABLE_SKILLS = playable_skills as SkillData[];

// Extra skills that only appear in "All Skills" mode
const EXTRA_SKILLS: SkillData[] = [];

// JSON 1 (Full): All Skills
export const ALL_SKILLS: SkillData[] = [];


// JSON 2: Classes
export const CLASS_DATA: ClassData[] = [
  { class: "Witch", ascendancy: "Elementalist" },
  { class: "Witch", ascendancy: "Occultist" },
  { class: "Witch", ascendancy: "Necromancer" },
  { class: "Duelist", ascendancy: "Slayer" },
  { class: "Duelist", ascendancy: "Gladiator" },
  { class: "Duelist", ascendancy: "Champion" },
  { class: "Shadow", ascendancy: "Assassin" },
  { class: "Shadow", ascendancy: "Trickster" },
  { class: "Shadow", ascendancy: "Saboteur" },
  { class: "Ranger", ascendancy: "Deadeye" },
  { class: "Ranger", ascendancy: "Raider" },
  { class: "Ranger", ascendancy: "Pathfinder" },
  { class: "Marauder", ascendancy: "Juggernaut" },
  { class: "Marauder", ascendancy: "Berserker" },
  { class: "Marauder", ascendancy: "Chieftain" },
  { class: "Templar", ascendancy: "Inquisitor" },
  { class: "Templar", ascendancy: "Hierophant" },
  { class: "Templar", ascendancy: "Guardian" },
  { class: "Scion", ascendancy: "Ascendant" },
];

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', text: 'Complete Act 10', isCompleted: false },
  { id: '2', text: 'Unlock the 4th Labyrinth (Eternal)', isCompleted: false },
  { id: '3', text: 'Complete 100 Atlas Bonus Objectives', isCompleted: false },
  { id: '4', text: 'Defeat a Conqueror or Guardian Map Boss', isCompleted: false },
  { id: '5', text: 'Defeat a Pinnacle Boss (e.g. Eater/Exarch)', isCompleted: false },
  { id: '6', text: 'Reach Level 90', isCompleted: false },
  { id: '7', text: 'Complete T17 Map Boss', isCompleted: false },
  { id: '8', text: 'Defeat a Uber Boss', isCompleted: false },
];