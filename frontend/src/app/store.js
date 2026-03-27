import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import sessionReducer from '../features/sessions/sessionSlice';
import prosessionReducer from '../features/sessions/prosessionSlice';

const store=configureStore({
    reducer: {
        auth: authReducer,
        sessions: sessionReducer,
        proSessions: prosessionReducer,
    },
    devTools:true,
});

export default store