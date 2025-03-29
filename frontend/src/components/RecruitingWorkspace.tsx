import React, { useState, useEffect } from 'react';
import { useToast } from './ToastContainer';
import '../styles/RecruitingWorkspace.css';

interface Step {
  id: string;
  title: string;
  description: string;
  done?: boolean;
}

interface Sequence {
  title: string;
  description: string;
  steps: Step[];
}

interface Props {
  sequence: Sequence | null;
  onUpdateSequence: (sequence: Sequence) => void;
  isResearching: boolean;
  darkMode?: boolean;
  activeChatSessionId?: string | null;
}

// Interface for LinkedIn search history
interface LinkedInSearch {
  id: string;
  query: string;
  timestamp: Date;
  skills?: string[];
}

// Extract skills from a text
const extractSkills = (text: string): string[] => {
  const commonSkills = [
    'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'express', 
    'python', 'django', 'flask', 'java', 'spring', 'c#', '.net', 'sql', 'nosql', 
    'mongodb', 'postgresql', 'mysql', 'docker', 'kubernetes', 'aws', 'azure', 
    'gcp', 'ci/cd', 'git', 'agile', 'scrum', 'product management', 'leadership', 
    'communication', 'problem-solving', 'teamwork', 'design', 'ux', 'ui', 'figma',
    'sketch', 'photoshop', 'illustrator', 'marketing', 'seo', 'content', 'analytics'
  ];
  
  // Convert text to lowercase for matching
  const lowerText = text.toLowerCase();
  
  // Find all skills in the text
  return commonSkills.filter(skill => lowerText.includes(skill));
};

