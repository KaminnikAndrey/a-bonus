import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';

export interface User {
    id: string;
    role: 'student' | 'teacher';
}

interface UserCredentials {
    login: string | null;
    password: string | null;
}

interface AuthState {
    user: User | null;
    creds: UserCredentials | null;
}

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        creds: null,
    } as AuthState,
    reducers: {
        login: (state, action: PayloadAction<{ user: User, creds: UserCredentials }>) => {
            state.creds = action.payload.creds;
            state.user = action.payload.user;
        },
        logout: state => {
            state.creds = null;
            state.user = null;
        }
    },
    selectors: {
        getCurrentUser: state => (state.user),
        getCreds: state => (state.creds)
        
    }
});

const persistConfig = {
    key: 'userInfo',
    storage: AsyncStorage,
    //blackList: ["token"] переписать на использование JWT токена на бэке и в защищенное хранилище складывать
}

export const persistedReducer = persistReducer(persistConfig, authSlice.reducer)

export const userSelector = authSlice.selectors.getCurrentUser

export const {login, logout} = authSlice.actions

export const store = configureStore({
    reducer: {
        auth: persistedReducer,
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
        serializableCheck: false, 
    }),
});

export const persistor = persistStore(store);