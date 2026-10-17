import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { App } from './app';
import { Providers } from './app/providers';
import './style.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Providers>
        <App />
        <Toaster position="bottom-right" richColors closeButton />
      </Providers>
    </BrowserRouter>
  </StrictMode>,
);
