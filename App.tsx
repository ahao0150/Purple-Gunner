import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScreenState, GameMode, EnemyConfig, GameStats } from './types';
import { CharacterAvatar, EnemySprite, CoverObject } from './components/GameAssets';
import { UIOverlay, GameOverModal } from './components/UIOverlay';
import { Shop } from './components/Shop';
import { 
  CAMPAIGN_LEVELS, 
  INFINITE_LEVEL_CONFIG, 
  LANES, 
  MAX_PLAYER_HEALTH, 
  ENEMY_STATS, 
  BASE_AMMO,
  BASE_RELOAD_TIME,
  BASE_DAMAGE
} from './constants';
import { getSaveData, saveLevelProgress, saveInfiniteScore, addCurrency, SaveData } from './services/storage';
import { audio } from './services/audio';
import { Lock, Play, Star, Shield, Activity, ShoppingBag } from 'lucide-react';

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.LOGIN);
  const [mode, setMode] = useState<GameMode>(GameMode.CAMPAIGN);
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [saveData, setSaveData] = useState<SaveData>(getSaveData());
  
  // Computed Stats based on Upgrades
  const currentMaxAmmo = BASE_AMMO + (saveData.upgrades.capacity - 1) * 4;
  const currentReloadTime = Math.max(500, BASE_RELOAD_TIME - (saveData.upgrades.reloadSpeed - 1) * 300);
  const currentDamage = BASE_DAMAGE + (saveData.upgrades.damage - 1);

  // Game State
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    kills: 0,
    currentLevel: 1,
    health: MAX_PLAYER_HEALTH,
    maxHealth: MAX_PLAYER_HEALTH,
    ammo: currentMaxAmmo,
    maxAmmo: currentMaxAmmo,
    currency: 0,
  });

  const [enemies, setEnemies] = useState<EnemyConfig[]>([]);
  const [isReloading, setIsReloading] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  
  // Refs for loop logic
  const gameStateRef = useRef({
    lastSpawn: 0,
    enemies: [] as EnemyConfig[],
    stats: stats,
    isPlaying: false,
    levelConfig: CAMPAIGN_LEVELS[0],
    damage: currentDamage
  });

  // Sync refs
  useEffect(() => {
    gameStateRef.current.stats = stats;
    gameStateRef.current.enemies = enemies;
    gameStateRef.current.damage = currentDamage;
  }, [stats, enemies, currentDamage]);

  // --- Game Loop ---
  const gameLoopId = useRef<number>();
  const spawnTimeoutId = useRef<number>();

  const startGame = (selectedMode: GameMode, levelId: number) => {
    audio.init(undefined); // Initialize audio context
    audio.playUiClick(undefined);

    const levelConfig = selectedMode === GameMode.CAMPAIGN 
      ? CAMPAIGN_LEVELS.find(l => l.id === levelId) || CAMPAIGN_LEVELS[0] 
      : INFINITE_LEVEL_CONFIG;

    setMode(selectedMode);
    setCurrentLevelId(levelId);
    
    // Reset Game State
    setStats({
      score: 0,
      highScore: selectedMode === GameMode.INFINITE ? saveData.highScoreInfinite : 0,
      kills: 0,
      currentLevel: levelId,
      health: MAX_PLAYER_HEALTH,
      maxHealth: MAX_PLAYER_HEALTH,
      ammo: currentMaxAmmo,
      maxAmmo: currentMaxAmmo,
      currency: 0,
    });

    setEnemies([]);
    setIsReloading(false);
    
    gameStateRef.current.isPlaying = true;
    gameStateRef.current.levelConfig = levelConfig;
    gameStateRef.current.lastSpawn = Date.now();
    
    setScreen(ScreenState.GAME);
  };

  const spawnEnemy = useCallback(() => {
    if (!gameStateRef.current.isPlaying) return;

    const laneIdx = Math.floor(Math.random() * LANES.length);
    const id = Date.now().toString() + Math.random();
    const level = gameStateRef.current.levelConfig;
    
    // Pick enemy type based on level config
    const allowedTypes = level.allowedEnemies || ['slime'];
    const typeKey = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const enemyBaseStats = ENEMY_STATS[typeKey];

    // Difficulty scaling
    const infiniteScaling = mode === GameMode.INFINITE ? 1 + (stats.kills * 0.05) : 1;

    const newEnemy: EnemyConfig = {
      id,
      lane: laneIdx,
      type: typeKey,
      hp: enemyBaseStats.hp * (mode === GameMode.INFINITE && stats.kills > 20 ? 1.5 : 1), // Slight HP scale in infinite
      maxHp: enemyBaseStats.hp,
      appearTime: Date.now(),
      duration: (Math.random() * 2000 + 2000) / (level.enemySpeedMultiplier * enemyBaseStats.speedMod * infiniteScaling),
      state: 'appearing'
    };

    setEnemies(prev => {
       if (prev.some(e => e.lane === laneIdx && e.state !== 'dying')) return prev;
       return [...prev, newEnemy];
    });

    const nextSpawnTime = Math.max(500, level.spawnRate / (mode === GameMode.INFINITE ? (1 + stats.kills * 0.1) : 1));
    spawnTimeoutId.current = setTimeout(spawnEnemy, nextSpawnTime);
  }, [mode, stats.kills]);

  useEffect(() => {
    if (screen === ScreenState.GAME) {
      spawnEnemy();
    }
    return () => clearTimeout(spawnTimeoutId.current);
  }, [screen, spawnEnemy]);

  // Main update loop
  useEffect(() => {
    if (screen !== ScreenState.GAME) {
      cancelAnimationFrame(gameLoopId.current!);
      return;
    }

    const loop = () => {
      const now = Date.now();
      const currentEnemies = gameStateRef.current.enemies;
      let hpChange = 0;
      let updatedEnemies = currentEnemies.map(e => {
         if (e.state === 'dying') return e;

         const elapsed = now - e.appearTime;
         
         // Appearing -> Visible
         if (e.state === 'appearing' && elapsed > 300) {
           return { ...e, state: 'visible' };
         }

         // Visible -> Attacking
         if (e.state === 'visible' && elapsed > e.duration) {
            return { ...e, state: 'attacking', appearTime: now };
         }

         // Attacking -> Damage -> Hiding
         if (e.state === 'attacking' && elapsed > 500) {
            hpChange -= 1;
            return { ...e, state: 'hiding' };
         }

         return e;
      }).filter(e => e.state !== 'hiding');

      if (updatedEnemies.length !== currentEnemies.length || updatedEnemies.some((e, i) => e.state !== currentEnemies[i].state)) {
         setEnemies(updatedEnemies as EnemyConfig[]);
      }

      if (hpChange < 0) {
         audio.playPlayerDamage();
         setShakeScreen(true);
         setTimeout(() => setShakeScreen(false), 500);
         
         setStats(prev => {
           const newHp = prev.health + hpChange;
           if (newHp <= 0) {
             gameStateRef.current.isPlaying = false;
             setScreen(ScreenState.GAME_OVER);
             if (mode === GameMode.INFINITE) saveInfiniteScore(prev.score);
             // Save accumulated currency
             addCurrency(prev.currency);
             setSaveData(getSaveData()); // Refresh UI
           }
           return { ...prev, health: newHp };
         });
      }

      gameLoopId.current = requestAnimationFrame(loop);
    };

    gameLoopId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoopId.current!);
  }, [screen, mode]);

  // --- Interaction ---

  const handleReload = () => {
    if (isReloading || stats.ammo === currentMaxAmmo) return;
    audio.playReload();
    setIsReloading(true);
    setTimeout(() => {
      setStats(prev => ({ ...prev, ammo: currentMaxAmmo }));
      setIsReloading(false);
    }, currentReloadTime);
  };

  const handleShoot = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (isReloading) return;
    
    if (stats.ammo <= 0) {
      handleReload();
      return;
    }

    audio.playShoot(currentDamage > 1);
    setMuzzleFlash(true);
    setTimeout(() => setMuzzleFlash(false), 50);
    setStats(prev => ({ ...prev, ammo: prev.ammo - 1 }));
  };

  const handleHitEnemy = (enemyId: string) => {
    if (isReloading || stats.ammo <= 0) return;

    setEnemies(prev => prev.map(e => {
      if (e.id === enemyId && (e.state === 'visible' || e.state === 'appearing')) {
        audio.playEnemyHit();
        const newHp = e.hp - gameStateRef.current.damage;
        
        if (newHp <= 0) {
          audio.playEnemyDie();
          const enemyStats = ENEMY_STATS[e.type];
          
          setStats(s => {
             const newKills = s.kills + 1;
             const levelConfig = gameStateRef.current.levelConfig;
             
             if (mode === GameMode.CAMPAIGN && newKills >= levelConfig.requiredKills!) {
                gameStateRef.current.isPlaying = false;
                setTimeout(() => {
                   setScreen(ScreenState.VICTORY);
                   saveLevelProgress(currentLevelId);
                   addCurrency(s.currency + Math.floor(enemyStats.score / 10)); // Save accumulated + last kill
                   setSaveData(getSaveData());
                }, 500);
             }
             // Currency formula: Score / 10 roughly
             return { 
               ...s, 
               score: s.score + enemyStats.score, 
               kills: newKills,
               currency: s.currency + Math.floor(enemyStats.score / 10)
             };
          });
          return { ...e, state: 'dying' };
        }
        return { ...e, hp: newHp };
      }
      return e;
    }) as EnemyConfig[]);
  };

  // Cleanup dead enemies
  useEffect(() => {
    if (enemies.some(e => e.state === 'dying')) {
       const t = setTimeout(() => {
          setEnemies(prev => prev.filter(e => e.state !== 'dying'));
       }, 300);
       return () => clearTimeout(t);
    }
  }, [enemies]);


  // --- RENDERERS ---

  const renderLogin = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-lavender-100 to-purple-200 p-6">
      <div className="mb-8 transform scale-125 animate-bounce-slow">
        <CharacterAvatar isIdle={true} weaponLevel={saveData.upgrades.damage} />
      </div>
      
      <h1 className="text-5xl md:text-7xl font-black text-lavender-600 mb-2 drop-shadow-sm text-center tracking-tighter">
        PURPLE GUNNER
      </h1>
      <p className="text-lavender-800 mb-12 text-lg font-bold tracking-widest uppercase">Pop & Shot</p>
      
      <button 
        onClick={() => { audio.playUiClick(); setScreen(ScreenState.MODE_SELECT); }}
        className="bg-gradient-to-r from-lavender-500 to-purple-600 hover:from-lavender-400 hover:to-purple-500 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-xl transform transition hover:scale-110 active:scale-95 flex items-center gap-3"
      >
        <Play fill="white" /> START GAME
      </button>
    </div>
  );

  const renderModeSelect = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-lavender-50 p-6 relative">
      <button 
        onClick={() => { audio.playUiClick(); setScreen(ScreenState.LOGIN); }}
        className="absolute top-6 left-6 text-lavender-500 hover:text-lavender-700 font-bold text-lg"
      >
         ← BACK
      </button>

      {/* Shop Button */}
      <button 
        onClick={() => { audio.playUiClick(); setScreen(ScreenState.SHOP); }}
        className="absolute top-6 right-6 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 px-6 py-2 rounded-full font-bold shadow-md flex items-center gap-2 transition-transform hover:scale-105"
      >
        <ShoppingBag size={20} />
        <span>{saveData.totalCurrency.toLocaleString()}</span>
      </button>

      <h2 className="text-4xl font-bold text-lavender-800 mb-10">SELECT MODE</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <button 
          onClick={() => { audio.playUiClick(); setScreen(ScreenState.LEVEL_SELECT); }}
          className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-4 border-transparent hover:border-lavender-400 flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Star className="w-12 h-12 text-sky-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-700 mb-2">CAMPAIGN</h3>
          <p className="text-slate-500 text-center">Progress through levels, defeat waves, earn coins.</p>
        </button>

        <button 
          onClick={() => startGame(GameMode.INFINITE, 999)}
          className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-4 border-transparent hover:border-fuchsia-400 flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-fuchsia-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Activity className="w-12 h-12 text-fuchsia-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-700 mb-2">INFINITE</h3>
          <p className="text-slate-500 text-center">Endless waves. Survive as long as you can. High Score: {saveData.highScoreInfinite}</p>
        </button>
      </div>
    </div>
  );

  const renderLevelSelect = () => (
    <div className="min-h-screen bg-lavender-50 p-6 flex flex-col items-center">
       <div className="w-full max-w-4xl flex justify-between items-center mb-8">
         <button onClick={() => { audio.playUiClick(); setScreen(ScreenState.MODE_SELECT); }} className="text-lavender-600 font-bold">← BACK</button>
         <h2 className="text-3xl font-black text-lavender-800">CAMPAIGN MAP</h2>
         <div className="w-16"></div>
       </div>

       <div className="w-full max-w-md space-y-4">
          {CAMPAIGN_LEVELS.map((level) => {
             const isLocked = level.id > saveData.unlockedLevels;
             return (
               <button
                 key={level.id}
                 disabled={isLocked}
                 onClick={() => startGame(GameMode.CAMPAIGN, level.id)}
                 className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all transform hover:scale-[1.02] active:scale-95 ${
                   isLocked 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-white text-slate-800 shadow-lg border-l-8 border-lavender-500'
                 }`}
               >
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLocked ? 'bg-slate-300' : level.backgroundColor}`}>
                       {isLocked ? <Lock size={20} /> : <span className="font-black text-lg">{level.id}</span>}
                    </div>
                    <div className="text-left">
                       <div className="font-bold text-lg">{level.name}</div>
                       <div className="text-xs opacity-70">Enemies: {level.allowedEnemies?.join(', ')}</div>
                    </div>
                 </div>
                 {!isLocked && <Play className="text-lavender-400" />}
               </button>
             )
          })}
       </div>
    </div>
  );

  const renderGame = () => {
    const levelConfig = mode === GameMode.CAMPAIGN 
      ? CAMPAIGN_LEVELS.find(l => l.id === currentLevelId)! 
      : INFINITE_LEVEL_CONFIG;

    return (
      <div 
        className={`relative w-full h-screen overflow-hidden cursor-crosshair select-none ${levelConfig.backgroundColor} ${shakeScreen ? 'animate-shake' : ''}`}
        onClick={handleShoot}
      >
        <div className="absolute bottom-0 w-full h-[50%] bg-emerald-800/20 transform skew-y-3 origin-bottom-right"></div>
        
        <UIOverlay 
          stats={stats} 
          levelName={levelConfig.name}
          onReload={handleReload}
          onPause={() => setScreen(ScreenState.MODE_SELECT)} 
        />

        <div className="absolute inset-0 top-20"> 
           {LANES.map(lane => {
              const laneEnemy = enemies.find(e => e.lane === lane.id);
              return (
                <div 
                  key={lane.id} 
                  className="absolute"
                  style={{ 
                    left: lane.x, 
                    top: lane.y, 
                    transform: `scale(${lane.scale}) translate(-50%, -50%)`,
                    zIndex: Math.floor(lane.scale * 100)
                  }}
                >
                   <div className="relative flex flex-col items-center justify-end h-32 w-32">
                      {laneEnemy && (
                        <div 
                          onClick={(e) => { e.stopPropagation(); handleHitEnemy(laneEnemy.id); }}
                          className={`absolute transition-transform duration-300 cursor-pointer
                            ${laneEnemy.state === 'appearing' ? 'translate-y-10 opacity-100' : 
                              laneEnemy.state === 'visible' ? '-translate-y-10' : 
                              laneEnemy.state === 'attacking' ? '-translate-y-16 scale-110' : 
                              laneEnemy.state === 'dying' ? 'translate-y-20 opacity-0 rotate-45' : 'translate-y-20 opacity-0'}
                            ${laneEnemy.type === 'ghost' && laneEnemy.state === 'visible' ? 'animate-pulse' : ''}
                          `}
                        >
                           <EnemySprite type={laneEnemy.type} />
                           {laneEnemy.maxHp > 1 && (
                              <div className="absolute -top-4 w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                 <div className="h-full bg-red-500 transition-all" style={{ width: `${(laneEnemy.hp/laneEnemy.maxHp)*100}%`}}></div>
                              </div>
                           )}
                        </div>
                      )}
                      <div className="z-10 relative">
                        <CoverObject laneId={lane.id} />
                      </div>
                   </div>
                </div>
              )
           })}
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-10 pointer-events-none z-40 scale-75 md:scale-100">
          <CharacterAvatar isShooting={muzzleFlash} weaponLevel={saveData.upgrades.damage} />
          {muzzleFlash && (
             <div className="absolute bottom-40 right-[-50px] w-32 h-32 bg-yellow-200 rounded-full blur-xl opacity-50 animate-ping"></div>
          )}
        </div>

        {isReloading && (
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              <div className="bg-black/70 text-white px-6 py-2 rounded-full font-bold animate-pulse flex items-center gap-2">
                 <div className="animate-spin">↺</div> RELOADING...
              </div>
           </div>
        )}
      </div>
    );
  }

  return (
    <>
      {screen === ScreenState.SHOP && (
        <Shop 
          saveData={saveData} 
          onClose={() => setScreen(ScreenState.MODE_SELECT)}
          onUpdate={() => setSaveData(getSaveData())} 
        />
      )}
      {screen === ScreenState.LOGIN && renderLogin()}
      {screen === ScreenState.MODE_SELECT && renderModeSelect()}
      {screen === ScreenState.LEVEL_SELECT && renderLevelSelect()}
      {screen === ScreenState.GAME && renderGame()}
      {(screen === ScreenState.GAME_OVER || screen === ScreenState.VICTORY) && (
        <GameOverModal 
           stats={stats} 
           state={screen} 
           onRetry={() => startGame(mode, currentLevelId)}
           onMenu={() => setScreen(ScreenState.MODE_SELECT)}
           nextLevel={screen === ScreenState.VICTORY && currentLevelId < CAMPAIGN_LEVELS.length ? () => startGame(GameMode.CAMPAIGN, currentLevelId + 1) : undefined}
        />
      )}
    </>
  );
};

export default App;