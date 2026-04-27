import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import App from './App.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { store } from './store.js';
import '@campaign-manager/ui/tokens.css';
import './styles.css';

async function bootstrap(): Promise<void> {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW === '1') {
    const { worker } = await import('./mocks/browser.js');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  const root = document.getElementById('root');
  if (!root) throw new Error('#root not found');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <App />
          <Toaster position="top-right" richColors closeButton />
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}

void bootstrap();
