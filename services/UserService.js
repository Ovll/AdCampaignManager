/**
 * @fileoverview Service for managing user data.
 * This service handles user creation and retrieval, persisting data via LocalStorageService.
 */

class UserService {
    /**
     * @param {LocalStorageService} localStorageService Dependency on LocalStorageService.
     */
    constructor(localStorageService) {
        /**
         * @private
         * @type {LocalStorageService}
         */
        this.localStorageService = localStorageService;
        /**
         * @private
         * @type {string}
         */
        this.USERS_KEY = 'app_users';
    }

    /**
     * Retrieves all registered users.
     * @returns {Array<Object>} An array of user objects.
     * @private
     */
    _getUsers() {
        return this.localStorageService.getItem(this.USERS_KEY) || [];
    }

    /**
     * Saves the current list of users to Local Storage.
     * @param {Array<Object>} users The array of user objects to save.
     * @private
     */
    _saveUsers(users) {
        this.localStorageService.setItem(this.USERS_KEY, users);
    }

    /**
     * Creates an initial default user if no users exist in Local Storage.
     * This is for convenient testing and initial setup.
     */
    createInitialUser() {
        const users = this._getUsers();
        if (users.length === 0) {
            const initialUser = {
                username: 'testuser',
                password: 'password123'
            };
            users.push(initialUser);
            this._saveUsers(users);
            console.log('Initial user "testuser" created.');
        }
    }

    /**
     * Finds a user by username.
     * @param {string} username The username to search for.
     * @returns {Object | undefined} The user object if found, otherwise undefined.
     */
    getUser(username) {
        const users = this._getUsers();
        return users.find(user => user.username === username);
    }

    /**
     * Saves a new user to the system.
     * @param {Object} user The user object to save.
     * @returns {boolean} True if the user was saved, false if username already exists.
     */
    saveUser(user) {
        const users = this._getUsers();
        if (users.some(u => u.username === user.username)) {
            return false; // User already exists
        }
        users.push(user);
        this._saveUsers(users);
        return true;
    }
}

export default UserService;