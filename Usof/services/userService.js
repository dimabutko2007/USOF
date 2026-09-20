const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const mailerService = require('../config/mailer');
const { ApiError } = require('../middlewares/errorMiddleware');

class UserService {
  /**
   * Get all users list
   */
  async getAllUsers() {
    return await userRepository.findAll();
  }

  /**
   * Get user profile by ID
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }
    return user;
  }

  /**
   * Admin-only user creation
   */
  async createUserByAdmin({ login, password, full_name, email, role = 'user' }) {
    if (!login || !password || !email) {
      throw ApiError.badRequest('Login, password, and email are required.');
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
    const userId = await userRepository.create({
      login,
      password: hashedPassword,
      full_name: full_name || login,
      email,
      role: role === 'admin' ? 'admin' : 'user',
      is_email_confirmed: 1 // Admin created users are pre-confirmed
    });

    return await userRepository.findById(userId);
  }

  /**
   * Upload / update user avatar
   */
  async updateAvatar(userId, file) {
    if (!file) {
      throw ApiError.badRequest('No image file uploaded.');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const avatarFilename = file.filename;
    await userRepository.updateAvatar(userId, avatarFilename);

    return {
      message: 'Avatar uploaded successfully.',
      profile_picture: avatarFilename
    };
  }

  /**
   * Update profile details (Users can update own profile, Admins can update any profile)
   */
  async updateUserProfile(userId, { login, full_name, email, role }, currentSessionUser) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    // Permission check: only admin or the user themselves
    if (currentSessionUser.role !== 'admin' && currentSessionUser.id !== parseInt(userId, 10)) {
      throw ApiError.forbidden('You are not authorized to update this profile.');
    }

    // Role modification is restricted to Admins only
    let updatedRole = user.role;
    if (role && currentSessionUser.role === 'admin') {
      updatedRole = role === 'admin' ? 'admin' : 'user';
    }

    if (login && login !== user.login) {
      const existing = await userRepository.findByLogin(login);
      if (existing) throw ApiError.conflict('Login is already taken.');
    }

    if (email && email !== user.email) {
      if (!mailerService.constructor.isValidEmail(email)) throw ApiError.badRequest('Invalid email format.');
      const existing = await userRepository.findByEmail(email);
      if (existing) throw ApiError.conflict('Email is already taken.');
    }

    await userRepository.update(userId, {
      login,
      full_name,
      email,
      role: updatedRole
    });

    return await userRepository.findById(userId);
  }

  /**
   * Delete user profile (Admin or self)
   */
  async deleteUser(userId, currentSessionUser) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    if (currentSessionUser.role !== 'admin' && currentSessionUser.id !== parseInt(userId, 10)) {
      throw ApiError.forbidden('You are not authorized to delete this user.');
    }

    await userRepository.delete(userId);
    return { message: 'User deleted successfully.' };
  }
}

module.exports = new UserService();
