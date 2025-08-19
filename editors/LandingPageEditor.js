/**
 * @fileoverview Manages the Landing Page Editor screen.
 * Allows creating and editing landing pages with content, images, CTA buttons, and an optional lead form.
 */

class LandingPageEditor {
    /**
     * @param {LocalStorageService} localStorageService Dependency on LocalStorageService.
     * @param {CampaignService} campaignService Dependency on CampaignService.
     */
    constructor(localStorageService, campaignService) {
        this.localStorageService = localStorageService;
        this.campaignService = campaignService;
        this.LANDING_PAGE_KEY = 'current_landing_page'; // Retained for compatibility

        // DOM Elements
        this.templateBtns = document.querySelectorAll('.landing-template-btn');
        this.titleInput = document.getElementById('landing-title');
        this.paragraphInput = document.getElementById('landing-paragraph');
        this.imageUrlInput = document.getElementById('landing-image-url');
        this.ctaTextInput = document.getElementById('landing-cta-text');
        this.ctaLinkInput = document.getElementById('landing-cta-link');
        this.bgColorInput = document.getElementById('landing-bg-color');
        this.textColorInput = document.getElementById('landing-text-color');
        this.collectLeadsCheckbox = document.getElementById('landing-collect-leads');
        this.saveBtn = document.getElementById('save-landing-btn');
        this.previewContainer = document.getElementById('landing-preview-container');
        this.downloadHtmlBtn = document.getElementById('download-html-btn');


        this.currentTemplateId = 'template1'; // Default template

        this._bindEvents();
        this._applyTemplate(this.currentTemplateId); // Apply default template on load
    }

    /**
     * Defines basic HTML templates for landing pages.
     * @param {string} templateId The ID of the template to retrieve.
     * @param {boolean} includeLeadForm Whether to include the lead collection form.
     * @returns {string} The HTML string for the chosen template.
     * @private
     */
    _getTemplateHtml(templateId, includeLeadForm) {
        const leadFormHtml = `
            <div style="background-color: rgba(255,255,255,0.9); padding: 20px; border-radius: 8px; margin-top: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h4 style="text-align: center; color: #333; margin-bottom: 15px;">Sign Up for More Info!</h4>
                <form onsubmit="event.preventDefault(); alert('Lead Captured: ' + this.name.value + ' - ' + this.email.value);" style="display: flex; flex-direction: column; gap: 10px;">
                    <input type="text" name="name" placeholder="Your Name" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px;" required>
                    <input type="email" name="email" placeholder="Your Email" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px;" required>
                    <button type="submit" style="padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Submit</button>
                </form>
            </div>
        `;

        switch (templateId) {
            case 'template1':
                return `
                <div style="width: 100%; max-width: 800px; margin: 0 auto; padding: 30px; box-sizing: border-box; background-color: {bgColor}; color: {textColor}; font-family: 'Inter', sans-serif; text-align: center; display: flex; flex-direction: column;">
                    <h1 style="font-size: 36px; margin-bottom: 20px; color: {textColor};">{title}</h1>
                    <img src="{imageUrl}" alt="Landing Image" style="width: 100%; height: auto; max-height: 400px; object-fit: cover; border-radius: 12px; margin-bottom: 25px;">
                    <p style="font-size: 18px; line-height: 1.6; margin-bottom: 30px;">{paragraph}</p>
                    <a href="{ctaLink}" style="display: inline-block; padding: 15px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 8px; font-size: 20px; font-weight: bold; transition: background-color 0.3s ease;">{ctaText}</a>
                    ${includeLeadForm ? leadFormHtml : ''}
                </div>
                `;
            case 'template2':
                return `
                <div style="width: 100%; max-width: 700px; margin: 0 auto; padding: 25px; box-sizing: border-box; background-color: {bgColor}; color: {textColor}; font-family: 'Verdana', sans-serif; text-align: left; display: flex; flex-direction: column;">
                    <img src="{imageUrl}" alt="Landing Image" style="width: 100%; height: auto; max-height: 350px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="font-size: 32px; margin-bottom: 15px; color: {textColor};">{title}</h2>
                    <p style="font-size: 17px; line-height: 1.5; margin-bottom: 25px;">{paragraph}</p>
                    <a href="{ctaLink}" style="display: inline-block; padding: 12px 25px; background-color: #28a745; color: white; text-decoration: none; border-radius: 6px; font-size: 18px; transition: background-color 0.3s ease;">{ctaText}</a>
                    ${includeLeadForm ? leadFormHtml : ''}
                </div>
                `;
            case 'template3':
                return `
                <div style="width: 100%; max-width: 900px; margin: 0 auto; padding: 40px; box-sizing: border-box; background-color: {bgColor}; color: {textColor}; font-family: 'Georgia', serif; text-align: center; display: flex; flex-direction: column;">
                    <h1 style="font-size: 40px; margin-bottom: 30px; color: {textColor}; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">{title}</h1>
                    <p style="font-size: 20px; line-height: 1.7; margin-bottom: 40px;">{paragraph}</p>
                    <img src="{imageUrl}" alt="Landing Image" style="width: 80%; height: auto; object-fit: contain; border-radius: 15px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); margin-bottom: 40px;">
                    <a href="{ctaLink}" style="display: inline-block; padding: 18px 35px; background-color: #ffc107; color: #333; text-decoration: none; border-radius: 10px; font-size: 22px; font-weight: bold; transition: background-color 0.3s ease; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">⚡ {ctaText} ⚡</a>
                    ${includeLeadForm ? leadFormHtml : ''}
                </div>
                `;
            default:
                return '';
        }
    }

