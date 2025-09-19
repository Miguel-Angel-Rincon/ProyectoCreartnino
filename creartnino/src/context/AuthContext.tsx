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
  permisos: string[];
  cargarPermisos: (idRol: number) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  usuario: null,
  token: null,
  isAuthenticated: false,
  iniciarSesion: () => {},
  cerrarSesion: () => {},
  avatar: avatarImg,
  setAvatar: () => {},
  permisos: [],
  cargarPermisos: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<IUsuarios | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string>(avatarImg);
  const [permisos, setPermisos] = useState<string[]>([]);

  // 🔑 Inicia sesión y guarda usuario + token + permisos
  const iniciarSesion = (datos: IUsuarios, token: string) => {
    const nuevoUsuario = { ...datos };

    setUsuario(nuevoUsuario);
    localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));

    setToken(token);
    localStorage.setItem("token", token);

    if (datos.IdRolNavigation?.Rol) {
      localStorage.setItem("rolUsuario", datos.IdRolNavigation.Rol);
    }

    if (datos.IdRol) {
      cargarPermisos(datos.IdRol);
    }
  };

  // 🔑 Cierra sesión y limpia todo
  const cerrarSesion = () => {
    setUsuario(null);
    setToken(null);
    setPermisos([]);
    setAvatar(avatarImg);

    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    localStorage.removeItem("avatarPerfil");
    localStorage.removeItem("rolUsuario");
    localStorage.removeItem("permisos");
  };

  // 🔑 Carga permisos de la API
  const cargarPermisos = async (idRol: number) => {
    try {
      // 1️⃣ Obtenemos TODA la lista de permisos
      const permisosRes = await fetch(
        "https://www.apicreartnino.somee.com/api/Permisos/Lista"
      );
      if (!permisosRes.ok) throw new Error("No se pudieron cargar permisos");
      const permisosData: { IdPermisos: number; RolPermisos: string }[] =
        await permisosRes.json();

      // 2️⃣ Obtenemos qué permisos tiene el rol
      const rolPermisosRes = await fetch(
        "https://www.apicreartnino.somee.com/api/RolPermisos/Lista"
      );
      if (!rolPermisosRes.ok) throw new Error("No se pudieron cargar roles");
      const rolPermisosData: { IdRol: number; IdPermisos: number }[] =
        await rolPermisosRes.json();

      // 3️⃣ Filtramos permisos por el rol actual
      const idsPermisosRol = rolPermisosData
        .filter((rp) => rp.IdRol === idRol)
        .map((rp) => rp.IdPermisos);

      const listaPermisos = permisosData
        .filter((permiso) => idsPermisosRol.includes(permiso.IdPermisos))
        .map((permiso) => permiso.RolPermisos);

      setPermisos(listaPermisos);
      localStorage.setItem("permisos", JSON.stringify(listaPermisos));
    } catch (error) {
      console.error("Error cargando permisos:", error);
    }
  };

  // 🔄 Recupera datos guardados en localStorage al recargar
  useEffect(() => {
    const almacenado = localStorage.getItem("usuario");
    const tokenStored = localStorage.getItem("token");
    const avatarStored = localStorage.getItem("avatarPerfil");
    const permisosStored = localStorage.getItem("permisos");

    if (almacenado) setUsuario(JSON.parse(almacenado));
    if (tokenStored) setToken(tokenStored);
    if (avatarStored) setAvatar(avatarStored);
    if (permisosStored) setPermisos(JSON.parse(permisosStored));
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
        permisos,
        cargarPermisos,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
