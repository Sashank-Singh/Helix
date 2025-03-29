import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header if token exists
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Chat API
export const chatApi = {
  sendMessage: async (message, sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message, session_id: sessionId }),
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  getChatHistory: async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/history/${sessionId}`, {
        credentials: 'include',
      });
      return response.json();
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },
};

// Sequence API
export const sequenceApi = {
  generateSequence: async (candidateInfo, jobRole) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-sequence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ candidate_info: candidateInfo, job_role: jobRole }),
      });
      return response.json();
    } catch (error) {
      console.error('Error generating sequence:', error);
      throw error;
    }
  },

  getSequences: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sequences`, {
        credentials: 'include',
      });
      return response.json();
    } catch (error) {
      console.error('Error getting sequences:', error);
      throw error;
    }
  },

  getSequence: async (sequenceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sequences/${sequenceId}`, {
        credentials: 'include',
      });
      return response.json();
    } catch (error) {
      console.error('Error getting sequence:', error);
      throw error;
    }
  },

  updateSequence: async (sequenceId, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sequences/${sequenceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      return response.json();
    } catch (error) {
      console.error('Error updating sequence:', error);
      throw error;
    }
  },

  deleteSequence: async (sequenceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sequences/${sequenceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return response.json();
    } catch (error) {
      console.error('Error deleting sequence:', error);
      throw error;
    }
  },
}; 