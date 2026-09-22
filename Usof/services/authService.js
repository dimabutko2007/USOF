const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const mailerService = require('../config/mailer');
const { ApiError } = require('../middlewares/errorMiddleware');

class AuthService {
  async register({ login, password, passwordConfirmation, full_name, email }) {
    if (!login || !password || !passwordConfirmation || !email) {
      throw ApiError.badRequest('Missing required fields (login, password, passwordConfirmation, email).');
    }

    if (password !== passwordConfirmation) {
      throw ApiError.badRequest('Password and password confirmation do not match.');
    }

    if (!mailerService.constructor.isValidEmail(email)) {
      throw ApiError.badRequest('Invalid email format.');
    }

    const existingLogin = await userRepository.findByLogin(login);
    if (existingLogin) {
      throw ApiError.conflict('User with this login already exists.');
    }

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      throw ApiError.conflict('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmToken = crypto.randomBytes(32).toString('hex');

    const userId = await userRepository.create({
      login,
      password: hashedPassword,
      full_name: full_name || login,
      email,
      role: 'user',
      is_email_confirmed: 0,
      confirm_token: confirmToken
    });

    await mailerService.sendConfirmationEmail(email, confirmToken);

    return {
      message: 'Registration successful! Please check your email to confirm your account.',
      userId,
      confirmToken
    };
  }

  async confirmEmail(confirmToken) {
    if (!confirmToken) {
      throw ApiError.badRequest('Confirmation token is required.');
    }

    const user = await userRepository.findByConfirmToken(confirmToken);
    if (!user) {
      throw ApiError.badRequest('Invalid or expired confirmation token.');
    }

    await userRepository.confirmEmail(user.id);
    return { message: 'Email address confirmed successfully! You can now log in.' };
  }

  async login(loginOrEmail, password) {
    if (!loginOrEmail || !password) {
      throw ApiError.badRequest('Login/email and password are required.');
    }

    let user = await userRepository.findByLogin(loginOrEmail);
    if (!user) {
      user = await userRepository.findByEmail(loginOrEmail);
    }

    if (!user) {
      throw ApiError.unauthorized('Invalid login credentials.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid login credentials.');
    }

    if (!user.is_email_confirmed) {
      throw ApiError.forbidden('Email address is not confirmed. Please confirm your email before logging in.');
    }

    return {
      id: user.id,
      login: user.login,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      profile_picture: user.profile_picture,
      rating: user.rating
    };
  }

  async requestPasswordReset(email) {
    if (!email) {
      throw ApiError.badRequest('Email address is required.');
    }

    if (!mailerService.constructor.isValidEmail(email)) {
      throw ApiError.badRequest('Invalid email format.');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { message: 'If an account with that email exists, password reset instructions have been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    await userRepository.saveResetToken(user.id, resetToken, expiresAt);
    await mailerService.sendPasswordResetEmail(email, resetToken);

    return {
      message: 'Password reset link sent to your email.',
      resetToken
    };
  }

  async confirmPasswordReset(confirmToken, newPassword, newPasswordConfirmation) {
    if (!confirmToken) {
      throw ApiError.badRequest('Reset token is required.');
    }

    if (!newPassword || !newPasswordConfirmation) {
      throw ApiError.badRequest('New password and confirmation are required.');
    }

    if (newPassword !== newPasswordConfirmation) {
      throw ApiError.badRequest('New password and confirmation do not match.');
    }

    const user = await userRepository.findByResetToken(confirmToken);
    if (!user) {
      throw ApiError.badRequest('Invalid or expired password reset token.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(user.id, hashedPassword);

    return { message: 'Password reset successfully! You can now log in with your new password.' };
  }
}

module.exports = new AuthService();
