// src/components/ListarClientes.tsx
import React, { useEffect, useState } from "react";
import "../styles/style.css";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

import CrearClienteModal from "./Crear";
import EditarClienteModal from "./Editar";
import VerClienteModal from "./Ver";

import { APP_SETTINGS } from "../../../settings/appsettings";
import type { IClientes } from "../../interfaces/IClientes";

const clientesPorPagina = 6;

const ListarClientes: React.FC = () => {
  const [clientes, setClientes] = useState<IClientes[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [clienteEditar, setClienteEditar] = useState<IClientes | null>(null);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [clienteVer, setClienteVer] = useState<IClientes | null>(null);

  // Construcción segura de la base API
  const apiBaseRaw =
    (APP_SETTINGS as any).apiUrl ??
    (APP_SETTINGS as any).API_URL ??
    (APP_SETTINGS as any).API_URL_BASE ??
    "";
  const apiBase = apiBaseRaw.replace(/\/+$/, "");
  const buildUrl = (path: string) => `${apiBase}/${path.replace(/^\/+/, "")}`;

  // Helpers para estado
  const getEstado = (c: any): boolean => !!(c?.Estado ?? c?.estado ?? false);
  const setEstadoKey = (obj: any, value: boolean) => {
    if ("Estado" in obj) obj.Estado = value;
    else if ("estado" in obj) obj.estado = value;
    else obj.Estado = value;
    return obj;
  };

  // --- Cargar clientes ---
  useEffect(() => {
    obtenerClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const obtenerClientes = async () => {
    try {
      const resp = await fetch(buildUrl("Clientes/Lista"));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: IClientes[] = await resp.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("obtenerClientes:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los clientes.",
        confirmButtonColor: "#e83e8c",
      });
    }
  };

  // --- Eliminar cliente ---
  const handleEliminarCliente = (id: number, estado: boolean) => {
    if (estado) {
      Swal.fire({
        icon: "warning",
        title: "Cliente activo",
        text: "No puedes eliminar un cliente activo. Desactívalo primero.",
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
          const resp = await fetch(buildUrl(`Clientes/Eliminar/${id}`), {
            method: "DELETE",
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          setClientes((prev) => prev.filter((c) => c.IdCliente !== id));
          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "El cliente ha sido eliminado correctamente",
            confirmButtonColor: "#e83e8c",
          });
        } catch (err) {
          console.error("eliminarCliente:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar el cliente.",
            confirmButtonColor: "#e83e8c",
          });
        }
      }
    });
  };

  // --- Cambiar estado ---
  const handleEstadoChange = async (id: number) => {
    const target = clientes.find((c) => c.IdCliente === id);
    if (!target) return;

    const current = getEstado(target);
    const actualizado = setEstadoKey({ ...target }, !current) as IClientes;

    setClientes((prev) =>
      prev.map((c) => (c.IdCliente === id ? actualizado : c))
    );

    try {
      const resp = await fetch(buildUrl(`Clientes/Actualizar/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actualizado),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      await obtenerClientes();
    } catch (err) {
      console.error("actualizarEstado:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado del cliente.",
        confirmButtonColor: "#e83e8c",
      });
      setClientes((prev) =>
        prev.map((c) => (c.IdCliente === id ? target : c))
      );
    }
  };

  // --- Abrir modales ---
  const handleEditarCliente = (cliente: IClientes) => {
    setClienteEditar(cliente);
    setMostrarEditarModal(true);
  };
  const handleVerCliente = (cliente: IClientes) => {
    setClienteVer(cliente);
    setMostrarVerModal(true);
  };

  // --- Filtro búsqueda ---
  const clientesFiltrados = clientes.filter((c) => {
    const nombre = (c.NombreCompleto ?? "").toString();
    const documento = (c.NumDocumento ?? "").toString();
    const correo = (c.Correo ?? "").toString();
    const celular = (c.Celular ?? "").toString();

    return (
      nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      documento.includes(busqueda) ||
      correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      celular.includes(busqueda)
    );
  });

  // --- Paginación ---
  const indexInicio = (paginaActual - 1) * clientesPorPagina;
  const clientesPagina = clientesFiltrados.slice(
    indexInicio,
    indexInicio + clientesPorPagina
  );
  const totalPaginas = Math.max(
    1,
    Math.ceil(clientesFiltrados.length / clientesPorPagina)
  );

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Clientes</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>
          Crear Cliente
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por Nombre, Documento, Correo o Celular"
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
              <th>Correo</th>
              <th>Celular</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesPagina.map((c, index) => (
              <tr
                key={c.IdCliente}
                className={index % 2 === 0 ? "fila-par" : "fila-impar"}
              >
                <td>
                  {c.TipoDocumento ?? ""} {c.NumDocumento ?? ""}
                </td>
                <td>{c.NombreCompleto}</td>
                <td>{c.Correo}</td>
                <td>{c.Celular}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={getEstado(c)}
                      onChange={() =>
                        typeof c.IdCliente === "number" &&
                        handleEstadoChange(c.IdCliente)
                      }
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <FaEye
                    className="icono text-info"
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={() => handleVerCliente(c)}
                  />
                  <FaEdit
                    className="icono text-warning"
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={() => handleEditarCliente(c)}
                  />
                  <FaTrash
                    className="icono text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      typeof c.IdCliente === "number" &&
                      handleEliminarCliente(c.IdCliente, getEstado(c))
                    }
                  />
                </td>
              </tr>
            ))}
            {clientesPagina.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">
                  No hay clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="paginacion text-end">
          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i}
              className={`btn me-2 ${
                paginaActual === i + 1 ? "btn-pink" : "btn-light"
              }`}
              onClick={() => setPaginaActual(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Crear Cliente */}
      {mostrarModal && (
        <CrearClienteModal
          onClose={() => setMostrarModal(false)}
          onCrear={() => {
  obtenerClientes(); // 🔄 recargar lista real
  setPaginaActual(1);
  setMostrarModal(false);
  Swal.fire({
    icon: "success",
    title: "Cliente creado correctamente",
    confirmButtonColor: "#e83e8c",
  });
}}

        />
      )}

            {/* Editar Cliente */}
      {mostrarEditarModal && clienteEditar && (
        <EditarClienteModal
          cliente={clienteEditar}
          onClose={() => setMostrarEditarModal(false)}
          onEditar={() => {
            obtenerClientes(); // 🔄 recargar lista
            setMostrarEditarModal(false);
            Swal.fire({
              icon: "success",
              title: "Cliente actualizado correctamente",
              confirmButtonColor: "#e83e8c",
            });
          }}
        />
      )}

      {/* Ver Cliente */}
      {mostrarVerModal && clienteVer && (
        <VerClienteModal
          cliente={clienteVer}
          onClose={() => setMostrarVerModal(false)}
        />
      )}

    </div>
  );
};

export default ListarClientes;
