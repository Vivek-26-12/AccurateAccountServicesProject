// DataContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface DataContextType {
  refreshUsers: () => void;
  refreshClients: () => void;
}

const DataContext = createContext<DataContextType>({
  refreshUsers: () => {},
  refreshClients: () => {},
});

export const DataProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [userVersion, setUserVersion] = useState(0);
  const [clientVersion, setClientVersion] = useState(0);

  const refreshUsers = () => setUserVersion(v => v + 1);
  const refreshClients = () => setClientVersion(v => v + 1);

  return (
    <DataContext.Provider value={{ refreshUsers, refreshClients }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);