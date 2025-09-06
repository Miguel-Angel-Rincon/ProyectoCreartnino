// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import avatarImg from "../assets/Imagenes/avatar-default.png";
import type { IUsuarios } from "../features/interfaces/IUsuarios";

interface AuthContextType {
  usuario: IUsuarios | null;
  token: string | null;
  isAuthenticated: boolean;
  iniciarSesion: (datos: IUsuarios, token: string) => void;
  cerrarSesion: () => void;
  avatar: string;
  setAvatar: (nuevoAvatar: string) => void;
}

export const AuthContext = createContext<AuthContextType>({
  usuario: null,
  token: null,
  isAuthenticated: false,
  iniciarSesion: () => {},
  cerrarSesion: () => {},
  avatar: avatarImg,
  setAvatar: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<IUsuarios | null>(() => {
    const almacenado = localStorage.getItem("usuario");
    return almacenado ? JSON.parse(almacenado) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token") || null;
  });

  const [avatar, setAvatar] = useState<string>(() => {
    return localStorage.getItem("avatarPerfil") || avatarImg;
  });

  const iniciarSesion = (datos: IUsuarios, token: string) => {
    setUsuario((prev) => {
      const nuevoUsuario = { ...prev, ...datos }; // 🔥 fusiona con lo anterior
      localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));

      console.log("✅ Usuario guardado en localStorage:", nuevoUsuario);

      return nuevoUsuario;
    });

    setToken(token);
    localStorage.setItem("token", token);

    if (datos.IdRolNavigation?.NombreRol) {
      localStorage.setItem("rolUsuario", datos.IdRolNavigation.NombreRol);
    }
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    localStorage.removeItem("avatarPerfil");
    localStorage.removeItem("rolUsuario");
    setAvatar(avatarImg);

    console.log("❌ Sesión cerrada, storage limpio");
  };

  useEffect(() => {
    const almacenado = localStorage.getItem("usuario");
    const tokenStored = localStorage.getItem("token");
    const avatarStored = localStorage.getItem("avatarPerfil");

    if (almacenado) {
      try {
        setUsuario(JSON.parse(almacenado));
      } catch {
        localStorage.removeItem("usuario");
      }
    }
    if (tokenStored) setToken(tokenStored);
    if (avatarStored) setAvatar(avatarStored);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        iniciarSesion,
        cerrarSesion,
        isAuthenticated: !!usuario && !!token,
        avatar,
        setAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
