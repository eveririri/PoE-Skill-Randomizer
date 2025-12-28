
import React from 'react';
import { Settings, Unlock, AlertTriangle, Database } from 'lucide-react';
import { useAppContext } from '../App';

const SettingsPage: React.FC = () => {
  const { 
    enableUnlockNewSkills, 
    setEnableUnlockNewSkills,
    showAllSkills,
    toggleShowAllSkills
  } = useAppContext();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
        <Settings className="w-8 h-8 text-accent-500" />
        <h1 className="text-3xl font-bold text-white">Settings</h1>
      </div>

      <div className="space-y-6">
          {/* Unlock New Skills Mode */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                    <Unlock className={`w-5 h-5 ${enableUnlockNewSkills ? 'text-accent-500' : 'text-gray-500'}`} />
                    <h3 className="text-xl font-bold text-white">Unlock New Skills Mode</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  This mode reduces randomness by allowing you to add skills after completion challenges.
                  <br />
                  <br />
                  <span className="text-indigo-400 font-medium block mb-1">How it works:</span>
                  <ul className="list-disc pl-5 space-y-1 text-gray-400">
                      <li>For every task completed in the <strong>Build Progression Tracker</strong>, you earn an opportunity to unlock a new skill.</li>
                      <li>Go back to the <strong>Randomizer</strong> page to roll for new skill options.</li>
                      <li>Newly selected skills will be added to your <strong>Active Build</strong> as optional swaps.</li>
                  </ul>
                </p>
                {enableUnlockNewSkills && (
                    <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-900/20 px-3 py-2 rounded-lg border border-orange-900/50 inline-flex">
                        <AlertTriangle className="w-4 h-4" />
                        Warning: Disabling this later won't delete unlocked skills, but will hide the selection UI.
                    </div>
                )}
              </div>

              <div className="shrink-0 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={enableUnlockNewSkills}
                        onChange={(e) => setEnableUnlockNewSkills(e.target.checked)}
                    />
                    <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data Source Settings (Disabled) */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg opacity-75 grayscale">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-gray-500" />
                    <h3 className="text-xl font-bold text-gray-300">Data Source: All Skills</h3>
                    <span className="ml-2 text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase tracking-wider border border-gray-700 font-bold">Coming Later</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  Controls the dataset used on the <strong>Data</strong> and <strong>Randomizer</strong> pages.
                  <br />
                  <br />
                  <span className="font-bold text-gray-500">OFF (Default):</span> Uses filtered playable skills.
                  <br />
                  <span className="font-bold text-gray-500">ON:</span> Uses the full, unfiltered database including niche skills, Vaal variants, and utility gems.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50 inline-flex">
                    <AlertTriangle className="w-3 h-3" />
                    Note: This feature is currently disabled and will be added in a future update.
                </div>
              </div>

              <div className="shrink-0 pt-2 cursor-not-allowed">
                <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={showAllSkills}
                        onChange={(e) => toggleShowAllSkills(e.target.checked)}
                        disabled
                    />
                    <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default SettingsPage;
