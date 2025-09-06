// src/web/components/RutaPrivada.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { JSX } from 'react';

const RutaPrivada = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, usuario } = useAuth();

  // 🔒 Si no está autenticado, redirige a ingresar
  if (!isAuthenticated) {
    return <Navigate to="/ingresar" />;
  }

  // 🔒 Si no es cliente, lo mandamos al dashboard admin
  if (usuario?.IdRol !== 4) {
    return <Navigate to="/dashboard" />;
  }

  // ✅ Si es cliente, muestra la ruta protegida
  return children;
};

export default RutaPrivada;
