const express = require('express');
const likeController = require('../controllers/likeController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

const postLikeRouter = express.Router({ mergeParams: true });
postLikeRouter.get('/', likeController.getPostLikes);
postLikeRouter.post('/', isAuthenticated, likeController.addPostLike);
postLikeRouter.delete('/', isAuthenticated, likeController.deletePostLike);

const commentLikeRouter = express.Router({ mergeParams: true });
commentLikeRouter.get('/', likeController.getCommentLikes);
commentLikeRouter.post('/', isAuthenticated, likeController.addCommentLike);
commentLikeRouter.delete('/', isAuthenticated, likeController.deleteCommentLike);

module.exports = {
  postLikeRouter,
  commentLikeRouter
};
