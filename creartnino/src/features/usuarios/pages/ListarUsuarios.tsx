import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import CrearUsuarioModal from "./Crear";
import EditarUsuarioModal from "./Editar";
import VerUsuarioModal from "./Ver";
import type { IUsuarios } from "../../interfaces/IUsuarios";

const ListarUsuarios: React.FC = () => {
  const [Usuarios, setUsuarios] = useState<IUsuarios[]>([]);
  const [roles, setRoles] = useState<{ IdRol: number; Rol: string; Descripcion: string }[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [usuarioVer, setUsuarioVer] = useState<IUsuarios | null>(null);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [UsuarioEditar, setUsuarioEditar] = useState<IUsuarios | null>(null);
  const UsuariosPorPagina = 6;

  // =================== FETCH USUARIOS ===================
  const obtenerUsuarios = async () => {
    try {
      const response = await fetch("https://apicreartnino.somee.com/api/Usuarios/Lista");
      if (!response.ok) throw new Error("Error al obtener usuarios");
      const data: IUsuarios[] = await response.json();
      setUsuarios(data.sort((a, b) => (b.IdUsuarios ?? 0) - (a.IdUsuarios ?? 0)));

    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los usuarios",
      });
    }
  };

  // =================== FETCH ROLES ===================
  const obtenerRoles = async () => {
    try {
      const response = await fetch("https://apicreartnino.somee.com/api/Roles/Lista");
      if (!response.ok) throw new Error("Error al obtener roles");
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los roles",
      });
    }
  };

  useEffect(() => {
    obtenerUsuarios();
    obtenerRoles();
  }, []);

  // =================== OBTENER NOMBRE DEL ROL ===================
  const getRoleName = (id: number) => {
    const rol = roles.find((r) => r.IdRol === id);
    return rol ? rol.Rol : "Desconocido";
  };

  // =================== ELIMINAR USUARIO ===================
  const handleEliminarUsuarios = async (id: number, estado: boolean) => {
    if (estado) {
      Swal.fire({
        icon: "warning",
        title: "Usuario activo",
        text: "No puedes eliminar un Usuario que está activo. Desactívalo primero.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      html:
        "Esta acción eliminará <strong>permanentemente</strong> el usuario y no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    
    if (!confirm.isConfirmed) return;

    try {
      const resp = await fetch(
        `https://apicreartnino.somee.com/api/Usuarios/Eliminar/${id}`,
        { method: "DELETE" }
      );

      if (!resp.ok) {
        // intentar leer mensaje del servidor
        let detalle = "";
        try {
          const json = await resp.json();
          detalle =
            json?.message || json?.Message || json?.mensaje || json?.error || "";
        } catch {
          /* no hay body JSON */
        }

        // 409 -> conflicto por relaciones (ej. pedido asociado)
        if (resp.status === 409) {
          Swal.fire({
            icon: "error",
            title: "No permitido",
            text: "No se puede eliminar este usuario porque está asociado a un pedido.",
          });
          return;
        }

        // mostrar detalle si existe, sino mensaje genérico explicando la posible causa
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            detalle ||
            "No se pudo eliminar el usuario. Es posible que esté asociado a pedidos u otros registros.",
        });
        return;
      }

      // éxito
      await obtenerUsuarios();
      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "El Usuario ha sido eliminado correctamente",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Eliminar usuario:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "No se pudo eliminar el usuario. Es posible que esté asociado a pedidos u otros registros o que exista un problema de conexión.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  // =================== CAMBIO DE ESTADO ===================
  const handleEstadoChange = async (id: number) => {
    const target = Usuarios.find((u) => u.IdUsuarios === id);
    if (!target) return;

    // Si se intenta DESACTIVAR (estado actual true) pedir confirmación
    if (target.Estado) {
      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción desactivará el usuario. ¿Deseas continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, desactivar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
      });
      if (!confirmacion.isConfirmed) return;
    } else {
      // Si se va a ACTIVAR (estado actual false), pedir confirmación
      const confirmacion = await Swal.fire({
        title: "¿Activar usuario?",
        text: "¿Deseas activar este usuario y permitirle el acceso al sistema?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, activar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#3085d6",
      });
      if (!confirmacion.isConfirmed) return;
    }

    // 🧩 Verificar si el usuario es un ADMIN
    const rolAdmin = roles.find(
      (r) =>
        r.Rol.toLowerCase() === "admin" ||
        r.Rol.toLowerCase() === "administrador"
    );
    const esAdmin = target.IdRol === rolAdmin?.IdRol;

    // 🔒 Verificar si es el último admin activo (sólo aplica al intentar desactivar)
    if (esAdmin && target.Estado) {
      const adminsActivos = Usuarios.filter(
        (u) => u.IdRol === rolAdmin?.IdRol && u.Estado
      );

      if (adminsActivos.length <= 1) {
        Swal.fire({
          icon: "warning",
          title: "No permitido",
          text: "Debe haber al menos un administrador activo.",
          timer: 4000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }
    }

    // ✅ Si pasa la validación, proceder con el cambio
    const actualizado: IUsuarios = { ...target, Estado: !target.Estado };

    try {
      const resp = await fetch(
        `https://apicreartnino.somee.com/api/Usuarios/Actualizar/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(actualizado),
        }
      );

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      await obtenerUsuarios();

      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: `Estado actualizado correctamente`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("actualizarEstado:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado del usuario.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };


  // =================== CREAR, EDITAR, V3ER ===================
  const handleCrear = async (_nuevoUsuario: IUsuarios) => {
  await obtenerUsuarios(); // 🔄 refrescar
};


  const handleVerUsuario = (usuario: IUsuarios) => {
    setUsuarioVer(usuario);
    setMostrarVerModal(true);
  };

  const handleEditarUsuario = (usuario: IUsuarios) => {
    setUsuarioEditar(usuario);
    setMostrarEditarModal(true);
  };

  const handleActualizarUsuario = async (_usuarioActualizado: IUsuarios) => {
    setMostrarEditarModal(false);
    await obtenerUsuarios(); // 🔄 refrescar lista
  };

  // =================== FILTRADO Y PAGINACIÓN ===================
  const UsuariosFiltrados = Usuarios.filter(
    (p) =>
      p.NombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.NumDocumento.includes(busqueda) ||
      getRoleName(p.IdRol).toLowerCase().includes(busqueda.toLowerCase()) ||
      p.Celular.includes(busqueda)
  );

  const indexInicio = (paginaActual - 1) * UsuariosPorPagina;
  const indexFin = indexInicio + UsuariosPorPagina;
  const UsuariosPagina = UsuariosFiltrados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(UsuariosFiltrados.length / UsuariosPorPagina);

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Usuarios Registrados</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>
          Crear Usuario
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por Nombre del usuario"
        className="form-control mb-3 buscador"
        value={busqueda}
        onChange={(e) => {
          const value = e.target.value;
          if (value.trim() === "" && value !== "") return;
          setBusqueda(value);
          setPaginaActual(1);
        }}
      />

      <div className="tabla-container">
        <table className="table tabla-proveedores">
          <thead>
            <tr>
              <th># Documento</th>
              <th>Nombre Completo</th>
              <th>Celular</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {UsuariosPagina.map((p, index) => (
              <tr key={p.IdUsuarios} className={index % 2 === 0 ? "fila-par" : "fila-impar"}>
                <td>
                  {p.TipoDocumento} {p.NumDocumento}
                </td>
                <td>{p.NombreCompleto}</td>
                <td>{p.Celular}</td>
                <td>{getRoleName(p.IdRol)}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={p.Estado}
                      onChange={() => handleEstadoChange(p.IdUsuarios)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={() => handleVerUsuario(p)}
                  />
                  <FaEdit
                    className="icono text-warning"
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={() => handleEditarUsuario(p)}
                  />
                  <FaTrash
                    className="icono text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEliminarUsuarios(p.IdUsuarios, p.Estado)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
        <div className="d-flex justify-content-center align-items-center mt-4 mb-3">
          <button
            className="btn btn-light me-2"
            onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaActual === 1}
          >
            «
          </button>

          {paginaActual > 1 && (
            <button className="btn btn-light me-2" onClick={() => setPaginaActual(paginaActual - 1)}>
              {paginaActual - 1}
            </button>
          )}

          <button className="btn btn-pink me-2">{paginaActual}</button>

          {paginaActual < totalPaginas && (
            <button className="btn btn-light me-2" onClick={() => setPaginaActual(paginaActual + 1)}>
              {paginaActual + 1}
            </button>
          )}

          <button
            className="btn btn-light"
            onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
            disabled={paginaActual === totalPaginas}
          >
            »
          </button>
        </div>
      </div>

      {/* MODALES */}
      {mostrarModal && (
        <CrearUsuarioModal onClose={() => setMostrarModal(false)} onCrear={handleCrear} />
      )}

      {mostrarEditarModal && UsuarioEditar && (
        <EditarUsuarioModal
          usuario={{ ...UsuarioEditar, Contrasena: UsuarioEditar.Contrasena ?? "" }}
          onClose={() => setMostrarEditarModal(false)}
          onEditar={handleActualizarUsuario}
        />
      )}

      {mostrarVerModal && usuarioVer && (
        <VerUsuarioModal
          usuario={{ ...usuarioVer, Contrasena: usuarioVer.Contrasena ?? "" }}
          onClose={() => setMostrarVerModal(false)}
        />
      )}
    </div>
  );
};

export default ListarUsuarios;
