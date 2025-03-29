import React, { useState } from 'react';
import '../styles/HistorySidebar.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SequenceHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  stepCount: number;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
  sequences?: SequenceHistoryItem[];
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  position?: string;
  company_size?: string;
  industry?: string;
}

interface HistorySidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  chatHistory: Message[];
  chatSessions: ChatSession[];
  sequenceHistory: SequenceHistoryItem[];
  onSelectMessage?: (messageId: string) => void;
  onSelectSequence?: (sequenceId: string) => void;
  onNewChat?: () => void;
  darkMode?: boolean;
  user?: User | null;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  toggleSidebar,
  chatHistory,
  chatSessions,
  sequenceHistory,
  onSelectMessage,
  onSelectSequence,
  onNewChat,
  darkMode = true,
  user
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'sequences'>('chats');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Group chat sessions by date
  const groupedChatSessions = chatSessions.reduce((groups: Record<string, ChatSession[]>, session) => {
    const date = new Date(session.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});
  
  // Sort sessions in each group by timestamp (newest first)
  Object.keys(groupedChatSessions).forEach(date => {
    groupedChatSessions[date].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  });
  
  // Find current active chat session
  const activeChatSession = chatSessions.find(session => 
    session.messages.some(msg => chatHistory.some(m => m.id === msg.id))
  );
  
  // Get sequences from the current active chat session
  const activeSessionSequences = activeChatSession?.sequences || [];
  
  // Group active session's sequence history by date
  const groupedSequenceHistory = activeSessionSequences.reduce((groups: Record<string, SequenceHistoryItem[]>, sequence: SequenceHistoryItem) => {
    const date = new Date(sequence.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(sequence);
    return groups;
  }, {});
  
  // Handle search for chat sessions
  const filteredChatSessions = searchTerm
    ? Object.entries(groupedChatSessions).reduce(
        (result: Record<string, ChatSession[]>, [date, sessions]) => {
          const filtered = sessions.filter(
            session => 
              session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              session.messages.some(message => 
                message.content.toLowerCase().includes(searchTerm.toLowerCase())
              )
          );
          if (filtered.length > 0) {
            result[date] = filtered;
          }
          return result;
        },
        {}
      )
    : groupedChatSessions;
  
  const filteredSequenceHistory = Object.entries(groupedSequenceHistory).reduce(
    (result: Record<string, SequenceHistoryItem[]>, [date, sequences]) => {
      const filtered = sequences.filter(
        sequence => sequence.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        result[date] = filtered;
      }
      return result;
    },
    {}
  );
  
  // Format the message content for preview
  const formatMessagePreview = (content: string, maxLength = 60): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };
  
  // Format time from ISO string
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`history-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="history-sidebar-header">
        <div className="history-sidebar-header-spacer"></div>
        <h2>History</h2>
        <button 
          className="new-chat-button"
          onClick={onNewChat}
          aria-label="New Chat"
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
          </svg>
        </button>
      </div>
      
      <div className="history-search-bar">
        <svg viewBox="0 0 24 24" width="18" height="18" className="search-icon">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
        </svg>
        <input 
          type="text" 
          placeholder="Search history..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="history-search-input"
        />
        {searchTerm && (
          <button 
            className="clear-search-button"
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="history-tabs">
        <button 
          className={`history-tab ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" fill="currentColor" />
          </svg>
          Chat History
        </button>
        <button 
          className={`history-tab ${activeTab === 'sequences' ? 'active' : ''}`}
          onClick={() => setActiveTab('sequences')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="currentColor" />
          </svg>
          Sequence History
        </button>
      </div>
      
      <div className="history-content">
        {activeTab === 'chats' ? (
          <>
            <div className="new-chat-card" onClick={onNewChat}>
              <div className="new-chat-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
              </div>
              <div className="new-chat-text">New Chat</div>
            </div>
            
            {Object.keys(filteredChatSessions).length > 0 ? (
              Object.entries(filteredChatSessions)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // Sort dates newest first
                .map(([date, sessions]) => (
                  <div key={date} className="history-date-group">
                    <div className="history-date-header">{date}</div>
                    {sessions.map(session => {
                      // Get the last message for preview
                      const lastMsg = session.messages[session.messages.length - 1];
                      
                      return (
                        <div 
                          key={session.id} 
                          className="history-item conversation"
                          onClick={() => onSelectMessage && onSelectMessage(session.messages[0].id)}
                        >
                          <div className="history-item-avatar">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor" />
                            </svg>
                          </div>
                          <div className="history-item-content">
                            <div className="history-item-header">
                              <span className="history-item-name">
                                {session.title}
                              </span>
                              <span className="history-item-time">
                                {formatTime(session.timestamp)}
                              </span>
                            </div>
                            <div className="history-item-preview">
                              {session.messages.length} messages • {formatMessagePreview(lastMsg.content)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
            ) : (
              <div className="empty-history">
                {searchTerm ? 'No matching chat history found' : 'No chat history yet'}
              </div>
            )}
          </>
        ) : (
          Object.keys(filteredSequenceHistory).length > 0 ? (
            Object.entries(filteredSequenceHistory)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // Sort dates newest first
              .map(([date, sequences]) => (
                <div key={date} className="history-date-group">
                  <div className="history-date-header">{date}</div>
                  {sequences.map(sequence => (
                    <div 
                      key={sequence.id} 
                      className="history-item sequence"
                      onClick={() => onSelectSequence && onSelectSequence(sequence.id)}
                    >
                      <div className="history-item-avatar">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="history-item-content">
                        <div className="history-item-header">
                          <span className="history-item-name">{sequence.title}</span>
                          <span className="history-item-time">{formatTime(sequence.timestamp)}</span>
                        </div>
                        <div className="history-item-preview">
                          {sequence.stepCount} steps
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
          ) : (
            <div className="empty-history">
              {searchTerm ? 'No matching sequence history found' : 'No sequence history yet'}
            </div>
          )
        )}
      </div>
      
      {user && (
        <div className="user-profile-section">
          <div className="user-avatar">
            {user.first_name && user.last_name ? (
              <>
                <svg viewBox="0 0 24 24" width="24" height="24" className="avatar-icon">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                </svg>
                <span className="user-initials">{`${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}</span>
              </>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" className="avatar-icon">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
              </svg>
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{user.first_name} {user.last_name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorySidebar; 