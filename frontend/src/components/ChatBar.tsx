import React, { useState, useRef, useEffect } from 'react';
import '../styles/ChatBar.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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

interface ChatBarProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  loading: boolean;
  agentState: string | null;
  darkMode?: boolean;
  user?: User | null;
}

const ChatBar: React.FC<ChatBarProps> = ({
  messages,
  onSendMessage,
  loading,
  agentState,
  darkMode,
  user
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !loading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Function to render messages with proper formatting
  const renderMessageContent = (content: string) => {
    // Check if the message is an error message
    if (content.startsWith('Error:') || content.startsWith('Sorry,')) {
      return <div className="error-message">{content}</div>;
    }

    // Regular expression to find code blocks: ```code```
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Process all code blocks
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
      }
      
      // Add code block
      parts.push(
        <pre key={`code-${match.index}`} className="code-block">
          <code>{match[1]}</code>
        </pre>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
    }
    
    return parts.length > 0 ? parts : content;
  };

  return (
    <div className="chat-bar">
      <div className="chat-header">
        <h2>Chat</h2>
      </div>
      
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`chat-message ${message.role}`}>
            <div className="message-content">
              {renderMessageContent(message.content)}
            </div>
            <div className="message-timestamp">
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="loading-indicator">
            AI is thinking...
          </div>
        )}
        {agentState && (
          <div className="agent-state-indicator">
            {agentState}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={!inputValue.trim() || loading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBar; 