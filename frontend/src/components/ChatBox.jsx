import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { socket } from '../services/socket';
import API from '../services/api';
import { Send, MessageSquare } from 'lucide-react';

export const ChatBox = ({ groupId }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch initial message history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get(`/groups/${groupId}/messages`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };

    if (groupId) {
      fetchHistory();
    }
  }, [groupId]);

  // Setup socket connection & room join
  useEffect(() => {
    if (!groupId || !user) return;

    socket.connect();
    socket.emit('join_group', {
      groupId,
      userId: user._id,
      userName: user.name
    });

    const handleNewMessage = (msg) => {
      if (msg.group === groupId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.disconnect();
    };
  }, [groupId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    socket.emit('send_message', {
      groupId,
      senderId: user._id,
      senderName: user.name,
      text: inputText.trim()
    });

    setInputText('');
  };

  return (
    <div className="chat-container">
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
        <MessageSquare size={18} style={{ color: 'var(--blinkit-yellow)' }} /> Group Chat & Location Discussion
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto', fontSize: '0.85rem' }}>
            No messages yet. Start chatting to decide where to meet and who pays!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.sender?._id === user._id || msg.sender === user._id;
            return (
              <div key={msg._id || index} className={`chat-bubble ${isMine ? 'mine' : 'other'}`}>
                <div className="chat-sender">{isMine ? 'You' : msg.senderName || msg.sender?.name}</div>
                <div>{msg.text}</div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-bar">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message to group..."
          style={{ flex: 1, background: '#1e293b', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', padding: '0.6rem 0.85rem', outline: 'none' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1rem' }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
