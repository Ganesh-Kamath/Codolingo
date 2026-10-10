import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/common/Toast';
import { AppContent } from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './styles/index.css';

const container = document.getElementById('root') || document.getElementById('app') || document.body;

ReactDOM.createRoot(container as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
