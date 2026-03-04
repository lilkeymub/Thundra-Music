import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthModal } from '@/components/AuthModal';

interface AuthModalContextType {
  openAuthModal: (options?: { mode?: 'login' | 'signup'; message?: string }) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
};

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState<string | undefined>();

  const openAuthModal = (options?: { mode?: 'login' | 'signup'; message?: string }) => {
    setMode(options?.mode || 'login');
    setMessage(options?.message);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
    setMessage(undefined);
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      <AuthModal
        isOpen={isOpen}
        onClose={closeAuthModal}
        defaultMode={mode}
        message={message}
      />
    </AuthModalContext.Provider>
  );
};
