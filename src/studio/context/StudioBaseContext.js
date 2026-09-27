import React, { createContext, useContext, useCallback } from 'react';

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

// Resolves an in-app path ("/crm/leads") against the mount point ("/studio" or "").
export function useStudioPath() {
  const { basePath } = useStudioBase();
  return useCallback(
    (to) => `${basePath}${to.startsWith('/') ? to : `/${to}`}`,
    [basePath]
  );
}
