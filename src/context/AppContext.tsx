import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  screen: string;
  entityId: number | null;
  dataSnapshot: unknown;
  setScreen: (screen: string) => void;
  setEntityId: (id: number | null) => void;
  setDataSnapshot: (data: unknown) => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [screen, setScreen] = useState<string>('fixtures');
  const [entityId, setEntityId] = useState<number | null>(null);
  const [dataSnapshot, setDataSnapshot] = useState<unknown>(null);

  return (
    <AppContext.Provider
      value={{
        screen,
        entityId,
        dataSnapshot,
        setScreen,
        setEntityId,
        setDataSnapshot,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

