const categoryService = require('../services/categoryService');

class CategoryController {
  async getAllCategories(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json({ status: 'success', categories });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const { category_id } = req.params;
      const category = await categoryService.getCategoryById(category_id);
      res.status(200).json({ status: 'success', category });
    } catch (error) {
      next(error);
    }
  }

  async getPostsByCategory(req, res, next) {
    try {
      const { category_id } = req.params;
      const currentUser = req.session ? req.session.user : null;
      const posts = await categoryService.getPostsByCategory(category_id, currentUser);
      res.status(200).json({ status: 'success', posts });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const { title, description } = req.body;
      const newCategory = await categoryService.createCategory({ title, description });
      res.status(201).json({ status: 'success', category: newCategory });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const { category_id } = req.params;
      const { title, description } = req.body;
      const updatedCategory = await categoryService.updateCategory(category_id, { title, description });
      res.status(200).json({ status: 'success', category: updatedCategory });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const { category_id } = req.params;
      const result = await categoryService.deleteCategory(category_id);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
