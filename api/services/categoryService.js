const categoryRepository = require('../repositories/categoryRepository');
const { ApiError } = require('../middlewares/errorMiddleware');

class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found.');
    }
    return category;
  }

  async getPostsByCategory(categoryId, currentUser) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw ApiError.notFound('Category not found.');
    }
    return await categoryRepository.findPostsByCategoryId(categoryId, currentUser);
  }

  async createCategory({ title, description }) {
    if (!title) {
      throw ApiError.badRequest('Category title is required.');
    }

    const existing = await categoryRepository.findByTitle(title);
    if (existing) {
      throw ApiError.conflict('Category with this title already exists.');
    }

    const id = await categoryRepository.create({ title, description });
    return await categoryRepository.findById(id);
  }

  async updateCategory(id, { title, description }) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found.');
    }

    if (title && title !== category.title) {
      const existing = await categoryRepository.findByTitle(title);
      if (existing) {
        throw ApiError.conflict('Category with this title already exists.');
      }
    }

    await categoryRepository.update(id, { title, description });
    return await categoryRepository.findById(id);
  }

  async deleteCategory(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found.');
    }

    const titleNorm = category.title.trim().toLowerCase();
    if (titleNorm === 'general discussion' || titleNorm === 'general discussions') {
      throw ApiError.badRequest('The General Discussion category cannot be deleted.');
    }

    // Find or create General Discussions category as fallback
    let generalCat = await categoryRepository.findByTitle('General Discussions');
    if (!generalCat) {
      generalCat = await categoryRepository.findByTitle('General Discussion');
    }
    if (!generalCat) {
      const newId = await categoryRepository.create({
        title: 'General Discussions',
        description: 'General tech questions, career advice, and project reviews.'
      });
      generalCat = await categoryRepository.findById(newId);
    }

    // Reassign all posts from this category to General Discussions (if not already assigned) and delete
    await categoryRepository.reassignPostsToGeneralAndDelete(id, generalCat.id);
    return { message: 'Category deleted successfully.' };
  }
}

module.exports = new CategoryService();
