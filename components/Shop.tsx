import React from 'react';
import { SaveData, purchaseUpgrade } from '../services/storage';
import { UPGRADE_MAX_LEVEL, UPGRADE_COSTS } from '../constants';
import { Zap, Briefcase, Clock, ArrowLeft, Star } from 'lucide-react';
import { audio } from '../services/audio';

interface ShopProps {
  saveData: SaveData;
  onClose: () => void;
  onUpdate: () => void; // Trigger parent refresh
}

export const Shop: React.FC<ShopProps> = ({ saveData, onClose, onUpdate }) => {
  
  const handlePurchase = (type: 'damage' | 'capacity' | 'reloadSpeed') => {
    const currentLevel = saveData.upgrades[type];
    if (currentLevel >= UPGRADE_MAX_LEVEL) return;
    
    const cost = UPGRADE_COSTS[currentLevel];
    if (purchaseUpgrade(type, cost)) {
      audio.playUpgrade();
      onUpdate();
    } else {
      // Error sound could go here
    }
  };

  const renderUpgradeCard = (
    type: 'damage' | 'capacity' | 'reloadSpeed', 
    title: string, 
    desc: string, 
    Icon: any, 
    colorClass: string
  ) => {
    const level = saveData.upgrades[type];
    const isMax = level >= UPGRADE_MAX_LEVEL;
    const cost = UPGRADE_COSTS[level];
    const canAfford = saveData.totalCurrency >= cost;

    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-100 flex flex-col items-center relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-full h-2 ${colorClass}`}></div>
        
        <div className={`w-16 h-16 ${colorClass.replace('bg-', 'bg-opacity-20 bg-')} rounded-full flex items-center justify-center mb-4`}>
           <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
        </div>

        <h3 className="text-xl font-black text-slate-800 mb-1">{title}</h3>
        <p className="text-slate-500 text-xs text-center mb-4 h-8">{desc}</p>

        {/* Level Indicator */}
        <div className="flex gap-1 mb-4">
           {[...Array(UPGRADE_MAX_LEVEL)].map((_, i) => (
             <div key={i} className={`w-3 h-3 rounded-full ${i < level ? colorClass : 'bg-slate-200'}`}></div>
           ))}
        </div>

        <button 
          onClick={() => handlePurchase(type)}
          disabled={isMax || !canAfford}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            isMax ? 'bg-slate-200 text-slate-400' :
            canAfford ? `${colorClass} text-white shadow-md hover:scale-105 active:scale-95` :
            'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isMax ? (
            'MAXED'
          ) : (
            <>
              <Star className="w-4 h-4 fill-current" />
              {cost.toLocaleString()}
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-lavender-50 p-6 flex flex-col items-center">
       <div className="w-full max-w-4xl flex justify-between items-center mb-8">
         <button onClick={() => { audio.playUiClick(); onClose(); }} className="text-lavender-600 font-bold flex items-center gap-2">
            <ArrowLeft size={20} /> BACK
         </button>
         <h2 className="text-3xl font-black text-lavender-800">WEAPON LAB</h2>
         <div className="bg-yellow-100 px-4 py-2 rounded-full flex items-center gap-2 border border-yellow-300">
            <Star className="fill-yellow-400 text-yellow-500 w-5 h-5" />
            <span className="font-mono font-bold text-yellow-700 text-lg">{saveData.totalCurrency.toLocaleString()}</span>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {renderUpgradeCard('damage', 'Power Shot', 'Increases damage per bullet.', Zap, 'bg-rose-500')}
          {renderUpgradeCard('capacity', 'Extended Mag', 'Increases ammo capacity.', Briefcase, 'bg-blue-500')}
          {renderUpgradeCard('reloadSpeed', 'Quick Hands', 'Reduces reload time.', Clock, 'bg-emerald-500')}
       </div>
    </div>
  );
};