
import React, { useState, useMemo, memo } from 'react';
import { Database, ExternalLink, CheckCircle2, Circle, Square, CheckSquare, MinusSquare, Plus, X, RotateCcw, AlertCircle, Trash2, Search, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { SkillData } from '../types';
import { useAppContext } from '../App';

// --- Sub-Components ---

// 1. Skill Row Component
interface SkillRowProps {
    skill: SkillData;
    isHidden: boolean;
    onToggleVisibility: (name: string) => void;
    onDelete: (name: string) => void;
}

const SkillRow = memo(({ skill, isHidden, onToggleVisibility, onDelete }: SkillRowProps) => {
    return (
        <div 
            className={`flex items-center justify-between px-4 py-3 group hover:bg-gray-800 transition-colors ${isHidden ? 'bg-gray-900/30' : ''}`}
        >
            <div className="flex items-center gap-3 flex-grow min-w-0">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility(skill.name);
                    }}
                    className={`shrink-0 transition-colors ${isHidden ? 'text-gray-600' : 'text-accent-500 hover:text-accent-400'}`}
                    title={isHidden ? "Include Skill" : "Exclude Skill"}
                >
                    {isHidden ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                </button>
                
                <div className="flex items-center gap-2 min-w-0">
                    <a 
                        href={skill.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-sm truncate hover:underline ${isHidden ? 'text-gray-500 line-through' : 'text-gray-300 hover:text-white'}`}
                    >
                        {skill.name}
                    </a>
                    <a 
                        href={skill.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 text-gray-600 hover:text-white transition-colors"
                        title="Open Wiki"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button
                onClick={() => onDelete(skill.name)}
                className="shrink-0 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                title="Delete Skill"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
});

// 2. Column Component
interface SkillColumnProps {
    tag: string;
    skills: SkillData[];
    isExcluded: boolean;
    isCollapsed: boolean;
    hiddenSkills: string[]; 
    onToggleExclusion: (tag: string) => void;
    onToggleCollapse: (tag: string) => void;
    onDeleteTag: (tag: string) => void;
    onToggleSkillVisibility: (name: string) => void;
    onDeleteSkill: (name: string) => void;
}

const SkillColumn = memo(({ 
    tag, skills, isExcluded, isCollapsed, hiddenSkills, 
    onToggleExclusion, onToggleCollapse, onDeleteTag, onToggleSkillVisibility, onDeleteSkill 
}: SkillColumnProps) => {
    
    return (
        <div 
            className={`flex-shrink-0 flex flex-col bg-gray-900 rounded-xl border transition-all duration-300 snap-start overflow-hidden ${
                isExcluded ? 'border-gray-800 bg-gray-900/50' : 'border-gray-700 shadow-md'
            } ${
                isCollapsed ? 'w-10 min-w-[2.5rem]' : 'w-80 min-w-[320px]'
            } h-full [content-visibility:auto]`}
        >
            <div 
                className={`bg-gray-800 border-b border-gray-700 flex items-center justify-between relative flex-shrink-0 ${
                    isCollapsed 
                    ? 'flex-col py-3 gap-2 h-full cursor-pointer hover:bg-gray-750 transition-colors' 
                    : 'px-4 py-3 rounded-t-xl'
                }`}
                onClick={isCollapsed ? () => onToggleCollapse(tag) : undefined}
            >
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleExclusion(tag);
                    }}
                    className={`hover:text-white transition-colors z-10 ${isExcluded ? 'text-gray-600' : 'text-accent-500'}`}
                    title={isExcluded ? "Include in Randomizer" : "Exclude from Randomizer"}
                >
                    {isExcluded ? <Square className="w-4 h-4" /> : (
                        skills.some(i => hiddenSkills.includes(i.name)) ? (
                            <MinusSquare className="w-4 h-4" />
                        ) : (
                            <CheckSquare className="w-4 h-4" />
                        )
                    )}
                </button>

                <div className={`${isCollapsed ? 'flex-grow flex items-center justify-center [writing-mode:vertical-rl] rotate-180 py-2' : ''}`}>
                    <h3 className={`font-bold flex items-center justify-center gap-2 whitespace-nowrap ${isExcluded ? 'text-gray-500' : 'text-accent-400'} ${isCollapsed ? 'text-[10px] uppercase tracking-widest' : ''}`}>
                    {!isCollapsed && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleCollapse(tag);
                            }}
                            className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    )}
                    {tag}
                    {!isCollapsed && (
                        <span className={`ml-1 text-xs ${isExcluded ? 'text-gray-600' : 'text-gray-500'} font-mono`}>
                            ({skills.length})
                        </span>
                    )}
                    </h3>
                </div>

                <div className={`flex items-center gap-1 ${isCollapsed ? 'flex-col' : ''}`}>
                    {!isCollapsed && (
                        <button
                            onClick={() => onDeleteTag(tag)}
                            className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors z-10"
                            title="Delete Column"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}

                    {isCollapsed && (
                        <span className="text-[9px] font-mono text-gray-500 mb-1">{skills.length}</span>
                    )}
                </div>
            </div>
            
            {!isCollapsed && (
                <div className={`divide-y divide-gray-800 overflow-y-auto flex-1 min-h-0 custom-scrollbar ${isExcluded ? 'opacity-50 grayscale' : ''}`}>
                    {skills.map((skill) => (
                        <SkillRow 
                            key={skill.name} 
                            skill={skill} 
                            isHidden={hiddenSkills.includes(skill.name)}
                            onToggleVisibility={onToggleSkillVisibility}
                            onDelete={onDeleteSkill}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

// 3. Class Card Component
interface ClassCardProps {
    className: string;
    ascendancies: string[];
    excludedAscendancies: string[];
    onToggleClass: (cls: string) => void;
    onDeleteClass: (cls: string) => void;
    onToggleAscendancy: (asc: string) => void;
    onDeleteAscendancy: (asc: string) => void;
}

const ClassCard = memo(({ className, ascendancies, excludedAscendancies, onToggleClass, onDeleteClass, onToggleAscendancy, onDeleteAscendancy }: ClassCardProps) => {
    const isAllExcluded = ascendancies.every(a => excludedAscendancies.includes(a));
    const isSomeExcluded = ascendancies.some(a => excludedAscendancies.includes(a));
    
    return (
        <div className={`
            flex-shrink-0 flex flex-col bg-gray-900 rounded-xl border transition-all duration-300 overflow-hidden
            ${isAllExcluded ? 'border-gray-800 bg-gray-900/50' : 'border-gray-700 shadow-md'}
            w-full md:w-[320px]
            min-h-[200px] max-h-[450px]
        `}>
            <div className="bg-gray-800 border-b border-gray-700 flex items-center justify-between relative flex-shrink-0 px-4 py-3">
                 <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleClass(className);
                    }}
                    className={`hover:text-white transition-colors z-10 shrink-0 ${isAllExcluded ? 'text-gray-600' : 'text-accent-500'}`}
                    title={isAllExcluded ? "Include Class" : "Exclude Class"}
                >
                    {isAllExcluded ? <Square className="w-4 h-4" /> : (isSomeExcluded ? <MinusSquare className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />)}
                </button>

                <div className="flex-grow flex items-center justify-center">
                     <h3 className={`font-bold flex items-center gap-2 whitespace-nowrap ${isAllExcluded ? 'text-gray-500' : 'text-accent-400'}`}>
                        {className}
                        <span className={`ml-1 text-xs ${isAllExcluded ? 'text-gray-600' : 'text-gray-500'} font-mono`}>
                            ({ascendancies.length})
                        </span>
                     </h3>
                </div>

                <div className="flex items-center gap-1">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClass(className);
                        }}
                        className="p-1.5 rounded-md hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors z-10"
                        title="Delete Class"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 divide-y divide-gray-800">
                {ascendancies.map(asc => {
                    const isExcluded = excludedAscendancies.includes(asc);
                    return (
                        <div 
                            key={asc} 
                            className={`flex items-center justify-between px-4 py-3 group hover:bg-gray-800 transition-colors ${isExcluded ? 'text-gray-500 bg-gray-900/30' : 'text-gray-200'}`}
                        >
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleAscendancy(asc);
                                    }}
                                    className={`shrink-0 transition-colors ${isExcluded ? 'text-gray-600' : 'text-accent-500 hover:text-accent-400'}`}
                                >
                                    {isExcluded ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                                </button>
                                <span className={`text-sm font-medium ${isExcluded ? 'line-through' : ''}`}>
                                    {asc}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteAscendancy(asc);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1"
                                    title="Delete Ascendancy"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});


const DataPage: React.FC = () => {
  const { 
    skills, addSkill, deleteSkill, deleteTag, resetData, orderedTags,
    excludedTags, toggleTagExclusion, 
    collapsedTags, toggleTagCollapse,
    hiddenSkills, toggleSkillVisibility,
    classes, deleteClass, deleteAscendancy,
    excludedAscendancies, toggleAscendancyExclusion, toggleClassExclusion,
    showAllSkills
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'skills' | 'classes'>('skills');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isCreatingNewTag, setIsCreatingNewTag] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const skillsByTag = useMemo(() => {
    const groups: Record<string, SkillData[]> = {};
    const lowerQuery = searchQuery.toLowerCase();

    skills.forEach(skill => {
      if (skill.name.toLowerCase().includes(lowerQuery)) {
        if (!groups[skill.tag]) {
            groups[skill.tag] = [];
        }
        groups[skill.tag].push(skill);
      }
    });
    return groups;
  }, [skills, searchQuery]);

  const tags = useMemo(() => {
      const currentTags = new Set(Object.keys(skillsByTag));
      return orderedTags.filter(t => currentTags.has(t));
  }, [orderedTags, skillsByTag]);

  const classesByGroup = useMemo(() => {
    const groups: Record<string, string[]> = {};
    const lowerQuery = searchQuery.toLowerCase();

    classes.forEach(c => {
      if (c.class.toLowerCase().includes(lowerQuery) || c.ascendancy.toLowerCase().includes(lowerQuery)) {
        if (!groups[c.class]) {
            groups[c.class] = [];
        }
        groups[c.class].push(c.ascendancy);
      }
    });
    return groups;
  }, [classes, searchQuery]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = newName.trim();
    if (!trimmedName || !newTag.trim()) return;

    const isDuplicate = skills.some(s => s.name.toLowerCase() === trimmedName.toLowerCase());
    
    if (isDuplicate) {
        setFormError(`Skill "${trimmedName}" already exists.`);
        return;
    }

    addSkill({
        name: trimmedName,
        tag: newTag,
        url: newUrl || '#'
    });

    setNewName('');
    setNewUrl('');
    if (!isCreatingNewTag && tags.length > 0) {
        setNewTag(tags[0]);
    } else {
        setNewTag('');
    }
    setIsAddModalOpen(false);
  };

  const openAddModal = () => {
      setFormError(null);
      setIsCreatingNewTag(false);
      const allTags = orderedTags.filter(t => new Set(skills.map(i => i.tag)).has(t));
      if (allTags.length > 0) {
        setNewTag(allTags[0]);
      } else {
        setIsCreatingNewTag(true);
        setNewTag('');
      }
      setIsAddModalOpen(true);
  }

  const handleTabChange = (tab: 'skills' | 'classes') => {
      setActiveTab(tab);
      setSearchQuery('');
  };

  return (
    <div className="space-y-6 h-full flex flex-col w-full">
      <div className="flex items-center justify-between shrink-0 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Database className="text-accent-500" />
          Game Data
        </h1>
        
        <div className="flex gap-2">
            <button
                onClick={resetData}
                className="px-3 py-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-md transition-colors flex items-center gap-2 text-sm border border-transparent hover:border-red-500/20"
                title="Reset all data and settings"
            >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
            </button>

            <div className="bg-gray-900 p-1 rounded-lg border border-gray-800 flex gap-1">
            <button
                onClick={() => handleTabChange('skills')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'skills'
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
            >
                Skills
            </button>
            <button
                onClick={() => handleTabChange('classes')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'classes'
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
            >
                Classes
            </button>
            </div>
        </div>
      </div>

      <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4 flex items-start gap-4 shrink-0 shadow-lg shadow-blue-900/5 max-w-7xl mx-auto w-full">
          <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="text-sm text-blue-200">
              <p className="font-bold text-blue-300 mb-1">
                  Active Data Source: <span className={showAllSkills ? 'text-blue-400' : 'text-green-400'}>{showAllSkills ? 'All Skills (Unfiltered)' : 'Playable Skills (Filtered)'}</span>
              </p>
              <p className="opacity-80 leading-relaxed">
                  {showAllSkills ? (
                       "The data below is sourced from the full unfiltered database containing all known Path of Exile skills. This serves as the source pool for the Randomizer."
                  ) : (
                       "All skills have been filtered based on their 'playability' — meaning all Auras, Warcries, Vaal skills, etc. have been removed. If you disagree with this filtering, please manually delete or add new skills yourself (e.g. Vaal Spark or similar)."
                  )}
              </p>
          </div>
      </div>

      <div className="flex-grow min-h-0 relative">
        {activeTab === 'skills' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
             <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm bg-gray-900/50 p-3 rounded border border-gray-800 shrink-0 max-w-7xl mx-auto w-full">
               <div className="relative w-full sm:w-64">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Search className="h-4 w-4 text-gray-500" />
                   </div>
                   <input
                       type="text"
                       className="block w-full pl-9 pr-3 py-1.5 border border-gray-700 rounded-md leading-5 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-900 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 sm:text-sm transition-colors"
                       placeholder="Search skill name..."
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                   />
               </div>

               <div className="flex gap-4 text-gray-400 flex-wrap justify-center">
                  <span className="flex items-center gap-1" title="Toggle checkbox to include/exclude from Randomizer">
                    <CheckSquare className="w-4 h-4 text-accent-500" /> 
                    <span className="hidden sm:inline">Randomizer</span>
                  </span>
               </div>
               
               <button 
                onClick={openAddModal}
                className="w-full sm:w-auto flex items-center justify-center gap-1 bg-accent-600 hover:bg-accent-500 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors"
               >
                   <Plus className="w-4 h-4" /> Add Skill
               </button>
             </div>
            
            <div className="flex gap-4 overflow-x-auto pb-6 snap-x w-full h-full pr-4">
              {tags.length === 0 && searchQuery && (
                  <div className="w-full flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                      <Search className="w-8 h-8 mb-2 opacity-50" />
                      <p>No skills found matching "{searchQuery}"</p>
                  </div>
              )}

              {tags.map(tag => (
                  <SkillColumn
                    key={tag}
                    tag={tag}
                    skills={skillsByTag[tag] || []}
                    isExcluded={excludedTags.includes(tag)}
                    isCollapsed={collapsedTags.includes(tag)}
                    hiddenSkills={hiddenSkills}
                    onToggleExclusion={toggleTagExclusion}
                    onToggleCollapse={toggleTagCollapse}
                    onDeleteTag={deleteTag}
                    onToggleSkillVisibility={toggleSkillVisibility}
                    onDeleteSkill={deleteSkill}
                  />
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar pb-6">
            
            <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm bg-gray-900/50 p-3 rounded border border-gray-800 shrink-0 w-full">
                 <div className="relative w-full sm:w-64">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Search className="h-4 w-4 text-gray-500" />
                   </div>
                   <input
                       type="text"
                       className="block w-full pl-9 pr-3 py-1.5 border border-gray-700 rounded-md leading-5 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-900 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 sm:text-sm transition-colors"
                       placeholder="Search class..."
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                
                <div className="flex gap-4 text-gray-400 flex-wrap justify-center">
                  <span className="flex items-center gap-1" title="Toggle checkbox to include/exclude from Randomizer">
                    <CheckSquare className="w-4 h-4 text-accent-500" /> 
                    <span className="hidden sm:inline">Randomizer</span>
                  </span>
               </div>
            </div>

            {Object.keys(classesByGroup).length === 0 && searchQuery && (
                 <div className="w-full flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                      <Search className="w-8 h-8 mb-2 opacity-50" />
                      <p>No classes found matching "{searchQuery}"</p>
                  </div>
            )}

            <div className="flex flex-wrap gap-4">
               {(Object.entries(classesByGroup) as [string, string[]][]).map(([className, ascendancies]) => (
                   <ClassCard 
                       key={className}
                       className={className}
                       ascendancies={ascendancies}
                       excludedAscendancies={excludedAscendancies}
                       onToggleClass={toggleClassExclusion}
                       onDeleteClass={deleteClass}
                       onToggleAscendancy={toggleAscendancyExclusion}
                       onDeleteAscendancy={deleteAscendancy}
                   />
               ))}
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
                  <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">Add New Skill</h3>
                      <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-white">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <form onSubmit={handleAddSkill} className="space-y-4">
                      {formError && (
                          <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-sm text-red-400">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              {formError}
                          </div>
                      )}

                      <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Skill Name</label>
                          <input 
                              type="text" 
                              required
                              value={newName}
                              onChange={e => {
                                  setNewName(e.target.value);
                                  if (formError) setFormError(null);
                              }}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-accent-500 focus:border-accent-500"
                              placeholder="e.g., Toxic Rain"
                          />
                      </div>

                      <div>
                          <div className="flex justify-between items-center mb-1">
                              <label className="block text-sm font-medium text-gray-400">Column (Tag)</label>
                              <button
                                type="button"
                                onClick={() => {
                                    setIsCreatingNewTag(!isCreatingNewTag);
                                    setNewTag('');
                                }}
                                className="text-xs text-accent-500 hover:text-accent-400 underline"
                              >
                                  {isCreatingNewTag ? "Select existing" : "Create new"}
                              </button>
                          </div>
                          
                          {isCreatingNewTag ? (
                              <input 
                                type="text"
                                required
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                placeholder="New Column Name"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-accent-500 focus:border-accent-500"
                                autoFocus
                              />
                          ) : (
                              <select
                                  required
                                  value={newTag}
                                  onChange={e => setNewTag(e.target.value)}
                                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-accent-500 focus:border-accent-500"
                              >
                                  {orderedTags.length === 0 && <option value="" disabled>No columns exist</option>}
                                  {orderedTags.map(t => (
                                      <option key={t} value={t}>{t}</option>
                                  ))}
                              </select>
                          )}
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Wiki URL (Optional)</label>
                          <input 
                              type="text" 
                              value={newUrl}
                              onChange={e => setNewUrl(e.target.value)}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-accent-500 focus:border-accent-500"
                              placeholder="https://..."
                          />
                      </div>

                      <div className="pt-2 flex gap-3">
                          <button 
                              type="button" 
                              onClick={() => setIsAddModalOpen(false)}
                              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              type="submit" 
                              className="flex-1 py-2.5 bg-accent-600 hover:bg-accent-500 text-white rounded-lg font-medium transition-colors"
                          >
                              Add Skill
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default DataPage;
