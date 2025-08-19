/**
 * @fileoverview Manages the Marketing Page Editor screen.
 * Allows creating and editing email-friendly HTML pages with content, images, and styles.
 */

class MarketingPageEditor {
    /**
     * @param {LocalStorageService} localStorageService Dependency on LocalStorageService.
     * @param {CampaignService} campaignService Dependency on CampaignService.
     */
    constructor(localStorageService, campaignService) {
        this.localStorageService = localStorageService;
        this.campaignService = campaignService;

        // DOM Elements
        this.templateBtns = document.querySelectorAll('.marketing-template-btn');
        this.titleInput = document.getElementById('marketing-title');
        this.paragraph1Input = document.getElementById('marketing-paragraph1');
        this.imageUrlInput = document.getElementById('marketing-image-url');
        this.bgColorInput = document.getElementById('marketing-bg-color');
        this.textColorInput = document.getElementById('marketing-text-color');
        this.saveBtn = document.getElementById('save-marketing-btn');
        this.previewContainer = document.getElementById('marketing-preview-container');
        this.sendBtn = document.getElementById('send-marketing-btn');

        this.currentTemplateId = 'template1'; // Default template

        this._bindEvents();
        this._applyTemplate(this.currentTemplateId); // Apply default template on load
    }

    /**
     * Defines basic HTML templates for marketing pages.
     * @param {string} templateId The ID of the template to retrieve.
     * @returns {string} The HTML string for the chosen template.
     * @private
     */
    _getTemplateHtml(templateId) {
        const defaultImageUrl = 'https://placehold.co/600x200/cccccc/333333?text=Your+Image';
        switch (templateId) {
            case 'template1':
                return `
                <div style="width: 650px; margin: 0 auto; padding: 20px; box-sizing: border-box; background-color: {bgColor}; color: {textColor}; font-family: sans-serif;">
                    <h1 style="text-align: center; color: {textColor};">{title}</h1>
                    <img src="{imageUrl}" alt="Marketing Image" style="width: 100%; height: auto; display: block; margin-bottom: 20px; border-radius: 8px;">
                    <p style="text-align: center; line-height: 1.5;">{paragraph1}</p>
                    <p style="text-align: center; font-size: 14px; margin-top: 30px;">© 2023 Your Company. All rights reserved.</p>
                </div>
                `;
            case 'template2':
                return `
                <div style="width: 650px; margin: 0 auto; padding: 25px; box-sizing: border-box; background-color: {bgColor}; color: {textColor}; font-family: 'Georgia', serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="padding-bottom: 20px; text-align: center;">
                                <h2 style="font-size: 28px; color: {textColor};">{title}</h2>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-bottom: 20px; text-align: center;">
                                <img src="{imageUrl}" alt="Marketing Image" style="max-width: 100%; height: auto; border-radius: 12px; display: block; margin: 0 auto;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding-bottom: 20px;">
                                <p style="font-size: 16px; line-height: 1.6; text-align: justify;">{paragraph1}</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: center; font-size: 13px; color: #888;">
                                <p>Follow us on Social Media!</p>
                            </td>
                        </tr>
                    </table>
                </div>
                `;
            case 'template3':
                return `
                <div style="width: 650px; margin: 0 auto; padding: 30px; box-sizing: border-box; background-color: {bgColor}; color: {textColor}; font-family: 'Verdana', sans-serif;">
                    <h3 style="text-align: left; color: {textColor}; border-bottom: 2px solid {textColor}; padding-bottom: 10px; margin-bottom: 20px;">{title}</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td width="30%" valign="top" style="padding-right: 20px;">
                                <img src="{imageUrl}" alt="Small Image" style="max-width: 100%; height: auto; border-radius: 4px;">
                            </td>
                            <td width="70%" valign="top">
                                <p style="font-size: 15px; line-height: 1.5; text-align: left;">{paragraph1}</p>
                            </td>
                        </tr>
                    </table>
                    <p style="text-align: right; font-size: 12px; margin-top: 40px;">Confidential &copy; 2023</p>
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
                this._applyTemplate(this.currentTemplateId); // Apply template values to inputs
                this.updatePreview(); // Update preview with new template structure
            });
        });

        if (this.titleInput) this.titleInput.addEventListener('input', () => this.updatePreview());
        if (this.paragraph1Input) this.paragraph1Input.addEventListener('input', () => this.updatePreview());
        if (this.imageUrlInput) this.imageUrlInput.addEventListener('input', () => this.updatePreview());
        if (this.bgColorInput) this.bgColorInput.addEventListener('input', () => this.updatePreview());
        if (this.textColorInput) this.textColorInput.addEventListener('input', () => this.updatePreview());

        if (this.saveBtn) this.saveBtn.addEventListener('click', () => this.savePage());
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendPage());
        }

        // Initial render when page loads
        document.addEventListener('DOMContentLoaded', () => this.render());
    }

    /**
     * Applies a template's default values to the input fields.
     * This makes it easier to start editing from a template.
     * @param {string} templateId The ID of the template to apply.
     * @private
     */
    _applyTemplate(templateId) {
        // These values are just initial suggestions, not forced by template HTML
        const currentTitle = this.titleInput?.value || '';
        const currentParagraph1 = this.paragraph1Input?.value || '';
        const currentImageUrl = this.imageUrlInput?.value || '';

        const templatesDefaults = {
            template1: {
                title: 'Welcome to Our New Campaign!',
                paragraph1: 'Discover amazing new offers and products designed just for you. Click below to learn more!',
                imageUrl: 'https://placehold.co/600x200/cccccc/333333?text=Your+Image',
                bgColor: '#f8f8f8',
                textColor: '#333333'
            },
            template2: {
                title: 'Exclusive Offer Just For You!',
                paragraph1: 'Don\'t miss out on our limited-time discounts. Get ready for savings that will surprise you!',
                imageUrl: 'https://placehold.co/600x300/aaddff/000000?text=Special+Deal',
                bgColor: '#e0f7fa',
                textColor: '#004d40'
            },
            template3: {
                title: 'Quick Update from Our Team',
                paragraph1: 'We\'ve got exciting news coming soon. Stay tuned for more information.',
                imageUrl: 'https://placehold.co/200x150/ffcccb/880000?text=News',
                bgColor: '#fffde7',
                textColor: '#424242'
            }
        };

        const defaults = templatesDefaults[templateId];
        if (defaults) {
            if (this.titleInput) this.titleInput.value = defaults.title;
            if (this.paragraph1Input) this.paragraph1Input.value = defaults.paragraph1;
            if (this.imageUrlInput) this.imageUrlInput.value = defaults.imageUrl;
            if (this.bgColorInput) this.bgColorInput.value = defaults.bgColor;
            if (this.textColorInput) this.textColorInput.value = defaults.textColor;
        }
        // Restore the user's custom values if they exist
        if (currentTitle) this.titleInput.value = currentTitle;
        if (currentParagraph1) this.paragraph1Input.value = currentParagraph1;
        if (currentImageUrl) this.imageUrlInput.value = currentImageUrl;
    }


    /**
     * Updates the marketing page preview in real-time.
     */
    updatePreview() {
        if (!this.previewContainer) return;

        const title = this.titleInput?.value || '';
        const paragraph1 = this.paragraph1Input?.value || '';
        let imageUrl = this.imageUrlInput?.value || '';
        const bgColor = this.bgColorInput?.value || '#f8f8f8';
        const textColor = this.textColorInput?.value || '#333333';

        // Provide a fallback image if URL is empty or invalid
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            imageUrl = 'https://placehold.co/600x200/cccccc/333333?text=Image+Placeholder';
        }

        let htmlContent = this._getTemplateHtml(this.currentTemplateId);

        // Replace placeholders with actual values
        htmlContent = htmlContent.replace(/{title}/g, title);
        htmlContent = htmlContent.replace(/{paragraph1}/g, paragraph1);
        htmlContent = htmlContent.replace(/{imageUrl}/g, imageUrl);
        htmlContent = htmlContent.replace(/{bgColor}/g, bgColor);
        htmlContent = htmlContent.replace(/{textColor}/g, textColor);

        console.log("Marketing Page Preview: Using image URL:", imageUrl);

        this.previewContainer.innerHTML = htmlContent;
    }

    /**
     * Loads saved marketing page data from Local Storage and populates controls.
     */
    loadPage() {
        const activeCampaign = this.campaignService.getActiveCampaign();
        if (activeCampaign && activeCampaign.assets && activeCampaign.assets.marketingPage) {
            const savedPage = activeCampaign.assets.marketingPage;
            this.currentTemplateId = savedPage.templateId; // Load saved template
            if (this.titleInput) this.titleInput.value = savedPage.title;
            if (this.paragraph1Input) this.paragraph1Input.value = savedPage.paragraph1;
            if (this.imageUrlInput) this.imageUrlInput.value = savedPage.imageUrl;
            if (this.bgColorInput) this.bgColorInput.value = savedPage.bgColor;
            if (this.textColorInput) this.textColorInput.value = savedPage.textColor;
            console.log('Marketing page loaded from active campaign.');
        } else {
            console.log('No marketing page found in active campaign, starting new.');
            this.currentTemplateId = 'template1'; // Reset to default if nothing saved
            this._applyTemplate('template1'); // Apply default template values
        }
        this.updatePreview();
    }
    /**
     * Saves current marketing page data to Local Storage.
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
            paragraph1: this.paragraph1Input?.value || '',
            imageUrl: this.imageUrlInput?.value || '',
            bgColor: this.bgColorInput?.value || '#f8f8f8',
            textColor: this.textColorInput?.value || '#333333'
        };

        // Update the active campaign object with the new marketing page data
        activeCampaign.assets.marketingPage = pageData;

        // Save the updated campaign to Local Storage (persists the change)
        this.campaignService.saveCampaign(activeCampaign);

        // Also update the active campaign key to reflect the change
        this.campaignService.setActiveCampaign(activeCampaign);

        console.log('Marketing page saved and campaign updated.');
    }
    /**
     * Simulates sending the current marketing page via email.
     * NOTE: This is a placeholder. Real email sending requires a backend service.
     */
    sendPage() {
        const activeCampaign = this.campaignService.getActiveCampaign();
        if (!activeCampaign || !this.previewContainer) {
            console.error('No active marketing page or preview to send.');
            return;
        }

        const pageData = activeCampaign.assets.marketingPage;
        const htmlContent = this.previewContainer.innerHTML; // Get the live preview HTML content
        const recipientEmail = 'example@recipient.com'; // In a real app, this would be a user input

        console.log(`Sending marketing page from campaign "${activeCampaign.name}" to ${recipientEmail}...`);
        console.log('Using rendered HTML content from the preview.');
        // In a real scenario, you would send this 'htmlContent' via a backend service
        // that handles SMTP, API calls (e.g., SendGrid, Mailgun), etc.

        alert('Marketing page sent for review (simulated)!');
        console.log('Simulated email sent with HTML content.');
    }


    /**
     * Renders the Marketing Page Editor screen.
    */
    render() {
        this.loadPage();
    }
}

export default MarketingPageEditor;


// In a real-world scenario, you would make an API call here:
// fetch('/api/send-email', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//         recipient: recipientEmail,
//         subject: pageData.title,
//         htmlContent: this.previewContainer.innerHTML // Send the rendered HTML
//     })
// }).then(response => {
//     if (response.ok) {
//         alert('Email sent successfully!');
//     } else {
//         alert('Failed to send email.');
//     }
// });

// in Netlify 
// Install Nodemailer: In your project's terminal, run the following command to install the required library.
// npm install nodemailer
// Configure Environment Variables: Go to your Netlify dashboard for this project. Navigate to Site settings > Build & deploy > Environment. Add the following key-value pairs.
// EMAIL_SERVICE: The email service you're using (e.g., 'gmail', 'outlook.com').
// EMAIL_USER: Your email address that will be used to send the emails.
// EMAIL_PASSWORD: The app password for your email account.
// This is not your regular password but a special, secure password.
// You must generate this in your email provider's security settings (e.g., Google's App Passwords).

//     try {
//         this.sendBtn.disabled = true; // Disable button to prevent multiple sends
//         this.sendBtn.textContent = 'Sending...';

//         const response = await fetch('/.netlify/functions/send-email', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 recipient,
//                 subject: pageData.title || 'Ad Campaign Marketing Page',
//                 htmlContent,
//             }),
//         });

//         if (response.ok) {
//             alert('Email sent successfully!');
//         } else {
//             const errorText = await response.text();
//             alert(`Failed to send email: ${errorText}`);
//             console.error('Email send failed:', errorText);
//         }
//     } catch (error) {
//         alert('An unexpected error occurred.');
//         console.error('Error during email send:', error);
//     } finally {
//         this.sendBtn.disabled = false;
//         this.sendBtn.textContent = 'Send to E-mail';
//     }
// }