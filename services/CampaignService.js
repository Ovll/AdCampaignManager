/**
 * @fileoverview Service for managing campaign data.
 * This service handles saving and retrieving campaign-related assets (banner, marketing page, landing page)
 * to and from Local Storage. It keeps track of the "active" campaign.
 */

class CampaignService {
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
        this.ACTIVE_CAMPAIGN_KEY = 'active_campaign';
        /**
         * @private
         * @type {string}
         */
        this.CAMPAIGN_PREFIX = 'campaign_';
    }

    /**
     * Retrieves the active campaign data.
     * @returns {Object | null} The active campaign object, or null if none exists.
     */
    getActiveCampaign() {
        return this.localStorageService.getItem(this.ACTIVE_CAMPAIGN_KEY);
    }

    /**
     * Sets the active campaign data.
     * @param {Object} campaignData The campaign object to set as active.
     */
    setActiveCampaign(campaignData) {
        // Ensure campaignData has essential properties like name and a timestamp
        const campaign = {
            ...campaignData,
            lastUpdated: new Date().toISOString() // Add timestamp for dashboard display
        };
        this.localStorageService.setItem(this.ACTIVE_CAMPAIGN_KEY, campaign);
        console.log('Active campaign updated:', campaign);
        // // Optionally, trigger an update on the dashboard if it's currently visible
        // this.displayActiveCampaign();
    }

    /**
     * Creates and saves a new campaign in Local Storage.
     * @param {string} campaignName The name of the new campaign.
     * @returns {Object} The newly created campaign object.
     */
    createCampaign(campaignName) {
        const campaignId = this._generateCampaignId();
        const newCampaign = {
            id: campaignId,
            name: campaignName,
            status: 'Draft',
            assets: {
                banner: null,
                marketingPage: null,
                landingPage: null
            },
            createdAt: new Date().toISOString()
        };
        this.saveCampaign(newCampaign);
        return newCampaign;
    }

    /**
     * Saves a campaign object to Local Storage using a unique key.
     * @param {Object} campaign The campaign object to save.
     */
    saveCampaign(campaign) {
        const campaignKey = this.CAMPAIGN_PREFIX + campaign.id;
        this.localStorageService.setItem(campaignKey, campaign);
        console.log(`Campaign "${campaign.name}" saved with key: ${campaignKey}`);
    }

    /**
     * Updates an asset (banner, marketingPage, or landingPage) for a given campaign.
     * @param {string} campaignId The ID of the campaign to update.
     * @param {string} assetType The type of asset ('banner', 'marketingPage', 'landingPage').
     * @param {Object} assetData The data for the asset to save.
     */
    updateCampaignAsset(campaignId, assetType, assetData) {
        const campaignKey = this.CAMPAIGN_PREFIX + campaignId;
        const campaign = this.localStorageService.getItem(campaignKey);

        if (campaign && campaign.assets && campaign.assets.hasOwnProperty(assetType)) {
            campaign.assets[assetType] = assetData;
            this.localStorageService.setItem(campaignKey, campaign);
            console.log(`Asset "${assetType}" for campaign "${campaign.name}" updated.`);
        } else {
            console.error(`Campaign with ID "${campaignId}" or asset type "${assetType}" not found.`);
        }
    }

    /**
     * Retrieves all saved campaigns from Local Storage.
     * @returns {Array<Object>} An array of all saved campaign objects.
     */
    getAllCampaigns() {
        const campaigns = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.CAMPAIGN_PREFIX)) {
                const campaign = this.localStorageService.getItem(key);
                if (campaign) {
                    campaigns.push(campaign);
                }
            }
        }
        return campaigns.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    }


    // Helper method to generate a unique ID (can be more robust)
    _generateCampaignId() {
        return 'campaign_' + Date.now();
    }

    /**
     * Displays the active campaign details on the dashboard.
     * Assumes specific DOM elements exist on the dashboard screen.
     */
    displayActiveCampaign() {
        const campaign = this.getActiveCampaign();
        const campaignOverview = document.getElementById('campaign-overview');
        const activeCampaignName = document.getElementById('active-campaign-name');
        const activeCampaignStatus = document.getElementById('active-campaign-status');
        const activeCampaignLastUpdated = document.getElementById('active-campaign-last-updated');
        const noCampaignMessage = document.getElementById('no-campaign-message');

        if (campaignOverview && activeCampaignName && activeCampaignStatus && activeCampaignLastUpdated && noCampaignMessage) {
            if (campaign) {
                activeCampaignName.textContent = campaign.name || 'Unnamed Campaign';
                activeCampaignStatus.textContent = campaign.status || 'Active'; // Default status
                activeCampaignLastUpdated.textContent = new Date(campaign.lastUpdated).toLocaleString();
                campaignOverview.classList.remove('hidden');
                noCampaignMessage.classList.add('hidden');
            } else {
                campaignOverview.classList.add('hidden');
                noCampaignMessage.classList.remove('hidden');
            }
        }
    }
}

export default CampaignService;