import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '../../store/authSlice';
import { fetchNotifications } from '../../store/notificationSlice';
import { fetchFavorites, clearFavorites } from '../../store/favoritesSlice';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import CreatePostModal from '../posts/CreatePostModal';

const MainLayout = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
      dispatch(fetchFavorites());
    } else {
      dispatch(clearFavorites());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <Sidebar onOpenCreateModal={() => setIsCreateOpen(true)} />
        <main className="page-wrapper">
          <Outlet context={{ openCreatePost: () => setIsCreateOpen(true) }} />
        </main>
      </div>
      <Footer />

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};

export default MainLayout;

