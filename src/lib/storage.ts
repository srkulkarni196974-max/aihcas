/**
 * AIHCAS User-Scoped Storage Utility
 * 
 * Ensures that data stored in localStorage is keyed by the logged-in userId,
 * preventing cross-user data leakage on shared browsers.
 */

export const StorageKeys = {
  PROFILE: 'aihcas_profile',
  REPORTS: 'aihcas_reports',
  PRESCRIPTIONS: 'aihcas_prescriptions',
};

/**
 * Gets a user-specific key for localStorage
 */
function getScopedKey(baseKey: string, userId: string | undefined): string {
  if (!userId) return baseKey;
  return `${baseKey}_${userId}`;
}

export const UserStorage = {
  getItem: (key: string, userId: string | undefined): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(getScopedKey(key, userId));
  },

  setItem: (key: string, value: string, userId: string | undefined): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getScopedKey(key, userId), value);
  },

  removeItem: (key: string, userId: string | undefined): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getScopedKey(key, userId));
  },

  // Helper to migrate legacy data (unscoped) to the current user if needed
  migrateLegacyData: (userId: string): void => {
    if (typeof window === 'undefined') return;
    Object.values(StorageKeys).forEach(key => {
      const legacyData = localStorage.getItem(key);
      if (legacyData && !localStorage.getItem(`${key}_${userId}`)) {
        localStorage.setItem(`${key}_${userId}`, legacyData);
        // We keep the legacy data for now to avoid accidental loss, 
        // but normally we might remove it.
      }
    });
  }
};
