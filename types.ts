export enum ScreenState {
  LOGIN = 'LOGIN',
  MODE_SELECT = 'MODE_SELECT',
  LEVEL_SELECT = 'LEVEL_SELECT',
  SHOP = 'SHOP',
  GAME = 'GAME',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum GameMode {
  INFINITE = 'INFINITE',
  CAMPAIGN = 'CAMPAIGN'
}

export type EnemyTypeKey = 'slime' | 'bat' | 'bear' | 'ghost';

export interface EnemyConfig {
  id: string;
  lane: number; // 0, 1, 2, 3 (Spawn points)
  type: EnemyTypeKey;
  hp: number;
  maxHp: number;
  appearTime: number; // Timestamp when they appeared
  duration: number; // How long they stay before shooting/hiding
  state: 'hiding' | 'appearing' | 'visible' | 'dying' | 'attacking';
}

export interface LevelData {
  id: number;
  name: string;
  requiredKills: number;
  enemySpeedMultiplier: number;
  spawnRate: number; // ms between spawns
  backgroundColor: string;
  allowedEnemies: EnemyTypeKey[];
}

export interface GameStats {
  score: number;
  highScore: number;
  kills: number;
  currentLevel: number;
  health: number; // Player health
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  currency: number; // Session currency
}

export interface UpgradeLevels {
  damage: number;
  capacity: number;
  reloadSpeed: number;
}