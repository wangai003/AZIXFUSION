import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper, TextField, Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { fetchConversationsAsync, fetchMessagesAsync, sendMessageAsync, selectConversations, selectConversationsStatus, selectConversationsError, selectMessages, selectMessagesStatus, selectMessagesError, selectSendStatus, selectSendError } from '../messages/MessageSlice';
import { selectUserInfo } from '../user/UserSlice';

export const SellerMessaging = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUserInfo);
  const conversations = useSelector(selectConversations);
  const conversationsStatus = useSelector(selectConversationsStatus);
  const conversationsError = useSelector(selectConversationsError);
  const messages = useSelector(selectMessages);
  const messagesStatus = useSelector(selectMessagesStatus);
  const messagesError = useSelector(selectMessagesError);
  const sendStatus = useSelector(selectSendStatus);
  const sendError = useSelector(selectSendError);

  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchConversationsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (selected) {
      dispatch(fetchMessagesAsync({ userId: selected.buyerId, order: selected.orderId, service: selected.serviceId }));
    }
  }, [dispatch, selected]);

  useEffect(() => {
    if (sendStatus === 'fulfilled') {
      setSnackbar({ open: true, message: 'Message sent!', severity: 'success' });
      setInput('');
    } else if (sendStatus === 'rejected') {
      setSnackbar({ open: true, message: sendError?.message || 'Failed to send', severity: 'error' });
    }
  }, [sendStatus, sendError]);

  const handleSelect = (conv) => {
    setSelected(conv);
  };
  const handleSend = () => {
    if (input.trim() && selected) {
      dispatch(sendMessageAsync({ receiver: selected.buyerId, content: input, order: selected.orderId, service: selected.serviceId }));
    }
  };

  if (conversationsStatus === 'pending') return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (conversationsError) return <Alert severity="error">{conversationsError.message || 'Failed to load conversations'}</Alert>;

  return (
    <Box display="flex" height={400}>
      <Paper sx={{ minWidth: 200, maxWidth: 250, mr: 2, overflowY: 'auto' }}>
        <List>
          {conversations.map((conv) => (
            <ListItem button key={conv._id} selected={selected?._id === conv._id} onClick={() => handleSelect(conv)}>
              <ListItemText primary={conv.buyer} secondary={conv.lastMessage} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
        {selected ? (
          <>
            <Typography variant="h6" mb={2}>Chat with {selected.buyer}</Typography>
            <Box flex={1} overflow="auto" mb={2}>
              {messagesStatus === 'pending' ? <CircularProgress /> :
                messagesError ? <Alert severity="error">{messagesError.message || 'Failed to load messages'}</Alert> :
                  messages.map((msg, i) => (
                    <motion.div key={i} align={msg.sender === user._id ? 'right' : 'left'} initial={{ opacity: 0, x: msg.sender === user._id ? 40 : -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Typography align={msg.sender === user._id ? 'right' : 'left'} color={msg.sender === user._id ? 'primary' : 'textSecondary'}>{msg.content}</Typography>
                    </motion.div>
                  ))}
            </Box>
            <Box display="flex" gap={1}>
              <TextField fullWidth value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." />
              <Button variant="contained" onClick={handleSend} disabled={sendStatus === 'pending'}>{sendStatus === 'pending' ? <CircularProgress size={20} /> : 'Send'}</Button>
            </Box>
          </>
        ) : (
          <Typography variant="body1" color="textSecondary">Select a conversation to start chatting.</Typography>
        )}
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 