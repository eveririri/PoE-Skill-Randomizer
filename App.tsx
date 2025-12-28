
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { Layout } from 'lucide-react'; 
import RandomizerPage from './pages/Randomizer';
import DataPage from './pages/Data';
import BuildPage from './pages/Build';
import SettingsPage from './pages/Settings';
import SharePreviewPage from './pages/SharePreview';
import { RandomizedResult, SkillData, ClassData, RandomizedClassOption, RandomizedSkillOption, ChecklistItem } from './types';
import { PLAYABLE_SKILLS, ALL_SKILLS, CLASS_DATA, DEFAULT_CHECKLIST } from './constants';

// Helper to get sorted default skills (Alphabetical by Name)
const getSortedSkills = (source: SkillData[]) => {
  return [...source].sort((a, b) => a.name.localeCompare(b.name));
};

// Helper for LocalStorage with generic typing
const getPersistedState = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    return (parsed !== null && parsed !== undefined) ? (parsed as T) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
};

// Context Definition
interface AppContextType {
  // Build State
  randomizedBuild: RandomizedResult | null;
  setRandomizedBuild: (build: RandomizedResult | null) => void;
  startNewBuild: () => void;
  
  // Settings State
  enableUnlockNewSkills: boolean;
  setEnableUnlockNewSkills: (enabled: boolean) => void;
  
  showAllSkills: boolean;
  toggleShowAllSkills: (enabled: boolean) => void;

  // Checklist State
  checklist: ChecklistItem[];
  setChecklist: (items: ChecklistItem[]) => void;
  toggleChecklistItem: (id: string) => void;
  addChecklistItem: (text: string) => void;
  deleteChecklistItem: (id: string) => void;

  // Navigation
  currentPath: string;
  navigate: (path: string) => void;
  
  // Data State (Skills)
  skills: SkillData[];
  addSkill: (skill: SkillData) => void;
  deleteSkill: (skillName: string) => void;
  deleteTag: (tagName: string) => void;
  resetData: () => void;
  orderedTags: string[]; 

  // Data State (Classes)
  classes: ClassData[];
  deleteClass: (className: string) => void;
  deleteAscendancy: (ascendancy: string) => void;

  // Visibility & Logic State
  excludedTags: string[]; 
  toggleTagExclusion: (tag: string) => void;
  collapsedTags: string[]; 
  toggleTagCollapse: (tag: string) => void;
  hiddenSkills: string[]; 
  toggleSkillVisibility: (skillName: string) => void;
  collapsedClasses: string[];
  toggleClassCollapse: (className: string) => void;
  
  // Class/Ascendancy Exclusion State
  excludedAscendancies: string[];
  toggleAscendancyExclusion: (ascendancy: string) => void;
  toggleClassExclusion: (className: string) => void;

  // Persistent Randomizer Settings
  genClassCount: number;
  setGenClassCount: (n: number) => void;
  genSkillCount: number;
  setGenSkillCount: (n: number) => void;
  genUseSpecificAscendancy: boolean;
  setGenUseSpecificAscendancy: (b: boolean) => void;
  genSelectedTags: string[]; 
  setGenSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Draft State (Current rolls in randomizer)
  randomizedClasses: RandomizedClassOption[];
  setRandomizedClasses: (opts: RandomizedClassOption[]) => void;
  randomizedSkills: RandomizedSkillOption[];
  setRandomizedSkills: (opts: RandomizedSkillOption[]) => void;
  selectedDraftClass: ClassData | null;
  setSelectedDraftClass: (c: ClassData | null) => void;
  selectedDraftSkill: {main: SkillData, supports: SkillData[]} | null;
  setSelectedDraftSkill: (s: {main: SkillData, supports: SkillData[]} | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const AppLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentPath, navigate } = useAppContext();

  const navItems = [
    { name: 'Build', path: '/build' },
    { name: 'Randomizer', path: '/' },
    { name: 'Data', path: '/data' },
    { name: 'Settings', path: '/settings' },
  ];

