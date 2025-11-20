import React from 'react';
import { EnemyTypeKey } from '../types';

// The Cute Purple Haired Girl
export const CharacterAvatar: React.FC<{ isIdle?: boolean; isShooting?: boolean; weaponLevel?: number }> = ({ isIdle = false, isShooting = false, weaponLevel = 1 }) => {
  return (
    <div className={`relative w-48 h-64 ${isIdle ? 'animate-wiggle' : ''}`}>
      {/* Hair Back */}
      <div className="absolute top-4 left-0 w-48 h-48 bg-lavender-600 rounded-full shadow-lg transform translate-y-2"></div>
      
      {/* Head */}
      <div className="absolute top-12 left-8 w-32 h-36 bg-orange-100 rounded-[2rem] shadow-inner z-10 flex flex-col items-center justify-center border-2 border-orange-200">
        {/* Face */}
        <div className="relative w-full h-full">
          {/* Eyes */}
          <div className="absolute top-12 left-4 w-8 h-10 bg-slate-800 rounded-full overflow-hidden">
            <div className="absolute top-1 right-2 w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-lavender-400 rounded-full opacity-50"></div>
          </div>
          <div className="absolute top-12 right-4 w-8 h-10 bg-slate-800 rounded-full overflow-hidden">
             <div className="absolute top-1 right-2 w-3 h-3 bg-white rounded-full animate-bounce"></div>
             <div className="absolute bottom-2 left-2 w-2 h-2 bg-lavender-400 rounded-full opacity-50"></div>
          </div>

          {/* Blush */}
          <div className="absolute top-20 left-2 w-6 h-3 bg-pink-300 rounded-full opacity-60 blur-sm"></div>
          <div className="absolute top-20 right-2 w-6 h-3 bg-pink-300 rounded-full opacity-60 blur-sm"></div>

          {/* Mouth */}
          {isShooting ? (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-red-400 rounded-b-full border-t-2 border-red-600"></div>
          ) : (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-pink-400 rounded-full"></div>
          )}
        </div>
      </div>

      {/* Hair Front/Bangs */}
      <div className="absolute top-4 left-6 w-36 h-16 bg-lavender-500 rounded-b-3xl z-20 shadow-sm"></div>
      <div className="absolute top-10 left-2 w-8 h-24 bg-lavender-600 rounded-full z-10 transform -rotate-12"></div>
      <div className="absolute top-10 right-2 w-8 h-24 bg-lavender-600 rounded-full z-10 transform rotate-12"></div>

      {/* Body/Dress */}
      <div className="absolute bottom-0 left-10 w-28 h-24 bg-pink-400 rounded-t-3xl z-0 border-4 border-white">
         <div className="w-full h-full flex justify-center mt-4">
            <div className="w-4 h-4 bg-yellow-300 rounded-full shadow-sm"></div>
         </div>
      </div>

      {/* Gun (Cartoon SMG) */}
      <div className={`absolute bottom-4 -right-8 z-30 transform ${isShooting ? 'rotate-0 translate-x-2' : 'rotate-12'}`}>
         <div className="relative">
            {/* Main Body - Changes color based on damage upgrade */}
            <div className={`w-24 h-12 ${weaponLevel > 3 ? 'bg-yellow-500' : weaponLevel > 1 ? 'bg-sky-600' : 'bg-slate-700'} rounded-lg shadow-lg border-b-4 border-slate-900 transition-colors`}></div>
            
            {/* Barrel */}
            <div className="absolute top-2 -right-4 w-8 h-6 bg-slate-800 rounded-r-md">
               {isShooting && (
                 <div className="absolute -right-12 -top-4 w-16 h-16 bg-yellow-400 rounded-full animate-ping opacity-75 clip-star"></div>
               )}
            </div>
            {/* Magazine - Extended for capacity upgrade */}
            <div className={`absolute bottom-0 left-8 w-6 ${weaponLevel > 2 ? 'h-16' : 'h-12'} bg-slate-800 rounded-b-md transform translate-y-6 border-l-2 border-slate-600`}></div>
            {/* Trigger Guard */}
            <div className="absolute bottom-0 left-16 w-6 h-6 border-2 border-slate-600 rounded-b-full"></div>
            {/* Stock */}
            <div className="absolute top-2 -left-6 w-8 h-2 bg-slate-600 rounded-l-md"></div>
         </div>
      </div>
    </div>
  );
};

