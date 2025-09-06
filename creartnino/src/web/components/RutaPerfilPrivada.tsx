import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { JSX } from "react";

const RutaPerfilPrivada = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();

  // 🔒 Si no está autenticado, redirige a ingresar
  if (!isAuthenticated) {
    return <Navigate to="/ingresar" />;
  }

  // ✅ Si está autenticado (sea admin o cliente), puede entrar
  return children;
};

export default RutaPerfilPrivada;
