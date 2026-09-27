import React, { createContext, useContext } from 'react';

const StudioBaseContext = createContext({ basePath: '' });

export function StudioBaseProvider({ basePath = '', children }) {
  const normalized = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  return (
    <StudioBaseContext.Provider value={{ basePath: normalized }}>
      {children}
    </StudioBaseContext.Provider>
  );
}

export function useStudioBase() {
  return useContext(StudioBaseContext);
}
