import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchConversations, fetchMessages, sendMessage } from './MessageApi';

const initialState = {
  conversations: [],
  conversationsStatus: 'idle',
  conversationsError: null,
  messages: [],
  messagesStatus: 'idle',
  messagesError: null,
  sendStatus: 'idle',
  sendError: null,
};

export const fetchConversationsAsync = createAsyncThunk('messages/fetchConversationsAsync', async () => {
  return await fetchConversations();
});

export const fetchMessagesAsync = createAsyncThunk('messages/fetchMessagesAsync', async (params) => {
  return await fetchMessages(params.userId, params.order, params.service);
});

export const sendMessageAsync = createAsyncThunk('messages/sendMessageAsync', async (data) => {
  return await sendMessage(data);
});

const messageSlice = createSlice({
  name: 'MessageSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversationsAsync.pending, (state) => {
        state.conversationsStatus = 'pending';
      })
      .addCase(fetchConversationsAsync.fulfilled, (state, action) => {
        state.conversationsStatus = 'fulfilled';
        state.conversations = action.payload;
      })
      .addCase(fetchConversationsAsync.rejected, (state, action) => {
        state.conversationsStatus = 'rejected';
        state.conversationsError = action.error;
      })
      .addCase(fetchMessagesAsync.pending, (state) => {
        state.messagesStatus = 'pending';
      })
      .addCase(fetchMessagesAsync.fulfilled, (state, action) => {
        state.messagesStatus = 'fulfilled';
        state.messages = action.payload;
      })
      .addCase(fetchMessagesAsync.rejected, (state, action) => {
        state.messagesStatus = 'rejected';
        state.messagesError = action.error;
      })
      .addCase(sendMessageAsync.pending, (state) => {
        state.sendStatus = 'pending';
      })
      .addCase(sendMessageAsync.fulfilled, (state, action) => {
        state.sendStatus = 'fulfilled';
        state.messages.push(action.payload);
      })
      .addCase(sendMessageAsync.rejected, (state, action) => {
        state.sendStatus = 'rejected';
        state.sendError = action.error;
      });
  },
});

export const selectConversations = (state) => state.MessageSlice.conversations;
export const selectConversationsStatus = (state) => state.MessageSlice.conversationsStatus;
export const selectConversationsError = (state) => state.MessageSlice.conversationsError;
export const selectMessages = (state) => state.MessageSlice.messages;
export const selectMessagesStatus = (state) => state.MessageSlice.messagesStatus;
export const selectMessagesError = (state) => state.MessageSlice.messagesError;
export const selectSendStatus = (state) => state.MessageSlice.sendStatus;
export const selectSendError = (state) => state.MessageSlice.sendError;

export default messageSlice.reducer; 