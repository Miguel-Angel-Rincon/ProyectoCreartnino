// src/components/ListarInsumos.tsx
import React, { useEffect, useState } from "react";
import "../styles/ListarInsumos.css";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

import CrearInsumoModal from "./CrearInsumo";
import EditarInsumoModal from "./EditarInsumo";
import VisualizarInsumoModal from "./VisualizarInsumo";

import { APP_SETTINGS } from "../../../settings/appsettings";
import type { IInsumos } from "../../interfaces/IInsumos";
import type { ICatInsumos } from "../../interfaces/ICatInsumos"; // 👈 interfaz de categorías de insumos

const INSUMOS_POR_PAGINA = 6;

const ListarInsumos: React.FC = () => {
  const [insumos, setInsumos] = useState<IInsumos[]>([]);
  const [categorias, setCategorias] = useState<ICatInsumos[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEditarModal, setMostrarEditarModal] = useState(false);
  const [insumoEditar, setInsumoEditar] = useState<IInsumos | null>(null);
  const [mostrarVerModal, setMostrarVerModal] = useState(false);
  const [insumoVer, setInsumoVer] = useState<IInsumos | null>(null);

  // --- API Base URL ---
  const apiBaseRaw =
    (APP_SETTINGS as any).apiUrl ??
    (APP_SETTINGS as any).API_URL ??
    (APP_SETTINGS as any).API_URL_BASE ??
    "";
  const apiBase = apiBaseRaw.replace(/\/+$/, "");
  const buildUrl = (path: string) => `${apiBase}/${path.replace(/^\/+/, "")}`;

  // --- Helpers Estado ---
  const getEstado = (i: any): boolean => !!(i?.Estado ?? i?.estado ?? false);
  const setEstadoKey = (obj: any, value: boolean) => {
    if ("Estado" in obj) obj.Estado = value;
    else if ("estado" in obj) obj.estado = value;
    else obj.Estado = value;
    return obj;
  };

  // --- Cargar insumos y categorías ---
  useEffect(() => {
    obtenerInsumos();
    obtenerCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const obtenerInsumos = async () => {
    try {
      const resp = await fetch(buildUrl("Insumos/Lista"));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: IInsumos[] = await resp.json();
      setInsumos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("obtenerInsumos:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los insumos.",
        confirmButtonColor: "#e83e8c",
      });
    }
  };

  const obtenerCategorias = async () => {
    try {
      const resp = await fetch(buildUrl("Categoria_Insumos/Lista"));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: ICatInsumos[] = await resp.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("obtenerCategorias:", err);
    }
  };

  // --- Eliminar insumo ---
  const handleEliminarInsumo = (id: number, estado: boolean) => {
    if (estado) {
      Swal.fire({
        icon: "warning",
        title: "Insumo activo",
        text: "No puedes eliminar un insumo activo. Desactívalo primero.",
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
          const resp = await fetch(buildUrl(`Insumos/Eliminar/${id}`), {
            method: "DELETE",
          });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          setInsumos((prev) => prev.filter((i) => i.IdInsumo !== id));
          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "El insumo ha sido eliminado correctamente",
            confirmButtonColor: "#e83e8c",
          });
        } catch (err) {
          console.error("eliminarInsumo:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar el insumo.",
            confirmButtonColor: "#e83e8c",
          });
        }
      }
    });
  };

  // --- Cambiar estado ---
  const handleEstadoChange = async (id: number) => {
    const target = insumos.find((i) => i.IdInsumo === id);
    if (!target) return;

    // 👇 Validación: no permitir desactivar si hay existencias
    if (getEstado(target) && target.Cantidad > 0) {
      Swal.fire({
        icon: "warning",
        title: "No permitido",
        text: "No puedes desactivar un insumo que aún tiene existencias.",
        confirmButtonColor: "#e83e8c",
      });
      return;
    }

    const current = getEstado(target);
    const actualizado = setEstadoKey({ ...target } as any, !current) as IInsumos;

    setInsumos((prev) =>
      prev.map((i) => (i.IdInsumo === id ? actualizado : i))
    );

    try {
      const resp = await fetch(buildUrl(`Insumos/Actualizar/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actualizado),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      await obtenerInsumos();
    } catch (err) {
      console.error("actualizarEstado:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado del insumo.",
        confirmButtonColor: "#e83e8c",
      });
      setInsumos((prev) =>
        prev.map((i) => (i.IdInsumo === id ? target : i))
      );
    }
  };

  // --- Abrir modales ---
  const handleEditarInsumo = (insumo: IInsumos) => {
    setInsumoEditar(insumo);
    setMostrarEditarModal(true);
  };

  const handleVerInsumo = (insumo: IInsumos) => {
    setInsumoVer(insumo);
    setMostrarVerModal(true);
  };

  // --- Filtro búsqueda ---
  const insumosFiltrados = insumos.filter((i) => {
    const nombre = (i.Nombre ?? "").toString();
    const categoriaNombre =
      categorias.find((c) => c.IdCatInsumo === i.IdCatInsumo)?.NombreCategoria ||
      "";
    const cantidad = (i.Cantidad ?? "").toString();
    const precio = (i.PrecioUnitario ?? "").toString();

    return (
      nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      categoriaNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cantidad.includes(busqueda) ||
      precio.includes(busqueda)
    );
  });

  // --- Paginación ---
  const indexInicio = (paginaActual - 1) * INSUMOS_POR_PAGINA;
  const insumosPagina = insumosFiltrados.slice(
    indexInicio,
    indexInicio + INSUMOS_POR_PAGINA
  );
  const totalPaginas = Math.max(
    1,
    Math.ceil(insumosFiltrados.length / INSUMOS_POR_PAGINA)
  );

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Insumos</h2>
        <button className="btn btn-pink" onClick={() => setMostrarModal(true)}>
          Crear Insumo
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por Nombre o Categoría"
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
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {insumosPagina.map((i, index) => {
              const categoriaNombre =
                categorias.find((c) => c.IdCatInsumo === i.IdCatInsumo)
                  ?.NombreCategoria || "Sin categoría";

              return (
                <tr
                  key={i.IdInsumo}
                  className={index % 2 === 0 ? "fila-par" : "fila-impar"}
                >
                  <td>{i.Nombre}</td>
                  <td>{categoriaNombre}</td>
                  <td>{i.Cantidad}</td>
                  <td>
                    {Number(i.PrecioUnitario).toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                      minimumFractionDigits: 0,
                    })}
                  </td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={getEstado(i)}
                        onChange={() =>
                          typeof i.IdInsumo === "number" &&
                          handleEstadoChange(i.IdInsumo)
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td>
                    <FaEye
                      className="icono text-info"
                      style={{ cursor: "pointer", marginRight: "10px" }}
                      onClick={() => handleVerInsumo(i)}
                    />
                    <FaEdit
                      className="icono text-warning"
                      style={{ cursor: "pointer", marginRight: "10px" }}
                      onClick={() => handleEditarInsumo(i)}
                    />
                    <FaTrash
                      className="icono text-danger"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        typeof i.IdInsumo === "number" &&
                        handleEliminarInsumo(i.IdInsumo, getEstado(i))
                      }
                    />
                  </td>
                </tr>
              );
            })}
            {insumosPagina.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">
                  No hay insumos registrados
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

      {/* Crear */}
      {mostrarModal && (
        <CrearInsumoModal
          onClose={() => setMostrarModal(false)}
          onCrear={async () => {
            await obtenerInsumos();
            setPaginaActual(1);
            setMostrarModal(false);
          }}
        />
      )}

      {/* Editar */}
      {mostrarEditarModal && insumoEditar && (
        <EditarInsumoModal
          insumo={insumoEditar}
          onClose={() => setMostrarEditarModal(false)}
          onEditar={async () => {
            await obtenerInsumos();
            setMostrarEditarModal(false);
            
          }}
        />
      )}

      {/* Ver */}
      {mostrarVerModal && insumoVer && typeof insumoVer.IdInsumo === "number" && (
        <VisualizarInsumoModal insumo={insumoVer} onClose={() => setMostrarVerModal(false)} />
      )}
    </div>
  );
};

export default ListarInsumos;