export const EnemySprite: React.FC<{ type: EnemyTypeKey }> = ({ type }) => {
  
  // 1. Jelly Slime (Normal)
  if (type === 'slime') {
    return (
      <div className="relative w-16 h-16 flex justify-center items-end animate-bounce-slow">
        <div className="w-14 h-12 bg-emerald-400 rounded-t-full rounded-b-xl border-4 border-emerald-600 shadow-md relative">
          <div className="absolute top-3 left-3 w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute top-3 right-3 w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-2 bg-emerald-700 rounded-full opacity-50"></div>
        </div>
      </div>
    );
  }

  // 2. Winged Berry (Fast)
  if (type === 'bat') {
    return (
      <div className="relative w-16 h-16 flex justify-center items-center animate-wiggle">
        {/* Wings */}
        <div className="absolute -left-4 top-2 w-8 h-8 bg-purple-700 rounded-full transform -skew-x-12"></div>
        <div className="absolute -right-4 top-2 w-8 h-8 bg-purple-700 rounded-full transform skew-x-12"></div>
        {/* Body */}
        <div className="w-12 h-12 bg-purple-500 rounded-full border-4 border-white relative z-10">
           <div className="absolute top-3 left-2 w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
           <div className="absolute top-3 right-2 w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
           {/* Fangs */}
           <div className="absolute bottom-3 left-3 w-1 h-2 bg-white"></div>
           <div className="absolute bottom-3 right-3 w-1 h-2 bg-white"></div>
        </div>
      </div>
    );
  }

  // 3. Gummy Bear (Tank)
  if (type === 'bear') {
    return (
      <div className="relative w-20 h-20 flex justify-center items-end">
        <div className="w-18 h-16 bg-amber-600 rounded-3xl border-4 border-amber-800 shadow-lg relative flex justify-center">
          {/* Ears */}
          <div className="absolute -top-3 -left-1 w-6 h-6 bg-amber-600 rounded-full border-4 border-amber-800"></div>
          <div className="absolute -top-3 -right-1 w-6 h-6 bg-amber-600 rounded-full border-4 border-amber-800"></div>
          {/* Face */}
          <div className="absolute top-4 flex gap-4">
             <div className="w-2 h-2 bg-black rounded-full"></div>
             <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <div className="absolute bottom-4 w-6 h-4 bg-amber-300 rounded-full opacity-50"></div>
        </div>
      </div>
    );
  }

  // 4. Marshmallow Ghost (Special)
  if (type === 'ghost') {
    return (
      <div className="relative w-16 h-16 flex justify-center items-center animate-pulse">
         <div className="w-14 h-16 bg-white rounded-t-full opacity-80 shadow-[0_0_15px_rgba(255,255,255,0.5)] flex justify-center items-center flex-col">
            <div className="flex gap-3 mb-2">
               <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
               <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
            </div>
            <div className="w-4 h-4 bg-slate-800 rounded-full"></div>
            {/* Tail */}
            <div className="absolute -bottom-2 flex gap-1">
               <div className="w-3 h-3 bg-white rounded-full"></div>
               <div className="w-3 h-3 bg-white rounded-full"></div>
               <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
         </div>
      </div>
    );
  }

  return null;
};

export const CoverObject: React.FC<{ laneId: number }> = ({ laneId }) => {
   // Variations based on lane
   if (laneId % 2 === 0) {
     return (
       <div className="w-24 h-16 bg-green-700 rounded-t-full border-b-8 border-green-900 relative overflow-hidden">
          <div className="absolute top-4 left-2 w-4 h-4 bg-green-500 rounded-full opacity-50"></div>
          <div className="absolute top-8 right-4 w-6 h-6 bg-green-600 rounded-full opacity-50"></div>
       </div>
     )
   }
   return (
      <div className="w-20 h-14 bg-stone-500 rounded-lg transform rotate-3 border-r-8 border-stone-600 relative">
          <div className="absolute top-2 left-2 w-full h-1 bg-stone-400 opacity-30"></div>
          <div className="absolute bottom-2 left-2 w-full h-1 bg-stone-400 opacity-30"></div>
      </div>
   )
}