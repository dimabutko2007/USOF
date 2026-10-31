import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import postsReducer from './postsSlice';
import commentsReducer from './commentsSlice';
import notificationReducer from './notificationSlice';
import favoritesReducer from './favoritesSlice';
import subscriptionsReducer from './subscriptionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    comments: commentsReducer,
    notifications: notificationReducer,
    favorites: favoritesReducer,
    subscriptions: subscriptionsReducer,
  },
});
