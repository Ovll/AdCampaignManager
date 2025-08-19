import LocalStorageService from './services/LocalStorageService.js';
import UserService from './services/UserService.js';
import AuthService from './services/AuthService.js';
import NavigationService from './services/NavigationService.js';
import CampaignService from './services/CampaignService.js';
import BannerEditor from './editors/BannerEditor.js';
import MarketingPageEditor from './editors/MarketingPageEditor.js';
import LandingPageEditor from './editors/LandingPageEditor.js';
import UIController from './controllers/UIController.js';

/**
 * Main application entry point.
 * Initializes all services, editors, and the UI controller, injecting dependencies.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Core Services (Dependency Injection)
    const localStorageService = new LocalStorageService();
    const userService = new UserService(localStorageService);
    const authService = new AuthService(localStorageService, userService);
    const campaignService = new CampaignService(localStorageService);

    // 2. Initialize Editor Components (injecting their dependencies)
    const bannerEditor = new BannerEditor(localStorageService, campaignService);
    const marketingPageEditor = new MarketingPageEditor(localStorageService, campaignService);
    const landingPageEditor = new LandingPageEditor(localStorageService, campaignService);

    // 3. Initialize Navigation Service (injecting AuthService)
    const navigationService = new NavigationService(authService);

    // 4. Initialize Main UI Controller (injecting all necessary services and editors)
    const uiController = new UIController(
        navigationService,
        authService,
        bannerEditor,
        marketingPageEditor,
        landingPageEditor,
        campaignService
    );

    // Resolve circular dependency: NavigationService needs UIController to trigger editor renders.
    // This is a common pattern when you have services that need to call methods on controllers.
    navigationService.setUIController(uiController);

    // Ensure an initial user exists for easy testing on first load
    userService.createInitialUser();

    // Initialize the UI controller, which will handle initial navigation
    uiController.init();

    // Expose some objects globally for easy debugging in console (optional)
    window.app = {
        localStorageService,
        userService,
        authService,
        navigationService,
        campaignService,
        bannerEditor,
        marketingPageEditor,
        landingPageEditor,
        uiController
    };
    console.log("Application initialized. Use window.app for debugging.");
});