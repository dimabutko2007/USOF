const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const mailerService = require('../config/mailer');
const { ApiError } = require('../middlewares/errorMiddleware');

class UserService {
  async getAllUsers(currentUser = null) {
    const users = await userRepository.findAll();
    const isAdmin = currentUser && currentUser.role === 'admin';
    if (!isAdmin) {
      return users.map(u => {
        const { email, ...rest } = u;
        return rest;
      });
    }
    return users;
  }

  async getUserById(userId, currentUser = null) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const isOwner = currentUser && currentUser.id === user.id;
    const isAdmin = currentUser && currentUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      delete user.email;
    }

    return user;
  }

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
      is_email_confirmed: 1
    });

    return await userRepository.findById(userId);
  }

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

  async updateUserProfile(userId, { login, full_name, email, role }, currentSessionUser) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    if (currentSessionUser.role !== 'admin' && currentSessionUser.id !== parseInt(userId, 10)) {
      throw ApiError.forbidden('You are not authorized to update this profile.');
    }
    let updatedRole = user.role;
    if (role && currentSessionUser.role === 'admin') {
      updatedRole = role === 'admin' ? 'admin' : 'user';
    }

    if (login && login !== user.login) {
      const existing = await userRepository.findByLogin(login);
      if (existing) throw ApiError.conflict('Login is already taken.');
    }

    if (email !== undefined && email !== user.email) {
      if (currentSessionUser.role === 'admin' && currentSessionUser.id !== parseInt(userId, 10)) {
        throw ApiError.forbidden('Admins cannot change other users’ email addresses.');
      }
      if (!mailerService.constructor.isValidEmail(email)) throw ApiError.badRequest('Invalid email format.');
      const existing = await userRepository.findByEmail(email);
      if (existing) throw ApiError.conflict('Email is already taken.');
    }

    const finalEmail = (currentSessionUser.id === parseInt(userId, 10)) ? email : undefined;

    await userRepository.update(userId, {
      login,
      full_name,
      email: finalEmail,
      role: updatedRole
    });

    return await userRepository.findById(userId);
  }

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
