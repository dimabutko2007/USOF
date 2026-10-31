import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFavorites } from './store/favoritesSlice';
import { fetchSubscriptions } from './store/subscriptionsSlice';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import PostDetailsPage from './pages/PostDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PasswordResetPage from './pages/PasswordResetPage';
import ProfilePage from './pages/ProfilePage';
import CategoriesPage from './pages/CategoriesPage';
import FavoritesPage from './pages/FavoritesPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import StatsPage from './pages/StatsPage';
import GuidelinesPage from './pages/GuidelinesPage';
import PrivacyPage from './pages/PrivacyPage';
import StatusPage from './pages/StatusPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFavorites());
      dispatch(fetchSubscriptions({ page: 1, limit: 100 }));
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="posts/:id" element={<PostDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="password-reset" element={<PasswordResetPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="users/:id" element={<ProfilePage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="guidelines" element={<GuidelinesPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="status" element={<StatusPage />} />
        <Route path="health" element={<StatusPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
