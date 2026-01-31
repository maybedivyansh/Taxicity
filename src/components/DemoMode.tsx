import React from 'react';
import { useDemoMode } from '../hooks/useDemoMode';

export const DemoMode = () => {
    const {
        demoEnabled,
        toggleDemo,
        setScenario,
        demoSpeed,
        setDemoSpeed,
        isPlaying,
        activeScenario
    } = useDemoMode();

    return (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl border border-slate-700 w-full max-w-md">
            <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <span className="text-xl">🚀</span> Hackathon Demo
                </h2>

                <button
                    onClick={toggleDemo}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${demoEnabled ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'
                        }`}
                >
                    {demoEnabled ? 'ACTIVE' : 'DISABLED'}
                </button>
            </div>

            {demoEnabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">

                    {/* Scenarios */}
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2 block">
                            Load Scenario
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={() => setScenario('scenario-1')}
                                disabled={isPlaying}
                                className={`p-2 rounded text-left text-sm hover:bg-slate-700 transition ${activeScenario === 'scenario-1' ? 'bg-indigo-900 border border-indigo-500' : 'bg-slate-800'}`}
                            >
                                💼 High Earner (₹50L)
                            </button>
                            <button
                                onClick={() => setScenario('scenario-2')}
                                disabled={isPlaying}
                                className={`p-2 rounded text-left text-sm hover:bg-slate-700 transition ${activeScenario === 'scenario-2' ? 'bg-indigo-900 border border-indigo-500' : 'bg-slate-800'}`}
                            >
                                💻 Freelancer (₹20L)
                            </button>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between bg-slate-800 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Speed:</span>
                            <div className="flex bg-slate-900 rounded p-1">
                                {[1, 2, 4].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setDemoSpeed(s)}
                                        className={`px-2 py-0.5 text-xs rounded ${demoSpeed === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {s}x
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isPlaying && (
                            <span className="text-xs text-green-400 animate-pulse font-mono">
                                ● RUNNING
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