const RecruitingWorkspace: React.FC<Props> = ({
  sequence,
  onUpdateSequence,
  isResearching,
  darkMode = false,
  activeChatSessionId
}) => {
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonValue, setJsonValue] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [outreachMessage, setOutreachMessage] = useState<string | null>(null);
  const [messageStepId, setMessageStepId] = useState<string | null>(null);
  
  // LinkedIn search history
  const [searchHistory, setSearchHistory] = useState<LinkedInSearch[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  
  // Get toast notification function
  const { showToast } = useToast();
  
  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('linkedinSearchHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert string timestamps back to Date objects
        const formattedHistory = parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setSearchHistory(formattedHistory);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);
  
  // Save search history to localStorage when updated
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('linkedinSearchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  const handleEditClick = (step: Step) => {
    setEditingStep(step.id);
    setEditedTitle(step.title);
    setEditedDescription(step.description);
  };

  const handleSaveClick = (stepId: string) => {
    if (!sequence) return;
    
    const updatedSteps = sequence.steps.map(step => 
      step.id === stepId 
        ? { ...step, title: editedTitle, description: editedDescription }
        : step
    );

    onUpdateSequence({
      ...sequence,
      steps: updatedSteps
    });

    setEditingStep(null);
  };

  const handleCancelEdit = () => {
    setEditingStep(null);
  };

  const handleToggleDone = (stepId: string) => {
    if (!sequence) return;
    
    const updatedSteps = sequence.steps.map(step => 
      step.id === stepId 
        ? { ...step, done: !step.done }
        : step
    );

    onUpdateSequence({
      ...sequence,
      steps: updatedSteps
    });
  };

  const toggleJsonMode = () => {
    if (isJsonMode) {
      // Switching back to normal mode
      setIsJsonMode(false);
      setJsonError("");
    } else if (sequence) {
      // Switching to JSON mode
      setJsonValue(JSON.stringify(sequence, null, 2));
      setIsJsonMode(true);
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonValue(e.target.value);
    setJsonError("");
  };

  const handleJsonSave = () => {
    try {
      const parsedJson = JSON.parse(jsonValue);
      
      // Basic validation
      if (!parsedJson.title || !parsedJson.description || !Array.isArray(parsedJson.steps)) {
        setJsonError("Invalid sequence format. Must include title, description, and steps array.");
        return;
      }
      
      // Validate steps structure
      for (const step of parsedJson.steps) {
        if (!step.id || !step.title || !step.description) {
          setJsonError("Invalid step format. Each step must have id, title, and description.");
          return;
        }
      }
      
      onUpdateSequence(parsedJson);
      setIsJsonMode(false);
      setJsonError("");
    } catch (error) {
      setJsonError("Invalid JSON format. Please check your syntax.");
    }
  };
  
  // Process LinkedIn search
  const openLinkedInSearch = (variationType?: string) => {
    try {
      if (!sequence) {
        showToast('Cannot search on LinkedIn: No sequence available', 'error');
        return;
      }
      
      // Extract job role and skills from sequence data
      let jobRole = '';
      let skills: string[] = [];
      
      // Extract the job role from sequence title
      if (sequence.title && sequence.title.trim()) {
        jobRole = sequence.title.trim();
      } 
      // If no title, try to extract from description
      else if (sequence.description && sequence.description.trim()) {
        // Look for role-related keywords in description
        const description = sequence.description.toLowerCase();
        const roleKeywords = ['engineer', 'developer', 'designer', 'manager', 'director', 'specialist', 'analyst'];
        
        for (const keyword of roleKeywords) {
          if (description.includes(keyword)) {
            // Get 2 words before and after the keyword
            const words = description.split(/\s+/);
            const keywordIndex = words.findIndex(word => word.includes(keyword));
            
            if (keywordIndex !== -1) {
              const start = Math.max(0, keywordIndex - 2);
              const end = Math.min(words.length, keywordIndex + 3);
              jobRole = words.slice(start, end).join(' ');
              break;
            }
          }
        }
      }
      
      // If still no job role, look at step titles
      if (!jobRole && sequence.steps && sequence.steps.length > 0) {
        // Check first few steps for role mentions
        for (let i = 0; i < Math.min(3, sequence.steps.length); i++) {
          const stepTitle = sequence.steps[i].title.toLowerCase();
          if (stepTitle.includes('role') || stepTitle.includes('position') || 
              stepTitle.includes('job') || stepTitle.includes('hiring')) {
            jobRole = sequence.steps[i].title;
            break;
          }
        }
      }
      
      // If we still don't have a job role, use a generic term for recruiting
      if (!jobRole) {
        jobRole = 'talented professionals';
      }
      
      // Extract skills from sequence description and step descriptions
      if (sequence.description) {
        skills = extractSkills(sequence.description);
      }
      
      // Also extract skills from step descriptions
      if (sequence.steps && sequence.steps.length > 0) {
        sequence.steps.forEach(step => {
          if (step.description) {
            const stepSkills = extractSkills(step.description);
            skills.push(...stepSkills);
          }
        });
      }
      
      // Remove duplicate skills
      skills = Array.from(new Set(skills));
      
      // Limit to top 5 most relevant skills
      skills = skills.slice(0, 5);
      
      let searchQuery = jobRole;
      
      // Add skills to search if variation type is specified
      if (variationType === 'withSkills' && skills.length > 0) {
        searchQuery = `${jobRole} ${skills.join(' ')}`;
      } else if (variationType === 'seniorOnly') {
        searchQuery = `senior ${jobRole}`;
      } else if (variationType === 'locationBased') {
        // You can add location parameter to the URL instead
        searchQuery = jobRole;
      }
      
      // Encode the search query for URL
      const encodedQuery = encodeURIComponent(searchQuery);
      
      // Create base LinkedIn search URL
      let linkedInUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodedQuery}&origin=SWITCH_SEARCH_VERTICAL`;
      
      // Add additional parameters based on variation type
      if (variationType === 'locationBased') {
        linkedInUrl += '&geoUrn=%5B%22101174742%22%2C%22101282230%22%5D'; // Example: San Francisco and New York
      }
      
      // Open LinkedIn search in a new tab with error handling
      const newWindow = window.open(linkedInUrl, '_blank');
      
      // Save search to history
      const newSearch: LinkedInSearch = {
        id: Date.now().toString(),
        query: searchQuery,
        timestamp: new Date(),
        skills: skills.length > 0 ? skills : undefined
      };
      
      setSearchHistory(prev => [newSearch, ...prev].slice(0, 10)); // Keep only last 10 searches
      
      // Check if window was successfully opened
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        showToast('LinkedIn search window was blocked by the browser. Please allow popups for this site.', 'error');
        console.error('LinkedIn search window was blocked by the browser. Please allow popups for this site.');
      } else {
        showToast(`Successfully opened LinkedIn search for "${searchQuery}"`, 'success');
      }
    } catch (error) {
      console.error('Error opening LinkedIn search:', error);
      showToast('Error opening LinkedIn search', 'error');
    }
  };
  
  // Open multiple LinkedIn search variations
  const openMultipleSearches = () => {
    if (!sequence) {
      showToast('Cannot search on LinkedIn: No sequence available', 'error');
      return;
    }
    
    // Open different search variations with 500ms delay between them
    setTimeout(() => openLinkedInSearch(), 0);
    setTimeout(() => openLinkedInSearch('withSkills'), 500);
    setTimeout(() => openLinkedInSearch('seniorOnly'), 1000);
    
    showToast('Opening multiple LinkedIn search variations', 'info');
  };
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Reuse a previous search
  const reusePreviousSearch = (search: LinkedInSearch) => {
    try {
      const encodedQuery = encodeURIComponent(search.query);
      const linkedInUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodedQuery}&origin=SWITCH_SEARCH_VERTICAL`;
      
      window.open(linkedInUrl, '_blank');
      showToast(`Reusing LinkedIn search for "${search.query}"`, 'success');
    } catch (error) {
      console.error('Error reusing search:', error);
      showToast('Error reusing LinkedIn search', 'error');
    }
  };

  // Generate outreach message for a step
  const generateOutreachMessage = (step: Step) => {
    // Extract key information from step title and description
    const stepTitle = step.title.toLowerCase();
    const stepDescription = step.description;
    
    // Generate greeting with placeholder
    let message = `Hi {{first_name}},\n\n`;
    
    // For the first step, use job posting outreach format
    if (step.id === "1" && sequence) {
      // Extract job role from sequence title
      let jobRole = '';
      
      if (sequence.title) {
        // Only remove "Recruitment Process" but keep the actual role
        jobRole = sequence.title
          .replace(/\s*Recruitment\s*Process\s*$/i, '')
          .trim();
      }
      
      // If still no job role, use a default
      if (!jobRole) {
        jobRole = "Software Engineer";
      }
      
      message += `I hope this message finds you well. I came across your profile and was really impressed with your background and experience.\n\n`;
      message += `We're currently hiring for a ${jobRole} role. Please review our job role and requirements @{{link}}.\n\n`;
      message += `I think your skills would be a great match for this position and would love to discuss this opportunity with you.`;
    }
    // Add appropriate content based on step type
    else if (stepTitle.includes('introduction') || stepTitle.includes('initial')) {
      message += `I hope this message finds you well. I came across your profile and was really impressed with your background and experience. `;
      message += `${stepDescription.split('.')[0]}. `;
      message += `\n\nI'd love to connect and share more about an opportunity that might align with your skills.`;
    } 
    else if (stepTitle.includes('follow') || stepTitle.includes('follow-up')) {
      message += `I wanted to follow up on my previous message about the role we're looking to fill. `;
      message += `${stepDescription.split('.')[0]}. `;
      message += `\n\nWould you be interested in learning more about this opportunity?`;
    }
    else if (stepTitle.includes('interview') || stepTitle.includes('schedule')) {
      message += `Thank you for your interest in the position. I'd like to schedule some time to discuss the role in more detail. `;
      message += `${stepDescription.split('.')[0]}. `;
      message += `\n\nWould you be available for a call this week?`;
    }
    else {
      // Generic outreach
      message += `I'm reaching out regarding a potential opportunity that might be a great fit for someone with your background. `;
      message += `${stepDescription.split('.')[0]}. `;
      message += `\n\nI'd love to share more details if you're interested.`;
    }
    
    // Add professional closing
    message += `\n\nLooking forward to connecting,\n[Your Name]\n[Your Position]\n[Company]`;
    
    return message;
  };
  
  // Copy outreach message to clipboard
  const copyOutreachToClipboard = (message: string) => {
    navigator.clipboard.writeText(message)
      .then(() => {
        showToast('Outreach message copied to clipboard!', 'success');
      })
      .catch(err => {
        console.error('Failed to copy message: ', err);
        showToast('Failed to copy message', 'error');
      });
  };

  return (
    <div className="recruiting-workspace">
      <div className="sequence-section">
        <div className="sequence-header-controls">
          <h2>Sequence</h2>
          
          {sequence && (
            <div className="linkedin-search-controls">
              <button 
                onClick={() => openLinkedInSearch()}
                className="linkedin-button"
                title={`Find ${sequence.title} candidates on LinkedIn`}
              >
                <svg className="linkedin-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" fill="currentColor"/>
                </svg>
                Find Candidates on LinkedIn
              </button>
              
              <div className="linkedin-dropdown">
                <button 
                  className="linkedin-dropdown-toggle"
                  onClick={() => setShowSearchHistory(!showSearchHistory)}
                  title="More LinkedIn search options"
                  aria-label="Toggle LinkedIn search options"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M7 10l5 5 5-5z" fill="currentColor" />
                  </svg>
                </button>
                
                {showSearchHistory && (
                  <div className="linkedin-dropdown-menu">
                    <div className="linkedin-dropdown-header">
                      <span>Search Options</span>
                    </div>
                    
                    <button 
                      className="linkedin-dropdown-item"
                      onClick={openMultipleSearches}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
                      </svg>
                      Open Multiple Search Variations
                    </button>
                    
                    <button 
                      className="linkedin-dropdown-item"
                      onClick={() => openLinkedInSearch('withSkills')}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="currentColor" />
                      </svg>
                      Include Skills in Search
                    </button>
                    
                    <div className="linkedin-dropdown-header">
                      <span>Recent Searches</span>
                    </div>
                    
                    {searchHistory.length > 0 ? (
                      searchHistory.map(search => (
                        <button 
                          key={search.id}
                          className="linkedin-dropdown-item linkedin-history-item"
                          onClick={() => reusePreviousSearch(search)}
                        >
                          <div className="linkedin-history-query">{search.query}</div>
                          <div className="linkedin-history-time">{formatDate(new Date(search.timestamp))}</div>
                        </button>
                      ))
                    ) : (
                      <div className="linkedin-empty-history">No recent searches</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {sequence ? (
          isJsonMode ? (
            <div className="json-editor-container">
              <textarea 
                className="json-editor"
                value={jsonValue}
                onChange={handleJsonChange}
                spellCheck={false}
                aria-label="JSON Editor"
                placeholder="Edit sequence JSON here"
              />
              {jsonError && <div className="json-error">{jsonError}</div>}
              <div className="json-editor-buttons">
                <button onClick={handleJsonSave} className="save-button">Save JSON</button>
                <button onClick={toggleJsonMode} className="cancel-button">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="sequence-content">
              <div className="sequence-header">
                <h3>{sequence.title}</h3>
                <p className="sequence-description">{sequence.description}</p>
              </div>
              <div className="sequence-steps">
                {sequence.steps.map((step) => (
                  <div key={step.id} className={`sequence-step ${step.done ? 'step-done' : ''}`}>
                    <div className="step-header">
                      <span className="step-number">{step.id}</span>
                      {editingStep === step.id ? (
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="step-title-input"
                          aria-label="Step Title"
                          placeholder="Enter step title"
                        />
                      ) : (
                        <h4 className="step-title">{step.title}</h4>
                      )}
                    </div>
                    {editingStep === step.id ? (
                      <div className="step-edit-controls">
                        <textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          className="step-description-input"
                          aria-label="Step Description"
                          placeholder="Enter step description"
                        />
                        <div className="step-edit-buttons">
                          <button onClick={() => handleSaveClick(step.id)} className="save-button">
                            Save
                          </button>
                          <button onClick={handleCancelEdit} className="cancel-button">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="step-description">{step.description}</p>
                        <div className="step-action-buttons">
                          <button onClick={() => handleEditClick(step)} className="edit-button">
                            Edit
                          </button>
                          <button 
                            onClick={() => handleToggleDone(step.id)} 
                            className={`done-button ${step.done ? 'done-active' : ''}`}
                          >
                            {step.done ? 'Mark Incomplete' : 'Mark Done'}
                          </button>
                          <button 
                            onClick={() => {
                              const message = generateOutreachMessage(step);
                              setOutreachMessage(message);
                              setMessageStepId(step.id);
                            }} 
                            className="outreach-button"
                          >
                            Generate Outreach
                          </button>
                        </div>
                        
                        {outreachMessage && messageStepId === step.id && (
                          <div className="outreach-message-preview">
                            <h4>Candidate Outreach Message</h4>
                            <pre className="outreach-preview-text">{outreachMessage}</pre>
                            <div className="outreach-actions">
                              <button 
                                onClick={() => copyOutreachToClipboard(outreachMessage)}
                                className="copy-button"
                              >
                                Copy to Clipboard
                              </button>
                              <button 
                                onClick={() => {
                                  setOutreachMessage(null);
                                  setMessageStepId(null);
                                }}
                                className="dismiss-button"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="empty-sequence">
            <p>No sequence generated yet. Ask me to create a recruiting sequence!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruitingWorkspace; 