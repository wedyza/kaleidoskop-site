import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import { logout, validateChangeEmail } from '../auth/authSlice';

interface User {
  id?: number;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  phone_number?: string;
  email: string;
  sex: 'MALE' | 'FEMALE' | undefined;
  avatar?: string;
  is_superuser: boolean;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  loaded: false,
};

export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async (_, { rejectWithValue }: any) => {
    try {
      const res = await api.get('/users/me/');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка получения пользователя');
    }
  }
);

export const updateUserInfo = createAsyncThunk(
  'user/updateUserInfo',
  async (
    userData: {
      first_name?: string;
      last_name?: string;
      middle_name?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch('/users/me/', userData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка при обновлении данных');
    }
  }
);

// export const updateUserAvatar = createAsyncThunk(
//   'user/updateUserAvatar',
//   async (avatarFile: File, { rejectWithValue, getState }: any) => {
//     const token = getState().auth.token;
//     const formData = new FormData();
//     formData.append('avatar', avatarFile);

//     try {
//       const res = await api.patch('/users/me/', formData, {
//         headers: {
//           Authorization: `Token ${token}`,
//         },
//       });
//       return res.data;
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || 'Ошибка при обновлении аватара');
//     }
//   }
// );

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      Object.assign(state, initialState);
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.loaded = true;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.loaded = true;
      })
      .addCase(updateUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        state.loading = false;
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // .addCase(updateUserAvatar.fulfilled, (state, action) => {
      //   if (state.user) {
      //     state.user.avatar = action.payload;
      //   }
      //   state.loading = false;
      // })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(validateChangeEmail.fulfilled, (state, action) => {
        if (state.user) {
          state.user.email = action.meta.arg.email;
        }
      });
  },
});

export const { clearUser, updateUser } = userSlice.actions;
export default userSlice.reducer;