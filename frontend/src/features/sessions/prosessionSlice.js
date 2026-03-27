// frontend/src/features/proSessions/proSessionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = `${import.meta.env.VITE_API_URL}/pro-sessions/`;

const api = axios.create({ baseURL: API_URL })
api.interceptors.request.use((request) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        request.headers.Authorization = `Bearer ${user.token}`
    }
    return request
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error)
    }
)

const initialState = {
    proSessions: [],
    activeProSession: null,
    isGenerating: false,
    isError: false,
    isLoading: false,
    message: ''
}

export const getProSessions = createAsyncThunk('proSessions/getAll', async (_, thunkAPI) => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
})

export const createProSession = createAsyncThunk('proSessions/create', async (sessionData, thunkAPI) => {
    try {
        const response = await api.post('/', sessionData);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
})

export const getProSessionById = createAsyncThunk('proSessions/getOne', async (sessionId, thunkAPI) => {
    try {
        const response = await api.get(`/${sessionId}`);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
})

export const deleteProSession = createAsyncThunk('proSessions/delete', async (sessionId, thunkAPI) => {
    try {
        const response = await api.delete(`/${sessionId}`);
        return response.data.id;
    }
    catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
})

export const submitProAnswer = createAsyncThunk('proSessions/submitAnswer', async ({ sessionId, formData }, thunkAPI) => {
    try {
        const response = await api.post(`/${sessionId}/submit-answer`, formData);
        return response.data;
    }
    catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);
    }
})

export const endProSession = createAsyncThunk('proSessions/endSession', async (sessionId, thunkAPI) => {
    try {
        const response = await api.post(`/${sessionId}/end`);
        return response.data;
    }
    catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
        return thunkAPI.rejectWithValue(message);

    }
})

export const proSessionSlice = createSlice({
    name: 'proSessions',
    initialState,
    reducers: {
        resetProSession: (state) => {
            state.isError = false;
            state.message = '';
            state.isLoading = false;
            state.isGenerating = false;
        },
        socketUpdateProSession: (state, action) => {
            const { sessionId, status, message, session } = action.payload;
            state.message = message;

            if (status === 'QUESTIONS_READY' || status === 'GENERATION_FAILED') {
                state.isGenerating = false;
            }

            if (session && state.activeProSession && state.activeProSession._id === sessionId) {
                state.activeProSession.questions = state.activeProSession.questions.map((currentQ, index) => {
                    const incomingQ = session.questions[index];
                    if (!incomingQ) return currentQ;
                    if (incomingQ.isEvaluated) return incomingQ;
                    if (currentQ.isSubmitted && !incomingQ.isSubmitted) return currentQ;
                    return incomingQ;
                });
                state.activeProSession.overallScore = session.overallScore;
                state.activeProSession.status = session.status;
                state.activeProSession.metrics = session.metrics;
            }
        },
        setActiveProSession: (state, action) => {
            state.activeProSession = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            
            .addCase(getProSessions.pending, (state) => { state.isLoading = true; })
            .addCase(getProSessions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.proSessions = action.payload;
            })
            .addCase(getProSessions.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createProSession.pending, (state) => { state.isLoading = true; state.isGenerating = true; state.activeProSession = null; })
            .addCase(createProSession.fulfilled, (state) => { state.isLoading = false; })
            .addCase(createProSession.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isGenerating = false;
                state.message = action.payload;
            })
            .addCase(getProSessionById.fulfilled, (state, action) => {
                state.activeProSession = action.payload;
            })
            .addCase(deleteProSession.fulfilled, (state, action) => {
                state.isLoading = false;
                state.proSessions = state.proSessions.filter(s => s._id !== action.payload);
            })
         
            .addCase(submitProAnswer.pending, (state) => {
                // Do NOT set global isLoading here, or it freezes the whole app.
                // We handle button loading locally in the component.
            })
            .addCase(submitProAnswer.fulfilled, (state, action) => {
                state.isLoading = false; 

              
                if (action.payload && Array.isArray(action.payload.questions)) {
                    state.activeProSession = action.payload;
                }
                
            })
            .addCase(submitProAnswer.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            })

            .addCase(endProSession.fulfilled, (state, action) => {
                if (action.payload?.session) {
                    state.activeProSession = action.payload.session;
                }
            })
            .addCase(endProSession.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            });
    }
})

export const { resetProSession, socketUpdateProSession, setActiveProSession } = proSessionSlice.actions;
export default proSessionSlice.reducer;