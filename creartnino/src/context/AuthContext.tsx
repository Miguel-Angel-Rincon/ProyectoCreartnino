// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import avatarImg from '../assets/Imagenes/avatar-default.png';

interface Usuario {
  nombreCompleto: string;
  correo: string;
  celular: string;
  direccion: string;
  rol: 'admin' | 'cliente';
  imagen?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  iniciarSesion: (datos: Usuario) => void;
  cerrarSesion: () => void;
  avatar: string;
  setAvatar: (nuevoAvatar: string) => void;
}

export const AuthContext = createContext<AuthContextType>({
  usuario: null,
  isAuthenticated: false,
  iniciarSesion: () => {},
  cerrarSesion: () => {},
  avatar: avatarImg,
  setAvatar: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const almacenado = localStorage.getItem('usuario');
    return almacenado ? JSON.parse(almacenado) : null;
  });

  const [avatar, setAvatar] = useState<string>(() => {
    return localStorage.getItem('avatarPerfil') || avatarImg;
  });

  const iniciarSesion = (datos: Usuario) => {
    setUsuario(datos);
    localStorage.setItem('usuario', JSON.stringify(datos));
    if (datos.imagen) {
      localStorage.setItem('avatarPerfil', datos.imagen);
      setAvatar(datos.imagen);
    }
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('avatarPerfil');
    setAvatar(avatarImg);
  };

  useEffect(() => {
    const almacenado = localStorage.getItem('usuario');
    const avatarStored = localStorage.getItem('avatarPerfil');
    if (almacenado) setUsuario(JSON.parse(almacenado));
    if (avatarStored) setAvatar(avatarStored);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        iniciarSesion,
        cerrarSesion,
        isAuthenticated: !!usuario,
        avatar,
        setAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
