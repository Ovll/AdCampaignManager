/**
 * @fileoverview Service for managing data in Local Storage.
 * This service encapsulates all interactions with localStorage, providing a centralized and testable interface.
 */

class LocalStorageService {
    /**
     * Stores a key-value pair in Local Storage.
     * @param {string} key The key under which to store the data.
     * @param {any} value The data to store. It will be JSON.stringified.
     * @returns {boolean} True if successful, false otherwise.
     */
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error("Error setting item to Local Storage:", e);
            // Handle quota exceeded errors, etc.
            return false;
        }
    }

    /**
     * Retrieves data from Local Storage by key.
     * @param {string} key The key of the data to retrieve.
     * @returns {any | null} The retrieved data (parsed from JSON), or null if not found/error.
     */
    getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error("Error getting item from Local Storage:", e);
            return null;
        }
    }

    /**
     * Removes an item from Local Storage by key.
     * @param {string} key The key of the item to remove.
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error("Error removing item from Local Storage:", e);
        }
    }
}

export default LocalStorageService;