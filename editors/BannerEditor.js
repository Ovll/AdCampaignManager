/**
 * @fileoverview Manages the Banner Editor screen and its functionalities.
 * Allows creating and editing banners with text, colors, fonts, and templates.
 */

class BannerEditor {
    /**
     * @param {LocalStorageService} localStorageService Dependency on LocalStorageService.
     * @param {CampaignService} campaignService Dependency on CampaignService.
     */
    constructor(localStorageService, campaignService) {
        this.localStorageService = localStorageService;
        this.campaignService = campaignService;

        // DOM Elements
        this.bannerTypeSelect = document.getElementById('banner-type');
        this.bannerTextInput = document.getElementById('banner-text');
        this.bannerBgColorInput = document.getElementById('banner-bg-color');
        this.bannerTextColorInput = document.getElementById('banner-text-color');
        this.bannerFontSizeInput = document.getElementById('banner-font-size');
        this.bannerFontFamilySelect = document.getElementById('banner-font-family');
        this.bannerTemplateBtns = document.querySelectorAll('.banner-template-btn');
        this.saveBannerBtn = document.getElementById('save-banner-btn');
        this.bannerPreviewContainer = document.getElementById('banner-preview-container');
        this.bannerPreview = document.getElementById('banner-preview');
        this.bannerPreviewText = document.getElementById('banner-preview-text');

        // Bind events
        this._bindEvents();
        this._applyTemplate('template1'); // Set a default template on load
    }

    /**
     * Binds event listeners to the editor controls.
     * @private
     */
    _bindEvents() {
        if (this.bannerTypeSelect) this.bannerTypeSelect.addEventListener('change', () => this.updatePreview());
        if (this.bannerTextInput) this.bannerTextInput.addEventListener('input', () => this.updatePreview());
        if (this.bannerBgColorInput) this.bannerBgColorInput.addEventListener('input', () => this.updatePreview());
        if (this.bannerTextColorInput) this.bannerTextColorInput.addEventListener('input', () => this.updatePreview());
        if (this.bannerFontSizeInput) this.bannerFontSizeInput.addEventListener('input', () => this.updatePreview());
        if (this.bannerFontFamilySelect) this.bannerFontFamilySelect.addEventListener('change', () => this.updatePreview());

        this.bannerTemplateBtns.forEach(button => {
            button.addEventListener('click', (e) => {
                const template = e.target.dataset.template;
                this._applyTemplate(template);
                this.updatePreview();
            });
        });

        if (this.saveBannerBtn) this.saveBannerBtn.addEventListener('click', () => this.saveBanner());

        // Initial preview update when page loads
        document.addEventListener('DOMContentLoaded', () => this.render());
    }

    /**
     * Applies a predefined design template to the banner controls.
     * @param {string} templateName The name of the template (e.g., 'template1').
     * @private
     */
    _applyTemplate(templateName) {
        const templates = {
            template1: {
                bgColor: '#4a90e2',
                textColor: '#ffffff',
                fontSize: 24,
                fontFamily: 'Arial, sans-serif'
            },
            template2: {
                bgColor: '#f9c74f',
                textColor: '#333333',
                fontSize: 28,
                fontFamily: 'Verdana, sans-serif'
            },
            template3: {
                bgColor: '#e76f51',
                textColor: '#f4f1de',
                fontSize: 20,
                fontFamily: 'Georgia, serif'
            }
        };

        const template = templates[templateName];
        if (template) {
            if (this.bannerBgColorInput) this.bannerBgColorInput.value = template.bgColor;
            if (this.bannerTextColorInput) this.bannerTextColorInput.value = template.textColor;
            if (this.bannerFontSizeInput) this.bannerFontSizeInput.value = template.fontSize;
            if (this.bannerFontFamilySelect) this.bannerFontFamilySelect.value = template.fontFamily;
        }
    }

