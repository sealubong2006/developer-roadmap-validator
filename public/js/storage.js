/**
 * LocalStorage management
 * Handles persisting user state
 */

const STORAGE_KEYS = {
    TRACK: 'drv_track',
    SKILLS: 'drv_skills',
    LAST_RESULTS: 'drv_last_results',
    SORT_PREFERENCE: 'drv_sort_preference',
    DASHBOARD_TOGGLE: 'drv_dashboard_toggle',
    GITHUB_TOKEN: 'drv_github_token',
    SO_KEY: 'drv_so_key'
};

class StorageManager {
    /**
     * Save track selection
     */
    saveTrack(track) {
        localStorage.setItem(STORAGE_KEYS.TRACK, track);
    }

    /**
     * Get saved track
     */
    getTrack() {
        return localStorage.getItem(STORAGE_KEYS.TRACK) || 'fullstack';
    }

    /**
     * Save skills
     */
    saveSkills(skills) {
        localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
    }

    /**
     * Get saved skills
     */
    getSkills() {
        const skills = localStorage.getItem(STORAGE_KEYS.SKILLS);
        return skills ? JSON.parse(skills) : [];
    }

    /**
     * Save validation results
     */
    saveResults(results) {
        const snapshot = {
            ...results,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.LAST_RESULTS, JSON.stringify(snapshot));
    }

    /**
     * Get saved results
     */
    getResults() {
        const results = localStorage.getItem(STORAGE_KEYS.LAST_RESULTS);
        return results ? JSON.parse(results) : null;
    }

    /**
     * Save sort preference
     */
    saveSortPreference(sortBy) {
        localStorage.setItem(STORAGE_KEYS.SORT_PREFERENCE, sortBy);
    }

    /**
     * Get sort preference
     */
    getSortPreference() {
        return localStorage.getItem(STORAGE_KEYS.SORT_PREFERENCE) || 'impact';
    }

    /**
     * Save dashboard toggle preference
     */
    saveDashboardToggle(isVisible) {
        localStorage.setItem(STORAGE_KEYS.DASHBOARD_TOGGLE, isVisible ? 'true' : 'false');
    }

    /**
     * Get dashboard toggle preference
     */
    getDashboardToggle() {
        const value = localStorage.getItem(STORAGE_KEYS.DASHBOARD_TOGGLE);
        return value !== 'false'; // Default to true
    }

    /**
     * Save GitHub token
     */
    saveGitHubToken(token) {
        if (token) {
            localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, token);
        } else {
            localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
        }
    }

    /**
     * Get GitHub token
     */
    getGitHubToken() {
        return localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN) || '';
    }

    /**
     * Save Stack Overflow key
     */
    saveSOKey(key) {
        if (key) {
            localStorage.setItem(STORAGE_KEYS.SO_KEY, key);
        } else {
            localStorage.removeItem(STORAGE_KEYS.SO_KEY);
        }
    }

    /**
     * Get Stack Overflow key
     */
    getSOKey() {
        return localStorage.getItem(STORAGE_KEYS.SO_KEY) || '';
    }

    /**
     * Clear all storage
     */
    clearAll() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    /**
     * Get storage size in KB
     */
    getStorageSize() {
        let total = 0;
        Object.values(STORAGE_KEYS).forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                total += value.length;
            }
        });
        return (total / 1024).toFixed(2);
    }
}

// Create global instance
window.storageManager = new StorageManager();
