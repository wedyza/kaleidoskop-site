import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axiosInstance';
import { logout } from '../auth/authSlice';

interface UserState {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  sex: 'MALE' | 'FEMALE' | undefined;
  avatar?: string;
  loading: boolean;
  error: string | null;
  loaded: boolean;
  is_superuser: boolean;
}

const initialState: UserState = {
  firstName: '',
  lastName: '',
  email: '',
  sex: undefined,
  loading: false,
  error: null,
  loaded: false,
  is_superuser: false,
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

// export const updateUserInfo = createAsyncThunk(
//   'user/updateUserInfo',
//   async (
//     updatedData: {
//       first_name: string;
//       last_name: string;
//       email: string;
//       gender: 'MALE' | 'FEMALE';
//     },
//     { rejectWithValue, getState }: any
//   ) => {
//     const token = getState().auth.token;
//     try {
//       const res = await api.patch('/users/me/', updatedData, {
//         headers: {
//           Authorization: `Token ${token}`,
//         },
//       });
//       return res.data;
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || 'Ошибка при обновлении данных');
//     }
//   }
// );

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
//       return res.data.avatar;
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        const { first_name, last_name, email, sex, avatar } = action.payload;
        state.firstName = first_name;
        state.lastName = last_name;
        state.email = email;
        state.sex = sex;
        state.avatar = avatar;
        state.loading = false;
        state.loaded = true;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.loaded = true;
      })
      // .addCase(updateUserInfo.fulfilled, (state, action) => {
      //   const { first_name, last_name, email, sex, user_type } = action.payload;
      //   state.firstName = first_name;
      //   state.lastName = last_name;
      //   state.email = email;
      //   state.user_type = user_type;
      //   state.gender = sex;
      //   state.loading = false;
      // })
      // .addCase(updateUserInfo.pending, (state) => {
      //   state.loading = true;
      // })
      // .addCase(updateUserInfo.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload as string;
      // })
      // .addCase(updateUserAvatar.fulfilled, (state, action) => {
      //   state.avatar = action.payload;
      //   state.loading = false;
      // })
      .addCase(logout, (state) => {
        state.firstName = '';
        state.lastName = '';
        state.email = '';
        state.sex = undefined;
        state.is_superuser = false;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;