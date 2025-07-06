// src/web/components/RutaAdminPrivada.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { JSX } from 'react';

const RutaAdminPrivada = ({ children }: { children: JSX.Element }) => {
  const { usuario, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/Ingresar" />;
  }

  if (usuario?.rol !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default RutaAdminPrivada;
