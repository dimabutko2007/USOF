import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favoritesApi } from '../api/extraApis';
import { toggleLikePost } from './postsSlice';

// Fetch user's favorites and store only the set of post IDs
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const res = await favoritesApi.getFavorites();
      return res.favorites || [];
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addFavorite = createAsyncThunk(
  'favorites/addFavorite',
  async (postId, { rejectWithValue }) => {
    try {
      await favoritesApi.addFavorite(postId);
      return postId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeFavorite = createAsyncThunk(
  'favorites/removeFavorite',
  async (postId, { rejectWithValue }) => {
    try {
      await favoritesApi.removeFavorite(postId);
      return postId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    // Set of favorited post IDs for quick lookup
    favoriteIds: [],
    // Full favorite post objects (for FavoritesPage)
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFavorites: (state) => {
      state.favoriteIds = [];
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.favoriteIds = action.payload.map((p) => p.id);
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        const postId = action.payload;
        if (!state.favoriteIds.includes(postId)) {
          state.favoriteIds.push(postId);
        }
      })
      .addCase(addFavorite.rejected, (state, action) => {
        // Optimistic update was already done in component, revert will happen on re-fetch
        state.error = action.payload;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        const postId = action.payload;
        state.favoriteIds = state.favoriteIds.filter((id) => id !== postId);
        state.items = state.items.filter((p) => p.id !== postId);
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.error = action.payload;
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

        const post = state.items.find((p) => p.id === postId);
        if (post) {
          post.user_reaction = nextReaction;
          post.user_like = nextReaction;
          post.likes_count = parseInt(post.likes_count || 0, 10) + diff;
        }
      });
  },
});

export const { clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;

