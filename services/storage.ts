import { UpgradeLevels } from "../types";

const STORAGE_KEY = 'purple_gunner_save_v2';

export interface SaveData {
  unlockedLevels: number; // Max level unlocked (1-based)
  highScoreInfinite: number;
  totalCurrency: number;
  upgrades: UpgradeLevels;
}

const DEFAULT_SAVE: SaveData = {
  unlockedLevels: 1,
  highScoreInfinite: 0,
  totalCurrency: 0,
  upgrades: {
    damage: 1,
    capacity: 1,
    reloadSpeed: 1
  }
};

export const getSaveData = (): SaveData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVE;
    // Merge with default in case we added new fields in v2
    return { ...DEFAULT_SAVE, ...JSON.parse(raw) };
  } catch (e) {
    console.error("Failed to load save", e);
    return DEFAULT_SAVE;
  }
};

export const saveGameData = (data: Partial<SaveData>) => {
  const current = getSaveData();
  const newData = { ...current, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
};

export const saveLevelProgress = (levelId: number) => {
  const current = getSaveData();
  if (levelId >= current.unlockedLevels) {
    saveGameData({ unlockedLevels: levelId + 1 });
  }
};

export const saveInfiniteScore = (score: number) => {
  const current = getSaveData();
  if (score > current.highScoreInfinite) {
    saveGameData({ highScoreInfinite: score });
  }
};

export const addCurrency = (amount: number) => {
  const current = getSaveData();
  saveGameData({ totalCurrency: current.totalCurrency + amount });
};

export const purchaseUpgrade = (type: keyof UpgradeLevels, cost: number) => {
  const current = getSaveData();
  if (current.totalCurrency >= cost) {
    const newUpgrades = { ...current.upgrades, [type]: current.upgrades[type] + 1 };
    saveGameData({
      totalCurrency: current.totalCurrency - cost,
      upgrades: newUpgrades
    });
    return true;
  }
  return false;
};