import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CaseProvider } from './context/CaseContext';
import { AppRoutes } from './AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CaseProvider>
          <AppRoutes />
        </CaseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
