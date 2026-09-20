const nodemailer = require('nodemailer');
require('dotenv').config();

class MailerService {
  constructor() {
    // Simulated Nodemailer transport (json/log transport or ethereal)
    this.transporter = nodemailer.createTransport({
      jsonTransport: true
    });
  }

  /**
   * Validate email format with basic legitimacy regex
   * @param {string} email
   * @returns {boolean}
   */
  static isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Send simulated confirmation email
   * @param {string} to
   * @param {string} confirmToken
   */
  async sendConfirmationEmail(to, confirmToken) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const confirmLink = `${appUrl}/api/auth/confirm-email/${confirmToken}`;

    const mailOptions = {
      from: '"USOF Admin" <no-reply@usof.local>',
      to: to,
      subject: 'USOF - Confirm Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to USOF!</h2>
          <p>Please confirm your email address by clicking the link below:</p>
          <a href="${confirmLink}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirm Email</a>
          <p>Or open this URL in your browser: <br><code>${confirmLink}</code></p>
        </div>
      `
    };

    console.log(`\n================ SIMULATED EMAIL SENT ================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Confirmation Link: ${confirmLink}`);
    console.log(`======================================================\n`);

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send simulated password reset email
   * @param {string} to
   * @param {string} resetToken
   */
  async sendPasswordResetEmail(to, resetToken) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/api/auth/password-reset/${resetToken}`;

    const mailOptions = {
      from: '"USOF Support" <support@usof.local>',
      to: to,
      subject: 'USOF - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          <p>Or open this URL in your browser: <br><code>${resetLink}</code></p>
        </div>
      `
    };

    console.log(`\n================ SIMULATED RESET EMAIL SENT ================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log(`===========================================================\n`);

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new MailerService();
