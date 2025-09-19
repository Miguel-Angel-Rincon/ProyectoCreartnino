// src/web/components/RutaPrivada.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { JSX } from "react";

interface RutaPrivadaProps {
  children: JSX.Element;
  permisosRequeridos: string[]; // 🔑 ahora acepta varios permisos
}

const RutaPrivada = ({ children, permisosRequeridos }: RutaPrivadaProps) => {
  const { isAuthenticated, permisos } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/Ingresar" />;
  }

  // ✅ Verifica si el usuario tiene al menos un permiso válido
  const tienePermiso = permisosRequeridos.some((permiso) =>
    permisos.includes(permiso)
  );

  if (!tienePermiso) {
    return <Navigate to="/" />;
  }

  return children;
};

export default RutaPrivada;
