import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { AppContent } from './App';
import './styles/index.css';

const container = document.getElementById('root') || document.getElementById('app') || document.body;

ReactDOM.createRoot(container as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </React.StrictMode>
);
