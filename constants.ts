import { LevelData, EnemyTypeKey } from "./types";

export const MAX_PLAYER_HEALTH = 3;

// Base stats, modified by upgrades
export const BASE_AMMO = 12;
export const BASE_RELOAD_TIME = 2000;
export const BASE_DAMAGE = 1;

export const LANES = [
  { id: 0, x: '15%', y: '40%', scale: 0.7, color: 'bg-emerald-600' },
  { id: 1, x: '35%', y: '38%', scale: 0.65, color: 'bg-emerald-700' },
  { id: 2, x: '60%', y: '42%', scale: 0.75, color: 'bg-emerald-500' },
  { id: 3, x: '85%', y: '45%', scale: 0.8, color: 'bg-emerald-400' },
];

export const ENEMY_STATS: Record<EnemyTypeKey, { hp: number, score: number, speedMod: number }> = {
  slime: { hp: 1, score: 50, speedMod: 1.0 },
  bat: { hp: 1, score: 100, speedMod: 0.7 }, // Faster (lower duration)
  bear: { hp: 4, score: 200, speedMod: 1.5 }, // Slower (higher duration)
  ghost: { hp: 2, score: 150, speedMod: 1.2 }
};

export const UPGRADE_COSTS = [0, 500, 1500, 3000, 5000, 9999];
export const UPGRADE_MAX_LEVEL = 5;

export const CAMPAIGN_LEVELS: LevelData[] = [
  { id: 1, name: "Sunny Meadow", requiredKills: 10, enemySpeedMultiplier: 1, spawnRate: 2000, backgroundColor: 'bg-sky-200', allowedEnemies: ['slime'] },
  { id: 2, name: "Twilight Hill", requiredKills: 15, enemySpeedMultiplier: 1.2, spawnRate: 1800, backgroundColor: 'bg-indigo-200', allowedEnemies: ['slime', 'bat'] },
  { id: 3, name: "Misty Ruins", requiredKills: 20, enemySpeedMultiplier: 1.4, spawnRate: 1500, backgroundColor: 'bg-slate-300', allowedEnemies: ['slime', 'bat', 'ghost'] },
  { id: 4, name: "Candy Fort", requiredKills: 25, enemySpeedMultiplier: 1.6, spawnRate: 1300, backgroundColor: 'bg-rose-200', allowedEnemies: ['slime', 'bear', 'ghost'] },
  { id: 5, name: "Void Edge", requiredKills: 40, enemySpeedMultiplier: 2.0, spawnRate: 1000, backgroundColor: 'bg-purple-900', allowedEnemies: ['slime', 'bat', 'bear', 'ghost'] },
];

export const INFINITE_LEVEL_CONFIG: LevelData = {
  id: 999,
  name: "Endless Defense",
  requiredKills: 999999,
  enemySpeedMultiplier: 1, 
  spawnRate: 2000, 
  backgroundColor: 'bg-fuchsia-100',
  allowedEnemies: ['slime', 'bat', 'bear', 'ghost']
};