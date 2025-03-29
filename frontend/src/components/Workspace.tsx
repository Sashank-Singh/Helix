import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SequenceType, SequenceStepType } from '../types';

interface WorkspaceProps {
  sequence: SequenceType | null;
  onUpdateSequence: (sequence: SequenceType) => void;
  onDeleteSequence?: () => void;
  width?: number;
  onResize?: (newWidth: number) => void;
}

const WorkspaceContainer = styled.div<{ width?: number }>`
  width: ${props => props.width ? `${props.width}%` : '60%'};
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  position: relative;
  
  .dark-mode & {
    background-color: #1e1e1e;
  }
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  
  .dark-mode & {
    background-color: #1e1e1e;
    border-bottom-color: #333;
  }
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
  font-weight: 600;
  font-size: 1.25rem;
  
  .dark-mode & {
    color: #f0f0f0;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  background-color: #fafafa;
  
  .dark-mode & {
    background-color: #2a2a2a;
  }
`;

const NoSequence = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 20px;
  
  svg {
    margin-bottom: 20px;
    color: #ccc;
  }
  
  h3 {
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }
  
  p {
    max-width: 400px;
    line-height: 1.6;
  }
  
  .dark-mode & {
    color: #aaa;
    
    svg {
      color: #555;
    }
    
    h3 {
      color: #f0f0f0;
    }
  }
`;

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 25px;
  margin-bottom: 30px;
  
  .dark-mode & {
    background-color: #2d2d2d;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
`;

const SequenceTitle = styled.input`
  font-size: 24px;
  font-weight: 600;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  outline: none;
  color: #333;
  background-color: transparent;
  transition: all 0.2s ease;
  
  &:hover, &:focus {
    border-color: #e0e0e0;
    background-color: #f9f9f9;
  }
  
  .dark-mode & {
    color: #f0f0f0;
    
    &:hover, &:focus {
      border-color: #444;
      background-color: #333;
    }
  }
`;

const SequenceDescription = styled.textarea`
  width: 100%;
  padding: 12px;
  margin-bottom: 25px;
  min-height: 80px;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
  color: #666;
  background-color: #f9f9f9;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
  }
  
  .dark-mode & {
    color: #ccc;
    background-color: #333;
    border-color: #444;
    
    &:focus {
      border-color: #4285f4;
      box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.2);
    }
  }
`;

const SequenceStepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StepContainer = styled.div`
  border-radius: 12px;
  padding: 0;
  background-color: #ffffff;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
`;

const StepNumber = styled.div`
  background-color: #4285f4;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(66, 133, 244, 0.3);
`;

const StepSubject = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #eeeeee;
  border-radius: 6px;
  font-weight: 500;
  color: #333;
  background-color: #ffffff;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
  }
`;

const StepMessageContainer = styled.div`
  padding: 20px;
`;

const StepMessage = styled.textarea`
  width: 100%;
  padding: 15px;
  min-height: 120px;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  color: #333;
  background-color: #f9f9f9;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 8px;
  margin-left: 5px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f0f0f0;
    color: #333;
  }

  .dark-mode & {
    color: #aaa;
    
    &:hover {
      background-color: #333;
      color: #f0f0f0;
    }
  }
`;

const DeleteButton = styled(ActionButton)`
  &:hover {
    background-color: #ffebee;
    color: #f44336;
  }

  .dark-mode & {
    &:hover {
      background-color: #3a2a2a;
      color: #ff6b6b;
    }
  }
`;

const SaveButton = styled.button`
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(66, 133, 244, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    background-color: #3367d6;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(66, 133, 244, 0.4);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 3px rgba(66, 133, 244, 0.3);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ResizeHandle = styled.div`
  position: absolute;
  top: 0;
  left: -5px;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
`;

const Workspace: React.FC<WorkspaceProps> = ({ 
  sequence, 
  onUpdateSequence,
  onDeleteSequence,
  width = 60,
  onResize
}) => {
  const [editedSequence, setEditedSequence] = useState<SequenceType | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(width);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Update local state when sequence prop changes
  useEffect(() => {
    if (sequence) {
      setEditedSequence({...sequence});
      setHasChanges(false);
    }
  }, [sequence]);
  
  const handleSave = () => {
    if (editedSequence) {
      onUpdateSequence(editedSequence);
      setHasChanges(false);
    }
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedSequence) {
      setEditedSequence({
        ...editedSequence,
        title: e.target.value
      });
      setHasChanges(true);
    }
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editedSequence) {
      setEditedSequence({
        ...editedSequence,
        description: e.target.value
      });
      setHasChanges(true);
    }
  };
  
  const handleStepChange = (index: number, field: keyof SequenceStepType, value: string | number) => {
    if (editedSequence && editedSequence.steps) {
      const updatedSteps = [...editedSequence.steps];
      updatedSteps[index] = {
        ...updatedSteps[index],
        [field]: value
      };
      
      setEditedSequence({
        ...editedSequence,
        steps: updatedSteps
      });
      
      setHasChanges(true);
    }
  };
  
  // Handle resize drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartWidth(width);
    e.preventDefault();
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    const parentWidth = containerRect.width / (width / 100);
    const delta = e.clientX - startX;
    const newWidthPercent = startWidth - (delta / parentWidth * 100);
    
    if (onResize && newWidthPercent >= 30 && newWidthPercent <= 80) {
      onResize(newWidthPercent);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);
  
  return (
    <WorkspaceContainer width={width} ref={containerRef}>
      <Header>
        <Title>Sequence</Title>
        <ButtonContainer>
          {editedSequence && hasChanges && (
            <SaveButton onClick={handleSave}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
                <path d="M17 21v-8H7v8"></path>
                <path d="M7 3v5h8"></path>
              </svg>
              Save Changes
            </SaveButton>
          )}
          {onDeleteSequence && sequence && (
            <DeleteButton onClick={onDeleteSequence} title="Delete sequence">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </DeleteButton>
          )}
        </ButtonContainer>
      </Header>
      
      <ContentContainer>
        {!sequence ? (
          <NoSequence>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="8" y1="12" x2="16" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="16"></line>
            </svg>
            <h3>No Sequence Generated Yet</h3>
            <p>Chat with Helix to create a recruiting outreach sequence. Once you provide enough information, a sequence will appear here.</p>
          </NoSequence>
        ) : editedSequence ? (
          <Card>
            <SequenceTitle 
              value={editedSequence.title || ''} 
              onChange={handleTitleChange}
              placeholder="Sequence Title"
            />
            
            <SequenceDescription 
              value={editedSequence.description || ''}
              onChange={handleDescriptionChange}
              placeholder="Add a description for this sequence..."
            />
            
            <SequenceStepsContainer>
              {editedSequence.steps && editedSequence.steps.map((step, index) => (
                <StepContainer key={index}>
                  <StepHeader>
                    <StepNumber>{index + 1}</StepNumber>
                    <StepSubject 
                      value={step.subject || ''}
                      onChange={(e) => handleStepChange(index, 'subject', e.target.value)}
                      placeholder="Email Subject"
                    />
                  </StepHeader>
                  
                  <StepMessageContainer>
                    <StepMessage 
                      value={step.message || ''}
                      onChange={(e) => handleStepChange(index, 'message', e.target.value)}
                      placeholder="Email message content..."
                    />
                  </StepMessageContainer>
                </StepContainer>
              ))}
            </SequenceStepsContainer>
          </Card>
        ) : null}
      </ContentContainer>
      
      {onResize && (
        <ResizeHandle 
          onMouseDown={handleMouseDown}
        />
      )}
    </WorkspaceContainer>
  );
};

export default Workspace; 