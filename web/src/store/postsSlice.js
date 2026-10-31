import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postsApi } from '../api/postsApi';
import { likesApi, favoritesApi } from '../api/extraApis';

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async (params, { rejectWithValue }) => {
  try {
    const res = await postsApi.getPosts(params);
    return res;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchPostById = createAsyncThunk('posts/fetchPostById', async (id, { rejectWithValue }) => {
  try {
    const res = await postsApi.getPostById(id);
    return res.post;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchPostSubscription = createAsyncThunk(
  'posts/fetchPostSubscription',
  async (postId, { rejectWithValue }) => {
    try {
      const res = await postsApi.getPostSubscription(postId);
      return res.isSubscribed;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleLikePost = createAsyncThunk(
  'posts/toggleLikePost',
  async ({ postId, type, currentReaction, currentLikesCount }, { rejectWithValue }) => {
    try {
      if (currentReaction === type) {
        await likesApi.removePostLike(postId);
        return { postId, type: null, previousReaction: currentReaction, currentLikesCount };
      } else {
        await likesApi.addPostLike(postId, type);
        return { postId, type, previousReaction: currentReaction, currentLikesCount };
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleFavoritePost = createAsyncThunk(
  'posts/toggleFavoritePost',
  async ({ postId, isFavorite }, { rejectWithValue }) => {
    try {
      if (isFavorite) {
        await favoritesApi.removeFavorite(postId);
        return { postId, isFavorite: false };
      } else {
        await favoritesApi.addFavorite(postId);
        return { postId, isFavorite: true };
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1,
    },
    filters: {
      search: '',
      sort: 'likes',
      categories: [],
      status: '',
      startDate: '',
      endDate: '',
    },
    likesByPostId: {}, // { [postId]: { reaction: 'like' | 'dislike' | null, likes_count: number } }
    currentPost: null,
    loading: false,
    detailLoading: false,
    error: null,
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1;
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        sort: 'likes',
        categories: [],
        status: '',
        startDate: '',
        endDate: '',
      };
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.posts || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPostById.pending, (state) => {
        state.detailLoading = true;
        state.currentPost = null;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPostSubscription.fulfilled, (state, action) => {
        if (state.currentPost) {
          state.currentPost.isSubscribed = action.payload;
        }
      })
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const { postId, type: nextReaction, previousReaction } = action.payload;
        const prevReaction =
          previousReaction !== undefined
            ? previousReaction
            : (action.meta?.arg?.currentReaction || null);

        const prevScore = prevReaction === 'like' ? 1 : prevReaction === 'dislike' ? -1 : 0;
        const nextScore = nextReaction === 'like' ? 1 : nextReaction === 'dislike' ? -1 : 0;
        const diff = nextScore - prevScore;

        let baseCount;
        if (state.likesByPostId[postId] !== undefined) {
          baseCount = state.likesByPostId[postId].likes_count;
        } else {
          const inItems = state.items.find((p) => p.id === postId);
          if (inItems && inItems.likes_count !== undefined) {
            baseCount = parseInt(inItems.likes_count, 10);
          } else if (
            state.currentPost &&
            state.currentPost.id === postId &&
            state.currentPost.likes_count !== undefined
          ) {
            baseCount = parseInt(state.currentPost.likes_count, 10);
          } else if (action.meta?.arg?.currentLikesCount !== undefined) {
            baseCount = parseInt(action.meta.arg.currentLikesCount, 10);
          } else {
            baseCount = 0;
          }
        }

        const newCount = baseCount + diff;
        state.likesByPostId[postId] = {
          reaction: nextReaction,
          likes_count: newCount,
        };

        const targetPost = state.items.find((p) => p.id === postId);
        if (targetPost) {
          targetPost.user_reaction = nextReaction;
          targetPost.user_like = nextReaction;
          targetPost.likes_count = newCount;
        }

        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost.user_reaction = nextReaction;
          state.currentPost.user_like = nextReaction;
          state.currentPost.likes_count = newCount;
        }
      });
  },
});

export const { setFilter, setPage, setLimit, resetFilters } = postsSlice.actions;
export default postsSlice.reducer;
