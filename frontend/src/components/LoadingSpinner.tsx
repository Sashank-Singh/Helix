import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  thickness?: number;
}

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const dash = keyframes`
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
`;

const SpinnerContainer = styled.div<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  display: inline-block;
  overflow: hidden;
  animation: ${rotate} 2s linear infinite;
`;

const SpinnerSvg = styled.svg`
  width: 100%;
  height: 100%;
  transform-origin: center;
  animation: ${rotate} 2s linear infinite;
`;

const SpinnerCircle = styled.circle<{ color: string, thickness: number }>`
  fill: none;
  stroke: ${props => props.color};
  stroke-width: ${props => props.thickness};
  stroke-linecap: round;
  animation: ${dash} 1.5s ease-in-out infinite;
`;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = '#4285f4',
  thickness = 4
}) => {
  const radius = 45;
  const viewBox = `0 0 ${radius * 2} ${radius * 2}`;
  
  return (
    <SpinnerContainer size={size}>
      <SpinnerSvg viewBox={viewBox}>
        <SpinnerCircle
          cx={radius}
          cy={radius}
          r={radius - thickness/2}
          color={color}
          thickness={thickness}
        />
      </SpinnerSvg>
    </SpinnerContainer>
  );
};

export default LoadingSpinner; 