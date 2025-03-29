import React, { useEffect, useRef, useState } from 'react';
import '../styles/LandingPage.css';

interface LandingPageProps {
  onGetStarted: () => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
  isAuthenticated?: boolean;
}

interface NodePosition {
  id: number;
  x: number;
  y: number;
  element: HTMLDivElement;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onGetStarted,
  darkMode,
  toggleDarkMode,
  isAuthenticated 
}) => {
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const networkRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Create neural network nodes and connections
    if (networkRef.current) {
      const container = networkRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Clear any existing nodes
      container.innerHTML = '';
      
      // Add nodes
      const numberOfNodes = 40;
      const nodePositions: NodePosition[] = [];
      
      for (let i = 0; i < numberOfNodes; i++) {
        const node = document.createElement('div');
        node.className = 'node';
        
        // Random position
        const left = Math.random() * containerWidth;
        const top = Math.random() * containerHeight;
        
        // Random size (1-3px)
        const size = 1 + Math.random() * 2;
        
        // Random animation delay
        const delay = Math.random() * 10;
        
        node.style.left = `${left}px`;
        node.style.top = `${top}px`;
        node.style.width = `${size}px`;
        node.style.height = `${size}px`;
        node.style.animationDelay = `${delay}s`;
        
        container.appendChild(node);
        nodePositions.push({ id: i, x: left, y: top, element: node });
      }
      
      // Create connections between nodes
      nodePositions.forEach((node) => {
        // Connect each node to 2-3 nearest nodes
        const otherNodes = [...nodePositions].filter(n => n.id !== node.id);
        
        // Sort by distance
        otherNodes.sort((a, b) => {
          const distA = Math.sqrt(Math.pow(node.x - a.x, 2) + Math.pow(node.y - a.y, 2));
          const distB = Math.sqrt(Math.pow(node.x - b.x, 2) + Math.pow(node.y - b.y, 2));
          return distA - distB;
        });
        
        // Get 2-3 nearest nodes
        const connectCount = 2 + Math.floor(Math.random() * 2);
        const nearestNodes = otherNodes.slice(0, connectCount);
        
        // Create connections
        nearestNodes.forEach(targetNode => {
          // Calculate distance and angle
          const dx = targetNode.x - node.x;
          const dy = targetNode.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          
          // Don't create connections that are too long
          if (distance < containerWidth / 3) {
            const connection = document.createElement('div');
            connection.className = 'connection';
            connection.style.width = `${distance}px`;
            connection.style.left = `${node.x}px`;
            connection.style.top = `${node.y}px`;
            connection.style.transform = `rotate(${angle}deg)`;
            connection.style.opacity = `${0.5 - (distance / (containerWidth / 1.5))}`;
            
            // Add some animation delay for the pulsing effect
            connection.style.animationDelay = `${Math.random() * 5}s`;
            
            container.appendChild(connection);
          }
        });
      });
    }
  }, []);

  const handleGetStartedClick = () => {
    if (isAuthenticated) {
      onGetStarted();
    } else {
      setShowAuthOptions(true);
    }
  };

  return (
    <div className="landing-container">
      <div className="neural-network" ref={networkRef}></div>
      <div className="landing-content">
        <div className="hero-section">
          <h1>Helix</h1>
          <h2>The Agentic Recruiter</h2>
          <p>Streamline your recruiting process with AI-powered tools</p>
          
          {showAuthOptions ? (
            <div className="auth-options">
              <div className="auth-buttons">
                <button 
                  className="auth-option-btn login"
                  onClick={onGetStarted}
                >
                  Login
                </button>
                <button 
                  className="auth-option-btn signup"
                  onClick={onGetStarted}
                >
                  Sign Up
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="get-started-btn" 
              onClick={handleGetStartedClick}
            >
              Get Started
            </button>
          )}
        </div>
        <div className="features-section">
          <div className="feature">
            <div className="feature-icon">📋</div>
            <h3>Smart Sequences</h3>
            <p>Create and manage recruiting workflows with ease</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🤖</div>
            <h3>AI Assistant</h3>
            <p>Get intelligent recommendations for your recruiting needs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 