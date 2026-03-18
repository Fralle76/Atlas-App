import React, { createContext, useContext, useState, useEffect } from 'react';

type Mode = 'calm' | 'crisis';

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType>({
  mode: 'calm',
  setMode: () => {},
  toggleMode: () => {},
});

export const ModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<Mode>('calm');

  useEffect(() => {
    // Apply the theme class to the body for global styling
    if (mode === 'crisis') {
      document.body.classList.add('theme-crisis');
    } else {
      document.body.classList.remove('theme-crisis');
    }
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'calm' ? 'crisis' : 'calm'));
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => useContext(ModeContext);
