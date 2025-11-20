import React from 'react';
import { GameStats, ScreenState } from '../types';
import { Heart, Crosshair, RotateCcw, Trophy, Home } from 'lucide-react';

interface UIProps {
  stats: GameStats;
  onReload: () => void;
  onPause: () => void;
  levelName: string;
}

export const UIOverlay: React.FC<UIProps> = ({ stats, onReload, onPause, levelName }) => {
  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-50">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        {/* Health & Level */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            {Array.from({ length: stats.maxHealth }).map((_, i) => (
              <Heart
                key={i}
                className={`w-8 h-8 ${i < stats.health ? 'fill-red-500 text-red-600' : 'fill-gray-300 text-gray-400'}`}
              />
            ))}
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full border-2 border-lavender-400 shadow-sm">
             <span className="font-bold text-lavender-900">{levelName}</span>
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col items-end">
           <div className="bg-white/90 px-6 py-2 rounded-full border-4 border-yellow-300 shadow-lg transform -skew-x-12">
              <span className="text-2xl font-black text-yellow-600 font-mono">{stats.score.toLocaleString()}</span>
           </div>
           {stats.highScore > 0 && (
             <div className="mt-1 mr-2 text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-md">
               HI: {stats.highScore.toLocaleString()}
             </div>
           )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-end pointer-events-auto">
         {/* Ammo */}
         <button 
            onClick={onReload}
            className={`group relative flex items-center gap-2 px-6 py-3 rounded-2xl transition-all ${
               stats.ammo === 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-800 hover:bg-slate-700'
            } text-white shadow-xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1`}
         >
            <div className="relative">
               <div className={`absolute bottom-0 left-0 bg-yellow-400 w-full transition-all duration-300 opacity-30`} style={{ height: `${(stats.ammo/stats.maxAmmo)*100}%`}}></div>
               <Crosshair className={`w-8 h-8 ${stats.ammo === 0 ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex flex-col items-start">
               <span className="text-xs uppercase tracking-wider text-slate-400">Ammo</span>
               <span className={`text-2xl font-mono font-bold ${stats.ammo < 5 ? 'text-red-400' : 'text-white'}`}>
                  {stats.ammo} / {stats.maxAmmo}
               </span>
            </div>
            <div className="absolute -top-2 -right-2 bg-white text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
               [R] or Click
            </div>
         </button>
         
         {/* Pause / Menu */}
         <button onClick={onPause} className="bg-lavender-200 hover:bg-lavender-300 p-3 rounded-full text-lavender-800 transition-colors">
            <div className="w-6 h-6 flex flex-col justify-center gap-1">
               <div className="w-full h-1 bg-current rounded-full"></div>
               <div className="w-full h-1 bg-current rounded-full"></div>
            </div>
         </button>
      </div>
    </div>
  );
};

export const GameOverModal: React.FC<{ 
   stats: GameStats; 
   state: ScreenState; 
   onRetry: () => void; 
   onMenu: () => void;
   nextLevel?: () => void;
}> = ({ stats, state, onRetry, onMenu, nextLevel }) => {
   const isVictory = state === ScreenState.VICTORY;
   
   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
         <div className={`bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl transform scale-100 border-8 ${isVictory ? 'border-yellow-300' : 'border-slate-300'}`}>
            {isVictory ? (
               <Trophy className="w-20 h-20 mx-auto text-yellow-400 mb-4 animate-bounce" />
            ) : (
               <div className="w-20 h-20 mx-auto bg-slate-200 rounded-full mb-4 flex items-center justify-center text-4xl">💀</div>
            )}
            
            <h2 className={`text-4xl font-black mb-2 ${isVictory ? 'text-lavender-600' : 'text-slate-700'}`}>
               {isVictory ? 'MISSION COMPLETE!' : 'GAME OVER'}
            </h2>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                     <span className="text-slate-400 text-xs uppercase">Score</span>
                     <span className="text-2xl font-bold text-slate-800">{stats.score}</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-slate-400 text-xs uppercase">Kills</span>
                     <span className="text-2xl font-bold text-slate-800">{stats.kills}</span>
                  </div>
               </div>
            </div>

            <div className="space-y-3">
               {isVictory && nextLevel && (
                  <button onClick={nextLevel} className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95 mb-2">
                     Next Mission
                  </button>
               )}
               
               <button onClick={onRetry} className="w-full flex items-center justify-center gap-2 bg-lavender-500 hover:bg-lavender-400 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95">
                  <RotateCcw size={20} />
                  Try Again
               </button>
               
               <button onClick={onMenu} className="w-full flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold py-3 rounded-xl transition-colors">
                  <Home size={20} />
                  Main Menu
               </button>
            </div>
         </div>
      </div>
   );
}
