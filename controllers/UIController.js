/**
 * @fileoverview Main UI Controller for the application.
 * Manages screen visibility, handles navigation events, and orchestrates interactions
 * between services and editor components.
 * Acts as the command center for the entire user interface, directing traffic between 
 * different parts of the application based on user input and system state, 
 * while delegating the actual work to specialized services and components.
 */

class UIController {
    /**
     * @param {NavigationService} navigationService Dependency on NavigationService.
     * @param {AuthService} authService Dependency on AuthService.
     * @param {BannerEditor} bannerEditor Dependency on BannerEditor.
     * @param {MarketingPageEditor} marketingPageEditor Dependency on MarketingPageEditor.
     * @param {LandingPageEditor} landingPageEditor Dependency on LandingPageEditor.
     * @param {CampaignService} campaignService Dependency on CampaignService.
     */
    constructor(navigationService, authService, bannerEditor, marketingPageEditor, landingPageEditor, campaignService) {
        /** @type {NavigationService} */
        this.navigationService = navigationService;
        /** @type {AuthService} */
        this.authService = authService;
        /** @type {BannerEditor} */
        this.bannerEditor = bannerEditor;
        /** @type {MarketingPageEditor} */
        this.marketingPageEditor = marketingPageEditor;
        /** @type {LandingPageEditor} */
        this.landingPageEditor = landingPageEditor;
        /** @type {CampaignService} */
        this.campaignService = campaignService;

        // DOM Elements
        this.loginScreen = document.getElementById('login-screen');
        this.mainAppContent = document.getElementById('main-app-content');
        this.dashboardScreen = document.getElementById('dashboard-screen');
        this.bannerEditorScreen = document.getElementById('banner-editor-screen');
        this.marketingEditorScreen = document.getElementById('marketing-editor-screen');
        this.landingEditorScreen = document.getElementById('landing-editor-screen');

        this.loginForm = document.getElementById('login-form');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginErrorDisplay = document.getElementById('login-error-message');
        this.signupButton = document.getElementById('signup-button');
        this.logoutButton = document.getElementById('logout-button');

        this.navDashboardBtn = document.getElementById('nav-dashboard');
        this.navBannerEditorBtn = document.getElementById('nav-banner-editor');
        this.navMarketingEditorBtn = document.getElementById('nav-marketing-editor');
        this.navLandingEditorBtn = document.getElementById('nav-landing-editor');
        this.createCampaignBtn = document.getElementById('create-campaign-btn');
        this.saveCampaignBtn = document.getElementById('save-campaign-btn');
        this.newCampaignNameInput = document.getElementById('new-campaign-name-input');
        this.campaignListContainer = document.getElementById('campaign-list');
        this.noCampaignsFoundMessage = document.getElementById('no-campaigns-found');



        this._bindEvents();
        this._registerScreens();
    }

    /**
     * Registers all main screen elements with the NavigationService.
     * @private
     */
    _registerScreens() {
        this.navigationService.registerScreens({
            'login-screen': this.loginScreen,
            'main-app-content': this.mainAppContent, // Main container for authenticated views
            'dashboard-screen': this.dashboardScreen,
            'banner-editor-screen': this.bannerEditorScreen,
            'marketing-editor-screen': this.marketingEditorScreen,
            'landing-editor-screen': this.landingEditorScreen
        });
    }

