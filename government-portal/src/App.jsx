import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import AppShell from './components/AppShell';

export default function App() {
  const [registrar, setRegistrar] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('bhoomichain_gov_token');
    const savedRegistrar = localStorage.getItem('bhoomichain_gov_user');
    if (savedToken && savedRegistrar) {
      try {
        setRegistrar(JSON.parse(savedRegistrar));
      } catch {
        // corrupt data — force re-login
      }
    }
  }, []);

  const handleLoginSuccess = (registrarData) => {
    setRegistrar(registrarData);
  };

  const handleLogout = () => {
    localStorage.removeItem('bhoomichain_gov_token');
    localStorage.removeItem('bhoomichain_gov_user');
    setRegistrar(null);
  };

  if (!registrar) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <AppShell registrar={registrar} onLogout={handleLogout} />;
}
