import React from 'react';

interface ResearcherNFTProps {
  counterValue: number;
  nextMilestone: number;
  isAtMilestone: boolean;
  hasNFT: boolean;
  onMintNFT: () => void;
  isLoading: boolean;
}

export const ResearcherNFT: React.FC<ResearcherNFTProps> = ({
  counterValue,
  nextMilestone,
  isAtMilestone,
  hasNFT,
  onMintNFT,
  isLoading
}) => {
  const progressPercentage = Math.min((counterValue / nextMilestone) * 100, 100);

  return (
    <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">🔬</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Milestone NFT</h3>
          <p className="text-sm text-slate-400">Earn NFT when counter reaches multiples of 10</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Counter: {counterValue}/{nextMilestone}</span>
          <span>{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-orange-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Status */}
      {hasNFT ? (
        <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/30">
          <div className="text-green-400 font-semibold mb-2">🎉 NFT Earned!</div>
          <div className="text-sm text-green-300">
            You've successfully earned the Milestone NFT
          </div>
        </div>
      ) : isAtMilestone ? (
        <div className="text-center">
          <div className="text-yellow-400 font-semibold mb-2">🎯 Milestone Reached!</div>
          <div className="text-sm text-slate-400 mb-4">
            Counter is at {counterValue} (multiple of 10). Mint your NFT now!
          </div>
          <button
            onClick={onMintNFT}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Minting...' : 'Mint Milestone NFT'}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-slate-400 font-semibold mb-2">⚡ Keep Interacting</div>
          <div className="text-sm text-slate-500">
            {nextMilestone - counterValue} more interactions to reach the next milestone
          </div>
        </div>
      )}

      {/* NFT Preview */}
      <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-600/30">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">Milestone NFT Preview</h4>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">🏆</span>
          </div>
          <div>
            <div className="text-white font-semibold">Top Signals Achiever</div>
            <div className="text-xs text-slate-400">
              Awarded for reaching counter milestones
            </div>
            <div className="text-xs text-slate-400">
              Role: Achiever • Level: Milestone Master
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
