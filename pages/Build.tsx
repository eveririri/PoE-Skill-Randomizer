
import React, { useState, useMemo } from 'react';
import { CheckSquare, Plus, Trash2, ArrowLeft, Swords, User, RotateCw, ExternalLink, Shield, GripVertical, Pencil, Link as LinkIcon, Unlock, CheckCircle2, Share2, X, Copy } from 'lucide-react';
import { useAppContext } from '../App';
import { PobLink, SkillData } from '../types';

const BuildPage: React.FC = () => {
  const { 
    randomizedBuild, 
    setRandomizedBuild, 
    startNewBuild,
    navigate,
    checklist,
    setChecklist,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    enableUnlockNewSkills
  } = useAppContext();
  
  const [newItemText, setNewItemText] = useState('');
  
  // PoB State
  const [newPobName, setNewPobName] = useState('');
  const [newPobUrl, setNewPobUrl] = useState('');

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Drag and Drop State (Checklist)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Drag and Drop State (PoB Links)
  const [draggedPobIndex, setDraggedPobIndex] = useState<number | null>(null);
  const [dragOverPobIndex, setDragOverPobIndex] = useState<number | null>(null);

  // --- Unlock Calculation ---
  const earnedPoints = useMemo(() => {
      return checklist.filter(i => i.isCompleted).length;
  }, [checklist]);

  const spentPoints = useMemo(() => {
      if (!randomizedBuild?.unlockedSkills) return 0;
      return Math.max(0, randomizedBuild.unlockedSkills.length - 1);
  }, [randomizedBuild]);

  const availablePoints = Math.max(0, earnedPoints - spentPoints);

  const addChecklistItemHandler = (e: React.FormEvent) => {
    e.preventDefault();
    addChecklistItem(newItemText);
    setNewItemText('');
  };

  // --- Drag and Drop Logic (Checklist) ---

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      handleDragEnd();
      return;
    }
    const newChecklist = [...checklist];
    const [movedItem] = newChecklist.splice(draggedIndex, 1);
    newChecklist.splice(dropIndex, 0, movedItem);
    setChecklist(newChecklist);
    handleDragEnd();
  };

  // --- Drag and Drop Logic (PoB Links) ---

  const handlePobDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPobIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePobDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedPobIndex === null || draggedPobIndex === index) return;
    setDragOverPobIndex(index);
  };

  const handlePobDragEnd = () => {
    setDraggedPobIndex(null);
    setDragOverPobIndex(null);
  };

  const handlePobDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedPobIndex === null || draggedPobIndex === dropIndex || !randomizedBuild?.pobLinks) {
      handlePobDragEnd();
      return;
    }
    
    const newLinks = [...randomizedBuild.pobLinks];
    const [movedLink] = newLinks.splice(draggedPobIndex, 1);
    newLinks.splice(dropIndex, 0, movedLink);
    
    setRandomizedBuild({
        ...randomizedBuild,
        pobLinks: newLinks
    });
    handlePobDragEnd();
  };

  // --- Build Name Logic ---

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (randomizedBuild) {
        setRandomizedBuild({
            ...randomizedBuild,
            name: e.target.value
        });
    }
  };

  // --- Skill Swap Logic ---
  const handleSwapActiveSkill = (skill: SkillData) => {
      if (randomizedBuild) {
          setRandomizedBuild({
              ...randomizedBuild,
              mainSkill: skill
          });
      }
  };

  // --- New Build Reset ---
  const handleNewBuild = () => {
      if (window.confirm("Are you sure you want to create a new build? Unsaved changes and current progression will be lost.")) {
          startNewBuild();
      }
  };

  // --- Share Logic ---
  const handleShare = () => {
      if (!randomizedBuild) return;

      const shareData = {
          build: randomizedBuild,
          checklist: checklist
      };

      try {
          const jsonString = JSON.stringify(shareData);
          const encoded = btoa(encodeURIComponent(jsonString));
          
          const baseUrl = window.location.origin + window.location.pathname;
          const fullUrl = `${baseUrl}#/share?data=${encoded}`;
          
          setShareUrl(fullUrl);
          setIsShareModalOpen(true);
      } catch (e) {
          console.error("Failed to generate share link", e);
          alert("Could not generate share link. Build data might be too large.");
      }
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(shareUrl).then(() => {
          alert("Link copied to clipboard!");
      });
  };

  // --- PoB / Links Logic ---

  const handleAddPob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!randomizedBuild || !newPobUrl.trim()) return;

    const newLink: PobLink = {
        id: Date.now().toString(),
        name: newPobName.trim() || 'Path of Building',
        url: newPobUrl.trim()
    };

    const currentLinks = randomizedBuild.pobLinks || [];
    setRandomizedBuild({
        ...randomizedBuild,
        pobLinks: [...currentLinks, newLink]
    });

    setNewPobName('');
    setNewPobUrl('');
  };

  const handleDeletePob = (id: string) => {
    if (!randomizedBuild || !randomizedBuild.pobLinks) return;
    
    setRandomizedBuild({
        ...randomizedBuild,
        pobLinks: randomizedBuild.pobLinks.filter(l => l.id !== id)
    });
  };


  if (!randomizedBuild) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-800">
          <Swords className="w-10 h-10 text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Skill Randomized Yet</h2>
        <p className="text-gray-400">Go to the Randomizer page to randomize your first skill.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-accent-600 hover:bg-accent-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-accent-900/20"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Randomizer
        </button>
      </div>
    );
  }

  const completionPercentage = checklist.length > 0 
    ? Math.round((checklist.filter(i => i.isCompleted).length / checklist.length) * 100)
    : 0;

  const unlockedSkills = randomizedBuild.unlockedSkills || [randomizedBuild.mainSkill];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. TOP HEADER: Build Name */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
         <div className="flex-grow w-full md:w-auto relative group">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">Build Name</label>
            <div className="relative">
                <input
                    type="text"
                    value={randomizedBuild.name || ''}
                    onChange={handleNameChange}
                    placeholder="Enter Build Name..."
                    className="bg-transparent text-3xl font-bold text-white placeholder-gray-700 w-full focus:outline-none border-b border-transparent focus:border-gray-700 transition-colors pb-1 pr-8"
                />
                <Pencil className="w-5 h-5 text-gray-700 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-gray-500 transition-colors" />
            </div>
         </div>
         
         <div className="flex items-center gap-3 shrink-0">
             <button
                onClick={handleShare}
                className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700"
                title="Share this build configuration"
             >
                <Share2 className="w-4 h-4" />
                Share
             </button>

             {enableUnlockNewSkills && (
                 <button
                    onClick={() => navigate('/')}
                    className="relative text-sm text-white flex items-center gap-2 transition-all px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 shadow-lg shadow-indigo-900/20"
                 >
                    <Unlock className="w-4 h-4" />
                    <span>Unlock Skill</span>
                    <span className="ml-1 bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {availablePoints}
                    </span>
                 </button>
             )}

             <button
                onClick={handleNewBuild}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700"
             >
                <RotateCw className="w-4 h-4" />
                New Build
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. LEFT COLUMN: Configuration & PoB */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* BLOCK: Build Configuration (Class + Skills) */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden flex flex-col">
              <div className="p-4 bg-gray-850 border-b border-gray-800">
                  <h2 className="font-bold text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-400" />
                      Build Configuration
                  </h2>
              </div>
              
              {/* Class Section */}
              <div className="p-6 flex flex-col items-center text-center bg-gradient-to-b from-gray-900 to-indigo-950/20 border-b border-gray-800/50">
                   <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-indigo-500/30 flex items-center justify-center mb-3 shadow-lg shadow-indigo-900/20 relative">
                       <Shield className="w-8 h-8 text-indigo-500" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-1">{randomizedBuild.selectedClass?.ascendancy}</h3>
                   <span className="px-3 py-0.5 rounded-full bg-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-700">
                       {randomizedBuild.selectedClass?.class}
                   </span>
              </div>

              {/* Skills Section */}
              <div className="p-6 bg-gray-900/50">
                   <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Swords className="w-3 h-3 text-orange-400" /> Active Main Skill
                   </div>

                   {/* Main Skill */}
                   <a href={randomizedBuild.mainSkill.url} target="_blank" rel="noreferrer" className="block mb-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-orange-500/20 hover:border-orange-500/40 transition-colors group">
                          <div className="w-10 h-10 rounded bg-gray-800 border border-orange-500/30 flex items-center justify-center text-orange-500 shrink-0">
                              <Swords className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                              <div className="font-bold text-gray-200 group-hover:text-orange-300 transition-colors truncate">
                                  {randomizedBuild.mainSkill.name}
                              </div>
                              <div className="text-[10px] text-orange-400/70 font-medium uppercase">{randomizedBuild.mainSkill.tag}</div>
                          </div>
                      </div>
                   </a>

                   {/* Supports */}
                   {randomizedBuild.supportSkills && randomizedBuild.supportSkills.length > 0 && (
                       <div className="space-y-2 pl-4 border-l border-gray-800 ml-5 relative">
                            {randomizedBuild.supportSkills.map((skill, idx) => (
                              <a 
                                  key={idx} 
                                  href={skill.url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-white group transition-colors"
                              >
                                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-accent-500 transition-colors"></div>
                                  <span className="truncate">{skill.name}</span>
                                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                              </a>
                            ))}
                       </div>
                   )}
              </div>
          </div>
          
          {/* BLOCK: Unlocked Skills */}
          {enableUnlockNewSkills && unlockedSkills.length > 1 && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden animate-in slide-in-from-left-2 duration-300">
                  <div className="p-4 bg-gray-850 border-b border-gray-800 flex items-center justify-between">
                      <h2 className="font-bold text-white flex items-center gap-2">
                          <Unlock className="w-4 h-4 text-accent-500" />
                          Unlocked Skills
                      </h2>
                      <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 font-mono">
                          {unlockedSkills.length}
                      </span>
                  </div>
                  
                  <div className="p-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {unlockedSkills.map((skill, index) => {
                          const isActive = randomizedBuild.mainSkill.name === skill.name;
                          return (
                              <div 
                                key={`${skill.name}-${index}`}
                                onClick={() => handleSwapActiveSkill(skill)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                                    isActive 
                                    ? 'bg-accent-900/10 border border-accent-500/30' 
                                    : 'hover:bg-gray-800 border border-transparent'
                                }`}
                              >
                                  <div className="flex items-center gap-3">
                                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-accent-500' : 'bg-gray-600'}`}></div>
                                      <span className={`text-sm ${isActive ? 'text-white font-medium' : 'text-gray-400'}`}>
                                          {skill.name}
                                      </span>
                                  </div>
                                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-accent-500" />}
                              </div>
                          )
                      })}
                  </div>
              </div>
          )}

          {/* BLOCK: PoB Links */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
              <div className="p-4 bg-gray-850 border-b border-gray-800">
                  <h2 className="font-bold text-white flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-blue-400" />
                      PoB Links
                  </h2>
              </div>
              
              <div className="p-4 space-y-4">
                  {(randomizedBuild.pobLinks && randomizedBuild.pobLinks.length > 0) ? (
                      <div className="space-y-2">
                          {randomizedBuild.pobLinks.map((link, index) => {
                              const isDragged = draggedPobIndex === index;
                              const isDragOver = dragOverPobIndex === index;
                              const draggingDown = draggedPobIndex !== null && draggedPobIndex < index;

                              return (
                                  <div 
                                      key={link.id} 
                                      draggable
                                      onDragStart={(e) => handlePobDragStart(e, index)}
                                      onDragOver={(e) => handlePobDragOver(e, index)}
                                      onDrop={(e) => handlePobDrop(e, index)}
                                      onDragEnd={handlePobDragEnd}
                                      className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-200 group
                                          ${isDragged 
                                            ? 'bg-gray-900 border-dashed border-gray-600 opacity-40' 
                                            : 'bg-gray-800/50 border-gray-700 hover:border-blue-500/30'
                                          }
                                          ${isDragOver && draggingDown ? 'border-b-2 border-b-blue-500' : ''}
                                          ${isDragOver && !draggingDown ? 'border-t-2 border-t-blue-500' : ''}
                                      `}
                                  >
                                      <div className={`mr-2 text-gray-600 cursor-grab active:cursor-grabbing hover:text-gray-400 shrink-0 ${isDragged ? 'invisible' : ''}`}>
                                           <GripVertical className="w-4 h-4" />
                                      </div>

                                      <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 min-w-0 flex-grow hover:underline decoration-blue-500/50 underline-offset-4">
                                          <div className="bg-blue-900/20 p-1.5 rounded text-blue-400 shrink-0">
                                              <LinkIcon className="w-3 h-3" />
                                          </div>
                                          <div className="min-w-0">
                                              <div className="text-sm font-medium text-gray-200 truncate">{link.name}</div>
                                              <div className="text-[10px] text-gray-500 truncate">{link.url}</div>
                                          </div>
                                      </a>
                                      <button 
                                        onClick={() => handleDeletePob(link.id)}
                                        className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors shrink-0"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                              );
                          })}
                      </div>
                  ) : (
                      <div className="text-center py-4 text-gray-600 text-xs italic border-2 border-dashed border-gray-800 rounded-lg">
                          No links added yet.
                      </div>
                  )}

                  <form onSubmit={handleAddPob} className="pt-2 border-t border-gray-800 space-y-2">
                      <input 
                          type="text" 
                          placeholder="Link Name (e.g., PoB v1)"
                          value={newPobName}
                          onChange={(e) => setNewPobName(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white focus:border-blue-500 focus:outline-none placeholder-gray-600"
                      />
                      <div className="flex gap-2">
                          <input 
                              type="url" 
                              required
                              placeholder="https://pobb.in/..."
                              value={newPobUrl}
                              onChange={(e) => setNewPobUrl(e.target.value)}
                              className="flex-grow bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white focus:border-blue-500 focus:outline-none placeholder-gray-600"
                          />
                          <button 
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded transition-colors"
                          >
                              <Plus className="w-4 h-4" />
                          </button>
                      </div>
                  </form>
              </div>
          </div>
        </div>

        {/* 3. RIGHT COLUMN: Challenge Tracker */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl flex flex-col h-full sticky top-24">
            <div className="p-6 border-b border-gray-800 bg-gray-850">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckSquare className="text-accent-500" />
                  Challenge Tracker
                </h2>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded bg-gray-800 border border-gray-700">
                        <span className="text-sm font-mono font-bold text-white">{completionPercentage}%</span>
                    </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-accent-600 h-2.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="p-6 flex-grow space-y-4">
              <form onSubmit={addChecklistItemHandler} className="flex gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Add new challenge..."
                  className="flex-grow bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-accent-500 focus:border-accent-500 block w-full p-2.5 placeholder-gray-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!newItemText.trim()}
                  className="bg-accent-600 hover:bg-accent-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white px-4 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </form>

              <ul className="space-y-2 relative">
                {checklist.length === 0 && (
                  <li className="text-center text-gray-500 py-12 italic border-2 border-dashed border-gray-800 rounded-xl">
                      <div className="flex flex-col items-center gap-2">
                          <CheckSquare className="w-8 h-8 opacity-20" />
                          <span>No checklist tasks defined. Start planning your journey!</span>
                      </div>
                  </li>
                )}
                {checklist.map((item, index) => {
                  const isDragged = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;
                  const draggingDown = draggedIndex !== null && draggedIndex < index;

                  return (
                    <li 
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`group flex items-center p-3 rounded-lg border transition-all duration-200 cursor-default select-none
                        ${isDragged 
                          ? 'bg-gray-900 border-dashed border-gray-600 opacity-40 scale-[0.98]' 
                          : 'bg-gray-800/80 border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                        } 
                        ${isDragOver && draggingDown ? 'border-b-2 border-b-accent-500' : ''}
                        ${isDragOver && !draggingDown ? 'border-t-2 border-t-accent-500' : ''}
                      `}
                    >
                      <div className={`mr-3 text-gray-600 cursor-grab active:cursor-grabbing hover:text-gray-400 shrink-0 ${isDragged ? 'invisible' : ''}`}>
                          <GripVertical className="w-5 h-5" />
                      </div>

                      <button 
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-all shrink-0 ${
                          item.isCompleted 
                            ? 'bg-accent-600 border-accent-600 text-white' 
                            : 'border-gray-500 hover:border-accent-400 hover:bg-gray-700'
                        }`}
                      >
                        {item.isCompleted && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                      </button>
                      
                      <span className={`flex-grow text-sm ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {item.text}
                      </span>

                      <button 
                        onClick={() => deleteChecklistItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {isShareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-800 p-2 rounded-lg text-white">
                           <Share2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Share Build</h3>
                      </div>
                      <button onClick={() => setIsShareModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <p className="text-gray-400 text-sm">
                      Copy the link below to share your build configuration and current progress.
                  </p>

                  <div className="flex items-center gap-2">
                      <input 
                          type="text" 
                          readOnly
                          value={shareUrl}
                          className="flex-grow bg-gray-950 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:outline-none font-mono"
                          onClick={(e) => e.currentTarget.select()}
                      />
                      <button 
                          onClick={copyToClipboard}
                          className="shrink-0 p-3 bg-accent-600 hover:bg-accent-500 text-white rounded-lg transition-colors"
                          title="Copy to clipboard"
                      >
                          <Copy className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Unlock className="w-3 h-3" />
                      Note: Unlocked skills will be visible in the preview.
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BuildPage;