    /**
     * Binds event listeners to the editor controls.
     * @private
     */
    _bindEvents() {
        this.templateBtns.forEach(button => {
            button.addEventListener('click', (e) => {
                this.currentTemplateId = e.target.dataset.templateId;
                this._applyTemplate(this.currentTemplateId);
                this.updatePreview();
            });
        });

        if (this.titleInput) this.titleInput.addEventListener('input', () => this.updatePreview());
        if (this.paragraphInput) this.paragraphInput.addEventListener('input', () => this.updatePreview());
        if (this.imageUrlInput) this.imageUrlInput.addEventListener('input', () => this.updatePreview());
        if (this.ctaTextInput) this.ctaTextInput.addEventListener('input', () => this.updatePreview());
        if (this.ctaLinkInput) this.ctaLinkInput.addEventListener('input', () => this.updatePreview());
        if (this.bgColorInput) this.bgColorInput.addEventListener('input', () => this.updatePreview());
        if (this.textColorInput) this.textColorInput.addEventListener('input', () => this.updatePreview());
        if (this.collectLeadsCheckbox) this.collectLeadsCheckbox.addEventListener('change', () => this.updatePreview());

        if (this.saveBtn) this.saveBtn.addEventListener('click', () => this.savePage());
        if (this.downloadHtmlBtn) this.downloadHtmlBtn.addEventListener('click', () => this.downloadHtml());


        document.addEventListener('DOMContentLoaded', () => this.render());
    }

    /**
     * Applies a template's default values to the input fields.
     * @param {string} templateId The ID of the template to apply.
     * @private
     */
    _applyTemplate(templateId) {
        // Store current values before they are overwritten
        const currentTitle = this.titleInput?.value || '';
        const currentParagraph = this.paragraphInput?.value || '';
        const currentImageUrl = this.imageUrlInput?.value || '';

        const templatesDefaults = {
            template1: {
                title: 'Boost Your Business!',
                paragraph: 'Learn how our innovative solutions can help you reach new customers and grow your revenue. Sign up now for a free consultation!',
                imageUrl: 'https://placehold.co/800x400/eeeeee/333333?text=Your+Amazing+Product',
                ctaText: 'Get Started Today',
                ctaLink: '#signup',
                bgColor: '#e0f2f7',
                textColor: '#0a2a43'
            },
            template2: {
                title: 'Limited Time Offer!',
                paragraph: 'Grab this incredible deal before it\'s gone! High-quality products at unbeatable prices.',
                imageUrl: 'https://placehold.co/800x400/ffe0b2/8d6e63?text=Special+Discount',
                ctaText: 'Claim Your Discount',
                ctaLink: '#discount',
                bgColor: '#fce4ec',
                textColor: '#4a148c'
            },
            template3: {
                title: 'Join Our Community',
                paragraph: 'Become part of a thriving community of professionals. Share ideas, gain insights, and connect with peers.',
                imageUrl: 'https://placehold.co/800x400/c8e6c9/2e7d32?text=Community+Hub',
                ctaText: 'Join Now',
                ctaLink: '#join',
                bgColor: '#e8f5e9',
                textColor: '#1b5e20'
            }
        };

        const defaults = templatesDefaults[templateId];
        if (defaults) {
            if (this.titleInput) this.titleInput.value = defaults.title;
            if (this.paragraphInput) this.paragraphInput.value = defaults.paragraph;
            if (this.imageUrlInput) this.imageUrlInput.value = defaults.imageUrl;
            if (this.ctaTextInput) this.ctaTextInput.value = defaults.ctaText;
            if (this.ctaLinkInput) this.ctaLinkInput.value = defaults.ctaLink;
            if (this.bgColorInput) this.bgColorInput.value = defaults.bgColor;
            if (this.textColorInput) this.textColorInput.value = defaults.textColor;
        }

        // Restore the user's custom values if they exist
        if (currentTitle) this.titleInput.value = currentTitle;
        if (currentParagraph) this.paragraphInput.value = currentParagraph;
        if (currentImageUrl) this.imageUrlInput.value = currentImageUrl;
    }

