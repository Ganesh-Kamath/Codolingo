import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/common/Toast';
import { AppContent } from './App';
import './styles/index.css';

const container = document.getElementById('root') || document.getElementById('app') || document.body;

ReactDOM.createRoot(container as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  </React.StrictMode>
);
