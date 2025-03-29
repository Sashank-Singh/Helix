import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SequencePanel.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Define types for the sequence data
interface SequenceStep {
  id: string;
  title: string;
  content: string;
  delay: string;
}

interface SequenceData {
  id?: string;
  session_id: string;
  title?: string;
  description?: string;
  items: SequenceStep[];
  created_at?: string;
}

// Define props interface
interface SequencePanelProps {
  sessionId: string;
}

const SequencePanel: React.FC<SequencePanelProps> = ({ sessionId }) => {
  const [sequence, setSequence] = useState<SequenceData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (sessionId) {
      fetchSequence();
    }
  }, [sessionId]);

  const fetchSequence = async () => {
    try {
      const response = await axios.get(`${API_URL}/sequence/${sessionId}`);
      if (response.data && response.data.items && response.data.items.length > 0) {
        setSequence(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch sequence:', error);
    }
  };

  const generateSequence = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/sequence/generate`, {
        session_id: sessionId
      });
      setSequence(response.data);
    } catch (error) {
      console.error('Failed to generate sequence:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sequence-panel">
      <h2>Sequence</h2>
      
      {!sequence?.items?.length ? (
        <div className="empty-state">
          <div className="empty-state-icon">+</div>
          <h3>No Sequence Generated Yet</h3>
          <p>
            Chat with Helix to create a recruiting outreach sequence.
            Once you provide enough information, a sequence will
            appear here.
          </p>
          <button 
            className="generate-btn" 
            onClick={generateSequence}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Sequence'}
          </button>
        </div>
      ) : (
        <div className="sequence-content">
          {sequence.title && <h3>{sequence.title}</h3>}
          {sequence.description && <p className="description">{sequence.description}</p>}
          <div className="sequence-steps">
            {sequence.items.map((step) => (
              <div key={step.id} className="sequence-step">
                <h3>Step {step.id}:</h3>
                <p className="delay">Send after: {step.delay}</p>
                <div className="step-content">
                  {step.content.split('\n').map((line, i) => (
                    line.trim() ? <p key={i}>{line}</p> : <br key={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SequencePanel;