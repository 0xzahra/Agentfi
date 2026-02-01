import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: (name: string, personality: number) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState(50);
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step === 1 && name) {
      setStep(2);
    } else if (step === 2) {
      onComplete(name, personality);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-700 p-8 rounded-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
      
      <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-6 tracking-wider">CREATE YOUR AGENT</h2>
      
      {step === 1 && (
        <div className="space-y-6">
          <label className="block">
            <span className="text-sm text-slate-400 uppercase tracking-widest">Identify Agent Name</span>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none font-mono"
              placeholder="e.g. OMEGA-7"
              autoFocus
            />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
             <div>
                <span className="text-sm text-slate-400 uppercase tracking-widest block mb-4">Personality Matrix</span>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={personality}
                    onChange={(e) => setPersonality(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between mt-2 text-xs font-bold text-slate-500">
                    <span className={`transition-colors ${personality < 30 ? 'text-rose-500' : ''}`}>DEGEN GAMBLER</span>
                    <span className={`transition-colors ${personality > 70 ? 'text-blue-500' : ''}`}>WALL ST ANALYST</span>
                </div>
            </div>
            
            <div className="text-xs text-slate-400 p-4 bg-slate-950 rounded border border-slate-800 font-mono">
                PREVIEW: {personality < 30 ? "High Risk. High Reward. Social focus." : personality > 70 ? "Data driven. Conservative. Execution focus." : "Balanced approach. Adaptable."}
            </div>
        </div>
      )}

      <button 
        onClick={handleNext}
        disabled={step === 1 && !name}
        className="mt-8 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
      >
        {step === 1 ? 'Initialize Core' : 'Deploy Agent'}
      </button>
    </div>
  );
};

export default Onboarding;