
import React, { useState, useMemo } from 'react';
import { Zap, Dice5, Shield, Sword, AlertTriangle, Layers, Settings2, Check, ArrowRight, Database, EyeOff, ChevronDown, ChevronRight, ExternalLink, Unlock, PlusCircle, Filter } from 'lucide-react';
import { useAppContext } from '../App';
import { RandomizedResult, SkillData, ClassData, RandomizedClassOption, RandomizedSkillOption } from '../types';
import { DEFAULT_CHECKLIST } from '../constants';

const RandomizerPage: React.FC = () => {
  const { 
    randomizedBuild,
    setRandomizedBuild, 
    navigate, 
    excludedTags, 
    hiddenSkills, 
    skills, 
    excludedAscendancies, 
    classes,
    enableUnlockNewSkills,
    checklist,
    setChecklist,
    // Persistent State
    genClassCount: classCount, setGenClassCount: setClassCount,
    genSkillCount: skillCount, setGenSkillCount: setSkillCount,
    genUseSpecificAscendancy: useSpecificAscendancy, setGenUseSpecificAscendancy: setUseSpecificAscendancy,
    genSelectedTags, setGenSelectedTags,
    randomizedClasses, setRandomizedClasses,
    randomizedSkills, setRandomizedSkills,
    selectedDraftClass, setSelectedDraftClass,
    selectedDraftSkill, setSelectedDraftSkill
  } = useAppContext();
  
  const [showPoolDetails, setShowPoolDetails] = useState<boolean>(false);
  const [activePoolTab, setActivePoolTab] = useState<'classes' | 'skills'>('classes');
  const [collapsedPoolTags, setCollapsedPoolTags] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Logic for Unlock New Skills Mode ---
  
  const earnedPoints = useMemo(() => {
      return checklist.filter(i => i.isCompleted).length;
  }, [checklist]);

  const spentPoints = useMemo(() => {
      if (!randomizedBuild?.unlockedSkills) return 0;
      return Math.max(0, randomizedBuild.unlockedSkills.length - 1);
  }, [randomizedBuild]);

  const availablePoints = Math.max(0, earnedPoints - spentPoints);
  
  const isAddSkillMode = enableUnlockNewSkills && randomizedBuild !== null;


  // --- Data Filtering ---

  const availableTags = useMemo(() => {
      const tags = new Set<string>();
      skills.forEach(skill => {
          if (!excludedTags.includes(skill.tag)) {
              tags.add(skill.tag);
          }
      });
      return Array.from(tags).sort();
  }, [skills, excludedTags]);

  const basePool = useMemo(() => {
    return skills.filter(skill => 
        !excludedTags.includes(skill.tag) && 
        !hiddenSkills.includes(skill.name) &&
        genSelectedTags.includes(skill.tag)
    );
  }, [skills, excludedTags, hiddenSkills, genSelectedTags]);

  const availableAscendancies = useMemo(() => {
      return classes.filter(c => !excludedAscendancies.includes(c.ascendancy));
  }, [excludedAscendancies, classes]);

  const uniqueClasses = useMemo(() => {
      return Array.from(new Set(availableAscendancies.map(c => c.class))).sort();
  }, [availableAscendancies]);

  const activeClassPoolDisplay = useMemo(() => {
      if (useSpecificAscendancy) {
          return availableAscendancies.map(c => ({ name: c.ascendancy, sub: c.class }));
      } else {
          return uniqueClasses.map(c => ({ name: c, sub: 'Base Class' }));
      }
  }, [useSpecificAscendancy, uniqueClasses, availableAscendancies]);

  const groupedClassPool = useMemo(() => {
    const groups: Record<string, string[]> = {};
    activeClassPoolDisplay.forEach(item => {
        const key = item.sub;
        if (!groups[key]) groups[key] = [];
        groups[key].push(item.name);
    });
    return groups;
  }, [activeClassPoolDisplay]);

  const activeSkillPoolDisplay = useMemo(() => {
      const groups: Record<string, string[]> = {};
      basePool.forEach(skill => {
          if (!groups[skill.tag]) groups[skill.tag] = [];
          groups[skill.tag].push(skill.name);
      });
      return groups;
  }, [basePool]);

  const togglePoolTagCollapse = (tag: string) => {
    setCollapsedPoolTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleGenSelectedTag = (tag: string) => {
      setGenSelectedTags(prev => 
          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      );
  };

  const isAllTagsSelected = availableTags.length > 0 && availableTags.every(t => genSelectedTags.includes(t));

  // --- Randomization Logic ---

  const handleRandomizeOptions = () => {
    setError(null);
    if (basePool.length === 0) {
        setError("No skills available. Please select at least one tag filter or adjust data exclusions.");
        return;
    }
    
    if (!isAddSkillMode) {
        if (activeClassPoolDisplay.length === 0) {
            setError("No classes available. Please enable some classes in the Data page.");
            return;
        }
    } else {
        if (availablePoints <= 0) {
            setError("No Unlock Points available. Complete more tasks in the Build page checklist.");
            return;
        }
    }

    setIsAnimating(true);
    setRandomizedClasses([]);
    setRandomizedSkills([]);
    setSelectedDraftClass(null);
    setSelectedDraftSkill(null);
    
    setTimeout(() => {
      let newClasses: RandomizedClassOption[] = [];
      
      if (!isAddSkillMode) {
          if (useSpecificAscendancy) {
              const shuffledAscendancies = [...availableAscendancies].sort(() => 0.5 - Math.random());
              const selected = shuffledAscendancies.slice(0, classCount);
              newClasses = selected.map(data => ({
                  data,
                  id: Math.random().toString(36).substr(2, 9)
              }));
          } else {
              const shuffledClasses = [...uniqueClasses].sort(() => 0.5 - Math.random());
              const selected = shuffledClasses.slice(0, classCount);
              newClasses = selected.map(clsName => ({
                  data: { class: clsName, ascendancy: clsName },
                  id: Math.random().toString(36).substr(2, 9)
              }));
          }
      }

      let newSkills: RandomizedSkillOption[] = [];
      let poolToSampleFrom = [...basePool];

      if (isAddSkillMode && randomizedBuild) {
          const existingSkillNames = new Set((randomizedBuild.unlockedSkills || []).map(s => s.name));
          existingSkillNames.add(randomizedBuild.mainSkill.name);

          poolToSampleFrom = poolToSampleFrom.filter(item => !existingSkillNames.has(item.name));
      }

      if (poolToSampleFrom.length === 0) {
          setIsAnimating(false);
          setError(isAddSkillMode ? "All available skills have already been unlocked!" : "No skills available to randomize.");
          return;
      }

      const shuffledMainSkills = poolToSampleFrom.sort(() => 0.5 - Math.random());
      const selectedMainSkills = shuffledMainSkills.slice(0, skillCount);

      newSkills = selectedMainSkills.map(mainSkill => ({
          main: mainSkill,
          supports: [], 
          id: Math.random().toString(36).substr(2, 9)
      }));
      
      if (newSkills.length === 0) {
        setError("Not enough unique skills left to randomize options.");
      } else if (!isAddSkillMode && newClasses.length === 0) {
        setError("Not enough classes to randomize options.");
      } else {
        setRandomizedClasses(newClasses);
        setRandomizedSkills(newSkills);
      }
      setIsAnimating(false);
    }, 600);
  };

  const finalizeBuild = () => {
    if (isAddSkillMode) {
        if (selectedDraftSkill && randomizedBuild) {
            const currentUnlocked = randomizedBuild.unlockedSkills || [randomizedBuild.mainSkill];
            
            if (currentUnlocked.some(s => s.name === selectedDraftSkill.main.name)) {
                setError("You already have this skill unlocked.");
                return;
            }

            const updatedBuild: RandomizedResult = {
                ...randomizedBuild,
                unlockedSkills: [...currentUnlocked, selectedDraftSkill.main]
            };
            setRandomizedBuild(updatedBuild);
            setRandomizedSkills([]);
            setSelectedDraftSkill(null);
        }
    } else {
        if (selectedDraftClass && selectedDraftSkill) {
            const finalBuild: RandomizedResult = {
                selectedClass: selectedDraftClass,
                mainSkill: selectedDraftSkill.main,
                supportSkills: selectedDraftSkill.supports,
                unlockedSkills: [selectedDraftSkill.main],
                timestamp: Date.now()
            };
            setRandomizedBuild(finalBuild);
            setChecklist(DEFAULT_CHECKLIST.map(item => ({...item, isCompleted: false})));
            
            setRandomizedClasses([]);
            setRandomizedSkills([]);
            setSelectedDraftClass(null);
            setSelectedDraftSkill(null);

            navigate('/build');
        }
    }
  };

  const hasResults = randomizedClasses.length > 0 || randomizedSkills.length > 0;
  const isReadyToFinalize = isAddSkillMode ? !!selectedDraftSkill : (!!selectedDraftClass && !!selectedDraftSkill);

  return (
    <div className="space-y-8 pb-32 max-w-6xl mx-auto relative">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-accent-500 to-blue-500">
          {isAddSkillMode ? 'Unlock New Skill' : 'Build Randomizer'}
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          {isAddSkillMode 
            ? `You have ${availablePoints} unlock point${availablePoints !== 1 ? 's' : ''} available based on your progression.` 
            : 'If you\'re bored of playing the same thing, pick a random ability and go conquer all the content.'}
        </p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg max-w-4xl mx-auto space-y-6">
        
        {isAddSkillMode ? (
             <div className="flex items-center justify-between bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl">
                 <div className="flex items-center gap-3">
                     <Unlock className="w-6 h-6 text-accent-500" />
                     <div>
                         <h3 className="font-bold text-white">Unlock Mode Active</h3>
                         <p className="text-sm text-gray-400">Class settings are disabled. Randomizing will provide new skill options to add to your existing build.</p>
                     </div>
                 </div>
                 <div className="text-right">
                     <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Points Available</div>
                     <div className={`text-2xl font-mono font-bold ${availablePoints > 0 ? 'text-accent-500' : 'text-gray-600'}`}>
                         {availablePoints}
                     </div>
                 </div>
             </div>
        ) : (
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div className="flex items-center gap-2 text-accent-500">
                    <Settings2 className="w-5 h-5" />
                    <h2 className="font-semibold text-lg">Configuration</h2>
                </div>
                <div className="flex gap-2">
                    {excludedAscendancies.length > 0 && (
                        <div className="text-xs text-indigo-400 flex items-center gap-1 bg-indigo-900/20 px-2 py-1 rounded border border-indigo-900/50">
                            <AlertTriangle className="w-3 h-3" />
                            {excludedAscendancies.length} Ascendancies excluded
                        </div>
                    )}
                    {excludedTags.length > 0 && (
                        <div className="text-xs text-orange-400 flex items-center gap-1 bg-orange-900/20 px-2 py-1 rounded border border-orange-900/50">
                            <AlertTriangle className="w-3 h-3" />
                            {excludedTags.length} tags excluded
                        </div>
                    )}
                </div>
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className={`bg-gray-800/20 rounded-xl p-5 border border-gray-800 flex flex-col justify-between ${isAddSkillMode ? 'opacity-30 pointer-events-none' : ''}`}>
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase text-xs tracking-wider mb-4">
                        <Shield className="w-4 h-4" /> Class Pool Settings
                    </div>
                    
                    <div className="bg-gray-900 p-1 rounded-lg flex mb-6 border border-gray-800">
                        <button
                            onClick={() => setUseSpecificAscendancy(false)}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-md transition-all ${
                                !useSpecificAscendancy 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            Base Classes
                        </button>
                        <button
                            onClick={() => setUseSpecificAscendancy(true)}
                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-md transition-all ${
                                useSpecificAscendancy 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            Ascendancies
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <label className="text-xs font-bold text-gray-500">
                            VARIANTS TO RANDOMIZE
                        </label>
                        <span className="text-2xl font-mono font-bold text-indigo-400 leading-none">{classCount}</span>
                    </div>
                    
                    <input 
                        type="range" 
                        min="1" 
                        max="10"
                        step="1"
                        value={classCount}
                        onChange={(e) => setClassCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-gray-700"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                        <span>1</span>
                        <span>10</span>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800/20 rounded-xl p-5 border border-gray-800 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 text-orange-400 font-bold uppercase text-xs tracking-wider mb-4">
                        <Sword className="w-4 h-4" /> Skill Pool Settings
                    </div>
                    
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                 <Filter className="w-3 h-3" /> FILTER BY TAG
                             </label>
                             <button 
                                onClick={() => setGenSelectedTags(availableTags)}
                                className={`text-[10px] uppercase font-bold transition-colors ${!isAllTagsSelected ? 'text-orange-400 hover:text-orange-300' : 'text-gray-600 cursor-default'}`}
                                disabled={isAllTagsSelected}
                             >
                                 Select All
                             </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.length === 0 && <span className="text-xs text-gray-600 italic">No tags enabled</span>}
                            {availableTags.map(tag => {
                                const isSelected = genSelectedTags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => toggleGenSelectedTag(tag)}
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border transition-all ${
                                            isSelected 
                                            ? 'bg-orange-600/20 text-orange-400 border-orange-600/50 shadow-sm' 
                                            : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                     <div className="flex justify-between items-end">
                        <label className="text-xs font-bold text-gray-500">
                            VARIANTS TO RANDOMIZE
                        </label>
                        <span className="text-2xl font-mono font-bold text-orange-400 leading-none">{skillCount}</span>
                    </div>
                    
                    <input 
                        type="range" 
                        min="1" 
                        max="10"
                        step="1"
                        value={skillCount}
                        onChange={(e) => setSkillCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-gray-700"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                        <span>1</span>
                        <span>10</span>
                    </div>
                </div>
            </div>
        </div>

        <button
            onClick={handleRandomizeOptions}
            disabled={isAnimating || basePool.length === 0 || (isAddSkillMode && availablePoints <= 0)}
            className={`w-full h-14 mt-8 group relative inline-flex items-center justify-center font-bold text-lg text-white transition-all duration-200 rounded-lg focus:outline-none shadow-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
                isAddSkillMode 
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/50' 
                    : 'bg-accent-600 hover:bg-accent-500 hover:scale-[1.01] shadow-accent-900/50'
            }`}
        >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-2 relative z-10">
                <Dice5 className={`w-6 h-6 ${isAnimating ? 'animate-spin' : ''}`} />
                <span>
                    {isAnimating ? 'Randomizing...' : (isAddSkillMode ? 'Randomize New Skill Variants' : 'Randomize Variants')}
                </span>
            </div>
        </button>
        
        {error && (
            <div className="mt-4 text-red-400 bg-red-900/20 border border-red-900/50 px-4 py-2 rounded-lg flex items-center gap-2 justify-center">
                <AlertTriangle className="w-4 h-4" />
                {error}
            </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-4">
            <button
                onClick={() => setShowPoolDetails(!showPoolDetails)}
                className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-2 transition-colors px-4 py-2 rounded-full hover:bg-gray-900 border border-transparent hover:border-gray-800"
            >
                {showPoolDetails ? <EyeOff className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                {showPoolDetails ? 'Hide Active Pool Details' : 'Show Active Pool Details'}
            </button>
        </div>

        {showPoolDetails && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex border-b border-gray-800 bg-gray-950/50">
                    <button
                        onClick={() => setActivePoolTab('classes')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border-b-2 ${
                            activePoolTab === 'classes' 
                            ? 'bg-indigo-900/10 text-indigo-400 border-indigo-500' 
                            : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-800/30'
                        }`}
                    >
                        <Shield className="w-4 h-4" />
                        <span>Active Classes</span>
                        <span className="ml-1 text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">{activeClassPoolDisplay.length}</span>
                    </button>
                    <button
                        onClick={() => setActivePoolTab('skills')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border-b-2 ${
                            activePoolTab === 'skills' 
                            ? 'bg-orange-900/10 text-orange-400 border-orange-500' 
                            : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-800/30'
                        }`}
                    >
                        <Database className="w-4 h-4" />
                        <span>Active Skills</span>
                        <span className="ml-1 text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">{basePool.length}</span>
                    </button>
                </div>

                <div className="p-6 bg-gray-900/50 min-h-[300px]">
                    
                    {activePoolTab === 'classes' && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            {activeClassPoolDisplay.length === 0 ? (
                                <div className="text-center py-12 text-red-400 bg-red-900/10 rounded-xl border border-red-900/30">
                                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    No classes available. Go to the Data page to enable excluded classes.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                                     {(Object.entries(groupedClassPool) as [string, string[]][]).map(([className, variants]) => (
                                         <div key={className} className="bg-gray-800/40 rounded-lg border border-gray-700/50 overflow-hidden hover:border-indigo-500/30 transition-colors group">
                                             <div className="px-3 py-2 bg-gray-800/80 border-b border-gray-700/50 font-bold text-gray-200 text-sm flex items-center gap-2">
                                                 <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:shadow-[0_0_8px_rgba(99,102,241,0.6)] transition-all"></div>
                                                 {className === 'Base Class' ? 'Base Classes' : className}
                                             </div>
                                             <div className="p-2 space-y-1">
                                                 {variants.map(variant => (
                                                     <div key={variant} className="text-xs text-gray-400 pl-4 border-l-2 border-gray-700 ml-1 group-hover:border-indigo-500/30 transition-colors">
                                                         {variant}
                                                     </div>
                                                 ))}
                                             </div>
                                         </div>
                                     ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activePoolTab === 'skills' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {basePool.length === 0 ? (
                                <div className="text-center py-12 text-red-400 bg-red-900/10 rounded-xl border border-red-900/30">
                                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    No skills available. Please select at least one tag filter above or adjust data exclusions.
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                                    {(Object.entries(activeSkillPoolDisplay) as [string, string[]][]).map(([tag, names]) => {
                                        const isCollapsed = collapsedPoolTags.includes(tag);
                                        return (
                                            <div key={tag} className="border border-gray-700/50 rounded-lg overflow-hidden bg-gray-800/20 hover:bg-gray-800/30 transition-colors">
                                                <button 
                                                    onClick={() => togglePoolTagCollapse(tag)}
                                                    className="w-full flex items-center justify-between px-4 py-3 text-left group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-1 rounded bg-gray-800 text-gray-500 group-hover:text-orange-400 transition-colors`}>
                                                             {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{tag}</span>
                                                    </div>
                                                    <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-1 rounded-full border border-gray-700">
                                                        {names.length}
                                                    </span>
                                                </button>
                                                
                                                {!isCollapsed && (
                                                    <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2 border-t border-gray-700/30 animate-in slide-in-from-top-1 bg-gray-900/20">
                                                        {names.map(name => (
                                                            <span key={name} className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded-md text-xs text-gray-400 hover:text-orange-200 border border-gray-700/50 hover:border-orange-500/30 transition-all cursor-default">
                                                                {name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        )}
      </div>

      {hasResults && (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500 fade-in">
          
          {!isAddSkillMode && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-gray-800 pb-2">
                    <div className="w-8 h-8 rounded bg-indigo-900/50 flex items-center justify-center text-indigo-400">
                        <Shield className="w-5 h-5" />
                    </div>
                    Step 1: Choose {useSpecificAscendancy ? 'Ascendancy' : 'Class'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {randomizedClasses.map((option) => {
                        const isSelected = selectedDraftClass?.class === option.data.class && selectedDraftClass?.ascendancy === option.data.ascendancy;
                        const isBaseMode = option.data.class === option.data.ascendancy;

                        return (
                            <div 
                                key={`class-${option.id}`}
                                onClick={() => setSelectedDraftClass(option.data)}
                                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 relative overflow-hidden group ${
                                    isSelected 
                                    ? 'bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' 
                                    : 'bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700'}`}>
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            {isBaseMode ? (
                                                <h3 className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                                    {option.data.class}
                                                </h3>
                                            ) : (
                                                <>
                                                    <h3 className={`text-lg font-bold leading-none ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                                        {option.data.ascendancy}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">{option.data.class}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && <div className="bg-indigo-600 p-1 rounded-full"><Check className="w-4 h-4 text-white" /></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
              </div>
          )}

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-gray-800 pb-2">
                <div className="w-8 h-8 rounded bg-orange-900/50 flex items-center justify-center text-orange-400">
                    <Sword className="w-5 h-5" />
                </div>
                {isAddSkillMode ? 'Select New Skill to Unlock' : 'Step 2: Choose Skill'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {randomizedSkills.map((option) => {
                     const isSelected = selectedDraftSkill?.main.name === option.main.name;

                    return (
                        <div 
                            key={`skill-${option.id}`}
                            onClick={() => setSelectedDraftSkill({ main: option.main, supports: option.supports })}
                            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 relative overflow-hidden group ${
                                isSelected 
                                ? 'bg-orange-900/20 border-orange-500 ring-1 ring-orange-500' 
                                : 'bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800'
                            }`}
                        >
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700'}`}>
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-bold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>{option.main.name}</h3>
                                            <a 
                                                href={option.main.url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className={`transition-colors shrink-0 ${isSelected ? 'text-orange-200 hover:text-white' : 'text-gray-500 hover:text-orange-400'}`}
                                                title="Open Wiki"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                        <span className="text-xs text-orange-500/80 uppercase font-bold">{option.main.tag}</span>
                                    </div>
                                </div>
                                {isSelected && <div className="bg-orange-600 p-1 rounded-full"><Check className="w-4 h-4 text-white" /></div>}
                             </div>
                        </div>
                    );
                })}
            </div>
          </div>
          
        </div>
      )}

      {hasResults && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/90 backdrop-blur-lg border-t border-gray-800 z-40 animate-in slide-in-from-bottom-20">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-2 md:gap-6 w-full md:w-auto">
                      
                      {!isAddSkillMode && (
                          <div className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-2 rounded-lg border transition-colors ${selectedDraftClass ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-gray-900 border-gray-800 border-dashed'}`}>
                              <Shield className={`w-4 h-4 ${selectedDraftClass ? 'text-indigo-400' : 'text-gray-600'}`} />
                              <div className="flex flex-col">
                                  <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Class</span>
                                  <span className={`text-sm font-medium ${selectedDraftClass ? 'text-white' : 'text-gray-600 italic'}`}>
                                      {selectedDraftClass 
                                        ? (selectedDraftClass.class === selectedDraftClass.ascendancy ? selectedDraftClass.class : selectedDraftClass.ascendancy)
                                        : 'Not selected'}
                                  </span>
                              </div>
                          </div>
                      )}

                      {!isAddSkillMode && <div className="text-gray-600"><PlusIcon /></div>}

                      <div className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-2 rounded-lg border transition-colors ${selectedDraftSkill ? 'bg-orange-900/30 border-orange-500/50' : 'bg-gray-900 border-gray-800 border-dashed'}`}>
                          <Sword className={`w-4 h-4 ${selectedDraftSkill ? 'text-orange-400' : 'text-gray-600'}`} />
                          <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">{isAddSkillMode ? 'New Skill' : 'Skill'}</span>
                              <span className={`text-sm font-medium ${selectedDraftSkill ? 'text-white' : 'text-gray-600 italic'}`}>
                                  {selectedDraftSkill ? selectedDraftSkill.main.name : 'Not selected'}
                              </span>
                          </div>
                      </div>
                  </div>

                  <button
                    onClick={finalizeBuild}
                    disabled={!isReadyToFinalize}
                    className="w-full md:w-auto px-8 py-3 bg-accent-600 hover:bg-accent-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                      {isAddSkillMode ? (
                          <>
                             <PlusCircle className="w-5 h-5" />
                             <span>Unlock Skill</span>
                          </>
                      ) : (
                          <>
                            <span>Create Build</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                      )}
                  </button>
              </div>
          </div>
      )}

      {!hasResults && !isAnimating && !error && (
        <div className="text-center opacity-30 mt-12">
            <div className="flex flex-col items-center justify-center gap-6">
                <Layers className="w-16 h-16 text-gray-600" />
                <p className="text-lg font-mono text-gray-500">
                    {isAddSkillMode 
                        ? 'Randomize variants to unlock a new skill slot' 
                        : 'Ready to randomize new builds'}
                </p>
            </div>
        </div>
      )}
    </div>
  );
};

const PlusIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="M12 5v14" />
    </svg>
)

export default RandomizerPage;