    /**
     * Updates the banner preview in real-time based on current control values.
     */
    updatePreview() {
        if (!this.bannerPreview || !this.bannerPreviewText || !this.bannerTypeSelect) return;

        const bannerType = this.bannerTypeSelect.value;
        const text = this.bannerTextInput?.value || '';
        const bgColor = this.bannerBgColorInput?.value || '#ffffff';
        const textColor = this.bannerTextColorInput?.value || '#000000';
        const fontSize = this.bannerFontSizeInput?.value || 16;
        const fontFamily = this.bannerFontFamilySelect?.value || 'sans-serif';

        // Set dimensions based on type
        if (bannerType === 'square') {
            this.bannerPreview.style.width = '250px';
            this.bannerPreview.style.height = '250px';
        } else { // vertical
            this.bannerPreview.style.width = '300px';
            this.bannerPreview.style.height = '600px';
        }

        // Apply styles
        this.bannerPreview.style.backgroundColor = bgColor;
        this.bannerPreviewText.style.color = textColor;
        this.bannerPreviewText.style.fontSize = `${fontSize}px`;
        this.bannerPreviewText.style.fontFamily = fontFamily;
        this.bannerPreviewText.textContent = text;
        this.bannerPreviewText.innerHTML = text.replace(/\n/g, '<br>');
    }

    /**
     * Loads saved banner data from Local Storage and populates controls.
     */
    loadBanner() {
        const activeCampaign = this.campaignService.getActiveCampaign();
        if (activeCampaign && activeCampaign.assets && activeCampaign.assets.banner) {
            const savedBanner = activeCampaign.assets.banner;
            if (this.bannerTypeSelect) this.bannerTypeSelect.value = savedBanner.type;
            if (this.bannerTextInput) this.bannerTextInput.value = savedBanner.text;
            if (this.bannerBgColorInput) this.bannerBgColorInput.value = savedBanner.bgColor;
            if (this.bannerTextColorInput) this.bannerTextColorInput.value = savedBanner.textColor;
            if (this.bannerFontSizeInput) this.bannerFontSizeInput.value = savedBanner.fontSize;
            if (this.bannerFontFamilySelect) this.bannerFontFamilySelect.value = savedBanner.fontFamily;
            console.log('Banner loaded from active campaign.');
        } else {
            console.log('No banner found in active campaign, starting new.');
            this._applyTemplate('template1');
            if (this.bannerTextInput) this.bannerTextInput.value = 'Your Ad Text Here'; // Default text
        }
        this.updatePreview();
    }

    /**
     * Saves current banner data to Local Storage.
     */
    saveBanner() {
        const activeCampaign = this.campaignService.getActiveCampaign();
        if (!activeCampaign) {
            console.error('No active campaign to save to.');
            return;
        }

        const bannerData = {
            type: this.bannerTypeSelect?.value || 'square',
            text: this.bannerTextInput?.value || '',
            bgColor: this.bannerBgColorInput?.value || '#ffffff',
            textColor: this.bannerTextColorInput?.value || '#000000',
            fontSize: this.bannerFontSizeInput?.value || 16,
            fontFamily: this.bannerFontFamilySelect?.value || 'sans-serif'
        };

        // Update the active campaign object with the new banner data
        activeCampaign.assets.banner = bannerData;

        // Save the updated campaign to Local Storage (persists the change)
        this.campaignService.saveCampaign(activeCampaign);

        // Also update the active campaign key to reflect the change
        this.campaignService.setActiveCampaign(activeCampaign);

        console.log('Banner saved and campaign updated.');
    }

    /**
     * Renders the Banner Editor screen, loading previous data if available.
     */
    render() {
        // Ensure all elements are available before trying to interact
        if (this.bannerPreview && this.bannerTextInput && this.bannerTypeSelect) {
            this.loadBanner();
        } else {
            console.warn("Banner Editor DOM elements not fully loaded or available.");
        }
    }
}

export default BannerEditor;