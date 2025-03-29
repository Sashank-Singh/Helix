import React, { useState, useEffect } from 'react';
import '../styles/Sidebar.css';

interface ChatHistory {
  id: string;
  title: string;
  createdAt: string;
}

interface SequenceHistory {
  id: string;
  title: string;
  createdAt: string;
}

interface SidebarProps {
  onChatSelect: (chatId: string) => void;
  onSequenceSelect: (sequenceId: string) => void;
  onNewChat: () => void;
  userId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onChatSelect, 
  onSequenceSelect, 
  onNewChat,
  userId 
}) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [sequenceHistory, setSequenceHistory] = useState<SequenceHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'chats' | 'sequences'>('chats');
  
  useEffect(() => {
    // Fetch chat history
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/chats`);
        if (response.ok) {
          const data = await response.json();
          setChatHistory(data);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };
    
    // Fetch sequence history
    const fetchSequenceHistory = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/sequences`);
        if (response.ok) {
          const data = await response.json();
          setSequenceHistory(data);
        }
      } catch (error) {
        console.error('Error fetching sequence history:', error);
      }
    };
    
    if (userId) {
      fetchChatHistory();
      fetchSequenceHistory();
    }
  }, [userId]);
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="new-chat-button" onClick={onNewChat}>
          <span>+</span> New Chat
        </button>
      </div>
      
      <div className="sidebar-tabs">
        <button 
          className={`tab ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          Chats
        </button>
        <button 
          className={`tab ${activeTab === 'sequences' ? 'active' : ''}`}
          onClick={() => setActiveTab('sequences')}
        >
          Sequences
        </button>
      </div>
      
      <div className="sidebar-content">
        {activeTab === 'chats' ? (
          <div className="history-list">
            {chatHistory.length === 0 ? (
              <div className="empty-history">No chat history</div>
            ) : (
              chatHistory.map(chat => (
                <div 
                  key={chat.id} 
                  className="history-item"
                  onClick={() => onChatSelect(chat.id)}
                >
                  <span className="history-title">{chat.title}</span>
                  <span className="history-date">
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="history-list">
            {sequenceHistory.length === 0 ? (
              <div className="empty-history">No sequence history</div>
            ) : (
              sequenceHistory.map(sequence => (
                <div 
                  key={sequence.id} 
                  className="history-item"
                  onClick={() => onSequenceSelect(sequence.id)}
                >
                  <span className="history-title">{sequence.title}</span>
                  <span className="history-date">
                    {new Date(sequence.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
