// src/web/components/RutaClientePrivada.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { JSX } from "react";

const RutaClientePrivada = ({ children }: { children: JSX.Element }) => {
  const { usuario, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/Ingresar" />;
  }

  // Solo cliente (idRol === 4) puede entrar
  if (usuario?.IdRol !== 4) {
    return <Navigate to="/dashboard" />; // si es admin lo mandamos al panel
  }

  return children;
};

export default RutaClientePrivada;
