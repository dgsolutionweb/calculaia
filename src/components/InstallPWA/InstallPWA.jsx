import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { FiDownload } from 'react-icons/fi';

const InstallButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--success-color);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 24px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    padding: 10px 20px;
    font-size: 0.9rem;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      const result = await deferredPrompt.prompt();
      console.log('Install prompt result:', result);
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  if (!isInstallable) return null;

  return (
    <InstallButton onClick={handleInstallClick}>
      <FiDownload /> Instalar App
    </InstallButton>
  );
};

export default InstallPWA;
