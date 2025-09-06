// src/web/components/RutaAdminPrivada.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { JSX } from "react";

const RutaAdminPrivada = ({ children }: { children: JSX.Element }) => {
  const { usuario, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/Ingresar" />;
  }

  // Solo admin (idRol === 1) puede entrar
  if (usuario?.IdRol !== 1) {
    return <Navigate to="/" />; // si es cliente lo mandamos al inicio
  }

  return children;
};

export default RutaAdminPrivada;