    /**
     * Binds event listeners for UI interactions.
     * @private
     */
    _bindEvents() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }
        if (this.signupButton) {
            this.signupButton.addEventListener('click', async () => {
                await this.handleSignup();
            });
        }
        if (this.logoutButton) {
            this.logoutButton.addEventListener('click', () => {
                this.authService.logout();
            });
        }
        if (this.createCampaignBtn) {
            this.createCampaignBtn.addEventListener('click', () => this.handleCreateCampaign());
        }
        if (this.saveCampaignBtn) {
            this.saveCampaignBtn.addEventListener('click', () => this.handleSaveCampaign());
        }
        if (this.campaignListContainer) {
            this.campaignListContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('load-campaign-btn')) {
                    const campaignId = event.target.dataset.campaignId;
                    this.handleLoadCampaign(campaignId);
                }
            });
        }

        // Navigation buttons
        if (this.navDashboardBtn) this.navDashboardBtn.addEventListener('click', () => this.navigationService.goToDashboard());
        if (this.navBannerEditorBtn) this.navBannerEditorBtn.addEventListener('click', () => this.navigationService.goToBannerEditor());
        if (this.navMarketingEditorBtn) this.navMarketingEditorBtn.addEventListener('click', () => this.navigationService.goToMarketingPageEditor());
        if (this.navLandingEditorBtn) this.navLandingEditorBtn.addEventListener('click', () => this.navigationService.goToLandingPageEditor());

        // Ensure dashboard content updates when dashboard is shown
        this.authService.onAuthChange(user => { // Corrected: Listen directly to AuthService
            if (user && this.dashboardScreen && !this.dashboardScreen.classList.contains('hidden')) {
                this.campaignService.displayActiveCampaign();
            }
        });
    }

    /**
     * Handles user login attempt.
     */
    async handleLogin() {
        const username = this.usernameInput?.value;
        const password = this.passwordInput?.value;
        if (!username || !password) {
            this._displayLoginError('Please enter both username and password.');
            return;
        }

        const success = await this.authService.login(username, password);
        if (success) {
            console.log('Login successful!');
            this._hideLoginError();
            this.navigationService.goToDashboard();
            this._resetLoginForm();
        } else {
            this._displayLoginError('Invalid username or password.');
        }
    }

    /**
     * Handles user signup attempt.
     */
    async handleSignup() {
        const username = this.usernameInput?.value;
        const password = this.passwordInput?.value;
        if (!username || !password) {
            this._displayLoginError('Please enter both username and password for signup.');
            return;
        }

        const success = await this.authService.signup(username, password);
        if (success) {
            console.log('Signup successful! Logged in automatically.');
            this._hideLoginError();
            this.navigationService.goToDashboard();
            this._resetLoginForm();
        }
        else {
            this._displayLoginError('Username already exists. Please choose a different one.');
        }
    }

    handleCreateCampaign() {
        const campaignName = this.newCampaignNameInput?.value || 'New Campaign';
        const newCampaign = this.campaignService.createCampaign(campaignName);
        this.campaignService.setActiveCampaign(newCampaign);
        console.log('New campaign created and set as active:', newCampaign);
        // Display the new campaign on the dashboard without full reload
        this.campaignService.displayActiveCampaign();
        this.newCampaignNameInput.value = ''; // Clear the input field
    }
    handleLoadCampaign(campaignId) {
        const allCampaigns = this.campaignService.getAllCampaigns();
        const campaignToLoad = allCampaigns.find(c => c.id === campaignId);

        if (campaignToLoad) {
            this.campaignService.setActiveCampaign(campaignToLoad);
            console.log(`Campaign "${campaignToLoad.name}" loaded and set as active.`);
            this.campaignService.displayActiveCampaign();
        } else {
            console.error(`Campaign with ID "${campaignId}" not found.`);
        }
    }

    handleSaveCampaign() {
        const activeCampaign = this.campaignService.getActiveCampaign();
        if (activeCampaign) {
            // Here you would get the current state from the relevant editor
            // For example, this.bannerEditor.getCampaignData()
            const updatedCampaign = {
                ...activeCampaign,
                assets: {
                    banner: { content: 'Saved banner content', version: Date.now() },
                    marketingPage: null, // Placeholder for other editors
                    landingPage: null
                }
            };
            this.campaignService.saveCampaign(updatedCampaign);
            this.campaignService.setActiveCampaign(updatedCampaign); // Ensure the active campaign object is the latest version
            console.log('Campaign assets saved and active campaign updated!');
        } else {
            console.error('No active campaign to save.');
        }
    }

    renderCampaignList() {
        const campaigns = this.campaignService.getAllCampaigns();
        this.campaignListContainer.innerHTML = ''; // Clear existing list

        if (this.noCampaignsFoundMessage) {
            if (campaigns.length === 0) {
                this.noCampaignsFoundMessage.classList.remove('hidden');
            } else {
                this.noCampaignsFoundMessage.classList.add('hidden');
            }
        }

        campaigns.forEach(campaign => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-md shadow-sm border border-gray-200';
            li.innerHTML = `
                <div>
                    <span class="font-bold text-gray-800">${campaign.name || 'Unnamed Campaign'}</span>
                </div>
                <button data-campaign-id="${campaign.id}" class="load-campaign-btn py-1 px-3 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Load
                </button>
            `;
            this.campaignListContainer.appendChild(li);
        });
    }

    /**
     * Displays a login error message.
     * @param {string} message The error message to display.
     * @private
     */
    _displayLoginError(message) {
        if (this.loginErrorDisplay) {
            this.loginErrorDisplay.textContent = message;
            this.loginErrorDisplay.classList.remove('hidden');
        }
    }

    /**
     * Hides the login error message.
     * @private
     */
    _hideLoginError() {
        if (this.loginErrorDisplay) {
            this.loginErrorDisplay.classList.add('hidden');
            this.loginErrorDisplay.textContent = '';
        }
    }

    /**
     * Resets the login form fields.
     * @private
     */
    _resetLoginForm() {
        if (this.usernameInput) this.usernameInput.value = '';
        if (this.passwordInput) this.passwordInput.value = '';
    }

    /**
     * Initializes the UI by checking auth status and navigating.
     */
    init() {
        this.authService.checkLoginStatus();
        this.renderCampaignList();
    }
}

export default UIController;