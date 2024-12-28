import React from 'react';
import styled, { keyframes } from 'styled-components';

const glowAnimation = keyframes`
  0% { filter: drop-shadow(0 0 2px var(--primary-color)); }
  50% { filter: drop-shadow(0 0 8px var(--primary-color)); }
  100% { filter: drop-shadow(0 0 2px var(--primary-color)); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const LogoSVG = styled.svg`
  animation: ${pulseAnimation} 4s ease-in-out infinite;
  &:hover {
    animation: ${glowAnimation} 2s ease-in-out infinite;
  }
`;

const LogoText = styled.div`
  font-family: 'Poppins', sans-serif;
  text-align: center;
  
  .company-name {
    font-size: 1.5rem;
    font-weight: bold;
    background: linear-gradient(135deg, var(--primary-color), var(--success-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .product-name {
    font-size: 1.2rem;
    color: var(--secondary-color);
    margin: 0;
    letter-spacing: 1px;
  }
`;

const Logo = ({ width = 200, height = 60 }) => {
  return (
    <LogoContainer>
      <LogoSVG
        width={width}
        height={height}
        viewBox="0 0 200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--primary-color)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'var(--success-color)', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#glow)">
          {/* Corpo da calculadora */}
          <rect x="20" y="10" width="60" height="80" rx="8" fill="url(#logoGradient)" />
          
          {/* Tela da calculadora */}
          <rect x="25" y="15" width="50" height="20" rx="4" fill="white" />
          <rect x="28" y="18" width="44" height="14" rx="2" fill="#e8f4f8" />
          
          {/* Botões da calculadora */}
          <g className="calculator-buttons">
            {/* Linha 1 */}
            <rect x="25" y="40" width="12" height="12" rx="2" fill="white" opacity="0.9" />
            <rect x="39" y="40" width="12" height="12" rx="2" fill="white" opacity="0.9" />
            <rect x="53" y="40" width="12" height="12" rx="2" fill="white" opacity="0.9" />
            <rect x="67" y="40" width="8" height="12" rx="2" fill="white" opacity="0.9" />
            
            {/* Linha 2 */}
            <rect x="25" y="54" width="12" height="12" rx="2" fill="white" opacity="0.9" />
            <rect x="39" y="54" width="12" height="12" rx="2" fill="white" opacity="0.9" />
            <rect x="53" y="54" width="12" height="12" rx="2" fill="white" opacity="0.9" />
            <rect x="67" y="54" width="8" height="26" rx="2" fill="white" opacity="0.9" />
            
            {/* Linha 3 */}
            <rect x="25" y="68" width="12" height="12" rx="2" fill="white" opacity="0.9" />
            <rect x="39" y="68" width="12" height="12" rx="2" fill="white" opacity="0.9" />
            <rect x="53" y="68" width="12" height="12" rx="2" fill="white" opacity="0.9" />
          </g>

          {/* Símbolo IA */}
          <g transform="translate(90, 20)">
            <circle cx="25" cy="25" r="20" fill="url(#logoGradient)" opacity="0.8" />
            <path
              d="M15 25L25 15L35 25L25 35L15 25Z"
              fill="white"
              stroke="var(--primary-color)"
              strokeWidth="2"
            />
            <circle cx="25" cy="25" r="3" fill="var(--primary-color)" />
          </g>

          {/* Linhas de conexão */}
          <path
            d="M82 35 Q 86 35, 90 35"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeDasharray="2 2"
          />
        </g>
      </LogoSVG>
      
      <LogoText>
        <div className="company-name">DGSolutionWEB</div>
        <div className="product-name">CalculaIA</div>
      </LogoText>
    </LogoContainer>
  );
};

export default Logo;
