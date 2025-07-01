// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

interface Usuario {
  nombreCompleto: string;
  correo: string;
  celular: string;
  direccion: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  iniciarSesion: (datos: Usuario) => void;
  cerrarSesion: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  usuario: null,
  isAuthenticated: false,
  iniciarSesion: () => {},
  cerrarSesion: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const almacenado = localStorage.getItem('usuario');
    return almacenado ? JSON.parse(almacenado) : null;
  });

  const iniciarSesion = (datos: Usuario) => {
    setUsuario(datos);
    localStorage.setItem('usuario', JSON.stringify(datos));
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('avatarPerfil'); // ✅ Elimina solo el avatar personalizado
  };

  useEffect(() => {
    const almacenado = localStorage.getItem('usuario');
    if (almacenado) setUsuario(JSON.parse(almacenado));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        iniciarSesion,
        cerrarSesion,
        isAuthenticated: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
