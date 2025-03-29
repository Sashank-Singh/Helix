import React, { useState, useEffect } from 'react';
import './Sequence.css';
import { io } from 'socket.io-client';

const Sequence = ({ sessionId }) => {
  const [sequence, setSequence] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to Socket.io for real-time updates
    const newSocket = io();
    setSocket(newSocket);
    
    // Set up event listener for sequence updates
    newSocket.on('sequence_updated', (data) => {
      if (data.session_id === sessionId) {
        fetchSequence();
      }
    });
    
    // Initial fetch of sequence
    fetchSequence();
    
    return () => {
      newSocket.disconnect();
    };
  }, [sessionId]);

  const fetchSequence = async () => {
    try {
      const response = await fetch(`/api/sequence/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sequence');
      }
      
      const data = await response.json();
      // Handle both formats - items (from direct API) or steps (from database)
      if ((data.items && data.items.length > 0) || (data.steps && data.steps.length > 0)) {
        // Normalize the data structure
        const normalizedData = {
          ...data,
          // If data has steps but no items, map steps to items
          items: data.items || data.steps
        };
        setSequence(normalizedData);
      }
    } catch (error) {
      console.error('Error fetching sequence:', error);
    }
  };

  const generateSequence = async () => {
    setIsLoading(true);
    
    try {
      // First try to generate from existing chat content
      const response = await fetch('/api/sequence/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate sequence');
      }
      
      const data = await response.json();
      setSequence(data);
    } catch (error) {
      console.error('Error generating sequence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sequence-container">
      <h2>Sequence</h2>
      
      {sequence?.items?.length > 0 ? (
        <div className="sequence-items">
          {sequence.items.map(item => (
            <div key={item.id} className="sequence-item">
              <h3>Step {item.id}: </h3>
              <div className="sequence-content">
                {item.content.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              <p className="delay">Send after: {item.delay}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-sequence">
          <div className="empty-state-icon">+</div>
          <h3>No Sequence Generated Yet</h3>
          <p>
            Chat with Helix to create a recruiting outreach sequence.
            Once you provide enough information, a sequence will
            appear here.
          </p>
          
          <button 
            className="generate-sequence-btn"
            onClick={generateSequence}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Sequence'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Sequence; 