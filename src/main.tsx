import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Set dark mode as default
if (!document.documentElement.classList.contains('dark') && !document.documentElement.classList.contains('light')) {
  document.documentElement.classList.add('dark');
}

// Get base path for GitHub Pages
// Vite automatically sets import.meta.env.BASE_URL based on vite.config.ts base option
// For GitHub Pages project sites, this will be '/repository-name/'
// For user/organization sites, this will be '/'
const basePath = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      basename={basePath}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

