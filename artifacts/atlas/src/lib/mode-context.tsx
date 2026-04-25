import React, { createContext, useContext, useState, useEffect } from 'react';

type Mode = 'calm' | 'crisis';

const MODE_KEY = 'atlas_mode';

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

function loadInitialMode(): Mode {
  if (typeof window === 'undefined') return 'calm';
  try {
    const raw = localStorage.getItem(MODE_KEY);
    return raw === 'crisis' ? 'crisis' : 'calm';
  } catch {
    return 'calm';
  }
}

export const ModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setModeState] = useState<Mode>(loadInitialMode);

  useEffect(() => {
    if (mode === 'crisis') {
      document.body.classList.add('theme-crisis');
    } else {
      document.body.classList.remove('theme-crisis');
    }
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      // ignore quota / privacy errors
    }
  }, [mode]);

  const setMode = (m: Mode) => setModeState(m);
  const toggleMode = () => {
    setModeState((prev) => (prev === 'calm' ? 'crisis' : 'calm'));
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => useContext(ModeContext);
