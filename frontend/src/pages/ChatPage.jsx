import React, { useState, useEffect } from 'react';
import ChatBar from '../components/ChatBar';
import Sequence from '../components/Sequence';
import './ChatPage.css';

const ChatPage = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Create or retrieve session ID on component mount
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = generateUUID();
      localStorage.setItem('sessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  const handleSendMessage = (content) => {
    // Your message sending logic here
    // This should be updated to match your API and state management
  };
  
  return (
    <div className="chat-page">
      <div className="chat-container">
        {sessionId && <ChatBar 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          loading={isLoading}
          agentState={null}
        />}
      </div>
      <div className="sequence-sidebar">
        {sessionId && <Sequence sessionId={sessionId} />}
      </div>
    </div>
  );
};

// Helper function to generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default ChatPage; 