/**
 * @fileoverview Service for managing application navigation (which screen is visible).
 * It orchestrates screen visibility based on authentication status and user actions.
 */

class NavigationService {
    /**
     * @param {AuthService} authService Dependency on AuthService.
     */
    constructor(authService) {
        /**
         * @private
         * @type {AuthService}
         */
        this.authService = authService;
        /**
         * @private
         * @type {Object.<string, HTMLElement>}
         */
        this.screens = {}; // To store references to screen elements
        /**
         * @private
         * @type {UIController|null}
         */
        this.uiController = null; // To avoid circular dependency, set later
    }

    /**
     * Sets the UIController instance. Used to resolve circular dependencies.
     * @param {UIController} uiController The UIController instance.
     */
    setUIController(uiController) {
        this.uiController = uiController;
        // Subscribe to auth changes to automatically navigate
        this.authService.onAuthChange(user => {
            if (user) {
                this.goToDashboard();
            } else {
                this.goToLogin();
            }
        });
    }

    /**
     * Registers screen elements with the navigation service.
     * @param {Object.<string, HTMLElement>} screenElements An object where keys are screen IDs and values are their HTMLElement references.
     */
    registerScreens(screenElements) {
        this.screens = screenElements;
    }

    /**
     * Hides all registered screens.
     * @private
     */
    _hideAllScreens() {
        Object.values(this.screens).forEach(screen => screen.classList.add('hidden'));
    }

    /**
     * Displays a specific screen by its ID.
     * @param {string} screenId The ID of the screen to display.
     * @private
     */
    _showScreen(screenId) {
        this._hideAllScreens();
        const screen = this.screens[screenId];
        if (screen) {
            screen.classList.remove('hidden');
            // If it's a main app screen, ensure the main-app-content is visible
            if (screenId !== 'login-screen') {
                this.screens['main-app-content'].classList.remove('hidden');
            } else {
                this.screens['main-app-content'].classList.add('hidden');
            }
            // Trigger rendering for editor screens
            if (this.uiController) {
                switch (screenId) {
                    case 'banner-editor-screen':
                        this.uiController.bannerEditor.render();
                        break;
                    case 'marketing-editor-screen':
                        this.uiController.marketingPageEditor.render();
                        break;
                    case 'landing-editor-screen':
                        this.uiController.landingPageEditor.render();
                        break;
                    case 'dashboard-screen':
                        this.uiController.campaignService.displayActiveCampaign(); // Ensure dashboard updates
                        break;
                }
            }
        } else {
            console.error(`Screen with ID "${screenId}" not registered.`);
        }
    }

    /**
     * Navigates to the login screen.
     */
    goToLogin() {
        this._showScreen('login-screen');
    }

    /**
     * Navigates to the dashboard screen. Requires authentication.
     */
    goToDashboard() {
        if (this.authService.getLoggedInUser()) {
            this._showScreen('dashboard-screen');
        } else {
            this.goToLogin(); // Redirect to login if not authenticated
        }
    }

    /**
     * Navigates to the banner editor screen. Requires authentication.
     */
    goToBannerEditor() {
        if (this.authService.getLoggedInUser()) {
            this._showScreen('banner-editor-screen');
        } else {
            this.goToLogin();
        }
    }

    /**
     * Navigates to the marketing page editor screen. Requires authentication.
     */
    goToMarketingPageEditor() {
        if (this.authService.getLoggedInUser()) {
            this._showScreen('marketing-editor-screen');
        } else {
            this.goToLogin();
        }
    }

    /**
     * Navigates to the landing page editor screen. Requires authentication.
     */
    goToLandingPageEditor() {
        if (this.authService.getLoggedInUser()) {
            this._showScreen('landing-editor-screen');
        } else {
            this.goToLogin();
        }
    }
}

export default NavigationService;