import Message from '../models/Message.js';

export const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a group room
    socket.on('join_group', ({ groupId, userId, userName }) => {
      socket.join(groupId);
      console.log(`User ${userName} (${userId}) joined group room: ${groupId}`);
    });

    // Handle sending message
    socket.on('send_message', async ({ groupId, senderId, senderName, text }) => {
      try {
        if (!text || !text.trim()) return;

        const newMessage = await Message.create({
          group: groupId,
          sender: senderId,
          senderName: senderName || 'User',
          text: text.trim()
        });

        // Broadcast to group room
        io.to(groupId).emit('new_message', {
          _id: newMessage._id,
          group: groupId,
          sender: { _id: senderId, name: senderName },
          senderName,
          text: newMessage.text,
          createdAt: newMessage.createdAt
        });
      } catch (error) {
        console.error('Socket send_message error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
