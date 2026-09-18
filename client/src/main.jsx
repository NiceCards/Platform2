import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <App />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  borderRadius: '12px',
                  background: 'rgba(26, 23, 18, 0.95)',
                  color: '#f1f5f9',
                  backdropFilter: 'blur(8px)',
                },
                success: { iconTheme: { primary: '#a06d11', secondary: '#ffffff' } },
                error: { iconTheme: { primary: '#e11d48', secondary: '#ffffff' } },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