    /**
     * Updates the landing page preview in real-time.
     */
    updatePreview() {
        if (!this.previewContainer) return;

        const title = this.titleInput?.value || '';
        const paragraph = this.paragraphInput?.value || '';
        let imageUrl = this.imageUrlInput?.value || '';
        const ctaText = this.ctaTextInput?.value || '';
        const ctaLink = this.ctaLinkInput?.value || '#';
        const bgColor = this.bgColorInput?.value || '#e0f2f7';
        const textColor = this.textColorInput?.value || '#0a2a43';
        const includeLeadForm = this.collectLeadsCheckbox?.checked || false;

        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            imageUrl = 'https://placehold.co/800x400/eeeeee/333333?text=Image+Placeholder';
        }

        let htmlContent = this._getTemplateHtml(this.currentTemplateId, includeLeadForm);

        // Replace placeholders with actual values
        htmlContent = htmlContent.replace(/{title}/g, title);
        htmlContent = htmlContent.replace(/{paragraph}/g, paragraph);
        htmlContent = htmlContent.replace(/{imageUrl}/g, imageUrl);
        htmlContent = htmlContent.replace(/{ctaText}/g, ctaText);
        htmlContent = htmlContent.replace(/{ctaLink}/g, ctaLink);
        htmlContent = htmlContent.replace(/{bgColor}/g, bgColor);
        htmlContent = htmlContent.replace(/{textColor}/g, textColor);

        this.previewContainer.innerHTML = htmlContent;
    }

    /**
     * Loads saved landing page data from Local Storage and populates controls.
     */
    loadPage() {
        const activeCampaign = this.campaignService.getActiveCampaign();
        if (activeCampaign && activeCampaign.assets && activeCampaign.assets.landingPage) {
            const savedPage = activeCampaign.assets.landingPage;
            this.currentTemplateId = savedPage.templateId; // Load saved template
            if (this.titleInput) this.titleInput.value = savedPage.title;
            if (this.paragraphInput) this.paragraphInput.value = savedPage.paragraph;
            if (this.imageUrlInput) this.imageUrlInput.value = savedPage.imageUrl;
            if (this.ctaTextInput) this.ctaTextInput.value = savedPage.ctaText;
            if (this.ctaLinkInput) this.ctaLinkInput.value = savedPage.ctaLink;
            if (this.bgColorInput) this.bgColorInput.value = savedPage.bgColor;
            if (this.textColorInput) this.textColorInput.value = savedPage.textColor;
            if (this.collectLeadsCheckbox) this.collectLeadsCheckbox.checked = savedPage.includeLeadForm;
            console.log('Landing page loaded from active campaign.');
        } else {
            console.log('No landing page found in active campaign, starting new.');
            this.currentTemplateId = 'template1'; // Reset to default if nothing saved
            this._applyTemplate('template1'); // Apply default template values
            if (this.collectLeadsCheckbox) this.collectLeadsCheckbox.checked = false; // Default to no form
        }
        this.updatePreview(); // Always update preview after loading/initializing
    }

    /**
     * Saves current landing page data to Local Storage.
     */
    savePage() {
        const activeCampaign = this.campaignService.getActiveCampaign();
        if (!activeCampaign) {
            console.error('No active campaign to save to.');
            return;
        }

        const pageData = {
            templateId: this.currentTemplateId,
            title: this.titleInput?.value || '',
            paragraph: this.paragraphInput?.value || '',
            imageUrl: this.imageUrlInput?.value || '',
            ctaText: this.ctaTextInput?.value || '',
            ctaLink: this.ctaLinkInput?.value || '#',
            bgColor: this.bgColorInput?.value || '#e0f2f7',
            textColor: this.textColorInput?.value || '#0a2a43',
            includeLeadForm: this.collectLeadsCheckbox?.checked || false
        };

        // Update the active campaign object with the new landing page data
        activeCampaign.assets.landingPage = pageData;

        // Save the updated campaign to Local Storage (persists the change)
        this.campaignService.saveCampaign(activeCampaign);

        // Also update the active campaign key to reflect the change
        this.campaignService.setActiveCampaign(activeCampaign);

        console.log('Landing page saved and campaign updated.');
    }

    /**
     * Downloads the current landing page as an HTML file.
     */
    downloadHtml() {
        if (!this.previewContainer) {
            console.error('Preview container not found.');
            return;
        }

        const pageTitle = this.titleInput?.value || 'Landing Page';
        const htmlContent = this.previewContainer.innerHTML;

        // Construct a full HTML document (optional, but good practice for a standalone file)
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <style>
        body { margin: 0; padding: 0; }
        /* Include any common styles or styles needed by your templates */
        /* For example, if you used Tailwind, you'd compile it or include CDN here */
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;

        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pageTitle.replace(/[^a-zA-Z0-9]/g, '_')}.html`; // Sanitize filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up the object URL
        console.log('Landing page HTML downloaded.');
    }


    /**
     * Renders the Landing Page Editor screen.
     */
    render() {
        this.loadPage();
    }
}

export default LandingPageEditor;