  const isSharePage = currentPath.startsWith('/share');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {!isSharePage && (
        <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <Layout className="w-6 h-6 text-accent-500" />
                <span className="font-bold text-xl tracking-tight">PoE Skill <span className="text-accent-500">Randomizer</span></span>
              </div>
              <div className="flex space-x-4">
                {navItems.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-accent-500/10 text-accent-500 border border-accent-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        {children}
      </main>
      <footer className="border-t border-gray-800 bg-gray-900 py-6">
        <div className="text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} PoE Skill Randomizer. Built with React & Tailwind.
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  
  // --- Persistent State Initialization ---

  const [randomizedBuild, setRandomizedBuild] = useState<RandomizedResult | null>(() => 
    getPersistedState<RandomizedResult | null>('poe_randomizedBuild', null)
  );

  const [enableUnlockNewSkills, setEnableUnlockNewSkills] = useState<boolean>(() => 
    getPersistedState<boolean>('poe_enableUnlockNewSkills', false)
  );
  
  const [showAllSkills, setShowAllSkills] = useState<boolean>(() => 
    getPersistedState<boolean>('poe_showAllSkills', false)
  );

  const [skills, setSkills] = useState<SkillData[]>(() => {
    const defaultPool = showAllSkills ? ALL_SKILLS : PLAYABLE_SKILLS;
    return getPersistedState<SkillData[]>('poe_skills', getSortedSkills(defaultPool));
  });
  
  const [classes, setClasses] = useState<ClassData[]>(() => 
    getPersistedState<ClassData[]>('poe_classes', CLASS_DATA)
  );

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => 
    getPersistedState<ChecklistItem[]>('poe_checklist', DEFAULT_CHECKLIST)
  );

  const [excludedTags, setExcludedTags] = useState<string[]>(() => 
    getPersistedState<string[]>('poe_excludedTags', [])
  );

  const [collapsedTags, setCollapsedTags] = useState<string[]>(() => 
    getPersistedState<string[]>('poe_collapsedTags', [])
  );

  const [hiddenSkills, setHiddenSkills] = useState<string[]>(() => 
    getPersistedState<string[]>('poe_hiddenSkills', [])
  );

  const [excludedAscendancies, setExcludedAscendancies] = useState<string[]>(() => 
    getPersistedState<string[]>('poe_excludedAscendancies', [])
  );

  const [genClassCount, setGenClassCount] = useState<number>(() => 
    getPersistedState<number>('poe_genClassCount', 3)
  );

  const [genSkillCount, setGenSkillCount] = useState<number>(() => 
    getPersistedState<number>('poe_genSkillCount', 3)
  );

  const [genUseSpecificAscendancy, setGenUseSpecificAscendancy] = useState<boolean>(() => 
    getPersistedState<boolean>('poe_genUseSpecificAscendancy', true)
  );

  const [genSelectedTags, setGenSelectedTags] = useState<string[]>(() => {
    // Explicitly type as string[] to ensure correct inference from Array.from and Set
    const allTags: string[] = Array.from(new Set(skills.map(i => i.tag))).sort();
    return getPersistedState<string[]>('poe_genSelectedTags', allTags);
  });

  // --- Draft Results Persistence (keeps your rolls visible after refresh) ---
  const [randomizedClasses, setRandomizedClasses] = useState<RandomizedClassOption[]>(() => 
    getPersistedState<RandomizedClassOption[]>('poe_draft_classes', [])
  );
  const [randomizedSkills, setRandomizedSkills] = useState<RandomizedSkillOption[]>(() => 
    getPersistedState<RandomizedSkillOption[]>('poe_draft_skills', [])
  );
  const [selectedDraftClass, setSelectedDraftClass] = useState<ClassData | null>(() => 
    getPersistedState<ClassData | null>('poe_draft_sel_class', null)
  );
  const [selectedDraftSkill, setSelectedDraftSkill] = useState<{main: SkillData, supports: SkillData[]} | null>(() => 
    getPersistedState<{main: SkillData, supports: SkillData[]} | null>('poe_draft_sel_skill', null)
  );

  const [collapsedClasses, setCollapsedClasses] = useState<string[]>([]);

  const orderedTags = useMemo(() => {
    return Array.from(new Set(skills.map(i => i.tag))).sort();
  }, [skills]);

  // --- Navigation Effect ---
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.hash.replace('#', '') || '/';
      setCurrentPath(path);
    };
    if (window.location.hash) {
      setCurrentPath(window.location.hash.replace('#', ''));
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  // --- Combined Persistence Effect ---
  useEffect(() => {
    localStorage.setItem('poe_randomizedBuild', JSON.stringify(randomizedBuild));
    localStorage.setItem('poe_enableUnlockNewSkills', JSON.stringify(enableUnlockNewSkills));
    localStorage.setItem('poe_showAllSkills', JSON.stringify(showAllSkills));
    localStorage.setItem('poe_skills', JSON.stringify(skills));
    localStorage.setItem('poe_classes', JSON.stringify(classes));
    localStorage.setItem('poe_checklist', JSON.stringify(checklist));
    localStorage.setItem('poe_excludedTags', JSON.stringify(excludedTags));
    localStorage.setItem('poe_collapsedTags', JSON.stringify(collapsedTags));
    localStorage.setItem('poe_hiddenSkills', JSON.stringify(hiddenSkills));
    localStorage.setItem('poe_excludedAscendancies', JSON.stringify(excludedAscendancies));
    localStorage.setItem('poe_genClassCount', JSON.stringify(genClassCount));
    localStorage.setItem('poe_genSkillCount', JSON.stringify(genSkillCount));
    localStorage.setItem('poe_genUseSpecificAscendancy', JSON.stringify(genUseSpecificAscendancy));
    localStorage.setItem('poe_genSelectedTags', JSON.stringify(genSelectedTags));
    
    // Draft Persistence
    localStorage.setItem('poe_draft_classes', JSON.stringify(randomizedClasses));
    localStorage.setItem('poe_draft_skills', JSON.stringify(randomizedSkills));
    localStorage.setItem('poe_draft_sel_class', JSON.stringify(selectedDraftClass));
    localStorage.setItem('poe_draft_sel_skill', JSON.stringify(selectedDraftSkill));
  }, [
    randomizedBuild, enableUnlockNewSkills, showAllSkills, skills, classes, checklist,
    excludedTags, collapsedTags, hiddenSkills, excludedAscendancies,
    genClassCount, genSkillCount, genUseSpecificAscendancy, genSelectedTags,
    randomizedClasses, randomizedSkills, selectedDraftClass, selectedDraftSkill
  ]);

  const toggleShowAllSkills = useCallback((enabled: boolean) => {
    setShowAllSkills(enabled);
    const newBaseSkills = enabled ? ALL_SKILLS : PLAYABLE_SKILLS;
    setSkills(getSortedSkills(newBaseSkills));
    // Fix: Explicitly type newTags as string[] to ensure it's not inferred as unknown[]
    const newTags: string[] = Array.from(new Set(newBaseSkills.map(i => i.tag))).sort();
    setGenSelectedTags(newTags);
  }, []);

  const navigate = useCallback((path: string) => {
    setCurrentPath(path);
    if (window.location.hash.replace('#', '') !== path) {
       window.location.hash = path;
    }
  }, []);

  const addSkill = useCallback((skill: SkillData) => {
    setSkills(prev => [...prev, skill]);
  }, []);

  const deleteSkill = useCallback((skillName: string) => {
    setSkills(prev => prev.filter(i => i.name !== skillName));
    setHiddenSkills(prev => prev.filter(n => n !== skillName));
  }, []);

  const deleteTag = useCallback((tagName: string) => {
    if (window.confirm(`Delete "${tagName}" column and all its skills?`)) {
      setSkills(prev => prev.filter(i => i.tag !== tagName));
    }
  }, []);

  const deleteAscendancy = useCallback((ascendancy: string) => {
    setClasses(prev => prev.filter(c => c.ascendancy !== ascendancy));
  }, []);

  const deleteClass = useCallback((className: string) => {
    if (window.confirm(`Delete class "${className}" and all its ascendancies?`)) {
        setClasses(prev => prev.filter(c => c.class !== className));
    }
  }, []);

  const toggleChecklistItem = useCallback((id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    ));
  }, []);

