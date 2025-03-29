import React, { useState, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChatBar from './components/ChatBar';
import RecruitingWorkspace from './components/RecruitingWorkspace';
import LandingPage from './components/LandingPage';
import HistorySidebar from './components/HistorySidebar';
import { ToastProvider } from './components/ToastContainer';
import Auth from './components/Auth';
import Settings from './components/Settings';
import './styles/App.css';
import './styles/ChatBar.css';
import './styles/RecruitingWorkspace.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

// User interface
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  position?: string;
  company_size?: string;
  industry?: string;
  company_description?: string;
  target_roles?: string;
  recruiting_goals?: string;
  outreach_preferences?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SequenceStep {
  id: string;
  title: string;
  description: string;
}

interface Sequence {
  title: string;
  description: string;
  steps: SequenceStep[];
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
  sequences: SequenceHistoryItem[];
}

const App: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Show landing page by default
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);
  
  // Dark mode detection
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  // Sequence history state
  const [sequenceHistory, setSequenceHistory] = useState<SequenceHistoryItem[]>([]);
  
  // Chat sessions state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  
  // Initial welcome message
  const initialMessage = {
    id: 'welcome',
    role: 'assistant' as const,
    content: `Hello${user ? ` ${user.first_name}` : ''}! I am Helix, your AI recruiting assistant. How can I help you today?`,
    timestamp: new Date().toISOString()
  };
  
  // Load messages from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = localStorage.getItem('chatHistory');
      return savedMessages ? JSON.parse(savedMessages) : [initialMessage];
    } catch (error) {
      console.error('Error loading chat history from localStorage:', error);
      return [initialMessage];
    }
  });
  
  // Load chat sessions from localStorage
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem('chatSessions');
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        setChatSessions(parsedSessions);
        
        // If we have sessions and no active session, set the most recent one as active
        if (parsedSessions.length > 0 && !activeChatSessionId) {
          // Sort by timestamp (newest first) and get the first one
          const sortedSessions = [...parsedSessions].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setActiveChatSessionId(sortedSessions[0].id);
          setMessages(sortedSessions[0].messages);
        }
      }
    } catch (error) {
      console.error('Error loading chat sessions from localStorage:', error);
    }
  }, [activeChatSessionId]);
  
  // Update active chat session when it changes
  useEffect(() => {
    if (activeChatSessionId && messages.length > 0) {
      setChatSessions(prevSessions => {
        // Find if this session already exists
        const sessionExists = prevSessions.some(session => session.id === activeChatSessionId);
        
        if (sessionExists) {
          // Update existing session
          return prevSessions.map(session => 
            session.id === activeChatSessionId 
              ? { ...session, messages, timestamp: new Date().toISOString() }
              : session
          );
        } else {
          // Create a new session
          // Get title from first user message or use default
          const firstUserMsg = messages.find(m => m.role === 'user');
          const title = firstUserMsg 
            ? firstUserMsg.content.substring(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
            : 'New Chat';
            
          const newSession: ChatSession = {
            id: activeChatSessionId,
            title,
            timestamp: new Date().toISOString(),
            messages,
            sequences: []
          };
          return [...prevSessions, newSession];
        }
      });
    }
  }, [activeChatSessionId, messages]);
  
  // Save chat sessions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    } catch (error) {
      console.error('Error saving chat sessions to localStorage:', error);
    }
  }, [chatSessions]);
  
  // Check for authenticated user on load
  useEffect(() => {
    const token = localStorage.getItem('helix_token');
    const userData = localStorage.getItem('helix_user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('helix_token');
        localStorage.removeItem('helix_user');
      }
    }
  }, []);
  
  // Check for dark mode preference
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDarkMode);
    
    // Listen for changes in color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    // Update body class
    document.body.classList.toggle('dark-mode', prefersDarkMode);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // -------------------------------
  // NEW: Socket.IO integration for live sequence updates
  // -------------------------------
  useEffect(() => {
    const socket = io(API_BASE_URL);
    socket.on("sequenceUpdate", (updatedSequence: Sequence) => {
      console.log("Received sequence update from server:", updatedSequence);
      setSequence(updatedSequence);
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  // -------------------------------
  
  // Handle successful authentication
  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowLandingPage(false);
  };
  
  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('helix_token');
    localStorage.removeItem('helix_user');
    setUser(null);
    setIsAuthenticated(false);
    setShowLandingPage(true);
  };
  
  // Handle user profile update
  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('helix_user', JSON.stringify(updatedUser));
  };
  
  // Toggle settings view
  const toggleSettings = () => {
    setShowSettings(prev => !prev);
  };
  
  // Update welcome message when user changes
  useEffect(() => {
    setMessages(prev => {
      // Find and update welcome message if it exists
      const welcomeMsg = prev.find(m => m.id.startsWith('welcome'));
      if (welcomeMsg) {
        return prev.map(m => 
          m.id.startsWith('welcome') 
            ? {
                ...m, 
                content: `Hello${user ? ` ${user.first_name}` : ''}! I am Helix, your AI recruiting assistant. How can I help you today?`
              }
            : m
        );
      }
      return prev;
    });
  }, [user]);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history to localStorage:', error);
    }
  }, [messages]);
  
  // Load sequence history from localStorage
  useEffect(() => {
    try {
      const savedSequences = localStorage.getItem('sequenceHistory');
      if (savedSequences) {
        setSequenceHistory(JSON.parse(savedSequences));
      }
    } catch (error) {
      console.error('Error loading sequence history from localStorage:', error);
    }
  }, []);
  
  // Save sequence history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sequenceHistory', JSON.stringify(sequenceHistory));
    } catch (error) {
      console.error('Error saving sequence history to localStorage:', error);
    }
  }, [sequenceHistory]);
  
  // Toggle dark mode manually if needed
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev;
      document.body.classList.toggle('dark-mode', newValue);
      return newValue;
    });
  }, []);
  
  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Show loading indicator when researching
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sequence, setSequence] = useState<Sequence | null>(null);
  // isResearching state is used to show a "Researching..." message in ChatBar
  // and can be set to true when the assistant is gathering information
  const [isResearching, setIsResearching] = useState<boolean>(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setShowLandingPage(false);
    } else {
      // Redirect to auth page
      setShowLandingPage(false);
    }
  };

  // Handler to send a message and process AI responses.
  const handleSendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, userMessage]);

      // Determine if this message requests sequence modification.
      const lowerContent = content.toLowerCase();
      const isSequenceModification = lowerContent.includes('add to sequence') ||
                                     lowerContent.includes('add step') ||
                                     lowerContent.includes('edit step') ||
                                     lowerContent.includes('update sequence') ||
                                     lowerContent.includes('modify sequence');

      // Get the auth token
      const token = localStorage.getItem('helix_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add auth token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Send message to the backend.
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: content,
          messageId: userMessage.id,
          currentSequence: isSequenceModification && sequence ? sequence : null
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();

      // If the backend returns a modified sequence, update state.
      if (data.isSequence && data.sequence) {
        setSequence(data.sequence);
        
        // Add to sequence history
        const newHistoryItem: SequenceHistoryItem = {
          id: Date.now().toString(),
          title: data.sequence.title,
          timestamp: new Date().toISOString(),
          stepCount: data.sequence.steps.length
        };
        
        setSequenceHistory(prev => [newHistoryItem, ...prev]);
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: Failed to send message: ${
          error instanceof Error ? error.message : 'Internal Server Error'
        }`,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [sequence]);

  // Handler to update the sequence both in local state and on the backend.
  const handleUpdateSequence = useCallback((updatedSequence: Sequence) => {
    // Update the sequence state so the UI can refresh live.
    setSequence(updatedSequence);
    
    // Create a new history item
    const newHistoryItem: SequenceHistoryItem = {
      id: Date.now().toString(),
      title: updatedSequence.title,
      timestamp: new Date().toISOString(),
      stepCount: updatedSequence.steps.length
    };
    
    // Add to global sequence history if it's a significant update
    const existingHistory = sequenceHistory.find(h => h.title === updatedSequence.title);
    if (!existingHistory || existingHistory.stepCount !== updatedSequence.steps.length) {
      setSequenceHistory(prev => [newHistoryItem, ...prev]);
    }
    
    // Add to current chat session's sequences
    if (activeChatSessionId) {
      setChatSessions(prevSessions => {
        return prevSessions.map(session => {
          if (session.id === activeChatSessionId) {
            // Check if this sequence already exists in the session
            const existingSequence = session.sequences?.find(s => s.title === updatedSequence.title);
            
            if (existingSequence) {
              // Update existing sequence
              const updatedSequences = session.sequences.map(s => 
                s.title === updatedSequence.title ? newHistoryItem : s
              );
              return { ...session, sequences: updatedSequences };
            } else {
              // Add new sequence to session
              const sequences = session.sequences || [];
              return { ...session, sequences: [newHistoryItem, ...sequences] };
            }
          }
          return session;
        });
      });
    }
    
    // Get the auth token
    const token = localStorage.getItem('helix_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Send the updated sequence
    fetch(`${API_BASE_URL}/api/sequences/${updatedSequence.title}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updatedSequence)
    }).catch((error) => {
      console.error('Error in API call to update sequence:', error);
    });
  }, [sequenceHistory, activeChatSessionId]);
  
  // Handle selecting a message from history
  const handleSelectMessage = useCallback((messageId: string) => {
    // Find which chat session contains this message
    for (const session of chatSessions) {
      const messageInSession = session.messages.find(m => m.id === messageId);
      if (messageInSession) {
        // Set this session as active
        setActiveChatSessionId(session.id);
        setMessages(session.messages);
        setSidebarOpen(false);
        return;
      }
    }
  }, [chatSessions]);
  
  // Handle selecting a sequence from history
  const handleSelectSequence = useCallback((sequenceId: string) => {
    // Find the sequence in history
    const historyItem = sequenceHistory.find(s => s.id === sequenceId);
    if (historyItem) {
      // You could load this sequence
      console.log('Selected sequence history item:', historyItem);
      
      // For now, just close the sidebar
      setSidebarOpen(false);
    }
  }, [sequenceHistory]);

  // Handle creating a new chat
  const handleNewChat = useCallback(() => {
    // Create a fresh welcome message
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: `Hello${user ? ` ${user.first_name}` : ''}! I am Helix, your AI recruiting assistant. How can I help you today?`,
      timestamp: new Date().toISOString()
    };
    
    // Create a new session ID
    const newSessionId = Date.now().toString();
    setActiveChatSessionId(newSessionId);
    
    // Reset messages to just the welcome message
    setMessages([welcomeMessage]);
    
    // Close the sidebar
    setSidebarOpen(false);
    
    // Reset any active sequence if needed
    setSequence(null);
  }, [user]);

  // If not authenticated and not on landing page, show Auth screen
  if (!isAuthenticated && !showLandingPage) {
    return (
      <ToastProvider>
        <Auth onAuthSuccess={handleAuthSuccess} />
      </ToastProvider>
    );
  }

  // If on landing page, show landing page with auth options
  if (showLandingPage) {
    return (
      <ToastProvider>
        <LandingPage 
          onGetStarted={handleGetStarted} 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
          isAuthenticated={isAuthenticated}
        />
      </ToastProvider>
    );
  }
  
  // If showing settings
  if (showSettings && user) {
    return (
      <ToastProvider>
        <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
          <header className="app-header">
            <div className="logo">
              <span className="logo-text">Helix</span>
              <span className="logo-subtitle">User Settings</span>
            </div>
            <div className="header-actions">
              <button 
                className="header-button" 
                onClick={toggleSettings}
                aria-label="Back to app"
              >
                Back to App
              </button>
            </div>
          </header>
          <main className="app-main settings-container">
            <Settings 
              user={user} 
              apiUrl={API_BASE_URL} 
              onUserUpdate={handleUserUpdate}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          </main>
        </div>
      </ToastProvider>
    );
  }

  // Main application view
  return (
    <ToastProvider>
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <HistorySidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          chatHistory={messages}
          chatSessions={chatSessions}
          sequenceHistory={sequenceHistory}
          onSelectMessage={handleSelectMessage}
          onSelectSequence={handleSelectSequence}
          onNewChat={handleNewChat}
          darkMode={darkMode}
          user={user}
        />
        
        <header className="app-header">
          <div className="sidebar-toggle">
            <button 
              className="sidebar-toggle-button"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                {sidebarOpen ? (
                  // X icon when sidebar is open
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
                ) : (
                  // Three lines icon when sidebar is closed
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor" />
                )}
              </svg>
            </button>
          </div>
          <div className="logo">
            <span className="logo-text">Helix</span>
            <span className="logo-subtitle">The Agentic Recruiter</span>
          </div>
          <div className="header-actions">
            <button 
              className="header-button" 
              onClick={toggleSettings}
              aria-label="Settings"
            >
              Settings
            </button>
            <button 
              className="logout-button" 
              onClick={handleLogout}
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="app-main">
          <ChatBar 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            loading={isLoading}
            agentState={isResearching ? "Researching..." : null}
            darkMode={darkMode}
            user={user}
          />
          <RecruitingWorkspace
            sequence={sequence}
            onUpdateSequence={handleUpdateSequence}
            isResearching={isResearching}
            darkMode={darkMode}
            activeChatSessionId={activeChatSessionId}
          />
        </main>
      </div>
    </ToastProvider>
  );
};

export default App;