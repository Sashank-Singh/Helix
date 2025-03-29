import React from 'react';
import styled from 'styled-components';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  height: 100%;
  width: 100%;
  background-color: #fafafa;
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  color: #f87171;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const ErrorTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
`;

const ErrorMessage = styled.p`
  font-size: 15px;
  color: #666;
  max-width: 400px;
  margin-bottom: 24px;
  line-height: 1.6;
`;

const RetryButton = styled.button`
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
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

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <ErrorContainer>
      <ErrorIcon>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </ErrorIcon>
      <ErrorTitle>Something went wrong</ErrorTitle>
      <ErrorMessage>{message}</ErrorMessage>
      {onRetry && (
        <RetryButton onClick={onRetry}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4V9H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 20V15H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.5 7.5C15.5287 6.52873 14.2787 5.87889 12.9271 5.64121C11.5755 5.40352 10.1864 5.58868 8.9396 6.17326C7.69281 6.75783 6.64908 7.71656 5.93213 8.93057C5.21519 10.1446 4.85953 11.5526 4.91 12.975C4.96047 14.3974 5.41525 15.7715 6.21744 16.9249C7.01963 18.0783 8.1344 18.9582 9.43135 19.4622C10.7283 19.9662 12.1473 20.0701 13.5066 19.7612C14.8659 19.4523 16.1103 18.7438 17.07 17.73" 
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Try Again
        </RetryButton>
      )}
    </ErrorContainer>
  );
};

export default ErrorState; 