  const addChecklistItem = useCallback((text: string) => {
    if (!text.trim()) return;
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text,
      isCompleted: false
    };
    setChecklist(prev => [...prev, newItem]);
  }, []);

  const deleteChecklistItem = useCallback((id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  }, []);

  const startNewBuild = useCallback(() => {
    setRandomizedBuild(null);
    setChecklist(DEFAULT_CHECKLIST.map(item => ({...item, isCompleted: false})));
    setRandomizedClasses([]);
    setRandomizedSkills([]);
    setSelectedDraftClass(null);
    setSelectedDraftSkill(null);
    navigate('/');
  }, [navigate]);

  const resetData = useCallback(() => {
    if (window.confirm("Reset all data? Custom changes will be lost.")) {
      const source = showAllSkills ? ALL_SKILLS : PLAYABLE_SKILLS;
      const allTags = Array.from(new Set(source.map(i => i.tag))).sort();
      setSkills(getSortedSkills(source));
      setClasses(CLASS_DATA);
      setExcludedTags([]);
      setExcludedAscendancies([]);
      setCollapsedTags([]);
      setHiddenSkills([]);
      setGenSelectedTags(allTags);
      setRandomizedBuild(null);
      setChecklist(DEFAULT_CHECKLIST);
    }
  }, [showAllSkills]);

  const toggleTagExclusion = useCallback((tag: string) => {
    setExcludedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }, []);

  const toggleTagCollapse = useCallback((tag: string) => {
    setCollapsedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }, []);

  const toggleSkillVisibility = useCallback((skillName: string) => {
    setHiddenSkills(prev => prev.includes(skillName) ? prev.filter(n => n !== skillName) : [...prev, skillName]);
  }, []);

  const toggleAscendancyExclusion = useCallback((ascendancy: string) => {
    setExcludedAscendancies(prev => prev.includes(ascendancy) ? prev.filter(a => a !== ascendancy) : [...prev, ascendancy]);
  }, []);

  const toggleClassExclusion = useCallback((className: string) => {
    const classAscendancies = classes.filter(c => c.class === className).map(c => c.ascendancy);
    setExcludedAscendancies(prev => {
      const allExcluded = classAscendancies.every(a => prev.includes(a));
      if (allExcluded) {
        return prev.filter(a => !classAscendancies.includes(a));
      } else {
        const newExclusions = classAscendancies.filter(a => !prev.includes(a));
        return [...prev, ...newExclusions];
      }
    });
  }, [classes]);

  const contextValue = useMemo(() => ({ 
      randomizedBuild, setRandomizedBuild, startNewBuild,
      enableUnlockNewSkills, setEnableUnlockNewSkills,
      showAllSkills, toggleShowAllSkills,
      checklist, setChecklist, toggleChecklistItem, addChecklistItem, deleteChecklistItem,
      currentPath, navigate,
      skills, addSkill, deleteSkill, deleteTag, resetData, orderedTags,
      classes, deleteClass, deleteAscendancy,
      excludedTags, toggleTagExclusion,
      collapsedTags, toggleTagCollapse,
      hiddenSkills, toggleSkillVisibility,
      excludedAscendancies, toggleAscendancyExclusion, toggleClassExclusion,
      collapsedClasses, toggleClassCollapse: (n: string) => {},
      genClassCount, setGenClassCount,
      genSkillCount, setGenSkillCount,
      genUseSpecificAscendancy, setGenUseSpecificAscendancy,
      genSelectedTags, setGenSelectedTags,
      randomizedClasses, setRandomizedClasses,
      randomizedSkills, setRandomizedSkills,
      selectedDraftClass, setSelectedDraftClass,
      selectedDraftSkill, setSelectedDraftSkill
    }), [
      randomizedBuild, enableUnlockNewSkills, showAllSkills, checklist,
      currentPath, skills, classes, orderedTags, excludedTags, collapsedTags,
      hiddenSkills, excludedAscendancies, genClassCount, genSkillCount,
      genUseSpecificAscendancy, genSelectedTags, randomizedClasses,
      randomizedSkills, selectedDraftClass, selectedDraftSkill,
      startNewBuild, toggleShowAllSkills, navigate, addSkill, deleteSkill,
      deleteTag, deleteClass, deleteAscendancy, resetData, toggleChecklistItem,
      addChecklistItem, deleteChecklistItem, toggleTagExclusion, toggleTagCollapse,
      toggleSkillVisibility, toggleAscendancyExclusion, toggleClassExclusion
    ]);

  const renderContent = () => {
    if (currentPath.startsWith('/share')) return <SharePreviewPage />;
    switch (currentPath) {
      case '/': return <RandomizerPage />;
      case '/data': return <DataPage />;
      case '/build': return <BuildPage />;
      case '/settings': return <SettingsPage />;
      default: return <RandomizerPage />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <AppLayout>{renderContent()}</AppLayout>
    </AppContext.Provider>
  );
};

export default App;
