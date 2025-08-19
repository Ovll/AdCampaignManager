// This function will handle sending emails
const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Parse the request body
    const { recipient, subject, htmlContent } = JSON.parse(event.body);

    // Validate the input
    if (!recipient || !subject || !htmlContent) {
        return { statusCode: 400, body: 'Missing required fields: recipient, subject, or htmlContent' };
    }

    try {
        // Create a Nodemailer transporter object
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Define the email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipient,
            subject: subject,
            html: htmlContent,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            body: 'Email sent successfully!',
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            statusCode: 500,
            body: 'Failed to send email.',
        };
    }
};