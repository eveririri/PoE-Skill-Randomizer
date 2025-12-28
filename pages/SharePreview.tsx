
import React, { useEffect, useState } from 'react';
import { Shield, Swords, CheckSquare, ArrowRight, AlertTriangle, User, Unlock, ExternalLink, Link as LinkIcon, RotateCw } from 'lucide-react';
import { useAppContext } from '../App';
import { RandomizedResult, ChecklistItem } from '../types';

interface ShareData {
  build: RandomizedResult;
  checklist: ChecklistItem[];
}

const SharePreviewPage: React.FC = () => {
  const { navigate } = useAppContext();
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const hash = window.location.hash;
      const queryString = hash.split('?')[1];
      const urlParams = new URLSearchParams(queryString);
      const encodedData = urlParams.get('data');

      if (!encodedData) {
        setError("No build data found in link.");
        return;
      }

      const jsonString = decodeURIComponent(atob(encodedData));
      const parsedData: ShareData = JSON.parse(jsonString);

      if (!parsedData.build || !parsedData.checklist) {
        setError("Invalid build data format.");
        return;
      }

      setData(parsedData);
    } catch (e) {
      console.error(e);
      setError("Failed to load shared build. The link might be broken.");
    }
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 max-w-7xl mx-auto">
        <div className="bg-red-900/20 p-6 rounded-xl border border-red-900/50 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Preview</h2>
          <p className="text-gray-400">{error}</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-accent-600 hover:bg-accent-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          Go to Randomizer
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center pt-20 max-w-7xl mx-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  const { build, checklist } = data;
  
  const completionPercentage = checklist.length > 0 
    ? Math.round((checklist.filter(i => i.isCompleted).length / checklist.length) * 100)
    : 0;

  const unlockedSkills = build.unlockedSkills || [build.mainSkill];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Read-Only Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <User className="w-64 h-64" />
         </div>
         
         <div className="relative z-10">
            <div className="flex items-center gap-2 text-accent-500 mb-1 text-sm font-bold uppercase tracking-wider">
                <CheckSquare className="w-4 h-4" /> Shared Build Preview
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                {build.name || "Unnamed Build"}
            </h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
                Shared on {new Date().toLocaleDateString()}
            </p>
         </div>

         <div className="relative z-10">
             <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-accent-600 hover:bg-accent-500 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-accent-900/30 flex items-center gap-2"
             >
                <RotateCw className="w-4 h-4" />
                Create Your Own Build
             </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Build Summary */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Configuration Card */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden flex flex-col">
              <div className="p-4 bg-gray-850 border-b border-gray-800">
                  <h2 className="font-bold text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-400" />
                      Class & Ascendancy
                  </h2>
              </div>
              
              <div className="p-6 flex flex-col items-center text-center bg-gradient-to-b from-gray-900 to-indigo-950/20">
                   <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-indigo-500/30 flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/20">
                       <Shield className="w-10 h-10 text-indigo-500" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-1">{build.selectedClass?.ascendancy}</h3>
                   <span className="px-3 py-0.5 rounded-full bg-gray-800 text-xs font-bold text-gray-400 uppercase tracking-widest border border-gray-700">
                       {build.selectedClass?.class}
                   </span>
              </div>
          </div>

          {/* Skills Card */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
              <div className="p-4 bg-gray-850 border-b border-gray-800">
                  <h2 className="font-bold text-white flex items-center gap-2">
                      <Swords className="w-5 h-5 text-orange-400" />
                      Main Skill
                  </h2>
              </div>
              <div className="p-6">
                   <a href={build.mainSkill.url} target="_blank" rel="noreferrer" className="block">
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-orange-500/20 hover:border-orange-500/40 transition-colors group">
                          <div className="w-12 h-12 rounded-lg bg-gray-800 border border-orange-500/30 flex items-center justify-center text-orange-500 shrink-0">
                              <Swords className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                              <div className="text-lg font-bold text-gray-200 group-hover:text-orange-300 transition-colors truncate">
                                  {build.mainSkill.name}
                              </div>
                              <div className="text-xs text-orange-400/70 font-medium uppercase">{build.mainSkill.tag}</div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-orange-400 ml-auto" />
                      </div>
                   </a>
              </div>
          </div>

          {/* Unlocked Skills List */}
          {unlockedSkills.length > 1 && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
                  <div className="p-4 bg-gray-850 border-b border-gray-800 flex items-center justify-between">
                      <h2 className="font-bold text-white flex items-center gap-2">
                          <Unlock className="w-4 h-4 text-accent-500" />
                          Unlocked Inventory
                      </h2>
                      <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 font-mono">
                          {unlockedSkills.length}
                      </span>
                  </div>
                  <div className="p-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {unlockedSkills.map((skill, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 border-b border-gray-800/50 last:border-0 text-gray-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent-500/50"></div>
                              <span className="text-sm">{skill.name}</span>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* PoB Links */}
          {build.pobLinks && build.pobLinks.length > 0 && (
             <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
                 <div className="p-4 bg-gray-850 border-b border-gray-800">
                      <h2 className="font-bold text-white flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-blue-400" />
                          Resources
                      </h2>
                  </div>
                  <div className="p-4 space-y-2">
                      {build.pobLinks.map(link => (
                          <a 
                            key={link.id} 
                            href={link.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors group"
                          >
                              <LinkIcon className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-300 group-hover:text-white font-medium truncate">{link.name}</span>
                              <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-blue-400 ml-auto" />
                          </a>
                      ))}
                  </div>
             </div>
          )}

        </div>

        {/* RIGHT COLUMN: Progress (Read Only) */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl flex flex-col h-full">
            <div className="p-6 border-b border-gray-800 bg-gray-850">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckSquare className="text-accent-500" />
                  Progression Snapshot
                </h2>
                <div className="px-3 py-1 rounded bg-gray-800 border border-gray-700">
                    <span className="text-sm font-mono font-bold text-white">{completionPercentage}%</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-accent-600 h-2.5 rounded-full" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="p-6 flex-grow">
              <ul className="space-y-2">
                {checklist.map((item) => (
                    <li 
                      key={item.id}
                      className={`flex items-center p-3 rounded-lg border transition-all duration-200 ${
                        item.isCompleted 
                        ? 'bg-gray-900/50 border-gray-800 opacity-60' 
                        : 'bg-gray-800/50 border-gray-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 shrink-0 ${
                        item.isCompleted 
                          ? 'bg-accent-600/50 border-accent-600/50 text-white' 
                          : 'border-gray-600'
                      }`}>
                        {item.isCompleted && <div className="w-2.5 h-2.5 bg-white/80 rounded-sm" />}
                      </div>
                      
                      <span className={`text-sm ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                        {item.text}
                      </span>
                    </li>
                ))}
                {checklist.length === 0 && (
                    <li className="text-center text-gray-500 py-4 italic">No checklist items in this build.</li>
                )}
              </ul>
            </div>
            
            <div className="p-6 bg-gray-850 border-t border-gray-800 text-center">
                <button 
                  onClick={() => navigate('/')}
                  className="text-gray-400 hover:text-white flex items-center justify-center gap-2 w-full transition-colors font-medium"
                >
                    Create your own build at PoE Skill Randomizer <ArrowRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePreviewPage;