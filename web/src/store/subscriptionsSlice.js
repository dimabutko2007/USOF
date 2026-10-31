import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionsApi } from '../api/subscriptionsApi';
import { toggleLikePost } from './postsSlice';

export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchSubscriptions',
  async (params, { rejectWithValue }) => {
    try {
      const res = await subscriptionsApi.getSubscriptions(params);
      return res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const subscribePost = createAsyncThunk(
  'subscriptions/subscribePost',
  async (postId, { rejectWithValue }) => {
    try {
      await subscriptionsApi.subscribe(postId);
      return postId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const unsubscribePost = createAsyncThunk(
  'subscriptions/unsubscribePost',
  async (postId, { rejectWithValue }) => {
    try {
      await subscriptionsApi.unsubscribe(postId);
      return postId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState: {
    items: [],
    subscribedPostIds: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 1 },
    loading: false,
    error: null,
  },
  reducers: {
    setSubscriptions: (state, action) => {
      state.items = action.payload.subscriptions || [];
      state.subscribedPostIds = state.items.map((post) => post.id);
      state.pagination = action.payload.pagination || state.pagination;
    },
    addSubscription: (state, action) => {
      const post = action.payload;
      if (!state.subscribedPostIds.includes(post.id)) {
        state.subscribedPostIds.push(post.id);
        state.items.unshift(post);
      }
    },
    removeSubscription: (state, action) => {
      const postId = action.payload;
      state.subscribedPostIds = state.subscribedPostIds.filter((id) => id !== postId);
      state.items = state.items.filter((s) => s.id !== postId);
    },
    clearSubscriptions: (state) => {
      state.items = [];
      state.subscribedPostIds = [];
      state.pagination = { page: 1, limit: 20, total: 0, pages: 1 };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        const subList = action.payload.data || action.payload.subscriptions || [];
        state.items = Array.isArray(subList) ? subList : [];

        const fetchedIds = state.items.map((post) => post.id);
        state.subscribedPostIds = Array.from(new Set([...state.subscribedPostIds, ...fetchedIds]));
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(subscribePost.fulfilled, (state, action) => {
        const postId = action.payload;
        if (!state.subscribedPostIds.includes(postId)) {
          state.subscribedPostIds.push(postId);
        }
      })
      .addCase(unsubscribePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.subscribedPostIds = state.subscribedPostIds.filter((id) => id !== postId);
        state.items = state.items.filter((s) => s.id !== postId);
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

export const { setSubscriptions, addSubscription, removeSubscription, clearSubscriptions } =
  subscriptionsSlice.actions;

export default subscriptionsSlice.reducer;
