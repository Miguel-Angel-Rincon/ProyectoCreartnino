// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import Swal from "sweetalert2"; // 👈 Importamos Swal
import type { IUsuarios } from "../features/interfaces/IUsuarios";

interface AuthContextType {
  usuario: IUsuarios | null;
  token: string | null;
  isAuthenticated: boolean;
  iniciarSesion: (datos: IUsuarios, token: string) => Promise<void>;
  cerrarSesion: () => void;
  permisos: string[];
  cargarPermisos: (idRol: number) => Promise<void>;
  refrescarUsuario: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  usuario: null,
  token: null,
  isAuthenticated: false,
  iniciarSesion: async () => {},
  cerrarSesion: () => {},
  permisos: [],
  cargarPermisos: async () => {},
  refrescarUsuario: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<IUsuarios | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permisos, setPermisos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true); // 🟢 NUEVO

  // -------------------
  // 🟢 INICIAR SESIÓN
  // -------------------
  const iniciarSesion = async (datos: IUsuarios, token: string) => {
    let usuarioConId = datos;

    if (!datos.IdUsuarios && datos.NumDocumento) {
      try {
        const res = await fetch(
          `https://www.apicreartnino.somee.com/api/Usuarios/Lista`
        );
        if (res.ok) {
          const listaUsuarios: IUsuarios[] = await res.json();
          const encontrado = listaUsuarios.find(
            (u) => u.NumDocumento === datos.NumDocumento
          );
          if (encontrado) usuarioConId = encontrado;
        }
      } catch (error) {
        console.error("Error buscando usuario:", error);
      }
    }

    if (!usuarioConId.IdUsuarios) {
      console.error("⚠️ No se pudo obtener IdUsuarios", usuarioConId);
      return;
    }

    setUsuario(usuarioConId);
    localStorage.setItem("usuario", JSON.stringify(usuarioConId));
    setToken(token);
    localStorage.setItem("token", token);

    await refrescarUsuario();
  };

  // -------------------
  // 🔴 CERRAR SESIÓN
  // -------------------
  // 🔴 CERRAR SESIÓN
const cerrarSesion = (porInactividad: boolean = false) => {
  setUsuario(null);
  setToken(null);
  setPermisos([]);

  localStorage.removeItem("usuario");
  localStorage.removeItem("token");
  localStorage.removeItem("rolUsuario");
  localStorage.removeItem("permisos");

  if (porInactividad) {
    // 🔔 Mostrar aviso rápido (sin bloquear)
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: "Sesión cerrada por inactividad",
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
    }).then(() => {
      window.location.href = "/ingresar";
    });
  } else {
    window.location.href = "/ingresar";
  }
};


  // -------------------
  // 🔑 CARGAR PERMISOS
  // -------------------
  const cargarPermisos = async (idRol: number) => {
    try {
      const permisosRes = await fetch(
        "https://www.apicreartnino.somee.com/api/Permisos/Lista"
      );
      if (!permisosRes.ok) throw new Error("No se pudieron cargar permisos");
      const permisosData: { IdPermisos: number; RolPermisos: string }[] =
        await permisosRes.json();

      const rolPermisosRes = await fetch(
        "https://www.apicreartnino.somee.com/api/RolPermisos/Lista"
      );
      if (!rolPermisosRes.ok) throw new Error("No se pudieron cargar roles");
      const rolPermisosData: { IdRol: number; IdPermisos: number }[] =
        await rolPermisosRes.json();

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

  // -------------------
  // 🔄 REFRESCAR USUARIO
  // -------------------
  const refrescarUsuario = async () => {
    if (!usuario && !localStorage.getItem("usuario")) return;

    try {
      const res = await fetch(
        "https://www.apicreartnino.somee.com/api/Usuarios/Lista"
      );
      if (res.ok) {
        const lista: IUsuarios[] = await res.json();
        const userId =
          usuario?.IdUsuarios ||
          JSON.parse(localStorage.getItem("usuario") || "{}")?.IdUsuarios;

        const usuarioRefrescado = lista.find((u) => u.IdUsuarios === userId);

        if (usuarioRefrescado) {
          setUsuario(usuarioRefrescado);
          localStorage.setItem("usuario", JSON.stringify(usuarioRefrescado));

          if (usuarioRefrescado.IdRol) {
            await cargarPermisos(usuarioRefrescado.IdRol);
          }
        }
      }
    } catch (error) {
      console.error("Error refrescando usuario:", error);
    }
  };

  // -------------------
  // ⏱️ AUTO-LOGOUT CON ADVERTENCIA
  // -------------------
  useEffect(() => {
    if (!token) return;

    let logoutTimer: ReturnType<typeof setTimeout>;
let warningTimer: ReturnType<typeof setTimeout>;

    const iniciarContadores = () => {
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);

      // ⏳ Mostrar advertencia 1 minuto antes (a los 9 min)
      warningTimer = setTimeout(() => {
        Swal.fire({
          title: "¿Sigues allí?",
          text: "Tu sesión se cerrará en 1 minuto por inactividad.",
          icon: "warning",
          confirmButtonText: "Continuar",
          showCancelButton: true,
          cancelButtonText: "Cerrar sesión",
          confirmButtonColor: "#7d3cf0",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            iniciarContadores(); // 👈 reinicia el tiempo
          } else {
            cerrarSesion();
          }
        });
      }, 9 * 60 * 1000); // 9 minutos

      // 🔴 Logout automático a los 10 min
      logoutTimer = setTimeout(() => {
        cerrarSesion(true); // 
        
      }, 10 * 60 * 1000);
    };

    const resetTimer = () => iniciarContadores();

    const eventos = ["mousemove", "keydown", "click", "scroll"];
    eventos.forEach((e) => window.addEventListener(e, resetTimer));

    iniciarContadores();

    return () => {
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);
      eventos.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [token]);

  // -------------------
  // ♻️ RECUPERAR ESTADO AL RECARGAR
  // -------------------
   // ♻️ RECUPERAR ESTADO AL RECARGAR
  useEffect(() => {
    const almacenado = localStorage.getItem("usuario");
    const tokenStored = localStorage.getItem("token");

    if (almacenado) {
      const user = JSON.parse(almacenado);
      setUsuario(user);
      if (user?.IdRol) cargarPermisos(user.IdRol);
    }

    if (tokenStored) setToken(tokenStored);

    setLoading(false); // ✅ Termina carga
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        iniciarSesion,
        cerrarSesion,
        isAuthenticated: !!usuario && !!token,
        permisos,
        cargarPermisos,
        refrescarUsuario,
      }}
    >
      {/* ⏳ Mientras carga, puedes mostrar un spinner o nada */}
      {loading ? <div>Cargando...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
