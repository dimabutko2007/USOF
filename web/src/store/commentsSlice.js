import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { commentsApi } from '../api/commentsApi';
import { likesApi } from '../api/extraApis';

export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ postId, sort = 'likes_asc', status }, { rejectWithValue }) => {
    try {
      const res = await commentsApi.getCommentsByPost(postId, { sort, status });
      return res.comments;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ postId, content, parent_id }, { rejectWithValue }) => {
    try {
      const res = await commentsApi.createComment(postId, { content, parent_id });
      return res.comment;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleCommentLike = createAsyncThunk(
  'comments/toggleCommentLike',
  async ({ commentId, type }, { rejectWithValue }) => {
    try {
      await likesApi.addCommentLike(commentId, type);
      return { commentId, type };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCommentStatus = createAsyncThunk(
  'comments/updateCommentStatus',
  async ({ commentId, status }, { rejectWithValue }) => {
    try {
      const res = await commentsApi.updateCommentStatus(commentId, status);
      return res.comment;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      await commentsApi.deleteComment(commentId);
      return commentId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    items: [],
    loading: false,
    error: null,
    sortBy: 'likes_asc', // Default: likes ascending per checklist requirement
  },
  reducers: {
    setCommentSort: (state, action) => {
      state.sortBy = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchComments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addComment
      .addCase(addComment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // updateCommentStatus
      .addCase(updateCommentStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      // deleteComment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      });
  },
});

export const { setCommentSort } = commentsSlice.actions;
export default commentsSlice.reducer;

