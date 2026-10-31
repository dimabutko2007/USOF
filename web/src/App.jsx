import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
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
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => (
  <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem', maxWidth: '500px', margin: '3rem auto' }}>
    <AlertTriangle size={48} color="var(--color-warning)" style={{ margin: '0 auto 1rem' }} />
    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>404 - Page Not Found</h1>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
      The page or discussion you are looking for does not exist or has been relocated.
    </p>
    <Link to="/" className="btn btn-primary">
      <ArrowLeft size={16} />
      <span>Back to Community Feed</span>
    </Link>
  </div>
);

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
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
