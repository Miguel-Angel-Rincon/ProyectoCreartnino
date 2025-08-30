// src/components/ListarProveedores.tsx
import React, { useEffect, useState } from "react";
import "../style/Listar.css";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

import CrearProveedorModal from "./NuevoProveedor";
import EditarProveedorModal from "./Editar";
import VerProveedoresModal from "./Ver";

import { APP_SETTINGS } from "../../../settings/appsettings";
import type { IProveedores } from "../../interfaces/IProveedores";

const productosPorPagina = 6;

const ListarProveedores: React.FC = () => {
  const [proveedores, setProveedores] = useState<IProveedores[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [proveedorEditar, setProveedoresEditar] = useState<IProveedores | null>(null);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [proveedorVer, setProveedorVer] = useState<IProveedores | null>(null);

  // --- Construcción segura de la base API (soporta APP_SETTINGS.apiUrl u otras variantes) ---
  const apiBaseRaw = (APP_SETTINGS as any).apiUrl ?? (APP_SETTINGS as any).API_URL ?? (APP_SETTINGS as any).API_URL_BASE ?? "";
  const apiBase = apiBaseRaw.replace(/\/+$/, ""); // quitar slash final si existe
  const buildUrl = (path: string) => `${apiBase}/${path.replace(/^\/+/, "")}`;

  // --- Helpers para 'Estado' vs 'estado' ---
  const getEstado = (p: any): boolean => {
    return !!(p?.Estado ?? p?.estado ?? false);
  };
  const setEstadoKey = (obj: any, value: boolean) => {
    if ("Estado" in obj) obj.Estado = value;
    else if ("estado" in obj) obj.estado = value;
    else obj.Estado = value;
    return obj;
  };

  // --- Cargar proveedores al inicio ---
  useEffect(() => {
    obtenerProveedores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const obtenerProveedores = async () => {
    try {
      const resp = await fetch(buildUrl("Proveedores/Lista"));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: IProveedores[] = await resp.json();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("obtenerProveedores:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los proveedores.",
        confirmButtonColor: "#e83e8c",
      });
    }
  };

  // --- Eliminar proveedor ---
  const handleEliminarProducto = (id: number, estado: boolean) => {
    if (estado) {
      Swal.fire({
        icon: "warning",
        title: "Proveedor activo",
        text: "No puedes eliminar el proveedor que está activo. Desactívalo primero.",
        confirmButtonColor: "#e83e8c",
      });
      return;
    }

    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const resp = await fetch(buildUrl(`Proveedores/Eliminar/${id}`), {
            method: "DELETE",
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          setProveedores((prev) => prev.filter((p) => p.IdProveedor !== id));
          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "El proveedor ha sido eliminado correctamente",
            confirmButtonColor: "#e83e8c",
          });
        } catch (err) {
          console.error("eliminarProveedor:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar el proveedor.",
            confirmButtonColor: "#e83e8c",
          });
        }
      }
    });
  };

  // --- Cambiar estado (persistir con PUT /Actualizar/{id}) ---
  const handleEstadoChange = async (id: number) => {
    const target = proveedores.find((p) => p.IdProveedor === id);
    if (!target) return;

    const current = getEstado(target);
    const actualizado = setEstadoKey({ ...target } as any, !current) as IProveedores;

    // Optimista en UI
    setProveedores((prev) => prev.map((p) => (p.IdProveedor === id ? actualizado : p)));

    try {
      const resp = await fetch(buildUrl(`Proveedores/Actualizar/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actualizado),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      // sincronizar con servidor en caso de diferencias de formato
      await obtenerProveedores();
    } catch (err) {
      console.error("actualizarEstado:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado del proveedor.",
        confirmButtonColor: "#e83e8c",
      });
      // revertir
      setProveedores((prev) => prev.map((p) => (p.IdProveedor === id ? target : p)));
    }
  };

  // --- Abrir modales ---
  const handleEditarProveedor = (proveedor: IProveedores) => {
    setProveedoresEditar(proveedor);
    setMostrarEditarModal(true);
  };

  const handleVerProveedor = (Proveedor: IProveedores) => {
    setProveedorVer(Proveedor);
    setMostrarVerModal(true);
  };

  // --- Filtro búsqueda ---
  const proveedoresFiltrados = proveedores.filter((p) => {
    const nombre = (p.NombreCompleto ?? "").toString();
    const documento = (p.NumDocumento ?? "").toString();
    const ciudad = (p.Ciudad ?? "").toString();
    const celular = (p.Celular ?? "").toString();

    return (
      nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      documento.includes(busqueda) ||
      ciudad.toLowerCase().includes(busqueda.toLowerCase()) ||
      celular.includes(busqueda)
    );
  });

  // --- Paginación ---
  const indexInicio = (paginaActual - 1) * productosPorPagina;
  const proveedoresPagina = proveedoresFiltrados.slice(indexInicio, indexInicio + productosPorPagina);
  const totalPaginas = Math.max(1, Math.ceil(proveedoresFiltrados.length / productosPorPagina));

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Proveedores</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>
          Crear Proveedor
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por Nombre del Proveedor"
        className="form-control mb-3 buscador"
        value={busqueda}
        onChange={(e) => {
          setBusqueda(e.target.value);
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
              <th>Ciudad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresPagina.map((p, index) => (
              <tr key={p.IdProveedor} className={index % 2 === 0 ? "fila-par" : "fila-impar"}>
                <td>
                  {p.TipoDocumento ?? ""} {p.NumDocumento ?? ""}
                </td>
                <td>{p.NombreCompleto}</td>
                <td>{p.Celular}</td>
                <td>{p.Ciudad}</td>

                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={getEstado(p)}
                      onChange={() => typeof p.IdProveedor === "number" && handleEstadoChange(p.IdProveedor)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={() => handleVerProveedor(p)}
                  />
                  <FaEdit
                    className="icono text-warning"
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={() => handleEditarProveedor(p)}
                  />
                  <FaTrash
                    className="icono text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => typeof p.IdProveedor === "number" && handleEliminarProducto(p.IdProveedor, getEstado(p))}
                  />
                </td>
              </tr>
            ))}
            {proveedoresPagina.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">
                  No hay proveedores registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="paginacion text-end">
          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              className={`btn me-2 ${paginaActual === i + 1 ? "btn-pink" : "btn-light"}`}
              onClick={() => setPaginaActual(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Crear */}
      {mostrarModal && (
        <CrearProveedorModal
          onClose={() => setMostrarModal(false)}
          // El modal puede devolver el objeto creado o simplemente cerrar; manejamos ambos casos
          onCrear={async (nuevoProveedor: any) => {
            try {
              if (nuevoProveedor && nuevoProveedor.IdProveedores) {
                setProveedores((prev) => [...prev, nuevoProveedor as IProveedores]);
              } else {
                await obtenerProveedores();
              }
              setMostrarModal(false);
              Swal.fire({ icon: "success", title: "Proveedor creado correctamente", confirmButtonColor: "#e83e8c" });
            } catch (err) {
              console.error("onCrear:", err);
            }
          }}
        />
      )}

      {/* Editar */}
      {mostrarEditarModal && proveedorEditar && (
        <EditarProveedorModal
          proveedor={proveedorEditar}
          onClose={() => setMostrarEditarModal(false)}
          onEditar={async (proveedorActualizado: any) => {
            try {
              if (proveedorActualizado && proveedorActualizado.IdProveedores) {
                setProveedores((prev) =>
                  prev.map((p) => (p.IdProveedor === proveedorActualizado.IdProveedores ? proveedorActualizado : p))
                );
              } else {
                await obtenerProveedores();
              }
              setMostrarEditarModal(false);
              Swal.fire({
                icon: "success",
                title: "Proveedor actualizado correctamente",
                confirmButtonColor: "#e83e8c",
              });
            } catch (err) {
              console.error("onEditar:", err);
            }
          }}
        />
      )}

      {/* Ver */}
      {mostrarVerModal && proveedorVer && typeof proveedorVer.IdProveedor === "number" && (
        <VerProveedoresModal proveedor={proveedorVer} onClose={() => setMostrarVerModal(false)} />
      )}
    </div>
  );
};

export default ListarProveedores;
