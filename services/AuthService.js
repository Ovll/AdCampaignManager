/**
 * @fileoverview Service for user authentication (login, signup, session management).
 * It uses LocalStorageService for persistence and UserService for user data.
 */

class AuthService {
    /**
     * @param {LocalStorageService} localStorageService Dependency on LocalStorageService.
     * @param {UserService} userService Dependency on UserService.
     */
    constructor(localStorageService, userService) {
        /**
         * @private
         * @type {LocalStorageService}
         */
        this.localStorageService = localStorageService;
        /**
         * @private
         * @type {UserService}
         */
        this.userService = userService;
        /**
         * @private
         * @type {string}
         */
        this.CURRENT_USER_KEY = 'current_user';
        /**
         * @private
         * @type {function[]}
         */
        this.authChangeListeners = [];
    }

    /**
     * Adds a listener for authentication status changes.
     * @param {function(Object|null):void} listener The callback function to execute on auth status change.
     */
    onAuthChange(listener) {
        this.authChangeListeners.push(listener);
    }

    /**
     * Notifies all registered listeners about an authentication status change.
     * @param {Object|null} user The current logged-in user object or null if logged out.
     * @private
     */
    _notifyAuthChange(user) {
        this.authChangeListeners.forEach(listener => listener(user));
    }

    /**
     * Attempts to log in a user.
     * @param {string} username The username.
     * @param {string} password The password.
     * @returns {Promise<boolean>} Resolves to true if login is successful, false otherwise.
     */
    async login(username, password) {
        const user = this.userService.getUser(username);
        if (user && user.password === password) {
            this.localStorageService.setItem(this.CURRENT_USER_KEY, { username: user.username });
            this._notifyAuthChange({ username: user.username });
            return true;
        }
        return false;
    }

    /**
     * Attempts to sign up a new user.
     * @param {string} username The desired username.
     * @param {string} password The desired password.
     * @returns {Promise<boolean>} Resolves to true if signup is successful, false if user already exists.
     */
    async signup(username, password) {
        const newUser = { username, password };
        const success = this.userService.saveUser(newUser);
        if (success) {
            // Automatically log in the new user
            return await this.login(username, password);
        }
        return false;
    }

    /**
     * Gets the currently logged-in user.
     * @returns {Object | null} The user object if logged in, otherwise null.
     */
    getLoggedInUser() {
        return this.localStorageService.getItem(this.CURRENT_USER_KEY);
    }

    /**
     * Checks the login status and notifies listeners.
     */
    checkLoginStatus() {
        const user = this.getLoggedInUser();
        this._notifyAuthChange(user);
    }

    /**
     * Logs out the current user.
     */
    logout() {
        this.localStorageService.removeItem(this.CURRENT_USER_KEY);
        this._notifyAuthChange(null);
    }
}

export default AuthService;