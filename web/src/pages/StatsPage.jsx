import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../api/postsApi';
import { userApi, categoriesApi } from '../api/extraApis';
import Avatar from '../components/common/Avatar';
import {
  BarChart2,
  Users,
  MessageSquare,
  Tag,
  Award,
  TrendingUp,
  Activity,
  CheckCircle,
} from 'lucide-react';

const StatsPage = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalCategories: 0,
    topUsers: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      postsApi.getPosts({ limit: 100 }),
      userApi.getUsers({ limit: 50 }),
      categoriesApi.getCategories(),
    ])
      .then(([postsRes, usersRes, catsRes]) => {
        const postsData = postsRes.status === 'fulfilled' ? postsRes.value : {};
        const usersData = usersRes.status === 'fulfilled' ? usersRes.value : {};
        const catsData = catsRes.status === 'fulfilled' ? catsRes.value : {};

        const posts = postsData.posts || [];
        const users = usersData.users || [];
        const categories = catsData.categories || [];

        // Sort users by rating descending for leaderboard
        const sortedUsers = [...users].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

        setStats({
          totalPosts: postsData.pagination?.total || posts.length,
          totalUsers: users.length,
          totalCategories: categories.length,
          topUsers: sortedUsers,
          recentActivity: posts.slice(0, 5),
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
        }}
      >
        <BarChart2 size={24} color="var(--accent-primary)" />
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Platform Analytics & Statistics</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Real-time activity metrics, contributor leaderboard, and platform engagement.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Computing platform analytics...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Key Metric Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Total Posts */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-light)', color: 'var(--accent-primary)' }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Total Questions</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.totalPosts}</div>
              </div>
            </div>

            {/* Total Users */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                <Users size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Developers</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.totalUsers}</div>
              </div>
            </div>

            {/* Categories */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                <Tag size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Topic Tags</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.totalCategories}</div>
              </div>
            </div>

            {/* Platform Status */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                <Activity size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>System Status</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={16} /> Operational
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Leaderboard & Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Top Contributors Leaderboard */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <Award size={20} color="var(--color-warning)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Top Contributors (By Rating)</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.topUsers.map((u, idx) => (
                  <div
                    key={u.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: idx === 0 ? 'var(--color-warning)' : 'var(--text-muted)',
                          minWidth: '20px',
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <Link
                        to={`/users/${u.id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}
                      >
                        <Avatar src={u.profile_picture} name={u.login} size={28} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.login}</span>
                      </Link>
                      <span className={`badge badge-${u.role}`}>{u.role}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-warning)', fontWeight: 700 }}>
                      <TrendingUp size={14} />
                      <span>{u.rating || 0} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Platform Announcements / High Engagement Posts */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <TrendingUp size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Active Discussions</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.recentActivity.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <a
                      href={`/posts/${post.id}`}
                      style={{
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: 'var(--text-primary)',
                        display: 'block',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {post.title}
                    </a>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <Link
                        to={`/users/${post.author_id}`}
                        style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                      >
                        By {post.author_login}
                      </Link>
                      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                        {post.likes_count || 0} votes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPage;

